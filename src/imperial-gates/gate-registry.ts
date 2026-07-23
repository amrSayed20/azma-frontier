/**
 * AZMA OS — THE IMPERIAL GATES
 * The Gate Registry — Real, Authored Cinematic Pacing Data
 *
 * Authorized explicitly under "The Law of Cinematic Continuity" — unlike
 * CHAMBER_SCORES's own gaps (ras-amr/makman-al-ghayah/universal), which
 * remain Constitutionally Undefined pending a separate authorization
 * this Directive did not grant, pacing data for the Gates below was
 * explicitly authorized by this Directive itself.
 *
 * Reuses EMOTIONAL_ARCS's already-certified named arcs and
 * DEFAULT_COMPANION_DIRECTION verbatim — no new arc/companion-timing
 * vocabulary invented, only assignment of the existing vocabulary to
 * the new Gate identities.
 *
 * 'imperial-gate' has no entry — no live route exists for it yet (see
 * types.ts). Authoring pacing for a page that doesn't exist would be
 * inventing content twice over; deferred until a real route exists.
 */

import { EMOTIONAL_ARCS, DEFAULT_COMPANION_DIRECTION } from '../design-system';
import type { ImperialGateId, ImperialGateScore } from './types';

export const IMPERIAL_GATE_SCORES: Partial<Record<ImperialGateId, ImperialGateScore>> = {
  landing: {
    gateId: 'landing',
    arc: EMOTIONAL_ARCS.ceremonial,
    companionDirection: DEFAULT_COMPANION_DIRECTION,
    defaultMode: 'shared-direction',
    transitionIn: 'reveal',
    transitionOut: 'reveal',
  },
  login: {
    gateId: 'login',
    arc: EMOTIONAL_ARCS.standard,
    companionDirection: DEFAULT_COMPANION_DIRECTION,
    defaultMode: 'citizen-leads',
    transitionIn: 'dissolve',
    transitionOut: 'ascend',
  },
  signup: {
    gateId: 'signup',
    arc: EMOTIONAL_ARCS.standard,
    companionDirection: DEFAULT_COMPANION_DIRECTION,
    defaultMode: 'shared-direction',
    transitionIn: 'dissolve',
    transitionOut: 'reveal',
  },
  subscription: {
    gateId: 'subscription',
    arc: EMOTIONAL_ARCS.ceremonial,
    companionDirection: DEFAULT_COMPANION_DIRECTION,
    defaultMode: 'shared-direction',
    transitionIn: 'reveal',
    transitionOut: 'ascend',
  },
};
