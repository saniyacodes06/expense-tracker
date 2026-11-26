// Login attempt limit: 5 failed logins per email in 15 minutes, then 429.
// Kept in memory (resets when the server restarts). Fine for one server.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

// email -> times (ms) of recent failed logins. Kept on globalThis so dev hot reload keeps it.
const globalForLimit = globalThis as unknown as { loginFailures?: Map<string, number[]> };
const failures = (globalForLimit.loginFailures ??= new Map<string, number[]>());

function recent(email: string) {
  const cutoff = Date.now() - WINDOW_MS;
  const times = (failures.get(email) ?? []).filter((t) => t > cutoff);
  if (times.length) failures.set(email, times);
  else failures.delete(email);
  return times;
}

export function isLoginBlocked(email: string) {
  return recent(email).length >= MAX_FAILURES;
}

export function recordLoginFailure(email: string) {
  failures.set(email, [...recent(email), Date.now()]);
}

export function clearLoginFailures(email: string) {
  failures.delete(email);
}
