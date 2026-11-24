import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "Not logged in" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Not allowed" }, { status: 403 });
}

export function notFound(what = "Not found") {
  return NextResponse.json({ error: what }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// full error only in the server log; the browser gets a short message
export function serverError(where: string, err: unknown) {
  console.error(`${where} failed:`, err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

// "12" -> 12, anything else -> null
export function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
