/**
 * AZMA OS — THE FIRST CONSTITUTIONAL MOTION
 * The Constitutional Launch Integration Layer
 *
 * Authority: "The Law of Constitutional Integration" and "The Law of
 * the First Constitutional Motion." This layer coordinates the four
 * already-certified Constitutional Engines (Registry Entries I-IV) — it
 * is not itself an Engine or an Organ, introduces no new Constitutional
 * Responsibility, and never modifies any certified Engine (Rulings I-IV
 * of "The Law of Constitutional Integration").
 *
 * Every field below is exactly one certified Engine's own, unmodified
 * output type: CreatorPresence (Entry III), TongueIntent (Entry IV),
 * ImperialVoice (Entry I), ConstitutionalManifestation (Entry II, or
 * null when no registered source has real evidence — never fabricated).
 *
 * The Entry I → Entry II connection is temporal, not a literal data
 * hand-off: Entry II's own certified adapter derives its own tone data
 * independently (from the same underlying getToneProfile source Entry I
 * also reads), per the Council's own resolution that faithfully
 * coordinating existing exports — without altering either Engine — is
 * sufficient Constitutional Motion.
 */

import type { CreatorPresence } from '../creator-presence';
import type { TongueIntent } from '../core/tongue';
import type { ImperialVoice } from '../imperial-voice';
import type { ConstitutionalManifestation } from '../constitutional-aggregation';

export interface FirstConstitutionalMotion {
  readonly presence: CreatorPresence;
  readonly intent: TongueIntent;
  readonly voice: ImperialVoice;
  readonly manifestation: ConstitutionalManifestation | null;
}

export interface LaunchIntegrationCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
