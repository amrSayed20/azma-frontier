/**
 * AZMA OS — QIYAMAH: THE FIRST GENERATION PATH
 * Interim Cost Control
 *
 * A DISCLOSED STOPGAP: a single global (not per-Creator) fixed-window
 * rate limit, because no real Authentication exists yet to attribute
 * usage to an individual Creator (Authentication is explicitly out of
 * this Package's Boundaries). This exists only to bound cost exposure
 * during the interim period — real, durable, per-Creator cost control
 * depends on the separately-planned Authentication and Billing
 * Engineering Packages.
 */

const MAX_GENERATIONS_PER_WINDOW = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

let windowStartedAt = Date.now();
let generationsInWindow = 0;

function refreshWindow(now: number): void {
  if (now - windowStartedAt >= WINDOW_MS) {
    windowStartedAt = now;
    generationsInWindow = 0;
  }
}

export function isRateLimited(now: number = Date.now()): boolean {
  refreshWindow(now);
  return generationsInWindow >= MAX_GENERATIONS_PER_WINDOW;
}

export function recordGeneration(now: number = Date.now()): void {
  refreshWindow(now);
  generationsInWindow += 1;
}

/** Resets the interim limiter — used only by tests. */
export function resetRateLimiterForTests(): void {
  windowStartedAt = Date.now();
  generationsInWindow = 0;
}
