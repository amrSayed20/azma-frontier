/**
 * Time utilities for orchestration lifecycle.
 */

export function now(): number {
  return Date.now();
}

export function elapsed(startedAt: number, endedAt: number = now()): number {
  return Math.max(0, endedAt - startedAt);
}
