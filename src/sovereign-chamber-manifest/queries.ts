/**
 * AZMA OS — SOVEREIGN CHAMBER MANIFEST
 * Constitutional Query Layer
 *
 * Pure, read-only accessor functions over SOVEREIGN_CHAMBER_MANIFESTS.
 * No mutation, no side effects, no network, no execution.
 */

import { SOVEREIGN_CHAMBER_MANIFESTS } from './manifests';
import type { SovereignChamberManifest, ManifestChamberContext } from './types';

/** Returns every declared chamber manifest, in declaration order. */
export function listAllChamberManifests(): readonly SovereignChamberManifest[] {
  return SOVEREIGN_CHAMBER_MANIFESTS;
}

/** Returns the manifest for a given chamber, or null if not declared. */
export function getChamberManifest(
  chamberId: ManifestChamberContext,
): SovereignChamberManifest | null {
  return SOVEREIGN_CHAMBER_MANIFESTS.find((m) => m.chamberId === chamberId) ?? null;
}

/** Returns the manifest for a given chamber by string id, or null. */
export function getChamberManifestById(chamberId: string): SovereignChamberManifest | null {
  return SOVEREIGN_CHAMBER_MANIFESTS.find((m) => m.chamberId === chamberId) ?? null;
}
