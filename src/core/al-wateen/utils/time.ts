/**
 * Time utilities for runtime orchestration.
 */

export interface TimeRange {
  readonly start: number;
  readonly end: number;
}

export function now(): number {
  return Date.now();
}

export function elapsed(start: number, end: number = now()): number {
  return Math.max(0, end - start);
}

export function createRange(windowMs: number, end: number = now()): TimeRange {
  return {
    start: end - windowMs,
    end
  };
}

export function inRange(value: number, range: TimeRange): boolean {
  return value >= range.start && value <= range.end;
}
