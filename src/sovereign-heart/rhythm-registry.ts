/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * The Constitutional Rhythm
 * Construction Phase IV
 *
 * Engineering defaults, disclosed as such — no vision Article specifies
 * exact timing. One rhythm, applied identically to every organ (Phase
 * IV Constitutional Limits: "no organ receives privileged treatment").
 */

import type { ConstitutionalRhythm } from './types';

export const CONSTITUTIONAL_RHYTHM: ConstitutionalRhythm = {
  beatIntervalMs: 5000,
  // 3 missed beats before an organ's continuity is recorded as "silent."
  silenceThresholdMs: 15000,
} as const;
