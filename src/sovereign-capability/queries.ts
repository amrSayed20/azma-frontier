/**
 * AZMA OS — THE SOVEREIGN CAPABILITY DIWAN
 * The Constitutional Query Layer (Construction ID SCD-001)
 * Campaign A — Constitutional Declaration Foundation
 *
 * Pure, read-only accessor functions over CAPABILITY_DIWAN. Every
 * function here does nothing but read already-declared data — no
 * mutation, no side effects, no network, no scheduling. This is the
 * Diwan's entire public surface for discovery (Diwan Ch. III Art. V):
 * consumers call these functions; nothing here calls back into a
 * consumer, a provider, or a chamber.
 */

import { CAPABILITY_DIWAN } from './diwan';
import type {
  ConstitutionalCapability,
  CapabilityOwner,
  CapabilityLifecycleState,
  ConstitutionalConsumer,
} from './types';

/** Returns every declared capability, in declaration order. */
export function listAllCapabilities(): readonly ConstitutionalCapability[] {
  return CAPABILITY_DIWAN;
}

/** Returns one capability by its constitutional id, or null if none exists. */
export function getCapabilityById(id: string): ConstitutionalCapability | null {
  return CAPABILITY_DIWAN.find((capability) => capability.id === id) ?? null;
}

/** Returns every capability owned by the given Sovereign Chamber. */
export function listCapabilitiesByOwner(
  owner: CapabilityOwner,
): readonly ConstitutionalCapability[] {
  return CAPABILITY_DIWAN.filter((capability) => capability.owner === owner);
}

/** Returns every capability currently in the given lifecycle state. */
export function listCapabilitiesByLifecycleState(
  state: CapabilityLifecycleState,
): readonly ConstitutionalCapability[] {
  return CAPABILITY_DIWAN.filter((capability) => capability.lifecycleState === state);
}

/**
 * Returns every capability that has declared itself discoverable to the
 * given constitutional consumer type (Diwan Ch. II Art. VI).
 */
export function listDiscoverableCapabilitiesFor(
  consumer: ConstitutionalConsumer,
): readonly ConstitutionalCapability[] {
  return CAPABILITY_DIWAN.filter(
    (capability) =>
      capability.visibility.discoverable && capability.visibility.visibleTo.includes(consumer),
  );
}

export interface ConstitutionalObservationSummary {
  readonly totalCapabilities: number;
  readonly byLifecycleState: Readonly<Record<CapabilityLifecycleState, number>>;
  readonly byOwner: Readonly<Partial<Record<CapabilityOwner, number>>>;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly discoverableCount: number;
}

/**
 * Constitutional Observation (Diwan Ch. III Art. IX): a pure, read-only
 * summary of the Diwan's current state — how many capabilities exist,
 * grouped by lifecycle state, owner, and category, and how many are
 * currently discoverable. Observation belongs to governance, not
 * engineering — this function computes nothing beyond counting what is
 * already declared; it does not decide, certify, or publish anything.
 */
export function getConstitutionalObservationSummary(): ConstitutionalObservationSummary {
  const byLifecycleState: Record<CapabilityLifecycleState, number> = {
    active: 0,
    'awaiting-certification': 0,
    deprecated: 0,
    retired: 0,
    restricted: 0,
    unavailable: 0,
  };
  const byOwner: Partial<Record<CapabilityOwner, number>> = {};
  const byCategory: Record<string, number> = {};
  let discoverableCount = 0;

  for (const capability of CAPABILITY_DIWAN) {
    byLifecycleState[capability.lifecycleState] += 1;
    byOwner[capability.owner] = (byOwner[capability.owner] ?? 0) + 1;
    byCategory[capability.category] = (byCategory[capability.category] ?? 0) + 1;
    if (capability.visibility.discoverable) discoverableCount += 1;
  }

  return {
    totalCapabilities: CAPABILITY_DIWAN.length,
    byLifecycleState,
    byOwner,
    byCategory,
    discoverableCount,
  };
}
