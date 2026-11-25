import { headers } from "next/headers";

/**
 * Small in-memory rate limiter.
 *
 * Good enough to blunt form spam and password guessing on a single-instance
 * deployment. If the site is ever run on several instances, swap the Map for a
 * shared store (Redis, D1, Upstash) — the call sites stay the same.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [existingKey, existing] of buckets) {
        if (existing.resetAt <= now) buckets.delete(existingKey);
      }
      if (buckets.size >= MAX_BUCKETS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true };
}

function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  return (
    forwarded.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "local"
  );
}

/** Key for a route handler, based on the caller's address. */
export function requestKey(request: Request, scope: string) {
  return `${scope}:${clientIp(request.headers)}`;
}

/** Key for a server action, where no Request object is available. */
export async function actionKey(scope: string) {
  return `${scope}:${clientIp(await headers())}`;
}
