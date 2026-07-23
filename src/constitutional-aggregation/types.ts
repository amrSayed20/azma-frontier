/**
 * AZMA OS — THE CONSTITUTIONAL MANIFESTATION SYSTEM
 * Constitutional Package II — Type Definitions
 *
 * Authority: "The Constitutional Construction Charter," Ch. V (first
 * cycle), "The Law of Constitutional Manifestation," and the
 * Constitutional Decision resolving Package II's own ambiguity: *"The
 * Constitutional Manifestation System SHALL NOT receive its truth from
 * a single constitutional source... It shall never become the renderer
 * of one subsystem alone."*
 *
 * NOT A SOVEREIGN ORGAN: no Constitutional Decision has authorized
 * registering Manifestation in the Skeleton's Organ Registry. Consistent
 * with the same conservative pattern already used for
 * src/imperial-presence/ and src/constitutional-expression/, this
 * module is built as coordination/transformation infrastructure, not an
 * organ, until the Council explicitly rules otherwise.
 *
 * WHAT "CREATOR-VISIBLE PRESENCE" ACTUALLY MEANS HERE, disclosed rather
 * than invented: this Package's own Directive names no concrete UI,
 * dashboard, or rendering surface — and every other module in this same
 * constitutional communication chain (Expression, Reception, Will,
 * Decision, Execution, Actuation, Operations) was built, and certified,
 * as data-only infrastructure with no real UI authorized anywhere. This
 * module follows the identical, established discipline: it produces a
 * ConstitutionalManifestation — a faithful, structured DATA record of
 * what would be shown to a Creator — never an actual rendered
 * component, page, or dashboard. Building a real UI would require a
 * future, separately-authorized package naming one explicitly, exactly
 * as Constitutional Execution's and Constitutional Actuation's own
 * "internal record only" scope was disclosed rather than assumed away.
 *
 * NO FILTERING, NO PRIORITIZATION — a boundary distinct from Expression:
 * unlike src/constitutional-expression/ (which explicitly filters by
 * evidentiary sufficiency and prioritizes by source order), this
 * Package's own Boundaries forbid exactly that ("shall NOT... Prioritize.
 * Filter constitutional truth."). Every registered source that has real
 * data for a subject is included, in registration order, none dropped,
 * none reordered by significance.
 */

export type ConstitutionalSourceId = 'imperial-tongue' | 'constitutional-expression';

export interface ConstitutionalSourceDescriptor {
  readonly sourceId: ConstitutionalSourceId;
  readonly subjectKeyKind: string;
  readonly evidenceQuery: string;
}

export interface ConstitutionalSourceInput {
  readonly sourceId: ConstitutionalSourceId;
  readonly subjectKey: string;
  readonly content: string;
}

export interface ConstitutionalManifestation {
  readonly manifestationId: string;
  readonly subjectKey: string;
  readonly sources: readonly ConstitutionalSourceInput[];
  readonly identityPreserved: boolean;
  readonly generatedAt: string;
}

export interface ConstitutionalManifestationCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
