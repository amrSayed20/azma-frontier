/**
 * AZMA OS — CHAMBER TRUTH
 *
 * The authority that answers "what can this Chamber genuinely do right now",
 * where every answer carries the service boundary that performs it.
 *
 * Import from here — never from truth-registry.ts directly.
 */

export type {
  ChamberTruth,
  ChamberCapability,
  DeferredCapability,
  CapabilityBoundary,
  CapabilityBoundaryKind,
} from './types';

export { CHAMBER_TRUTH, getChamberTruth, getExercisableCapabilities } from './truth-registry';
export type { TruthCapabilityId, CapabilityIdOf } from './truth-registry';
