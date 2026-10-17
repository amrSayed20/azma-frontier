/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * Attempt Limiter
 *
 * Fixed-window counters that slow password guessing and mass sign-up.
 * Process-local, like the generation limiter: a restart or a second
 * server instance starts fresh counts, so this bounds abuse on the
 * single-server deployment and is not a substitute for an edge firewall.
 */

export class AttemptLimiter {
  private readonly windows = new Map<string, { startedAt: number; count: number }>();

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number,
  ) {}

  /** True when `key` has used every attempt in its current window. */
  isBlocked(key: string, now: number = Date.now()): boolean {
    const window = this.windows.get(key);
    if (!window || now - window.startedAt >= this.windowMs) return false;
    return window.count >= this.maxAttempts;
  }

  /** Seconds until `key` may try again (0 when it is not blocked). */
  retryAfterSeconds(key: string, now: number = Date.now()): number {
    const window = this.windows.get(key);
    if (!window || !this.isBlocked(key, now)) return 0;
    return Math.ceil((window.startedAt + this.windowMs - now) / 1000);
  }

  record(key: string, now: number = Date.now()): void {
    const window = this.windows.get(key);
    if (!window || now - window.startedAt >= this.windowMs) {
      this.windows.set(key, { startedAt: now, count: 1 });
    } else {
      window.count += 1;
    }
    if (this.windows.size > 10_000) this.dropExpired(now);
  }

  clear(key: string): void {
    this.windows.delete(key);
  }

  private dropExpired(now: number): void {
    for (const [key, window] of this.windows) {
      if (now - window.startedAt >= this.windowMs) this.windows.delete(key);
    }
  }
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Failed log-ins per email: 10 per 15 minutes. A success clears the count. */
export const failedLoginsByEmail = new AttemptLimiter(10, FIFTEEN_MINUTES_MS);
/** Failed log-ins per client address: 30 per 15 minutes, across all emails. */
export const failedLoginsByClient = new AttemptLimiter(30, FIFTEEN_MINUTES_MS);
/** Accounts created per client address: 5 per hour. */
export const signupsByClient = new AttemptLimiter(5, ONE_HOUR_MS);
/** Failed current-password checks per creator when changing the password: 5 per 15 minutes. */
export const failedPasswordChangesByCreator = new AttemptLimiter(5, FIFTEEN_MINUTES_MS);

/** The client address as the reverse proxy reports it (first hop), or a shared bucket when absent. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown-client';
}
