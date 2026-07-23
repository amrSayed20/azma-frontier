/**
 * AZMA OS — THE IMPERIAL VOICE
 * Registry Entry I — The Imperial Tongue Engine
 * Constitutional Type Definitions
 *
 * Authority: The Constitutional Registry of Engines, Entry I ("THE
 * IMPERIAL TONGUE ENGINE"); "The Law of the Imperial Voice" (Constitutional
 * Rulings I-IV) — the Engine's official output is THE IMPERIAL VOICE, a
 * name distinct from, and never a duplicate of, the pre-existing
 * Constitutional Expression Organ's own "unifiedSummary." Constitutional
 * Expression serves the Living Body and precedes the Imperial Tongue;
 * the Imperial Voice serves the Creator and never replaces it.
 *
 * WHAT THIS MODULE ACTUALLY IS: a faithful composer over five
 * already-certified capabilities — Voice, Constitutional Identity,
 * Citizen Memory, Citizen Intention, Creator Service (src/core/tongue/
 * and src/imperial-presence/) — never a new capability, never a
 * re-derivation. Every field in an ImperialVoice traces to a real,
 * already-existing, already-certified read. Nothing here creates,
 * judges, filters, or prioritizes Constitutional Truth (Registry Entry
 * I's own Boundaries: never becomes Manifestation, Awareness, Wisdom,
 * Judgment, Conscience, or Memory).
 *
 * CITIZEN INTENTION IS NEVER FABRICATED: determining a TongueIntention
 * requires the Citizen's own literal expression (TongueIntent.raw) —
 * data this module cannot invent. When no real TongueIntent is
 * supplied, `intention` is honestly null, exactly as
 * constitutional-aggregation's (renamed from constitutional-manifestation)
 * own source adapters return null rather than fabricate when no real
 * evidence exists.
 */

import type { ChamberContext, TongueIntention, ToneProfile, CitizenProfile, CreatorProfile } from '../core/tongue';

export interface ImperialVoice {
  readonly voiceId: string;
  readonly context: ChamberContext;
  readonly tone: ToneProfile;
  readonly citizenProfile: CitizenProfile;
  readonly creatorProfile: CreatorProfile;
  readonly intention: TongueIntention | null;
  readonly identityPreserved: boolean;
  readonly generatedAt: string;
}

export interface ImperialVoiceCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
