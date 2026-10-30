import "server-only";

/**
 * Who may trigger a refresh. With CRON_SECRET set (recommended), Vercel's
 * cron sends it as a bearer token and nothing else is accepted. Without it,
 * production accepts only Vercel's cron user agent and SIGNAL's own internal
 * second step, and each server instance allows one run per ten minutes, so a
 * stray crawler cannot make it overwrite saved days or call the model. Local
 * development stays open.
 */
const COOLDOWN_MS = 10 * 60 * 1000;
let lastRun = 0;

export const INTERNAL_HEADER = "x-signal-internal";

export function internalToken(): string {
  return process.env.CRON_SECRET || process.env.VERCEL_DEPLOYMENT_ID || "local";
}

export function authorizeRefresh(request: Request): Response | undefined {
  const secret = process.env.CRON_SECRET;
  const internal = request.headers.get(INTERNAL_HEADER) === internalToken();
  if (secret) {
    if (request.headers.get("authorization") === `Bearer ${secret}` || internal) return undefined;
    return new Response("Unauthorized", { status: 401 });
  }
  if (process.env.VERCEL_ENV !== "production") return undefined;
  if (internal) return undefined;
  const cron = /^vercel-cron\//i.test(request.headers.get("user-agent") ?? "");
  if (!cron) return new Response("Unauthorized. Set CRON_SECRET to protect this endpoint.", { status: 401 });
  if (Date.now() - lastRun < COOLDOWN_MS) return new Response("Too soon", { status: 429 });
  lastRun = Date.now();
  return undefined;
}
