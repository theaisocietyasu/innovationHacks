import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly store: Map<string, number[]> = new Map();

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const timestamps = (this.store.get(key) ?? []).filter((ts) => ts > cutoff);

    if (timestamps.length >= this.maxRequests) {
      const retryAfterMs = Math.max(1, timestamps[0] + this.windowMs - now);
      this.store.set(key, timestamps);
      return { allowed: false, retryAfterMs };
    }

    timestamps.push(now);
    this.store.set(key, timestamps);
    return { allowed: true, retryAfterMs: 0 };
  }
}

class BruteForceTracker {
  private readonly windowMs: number;
  private readonly maxFailures: number;
  private readonly lockoutMs: number;
  private readonly failures: Map<string, number[]> = new Map();
  private readonly lockouts: Map<string, number> = new Map();

  constructor(windowMs: number, maxFailures: number, lockoutMs: number) {
    this.windowMs = windowMs;
    this.maxFailures = maxFailures;
    this.lockoutMs = lockoutMs;
  }

  recordFailure(ip: string): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const timestamps = (this.failures.get(ip) ?? []).filter((ts) => ts > cutoff);
    timestamps.push(now);
    this.failures.set(ip, timestamps);

    if (timestamps.length >= this.maxFailures) {
      this.lockouts.set(ip, now + this.lockoutMs);
    }
  }

  isLockedOut(ip: string): { locked: boolean; remainingMs: number } {
    const expiry = this.lockouts.get(ip);
    if (expiry === undefined) return { locked: false, remainingMs: 0 };

    const remainingMs = expiry - Date.now();
    if (remainingMs <= 0) {
      this.lockouts.delete(ip);
      this.failures.delete(ip);
      return { locked: false, remainingMs: 0 };
    }

    return { locked: true, remainingMs };
  }

  recordSuccess(ip: string): void {
    this.failures.delete(ip);
  }
}

export function getClientIp(request: NextRequest | Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

export function rateLimitResponse(retryAfterMs: number): NextResponse {
  const retryAfterSecs = Math.ceil(retryAfterMs / 1000);
  return NextResponse.json(
    { error: 'Too many requests', retryAfter: retryAfterSecs },
    { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } },
  );
}

export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 10);
export const adminApiRateLimiter = new RateLimiter(60 * 1000, 120);

export const oauthBruteForce = new BruteForceTracker(
  15 * 60 * 1000,
  5,
  30 * 60 * 1000,
);
