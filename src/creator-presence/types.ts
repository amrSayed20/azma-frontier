/**
 * AZMA OS — THE CREATOR PRESENCE
 * Registry Entry III — The Creator Welcome Engine
 * Constitutional Type Definitions
 *
 * Authority: "The Law of the Creator's Welcome" and "The Law of Creator
 * Presence" (Constitutional Rulings I-IV).
 *
 * THE CREATOR PRESENCE is constitutionally distinct from TongueIntent
 * (Ruling I). It is the Creator's raw presence exactly as they entered
 * the Living Empire — preserved, never interpreted, never transformed,
 * never judged (Ruling II). TongueIntent is not produced here: it
 * belongs to the Imperial Tongue Engine, which derives it from THE
 * CREATOR PRESENCE through its own faithful understanding (Ruling III).
 * This module's Constitutional Responsibility terminates the moment
 * THE CREATOR PRESENCE is produced (Ruling IV) — it never constructs,
 * infers, or influences TongueIntent, and deliberately excludes any
 * field (such as priorTurns or an outcome/intention shape) that would
 * belong to that later, distinct responsibility instead.
 */

import type { ChamberContext, InputMethod } from '../core/tongue';

export interface CreatorPresence {
  readonly presenceId: string;
  readonly raw: string;
  readonly method: InputMethod;
  readonly context: ChamberContext;
  readonly enteredAt: number;
}

export interface CreatorWelcomeCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
