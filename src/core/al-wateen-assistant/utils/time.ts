/**
 * AZMA OS – Al-Wateen Assistant
 * File: time.ts
 *
 * Time and duration utilities.
 */

export interface Duration {
  readonly milliseconds: number;
}

export interface TimeRange {
  readonly start: number;
  readonly end: number;
}

export function createDuration(milliseconds: number): Duration {
  return { milliseconds };
}

export function durationToMilliseconds(duration: Duration): number {
  return duration.milliseconds;
}

export function currentTimestamp(): number {
  return Date.now();
}

export function isExpired(createdAt: number, durationMs: number): boolean {
  return currentTimestamp() - createdAt > durationMs;
}

export function getElapsedTime(startTime: number, endTime: number = currentTimestamp()): number {
  return endTime - startTime;
}

export function createTimeRange(start: number, end: number): TimeRange {
  return { start, end };
}

export function isInTimeRange(timestamp: number, range: TimeRange): boolean {
  return timestamp >= range.start && timestamp <= range.end;
}

export function getTimeRangeDuration(range: TimeRange): number {
  return range.end - range.start;
}

export function roundToNearestSecond(milliseconds: number): number {
  return Math.round(milliseconds / 1000) * 1000;
}

export function roundToNearestMinute(milliseconds: number): number {
  return Math.round(milliseconds / 60000) * 60000;
}
