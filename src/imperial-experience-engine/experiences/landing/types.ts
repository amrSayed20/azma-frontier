/**
 * AZMA OS — SOVEREIGN LANDING, THE DATA CONTRACTS
 *
 * ─── WHY EVERY RECORD CARRIES BOTH TONGUES IN ITS OWN SHAPE ─────────────────
 *
 *   The platform's standing law is that no label exists in one language and
 *   not the other. The gateway proves that law one way — matched dictionary
 *   keys — and `GATEWAY_CHAMBERS` proves it another: `…Ar` and `…En` as
 *   REQUIRED fields on the record itself.
 *
 *   This landing follows the second pattern, because its content is prose
 *   that belongs to the page rather than chrome shared across the platform.
 *   Making both tongues non-optional means a missing translation is a type
 *   error at build time, not an empty paragraph a visitor discovers.
 *
 * ─── WHAT IS DELIBERATELY ABSENT ────────────────────────────────────────────
 *
 *   There is no `TestimonialRecord`. The Founder's construction order of
 *   2026-11-20 replaced the reference design's testimonial band with proof of
 *   real production capacity, because this Empire holds no Creator testimony
 *   it has the right to publish. A type for a thing we must not fabricate is
 *   an invitation to fabricate it later.
 */

/** One step of the journey from an idea to a published work. */
export interface LandingJourneyStep {
  readonly id: string;
  readonly ordinal: number;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly bodyAr: string;
  readonly bodyEn: string;
  /** The chamber that actually performs this step, named to the visitor. */
  readonly chamberAr: string;
  readonly chamberEn: string;
}

/**
 * One capability band on the landing.
 *
 * `door` is the API route a Creator's own press actually reaches. It is not
 * decoration: nothing is announced on the public page without one, and the
 * guard reads this field to prove it.
 */
export interface LandingCapability {
  readonly id: string;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly bodyAr: string;
  readonly bodyEn: string;
  /** The measured fact under the claim — never an adjective. */
  readonly groundAr: string;
  readonly groundEn: string;
  /** The live route that performs it. Proof the claim is reachable today. */
  readonly door: string;
}

/**
 * One named part of the knowledge foundation.
 *
 * `figure` is a string because «٧٬٥٨٠» is not a number, and because the shape
 * a reader sees must not depend on a formatter running correctly.
 */
export interface LandingProofPoint {
  readonly id: string;
  readonly figure: string;
  readonly labelAr: string;
  readonly labelEn: string;
}

/**
 * A chamber as a VISITOR is told about it.
 *
 * THERE IS NO `state` FIELD AND NO `limit` FIELD, and that absence is the
 * point. The Founder's order of 2026-11-20 forbids build-stage language on
 * any surface a user meets. A type that cannot hold a build state cannot leak
 * one, however carelessly it is later mapped over.
 *
 * `valueAr`/`valueEn` is what the chamber gives the Creator — the sentence
 * that replaced the qualification.
 */
export interface LandingChamber {
  readonly id: string;
  readonly href: string;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly roleAr: string;
  readonly roleEn: string;
  readonly bodyAr: string;
  readonly bodyEn: string;
  readonly valueAr: string;
  readonly valueEn: string;
}

/** One illustrative panel in the showcase. Declared as drawn, never as work. */
export interface LandingShowcaseTile {
  readonly id: string;
  readonly kind: 'image' | 'motion' | 'voice' | 'film';
  readonly labelAr: string;
  readonly labelEn: string;
  readonly chamberAr: string;
  readonly chamberEn: string;
}

/** One question a visitor actually asks, and an answer that does not promise. */
export interface LandingQuestion {
  readonly id: string;
  readonly questionAr: string;
  readonly questionEn: string;
  readonly answerAr: string;
  readonly answerEn: string;
}

/** One column of the footer. */
export interface LandingFooterColumn {
  readonly id: string;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly links: readonly LandingFooterLink[];
}

export interface LandingFooterLink {
  readonly labelAr: string;
  readonly labelEn: string;
  readonly href: string;
}

