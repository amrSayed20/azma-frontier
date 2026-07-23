/**
 * AZMA OS — THE IMPERIAL TONGUE
 * Constitutional Classification Registry
 * Constitutional Package I — The Imperial Tongue Constitutional Refoundation
 *
 * A pure, declarative record of every responsibility this organ
 * currently implements, classified per the completed Constitutional
 * Deliberation (Engineering Review, Constitutional Clarification
 * Report, both certified). This file adds a classification LAYER only —
 * it renames nothing, deletes nothing, relocates nothing, and rewrites
 * no existing file's own logic. Every file named below remains exactly
 * where it already was.
 *
 * PERMANENT responsibilities are the Imperial Tongue's own faithful
 * expression capability, inherited unchanged.
 *
 * TRANSITIONAL responsibilities are preserved exactly in place, per the
 * Constitutional Decision: "They shall NOT be removed. They shall NOT be
 * deleted. They shall NOT be relocated. They shall NOT be rewritten...
 * until their rightful Constitutional Homes are themselves born through
 * the Constitutional Order."
 *
 * Citation strength is recorded honestly per entry — some
 * classifications rest on a directly-quoted Charter Article; others
 * rest on the closest available analogy, disclosed as such rather than
 * overstated. See Constitutional Clarification III specifically:
 * `memory.ts`'s classification here is retained as Transitional per the
 * Council's own explicit designation, even though the Clarification
 * found its actual content ("Citizen Memory") does not cleanly match
 * the Charter's own definition of "Constitutional Memory" (institutional
 * precedent serving Judgment). That open question is disclosed, not
 * silently resolved by this registry.
 */

export type ImperialTongueResponsibilityClass = 'permanent' | 'transitional';

export interface ImperialTongueResponsibilityRecord {
  readonly file: string;
  readonly responsibility: string;
  readonly classification: ImperialTongueResponsibilityClass;
  readonly citation: string;
}

export const IMPERIAL_TONGUE_RESPONSIBILITIES: readonly ImperialTongueResponsibilityRecord[] = [
  {
    file: 'voice.ts',
    responsibility: 'Per-chamber tone, style, and response shaping (TONE_PROFILES, getToneProfile, buildStyleDirective, shapeResponse, selectCommunicationMode)',
    classification: 'permanent',
    citation:
      'Constitutional Package I, Constitutional Responsibilities: "faithfully express Constitutional Truth... maintain consistency of constitutional language across every Chamber... provide one unified constitutional voice for every Chamber." No Non-Responsibility citation conflicts with this file.',
  },
  {
    file: 'constitution.ts (ChamberContext, CONTEXT_ROLES, IMPERIAL_CONSCIOUSNESS)',
    responsibility: 'Constitutional identity and chamber vocabulary substrate for expression',
    classification: 'permanent',
    citation:
      'Same Package I Responsibility as above, plus Ch. III (Constitutional Belonging), Article III: "Every Organ shall know its place." — this vocabulary is that place, for every expression the Tongue produces.',
  },
  {
    file: 'constitution.ts (assessUnderstanding, validateResponse)',
    responsibility: 'Truth-validation logic, currently called only by conscience.ts\'s dignity gate',
    classification: 'transitional',
    citation:
      'Coupled by sole current caller to conscience.ts — see that entry. Classified with Conscience on citation grounds, not repository convenience (Constitutional Clarification Report).',
  },
  {
    file: 'conscience.ts',
    responsibility: 'Constitutional Conscience — dignity gates (validateDignity), the Imperial Conscience, Constitutional Permanence',
    classification: 'transitional',
    citation:
      'Constitutional Package I, Non-Responsibilities: "shall never become... Constitutional Conscience." Ch. X ("The Law of Constitutional Conscience"), in full — Conscience already possesses real constitutional existence via this chapter, independent of whether a dedicated organ has been implemented ("the absence of implementation shall never be interpreted as the absence of constitutional existence").',
  },
  {
    file: 'guardian.ts',
    responsibility: 'Quality assessment and guardian approach (assessQuality, citizenIsOnTrack, guardianApproach)',
    classification: 'transitional',
    citation:
      'Ch. X, Final Imperial Declaration, verbatim: "The Constitutional Conscience shall forever remain the silent Guardian standing between Power and Purpose." No chapter names a separate "Constitutional Guardian" organ distinct from Conscience — this file is an instantiation of Conscience\'s own Guardian function (Constitutional Clarification II).',
  },
  {
    file: 'memory.ts',
    responsibility: 'Citizen behavioral preference profile — depth/pace/creativity preference, creative fingerprint, signal counts, wisdom log',
    classification: 'permanent',
    citation:
      'POST-CERTIFICATION CORRECTION to Constitutional Package I: the Constitutional Council concluded, after Certification, that this file never represented Constitutional Memory as defined by the Charter (Ch. XI/VII, Judgment chapters: institutional precedent serving Constitutional Judgment, already implemented elsewhere as src/sovereign-memory/). It represents Citizen Memory — one Citizen\'s own interaction history, serving Expression — which the Council has ruled is an intrinsic responsibility of the Imperial Tongue itself, not a Non-Responsibility awaiting relocation. Reclassified from transitional to permanent by Council directive; no file content changed.',
  },
  {
    file: 'continuity.ts, momentum.ts',
    responsibility: 'Cross-chamber conversational continuity and momentum (ConversationThread, ChamberVisit, MomentumPoint)',
    classification: 'transitional',
    citation:
      'Ch. V ("The Law of Constitutional Communication"), Article VIII, verbatim: "The Body shall remember its conversations. Constitutional Communication shall become part of Constitutional Memory. For forgotten conversations become repeated mistakes."',
  },
  {
    file: 'intention.ts',
    responsibility: 'Citizen Intention — inferring one Citizen\'s own conversational goal and assessing its fulfillment (determineIntention, assessOutcome)',
    classification: 'transitional',
    citation:
      'Constitutionally distinct from src/constitutional-will/\'s own "Constitutional Intention" (an organ-level pipeline artifact with no citizen present) and from Ch. V Article XII\'s rhetorical "one Constitutional Intention" (the Empire\'s own unified voice, an aspiration, not an implementation) — Constitutional Clarification IV. Classified transitional pending its own rightful Constitutional Home, on the same footing as the other Citizen-scoped files above.',
  },
  {
    file: 'creator.ts',
    responsibility: 'Creator Service — calibrating whether and when to intervene, and whether responses build the Creator\'s own capability over time (inferCreatorProfile, measureFlowState, assessCapabilityTrend)',
    classification: 'transitional',
    citation:
      'Imperial Covenant, Article IX: "The Empire shall... seek to become the most faithful servant of Human Creativity." Ch. IX (Wisdom), Article VII; Ch. X (Conscience), Article IV. Constitutional Clarification I found this the closest of 4 offered labels, while disclosing it as the weakest-cited classification in this registry — "Creator Relationship" could not be ruled out by the Charter text available.',
  },
] as const;

/** Every file classified permanent — the Imperial Tongue's own inherited, unchanged capability. */
export function listPermanentResponsibilities(): readonly ImperialTongueResponsibilityRecord[] {
  return IMPERIAL_TONGUE_RESPONSIBILITIES.filter((entry) => entry.classification === 'permanent');
}

/** Every file classified transitional — preserved exactly in place, per Constitutional Decision, pending its own rightful Constitutional Home. */
export function listTransitionalResponsibilities(): readonly ImperialTongueResponsibilityRecord[] {
  return IMPERIAL_TONGUE_RESPONSIBILITIES.filter((entry) => entry.classification === 'transitional');
}
