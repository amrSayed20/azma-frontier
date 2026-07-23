/**
 * AZMA OS — THE CONSTITUTIONAL ACTUATION
 * The Constitutional Pathway Registry
 * Construction Campaign
 *
 * Names the one and only Constitutional Pathway this module is
 * authorized to route toward. Deliberately a single-entry registry —
 * see types.ts's own disclosure for why more than one pathway kind, or
 * choosing between them, would itself be forbidden Constitutional
 * Reasoning.
 */

import type { ConstitutionalPathway } from './types';

export const CONSTITUTIONAL_PATHWAY: ConstitutionalPathway = {
  pathwayKind: 'internal-record',
  description:
    'Routes a faithful Constitutional Execution to an internal, traceable record only. No AI provider, external API, runtime worker, queue, or infrastructure integration is ever invoked — none has been authorized anywhere in this campaign.',
};
