/**
 * AZMA OS Runtime Bootstrap — initializeAzmaOs()
 *
 * The single entry point that produces a fully-operational AZMA OS instance.
 *
 * STARTUP SEQUENCE (dependency-ordered):
 *   1.  Layer 3  — Scheduling Kernel        (createSchedulingKernel)
 *   2.  Layer 4  — Memory Layer             (createMemoryLayer)
 *   3.  Layer 7  — Agent Society            (createAgentSocietyLayer)
 *   4.  Layer 8  — Sovereign Intelligence   (createSovereignIntelligenceLayer)
 *   5.  Layer 10 — Chamber Integration      (ChamberIntegrationBootstrap)
 *   6.  Layer 10 — Peripheral Adapters      (all 4 adapters; Hujjah injects L4+L8)
 *   7.  Layer 9  — Sovereign Command        (createSovereignCommandLayer)
 *   8.  Identity — Sovereign Identity       (FounderIdentityService + SovereignAuthorityService)
 *   9.  Discovery — Register manifests      (ChamberIntegrationRuntime.registerManifests)
 *  10.  Discovery — Register adapters       (ChamberLoader.registerAdapter)
 *  11.  Lifecycle — Load all chambers       (runtime.loadChamber per chamberId)
 *  12.  Lifecycle — Activate all chambers   (runtime.activateChamber per chamberId)
 *
 * INVARIANTS:
 *   - All four chambers share a single L3 kernel and single L4 memory layer.
 *   - Sovereign Intelligence Layer (L8) is a platform service owned by AZMA OS.
 *   - Sovereign Command Layer (L9) observes all layers; no chamber owns it.
 *   - Identity and Authority are independent architectural concepts (Amendment II).
 *   - No initialization logic is duplicated; each step delegates to its canonical module.
 *   - Backward compatible: existing ChamberIntegrationBootstrap is reused unmodified.
 */

import { createSchedulingKernel } from '../constitution-runtime/wp-008-kernel';
import { createMemoryLayer } from '../constitution-runtime/wp-011-kernel';
import { createAgentSocietyLayer } from '../constitution-runtime/wp-020-kernel';
import { createSovereignIntelligenceLayer } from '../sovereign-intelligence/sovereign-intelligence-layer';
import { createSovereignCommandLayer } from '../sovereign-command/sovereign-command-layer';
import { FounderSessionService } from '../sovereign-identity/founder-session-service';
import { createFounderIdentityService } from '../sovereign-identity/founder-identity-service';
import { SovereignAuthorityService } from '../sovereign-identity/sovereign-authority-service';
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

  // ── Steps 1-3: Initialize kernel layers ─────────────────────────────────
  const kernelLayer3 = createSchedulingKernel();
  const kernelLayer4 = createMemoryLayer();
  const agentSociety = createAgentSocietyLayer();

  // ── Step 4: Initialize Sovereign Intelligence Layer (platform service) ───
  const sovereignIntelligence = createSovereignIntelligenceLayer(kernelLayer4, kernelLayer3);

  // ── Step 5: Initialize chamber integration infrastructure ───────────────
  const chamberIntegration = ChamberIntegrationBootstrap.initialize();
  const { loader, runtime } = chamberIntegration;

  // ── Step 6: Construct all four Layer 10 Peripheral Adapters ────────────
  const councilRuntime = createDefaultCouncilRuntime();

  const adapters = [
    new HujjahAlDamighahAdapter(kernelLayer4, sovereignIntelligence),
    new QiyamahAdapter(kernelLayer4, kernelLayer3),
    new RasAlAmrAdapter(kernelLayer4, kernelLayer3),
    new SovereignHighCouncilAdapter(councilRuntime, kernelLayer4, kernelLayer3),
  ] as const;

  // ── Step 7: Initialize Sovereign Command Layer (L9 — Executive Command Bridge) ─
  // getChamberAdapters is a deferred getter; adapters are registered before any
  // heartbeat call so runtime ordering is always correct.
  const sovereignCommand = createSovereignCommandLayer(
    kernelLayer3,
    kernelLayer4,
    agentSociety,
    sovereignIntelligence,
    () => adapters,
  );

  // ── Step 8: Initialize Sovereign Identity (Identity ≠ Authority — Amendment II)
  const founderSession = new FounderSessionService();
  const founderIdentity = createFounderIdentityService(founderSession);
  const sovereignAuthority = new SovereignAuthorityService();

  const sovereignIdentity = {
    founderIdentity,
    founderSession,
    sovereignAuthority,
  } as const;

  // ── Step 9: Register chamber manifests for discovery ───────────────────
  runtime.registerManifests(AZMA_OS_CHAMBER_MANIFESTS);

  // ── Step 10: Register adapters in the loader ────────────────────────────
  for (const adapter of adapters) {
    loader.registerAdapter(adapter);
  }

  // ── Steps 11-12: Load then activate every registered chamber ───────────
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
    sovereignIntelligence,
    sovereignCommand,
    sovereignIdentity,
    chamberIntegration,
    registeredChambers,
    activeChambers,
  } as const;
}
