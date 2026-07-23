/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION
 * The Constitutional Action Registry
 * Construction Campaign
 *
 * Names the one and only Constitutional Action this module is
 * authorized to perform. Deliberately a single-entry registry — see
 * types.ts's own disclosure for why more than one action kind, or
 * branching between them, would itself be an act of forbidden judgment.
 */

import type { ConstitutionalAction } from './types';

export const CONSTITUTIONAL_ACTION: ConstitutionalAction = {
  actionKind: 'faithful-record',
  description:
    'Records, faithfully and without alteration, that an already-approved Constitutional Decision has been carried through to completion. No external system, organ, or provider is invoked — no such capability has ever been authorized anywhere in this campaign.',
};
