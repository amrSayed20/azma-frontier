/**
 * AZMA OS — VISITOR PRESENCE
 * Arrival Record — the genuinely missing half of "Arrival Detection"
 *
 * Session-based known/unknown-Creator detection already exists
 * (app/page.tsx reads the session cookie). What was actually missing —
 * confirmed by a full-codebase audit before this file was written — is
 * device-level visit history: has this browser been here before, and
 * how many times. `getVariation(visitCount)` in
 * src/design-system/direction.ts has expected exactly this signal
 * since it was written, but nothing has ever called it with a real
 * value; it and its caller `applyVariation` remain unwired dead code.
 *
 * This module supplies that missing signal — and only that signal. It
 * does not call getVariation/applyVariation itself and does not change
 * anything about how the Arrival page looks or behaves: consuming this
 * to actually vary the experience is a Welcome-Experience decision for
 * a later package, not a runtime-foundation one ("do not redesign UI").
 *
 * Deliberately its own storage key, not a field bolted onto
 * DirectionMemory (src/design-system/direction.ts) — that structure
 * already means something specific (pacing/interruption preferences
 * within a scene), and conflating "how many times has this person
 * arrived at the Empire" with "how has this person preferred scenes to
 * be paced" would blur two genuinely different concerns.
 */

export interface ArrivalRecord {
  /** How many times this browser has arrived, including the current visit. */
  readonly arrivalCount: number;
  readonly firstArrivalAt: number;
  readonly lastArrivalAt: number;
  /** True from the second arrival onward. */
  readonly isReturning: boolean;
}

const STORAGE_KEY = 'azma.arrival.record';

interface PersistedShape {
  arrivalCount: number;
  firstArrivalAt: number;
  lastArrivalAt: number;
}

/**
 * Pure reducer — no I/O, fully unit-testable without a DOM. Given the
 * previously persisted record (or null, for a genuinely first arrival)
 * and the current time, computes the next record.
 */
export function nextArrivalRecord(previous: PersistedShape | null, now: number): ArrivalRecord {
  if (!previous) {
    return { arrivalCount: 1, firstArrivalAt: now, lastArrivalAt: now, isReturning: false };
  }
  const arrivalCount = previous.arrivalCount + 1;
  return {
    arrivalCount,
    firstArrivalAt: previous.firstArrivalAt,
    lastArrivalAt: now,
    isReturning: arrivalCount > 1,
  };
}

function readPersisted(): PersistedShape | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    if (
      typeof parsed.arrivalCount !== 'number' ||
      typeof parsed.firstArrivalAt !== 'number' ||
      typeof parsed.lastArrivalAt !== 'number'
    ) {
      return null;
    }
    return parsed as PersistedShape;
  } catch {
    return null;
  }
}

function writePersisted(record: ArrivalRecord): void {
  try {
    const shape: PersistedShape = {
      arrivalCount: record.arrivalCount,
      firstArrivalAt: record.firstArrivalAt,
      lastArrivalAt: record.lastArrivalAt,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
  } catch {
    /* storage unavailable — detection continues without persistence */
  }
}

/**
 * Records that an arrival is happening right now: reads the previous
 * record, advances it, persists the result, and returns it. Call once
 * per real page arrival, not on every render.
 */
export function recordArrival(now: number = Date.now()): ArrivalRecord {
  if (typeof window === 'undefined') {
    return { arrivalCount: 1, firstArrivalAt: now, lastArrivalAt: now, isReturning: false };
  }
  const record = nextArrivalRecord(readPersisted(), now);
  writePersisted(record);
  return record;
}

/** Read-only — does not advance the count. Null server-side or before any arrival has been recorded. */
export function getArrivalRecord(): ArrivalRecord | null {
  if (typeof window === 'undefined') return null;
  const persisted = readPersisted();
  if (!persisted) return null;
  return { ...persisted, isReturning: persisted.arrivalCount > 1 };
}
