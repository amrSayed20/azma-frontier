/**
 * AZMA OS — THE BUTTON ENGINE
 * Type Definitions
 *
 * New constitutional work, commissioned directly — not a reinterpretation
 * of Manifestation (data-only, forbidden from filtering/deciding), not an
 * extension of Constitutional Execution (records one abstract action
 * after approval, never decides visibility before it), and not a change
 * to Constitutional Expression (filters which internal organs may speak,
 * not which UI a Creator sees). This engine answers exactly one question:
 * given where a Creator stands and who they are, which constitutional
 * actions are available to them right now? It does not perform actions,
 * does not decide copy (see Creator Language Experience's labelKey), and
 * does not own auth/entitlement logic — it only consumes their
 * already-certified answers as input.
 */

import type { ChamberDestination } from '@/src/constitutional-navigation';

export type Threshold = 'gate' | 'subscribe' | 'chamber';

export type ChamberState = 'idle' | 'unauthorized' | 'payment-required' | 'error' | 'complete';

export interface ButtonContext {
  readonly threshold: Threshold;
  /** Relevant to 'gate' and 'subscribe'; the 'chamber' threshold resolves purely from chamberState and ignores these. */
  readonly authenticated?: boolean;
  readonly role?: 'creator' | 'founder' | null;
  readonly chamberState?: ChamberState;
  /**
   * Which Chamber this Creator stands in, when the consumer knows.
   *
   * Optional on purpose. The Gate and Subscribe call sites stand in no Chamber
   * and pass none; the Qiyamah call site — the one standing inside a Chamber —
   * passes what resolveChamberFromPath answers for the real pathname. Its
   * behaviour is identical with and without it: this carries the Chamber
   * through the layer so Awareness sees it on a real journey, and changes no
   * decision today. A decision that used it would be a widening of what
   * Awareness decides, which is a separate, owner-gated question.
   */
  readonly chamber?: ChamberDestination | null;
}

/**
 * Sourced from the Manifestation Plan contract (src/manifestation-plan/)
 * rather than redeclared here, so Button Engine's own id space and the
 * Imperial Awareness/Manifestation Engines' capability id space can never
 * silently drift apart now that Button Engine consumes them.
 */
import type { ConstitutionalCapabilityId } from '@/src/manifestation-plan';
export type ConstitutionalActionId = ConstitutionalCapabilityId;

export interface ActionDefinition {
  /** Matches a Creator Language Experience dictionary key — the Button Engine never owns copy directly. */
  readonly labelKey: string;
  readonly href?: string;
  readonly kind: 'navigate' | 'submit' | 'informational';
}

export interface AvailableAction extends ActionDefinition {
  readonly id: ConstitutionalActionId;
}
