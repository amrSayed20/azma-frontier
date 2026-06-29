/**
 * AZMA OS Runtime Bootstrap — initializeAzmaOs()
 *
 * The single entry point that produces a fully-operational AZMA OS instance.
 *
 * STARTUP SEQUENCE (dependency-ordered):
 *   1. Layer 3  — Scheduling Kernel       (createSchedulingKernel)
 *   2. Layer 4  — Memory Layer            (createMemoryLayer)
 *   3. Layer 7  — Agent Society           (createAgentSocietyLayer)
 *   4. Layer 10 — Chamber Integration     (ChamberIntegrationBootstrap)
 *   5. Layer 10 — Peripheral Adapters     (all 4 adapters, injecting L3+L4)
 *   6. Discovery — Register manifests     (ChamberIntegrationRuntime.registerManifests)
 *   7. Discovery — Register adapters      (ChamberLoader.registerAdapter)
 *   8. Lifecycle — Load all chambers      (runtime.loadChamber per chamberId)
 *   9. Lifecycle — Activate all chambers  (runtime.activateChamber per chamberId)
 *
 * INVARIANTS:
 *   - All four chambers share a single L3 kernel and single L4 memory layer.
 *   - No initialization logic is duplicated; each step delegates to its canonical module.
 *   - Backward compatible: existing ChamberIntegrationBootstrap is reused unmodified.
 */

import { createSchedulingKernel } from '../constitution-runtime/wp-008-kernel';
import { createMemoryLayer } from '../constitution-runtime/wp-011-kernel';
import { createAgentSocietyLayer } from '../constitution-runtime/wp-020-kernel';
import { ChamberIntegrationBootstrap } from '../chamber-integration/services/chamber-integration-bootstrap';
import { HujjahAlDamighahAdapter } from '../chamber-integration/adapters/hujjah-al-damighah-adapter';
import { QiyamahAdapter } from '../chamber-integration/adapters/qiyamah-adapter';
import { RasAlAmrAdapter } from '../chamber-integration/adapters/ras-al-amr-adapter';
import { SovereignHighCouncilAdapter } from '../chamber-integration/adapters/sovereign-high-council-adapter';
import { createDefaultCouncilRuntime } from './azma-os-council-bootstrap';
import { AZMA_OS_CHAMBER_MANIFESTS } from './azma-os-chamber-manifests';
import type { AzmaOsRuntimeContract } from './azma-os-types';

export async function initializeAzmaOs(): Promise<AzmaOsRuntimeContract> {
  const startedAt = new Date();

  // ── Step 1-3: Initialize kernel layers ──────────────────────────────────
  const kernelLayer3 = createSchedulingKernel();
  const kernelLayer4 = createMemoryLayer();
  const agentSociety = createAgentSocietyLayer();

  // ── Step 4: Initialize chamber integration infrastructure ───────────────
  const chamberIntegration = ChamberIntegrationBootstrap.initialize();
  const { loader, runtime } = chamberIntegration;

  // ── Step 5: Construct all four Layer 10 Peripheral Adapters ────────────
  // All adapters receive the same shared kernel instances (L3 + L4).
  const councilRuntime = createDefaultCouncilRuntime();

  const adapters = [
    new HujjahAlDamighahAdapter(kernelLayer4, kernelLayer3),
    new QiyamahAdapter(kernelLayer4, kernelLayer3),
    new RasAlAmrAdapter(kernelLayer4, kernelLayer3),
    new SovereignHighCouncilAdapter(councilRuntime, kernelLayer4, kernelLayer3),
  ] as const;

  // ── Step 6: Register chamber manifests for discovery ───────────────────
  runtime.registerManifests(AZMA_OS_CHAMBER_MANIFESTS);

  // ── Step 7: Register adapters in the loader ─────────────────────────────
  for (const adapter of adapters) {
    loader.registerAdapter(adapter);
  }

  // ── Steps 8-9: Load then activate every registered chamber ─────────────
  const chamberIds = adapters.map((a) => a.chamberId);

  for (const chamberId of chamberIds) {
    await runtime.loadChamber(chamberId);
  }

  for (const chamberId of chamberIds) {
    await runtime.activateChamber(chamberId);
  }

  // ── Verify: confirm all chambers reached ACTIVE status ──────────────────
  const registeredChambers = chamberIntegration.chamberRegistry
    .list()
    .map((ep) => ep.chamberId);

  const activeChambers = chamberIntegration.chamberRegistry
    .list()
    .filter((ep) => ep.status === 'ACTIVE')
    .map((ep) => ep.chamberId);

  return {
    version: '1.0.0',
    startedAt,
    kernelLayer3,
    kernelLayer4,
    agentSociety,
    chamberIntegration,
    registeredChambers,
    activeChambers,
  } as const;
}
