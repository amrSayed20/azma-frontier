/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * Constitutional Perception Contracts
 * Construction Phase II
 *
 * Two things live here, deliberately kept distinct:
 *
 * 1. createPerceptionEndpointForOrgan() — a real, executable factory
 *    that gives ANY organ already registered in the Skeleton
 *    (src/sovereign-body) a working PerceptionEndpoint (Phase II,
 *    Engineering Requirements: "every organ shall possess a
 *    constitutional perception endpoint"). This satisfies the
 *    requirement structurally — every one of the Skeleton's 11 organs
 *    CAN be given an endpoint today — without modifying any of those
 *    11 organs' own source files. No chamber, no Sovereign Identity
 *    file, no existing system was touched to achieve this.
 *
 * 2. PERCEPTION_CONTRACT — the documented, non-executable BEHAVIORAL
 *    promise every perception endpoint must honor (must not block, must
 *    not throw except for illegitimate origins, must remain read-only
 *    toward the Bus). This is specification, the same pattern already
 *    used for SIO-009's FUTURE_RUNTIME_CONTRACT and the Diwan's
 *    CONSTITUTIONAL_LIFECYCLE_CONTRACT — a contract future organs must
 *    satisfy, not itself executable logic.
 */

import { getOrganById } from '../sovereign-body';
import { emitSignal } from './perception-bus';
import { observeOrganState } from './state-registry';
import type { PerceptionEndpoint } from './types';

/**
 * Builds a real PerceptionEndpoint for one Skeleton-registered organ.
 * Throws if the organ id is not recognized — the same legitimacy check
 * the Bus itself applies, surfaced early so a caller learns immediately
 * rather than on first report().
 */
export function createPerceptionEndpointForOrgan(organId: string): PerceptionEndpoint {
  if (!getOrganById(organId)) {
    throw new Error(
      `Constitutional Nervous System: cannot create a perception endpoint for "${organId}" — it is not a recognized constitutional organ (src/sovereign-body Organ Registry).`,
    );
  }

  return {
    organId,
    report: (draft) => emitSignal({ ...draft, origin: organId }),
    observeSelf: () => observeOrganState(organId),
  };
}

export const PERCEPTION_CONTRACT = {
  mustNeverBlock:
    'A perception endpoint\'s report() call must return synchronously and must never await, poll, or otherwise delay the Bus. Perception is instantaneous transport, not a workflow step.',
  mustNeverThrowExceptOnIllegitimateOrigin:
    'report() may only throw if the organ id itself is unrecognized. It must never throw because of what the signal content means — the endpoint does not evaluate meaning.',
  mustRemainReadOnlyTowardTheBus:
    'An organ\'s perception endpoint may report signals and observe its own state; it must never mutate the Signal Log, the State Registry, or another organ\'s endpoint directly.',
  mustNotInterpretIncomingSignals:
    'Any listener an organ registers via observeOrgan()/observeSignalType()/observeAll() may react however that organ\'s OWN constitutional authority permits — but the Nervous System itself, and this contract, impose no interpretation of what a signal means. That responsibility belongs to the Sovereign Core (Phase V), not the Nervous System.',
} as const;
