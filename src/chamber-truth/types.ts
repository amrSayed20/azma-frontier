import type { ChamberId } from '@/src/chamber-identity';

/**
 * AZMA OS — CHAMBER TRUTH
 * What a Chamber can genuinely do, right now.
 *
 * ─── WHY THIS LAYER EXISTS ──────────────────────────────────────────────────
 *
 *   Three registries already describe a Chamber and none of them answers this
 *   question:
 *
 *     chamber-identity          who it is, why it exists, what it CAN do —
 *                               prose, written for a reader
 *     entry-exit-conditions     when to enter, when a visit concludes
 *     chamber-vision            the same grounded facts in a philosophical
 *                               register, by its own description
 *
 *   None of them names an executable path. So the only way to answer "what can
 *   I actually do here" has been to read the page and count its buttons — and
 *   a repository audit measured 77 buttons manifested against a constitutional
 *   action registry holding 10. Reading the interface is how the interface
 *   became its own authority.
 *
 * ─── THE ONE RULE ───────────────────────────────────────────────────────────
 *
 *   Every capability declared here carries the service boundary that performs
 *   it. A capability with no boundary is not written down — not as a disabled
 *   entry, not as a "coming soon", not as a placeholder. It is ABSENT, or it
 *   is named in DEFERRED_CAPABILITIES where the absence itself is the record.
 *
 *   That rule is what lets a truthful guide be derived from this file later:
 *   if it says the Creator can do something, an executable path exists.
 *
 * ─── WHAT THIS IS NOT ───────────────────────────────────────────────────────
 *
 *   Not a UI model. No label, no icon, no order, no grouping, no copy. Those
 *   belong to presentation, and putting them here would make this a second
 *   interface definition — the exact mistake it exists to end.
 *
 *   Not a decision engine. It states what a Chamber can do; whether a given
 *   Creator may do it now remains the Imperial Awareness Engine's question.
 */

/**
 * How a capability is actually reached.
 *
 * `route` is an HTTP boundary under app/api/. `action` is a Next.js Server
 * Action — the Chamber of Evidence has no API routes at all and would be
 * invisible to a route-only model.
 */
export type CapabilityBoundaryKind = 'route' | 'action';

export interface CapabilityBoundary {
  readonly kind: CapabilityBoundaryKind;
  /**
   * The exact path or exported function name, verbatim.
   *
   * Verbatim matters: a test can assert that this file's every claim resolves
   * to something that exists on disk, which is what keeps the model honest as
   * the Empire changes underneath it.
   */
  readonly at: string;
  /** For 'route' only — the verbs the handler actually exports. */
  readonly methods?: readonly ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')[];
}

/**
 * One thing a Creator can genuinely do in a Chamber.
 *
 * `id` is stable and machine-facing; it is never shown to a Creator. What a
 * capability is CALLED belongs to the Creator Language Experience, and what it
 * LOOKS like belongs to presentation.
 */
export interface ChamberCapability {
  readonly id: string;
  /** What it does, in engineering terms — for a reader of this file, not for a Creator. */
  readonly performs: string;
  /**
   * The same act, said to the Creator in their own tongue.
   *
   * `performs` is written for whoever reads this file and may never be shown:
   * it is English, and the Empire does not speak English to a Creator. A guide
   * that described a Chamber from a second, hand-kept list would drift from
   * what the Chamber actually does the first time a capability changed — so
   * the sentence the Creator reads is declared here, beside the boundary that
   * performs it, and moves only when the capability moves.
   */
  readonly performsAr: string;
  readonly boundary: CapabilityBoundary;
  /**
   * Whether exercising it requires an existing sovereign asset.
   *
   * The distinction a Chamber guide needs most: a Creator with an empty Vault
   * can generate, and cannot edit. Telling them otherwise is the first lie an
   * interface tells.
   */
  readonly requiresExistingAsset: boolean;
}

/**
 * A responsibility the constitution gives a Chamber that the repository does
 * NOT implement.
 *
 * Recorded rather than omitted, because silence would let the gap be
 * rediscovered as a surprise — and because the honest guide for a Chamber is
 * shaped as much by what it cannot do as by what it can. Nothing here may
 * ever be offered to a Creator.
 */
export interface DeferredCapability {
  readonly responsibility: string;
  /**
   * The same gap, said to the Creator in their own tongue.
   *
   * `responsibility` is written for a reader of this file. A Chamber's guide
   * shows what the Chamber will not do, and it must say that in Arabic like
   * everything else the Creator reads.
   */
  readonly responsibilityAr: string;
  /** Where the constitution assigns it. */
  readonly constitutionalSource: string;
  /** What is actually missing — measured, not guessed. */
  readonly missing: string;
}

export interface ChamberTruth {
  readonly chamberId: ChamberId;
  readonly capabilities: readonly ChamberCapability[];
  readonly deferred: readonly DeferredCapability[];
}
