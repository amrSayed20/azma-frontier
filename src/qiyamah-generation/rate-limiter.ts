/**
 * AZMA OS — QIYAMAH: THE FIRST GENERATION PATH
 * Interim Cost Control
 *
 * A DISCLOSED STOPGAP: a global fixed-window limit bounds total cost
 * exposure during the interim period. Inside it, each creator has a
 * smaller share, so one creator can no longer use the whole window and
 * lock every other creator out for the rest of the hour. Process-local:
 * a restart or a second server instance starts fresh counts. Durable
 * per-Creator cost control remains the AZMA Unit ledger.
 */

const MAX_GENERATIONS_PER_WINDOW = 20;
const MAX_GENERATIONS_PER_CREATOR_PER_WINDOW = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

let windowStartedAt = Date.now();
let generationsInWindow = 0;
const generationsByCreator = new Map<string, number>();

function refreshWindow(now: number): void {
  if (now - windowStartedAt >= WINDOW_MS) {
    windowStartedAt = now;
    generationsInWindow = 0;
    generationsByCreator.clear();
  }
}

/** True when the global window is full, or when `creatorId` has used its own share. */
export function isRateLimited(now: number = Date.now(), creatorId?: string | null): boolean {
  refreshWindow(now);
  if (generationsInWindow >= MAX_GENERATIONS_PER_WINDOW) return true;
  return !!creatorId && (generationsByCreator.get(creatorId) ?? 0) >= MAX_GENERATIONS_PER_CREATOR_PER_WINDOW;
}

export function recordGeneration(now: number = Date.now(), creatorId?: string | null): void {
  refreshWindow(now);
  generationsInWindow += 1;
  if (creatorId) generationsByCreator.set(creatorId, (generationsByCreator.get(creatorId) ?? 0) + 1);
}

/** Resets the interim limiter — used only by tests. */
export function resetRateLimiterForTests(): void {
  windowStartedAt = Date.now();
  generationsInWindow = 0;
  generationsByCreator.clear();
}
