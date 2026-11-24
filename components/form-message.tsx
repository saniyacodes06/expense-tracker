import { cn } from "@/lib/utils";

type FormMessageProps = {
  ok: boolean;
  message: string;
  className?: string;
};

export function FormMessage({ ok, message, className }: FormMessageProps) {
  if (!message) return null;

  return (
    <p className={cn("text-sm", ok ? "text-green-600" : "text-destructive", className)}>
      {message}
    </p>
  );
}
