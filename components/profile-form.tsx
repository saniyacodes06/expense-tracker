"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { FormMessage } from "@/components/form-message";
import type { Profile } from "@/lib/profile";

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState({ ok: false, text: "" });
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load profile");
        setProfile(body);
        setPhone(body.phone ?? "");
      })
      .catch((err) => setMessage({ ok: false, text: err.message }));
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage({ ok: false, text: "" });

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const body = await res.json().catch(() => ({}));
    setIsPending(false);

    if (!res.ok) return setMessage({ ok: false, text: body.error ?? "Could not save" });
    setProfile(body);
    setPhone(body.phone ?? "");
    setMessage({ ok: true, text: "Saved" });
  }

  if (!profile) {
    return message.text ? (
      <FormMessage ok={false} message={message.text} />
    ) : (
      <p className="text-sm text-muted-foreground">Loading...</p>
    );
  }

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Name</dt>
        <dd>{profile.name}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd>{profile.email}</dd>
        <dt className="text-muted-foreground">Phone</dt>
        <dd>{profile.phone ?? "Not added"}</dd>
      </dl>

      <form onSubmit={save} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <FormField id="phone" label="Phone number">
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            maxLength={20}
            autoComplete="tel"
          />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <FormMessage ok={message.ok} message={message.text} className="sm:col-span-2" />
      </form>
    </div>
  );
}
