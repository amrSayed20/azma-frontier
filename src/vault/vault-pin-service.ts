/**
 * AZMA OS — VAULT PIN AUTHENTICATION SERVICE
 * Per-Creator failed-attempt tracker for the Vault gate PIN.
 *
 * LIMITATION: In-process fixed-window counter. Does not survive a
 * server restart and does not work across multiple concurrent instances.
 * Consistent with the pattern used by src/qiyamah-generation/rate-limiter.ts.
 */

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  windowStart: number;
}

const attemptsByCreator = new Map<string, AttemptRecord>();

export function isPinAttemptBlocked(creatorId: string, now: number = Date.now()): boolean {
  const record = attemptsByCreator.get(creatorId);
  if (!record) return false;
  if (now - record.windowStart >= WINDOW_MS) return false;
  return record.count >= MAX_FAILED_ATTEMPTS;
}

export function recordFailedPinAttempt(creatorId: string, now: number = Date.now()): void {
  const record = attemptsByCreator.get(creatorId);
  if (!record || now - record.windowStart >= WINDOW_MS) {
    attemptsByCreator.set(creatorId, { count: 1, windowStart: now });
  } else {
    record.count += 1;
  }
}

export function clearPinAttempts(creatorId: string): void {
  attemptsByCreator.delete(creatorId);
}

export function resetPinAttemptTrackerForTests(): void {
  attemptsByCreator.clear();
}
