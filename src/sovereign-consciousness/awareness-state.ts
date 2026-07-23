/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * The Constitutional Awareness State
 * Construction Phase VII
 *
 * DISCLOSURE: this objective already exists. The Nervous System's own
 * State Registry (Phase II, src/sovereign-nervous-system/state-registry.ts)
 * already records the last-known signal of every type, per organ,
 * automatically — every emitSignal() call already updates it (see
 * perception-bus.ts). This file is a thin, Consciousness-scoped entry
 * point onto that same registry, not a second one.
 */

import { observeOrganState, listObservedOrganIds } from '../sovereign-nervous-system';
import type { ConstitutionalSignal, ConstitutionalSignalType } from '../sovereign-nervous-system';

/** One organ's complete last-known observable state, across every signal type it has reported. Read-only. */
export function getAwarenessStateForOrgan(
  organId: string,
): Readonly<Partial<Record<ConstitutionalSignalType, ConstitutionalSignal>>> {
  return observeOrganState(organId);
}

/** Every organ id the Body is currently aware of — has reported at least one signal so far. */
export function listAwareOrganIds(): readonly string[] {
  return listObservedOrganIds();
}
