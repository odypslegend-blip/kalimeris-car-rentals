/**
 * In-process sliding-window rate limits for the inquiry endpoint.
 *
 * Two buckets are enforced together:
 *   1. per-IP (default 5/hour, `INQUIRY_RATE_LIMIT_PER_HOUR`)
 *   2. global  (default 120/hour, `INQUIRY_GLOBAL_RATE_LIMIT_PER_HOUR`)
 *
 * The per-IP bucket is keyed on `x-forwarded-for`, which is spoofable unless a
 * trusted proxy overwrites it — a client can rotate a fake value on every
 * request. The global bucket is the backstop for exactly that flood: it caps
 * the total accepted per instance regardless of how many "IPs" are presented.
 *
 * ⚠️ Per-instance only. Each server instance (or serverless invocation cold
 * start) keeps its own maps, so N instances allow roughly N × the limit. That is
 * an acceptable abuse speed-bump for this site; a real multi-instance
 * deployment should replace this with Redis/Upstash and a shared key. The
 * signatures below are deliberately narrow so that swap is local.
 *
 * Nothing here is persisted and no PII is stored beyond the caller's IP key,
 * which is dropped as soon as its window closes.
 */

const WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 5;
const DEFAULT_GLOBAL_LIMIT = 120;
const MAX_TRACKED_KEYS = 5_000;

type Bucket = number[];

const buckets = new Map<string, Bucket>();
let globalBucket: Bucket = [];

function readPositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return parsed;
}

function readLimit(): number {
  return readPositiveInt(process.env.INQUIRY_RATE_LIMIT_PER_HOUR, DEFAULT_LIMIT);
}

function readGlobalLimit(): number {
  return readPositiveInt(
    process.env.INQUIRY_GLOBAL_RATE_LIMIT_PER_HOUR,
    DEFAULT_GLOBAL_LIMIT
  );
}

/** Returns only the timestamps still inside the window. */
function recentWithin(bucket: Bucket, cutoff: number): Bucket {
  return bucket.filter((timestamp) => timestamp > cutoff);
}

function retryAfter(oldest: number, now: number): number {
  return Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
}

/** Drops expired buckets so a long-running process cannot grow unbounded. */
function prune(now: number): void {
  const cutoff = now - WINDOW_MS;

  for (const [key, timestamps] of buckets) {
    const last = timestamps[timestamps.length - 1];

    if (last === undefined || last <= cutoff) {
      buckets.delete(key);
    }
  }

  if (buckets.size <= MAX_TRACKED_KEYS) return;

  // Still oversized: drop the oldest third rather than the whole map.
  const keys = [...buckets.keys()];
  for (const key of keys.slice(0, Math.ceil(keys.length / 3))) {
    buckets.delete(key);
  }
}

export type RateLimitResult =
  | {allowed: true; remaining: number}
  | {allowed: false; retryAfterSeconds: number};

export function checkRateLimit(ip: string, now = Date.now()): RateLimitResult {
  const key = ip.trim() || "unknown";
  const limit = readLimit();
  const globalLimit = readGlobalLimit();
  const cutoff = now - WINDOW_MS;

  const recent = recentWithin(buckets.get(key) ?? [], cutoff);
  const recentGlobal = recentWithin(globalBucket, cutoff);

  // Either bucket can refuse the request; report the one that has to wait
  // longest so the client backs off enough for both.
  const perIpExceeded = recent.length >= limit;
  const globalExceeded = recentGlobal.length >= globalLimit;

  if (perIpExceeded || globalExceeded) {
    buckets.set(key, recent);
    globalBucket = recentGlobal;

    const waits: number[] = [];
    if (perIpExceeded) waits.push(retryAfter(recent[0] ?? now, now));
    if (globalExceeded) waits.push(retryAfter(recentGlobal[0] ?? now, now));

    return {allowed: false, retryAfterSeconds: Math.max(...waits)};
  }

  recent.push(now);
  buckets.set(key, recent);
  recentGlobal.push(now);
  globalBucket = recentGlobal;
  prune(now);

  return {allowed: true, remaining: Math.max(0, limit - recent.length)};
}

/** Test helper: resets the in-memory windows. */
export function resetRateLimit(): void {
  buckets.clear();
  globalBucket = [];
}
