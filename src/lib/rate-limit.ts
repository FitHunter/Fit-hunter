import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting is backed by Upstash Redis so limits are shared across all
// serverless instances. If the two env vars below are not set, rate limiting
// is disabled (fail-open) rather than crashing the app — this lets the code
// ship safely and activate the moment the store is configured.
//
// Required env vars (see Upstash setup instructions):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // Placeholder/invalid values must disable rate limiting, not crash the
  // build — the Redis constructor throws on non-https URLs at import time.
  if (!url || !token || !url.startsWith("https://")) return null;
  try {
    return new Redis({ url, token });
  } catch (err) {
    console.warn("[rate-limit] failed to init Upstash Redis:", err);
    return null;
  }
}

const redis = createRedis();

if (!redis && process.env.NODE_ENV === "production") {
  console.warn("[rate-limit] Upstash env vars missing or invalid — rate limiting is DISABLED.");
}

type LimiterName = "auth" | "email" | "upload" | "public";

// Tuned per surface: auth is strict (brute-force), email is spam/cost control,
// upload is Cloudinary cost control, public is scraping protection.
const CONFIGS: Record<LimiterName, { limit: number; window: `${number} ${"s" | "m" | "h"}` }> = {
  auth: { limit: 5, window: "10 m" },
  email: { limit: 5, window: "1 h" },
  upload: { limit: 30, window: "1 h" },
  public: { limit: 60, window: "1 m" },
};

const limiters = new Map<LimiterName, Ratelimit>();

function getLimiter(name: LimiterName): Ratelimit | null {
  if (!redis) return null;
  let limiter = limiters.get(name);
  if (!limiter) {
    const c = CONFIGS[name];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(c.limit, c.window),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Enforces a rate limit for the given bucket + identifier.
 * Returns a 429 NextResponse if the caller is over the limit, otherwise null.
 * Callers should: `const limited = await enforceRateLimit(...); if (limited) return limited;`
 */
export async function enforceRateLimit(
  name: LimiterName,
  identifier: string
): Promise<NextResponse | null> {
  const limiter = getLimiter(name);
  if (!limiter) return null; // disabled until Upstash env vars are configured

  const { success } = await limiter.limit(identifier);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }
  return null;
}
