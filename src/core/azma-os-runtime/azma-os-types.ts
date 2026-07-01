/**
 * AZMA OS Runtime Contract
 *
 * The top-level public surface of a fully-initialized AZMA OS instance.
 * Returned by initializeAzmaOs() after all layers and chambers are active.
 *
 * LAYER COMPOSITION:
 *   Layer 2  — Sovereign Operations Bus (SOB)
 *   Layer 3  — Scheduling Kernel (WP-008)
 *   Layer 4  — Memory Layer (WP-009/010/011)
 *   Layer 7  — Agent Society (WP-013/020)
 *   Layer 8  — Sovereign Intelligence
 *   Layer 9  — Sovereign Command
 *   Layer 10 — Peripheral Adapters (Chamber Integration)
 */

import type { SovereignBusContract } from '../sovereign-bus/sovereign-bus-contract';
import type { SchedulingKernelContract } from '../constitution-runtime/wp-008-types';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { AgentSocietyLayerContract } from '../constitution-runtime/wp-013-020-agent-society-types';
import type { IntelligenceRuntimeContract } from '../sovereign-intelligence/intelligence-runtime-contract';
import type { SovereignCommandContract } from '../sovereign-command/sovereign-command-contract';
import type { SovereignIdentityContract } from '../sovereign-identity/sovereign-identity-contract';
import type { ChamberIntegrationServices } from '../chamber-integration/services/chamber-integration-bootstrap';
import type { SovereignJourneyEngineContract } from '../sovereign-journey/sovereign-journey-contract';

export interface AzmaOsRuntimeContract {
  readonly version: '1.0.0';
  readonly startedAt: Date;

  // Layer 2 — Sovereign Operations Bus
  readonly sovereignBus: SovereignBusContract;

  // Layer 3 — Scheduling
  readonly kernelLayer3: SchedulingKernelContract;

  // Layer 4 — Memory
  readonly kernelLayer4: MemoryLayerContract;

  // Layer 5 — Sovereign Journey Engine
  readonly sovereignJourney: SovereignJourneyEngineContract;

  // Layer 7 — Agent Society
  readonly agentSociety: AgentSocietyLayerContract;

  // Layer 8 — Sovereign Intelligence (platform service consumed by all chambers)
  readonly sovereignIntelligence: IntelligenceRuntimeContract;

  // Layer 9 — Sovereign Command (Executive Intelligence Center)
  readonly sovereignCommand: SovereignCommandContract;

  // Sovereign Identity (Founder Identity + Authority — Amendment II)
  readonly sovereignIdentity: SovereignIdentityContract;

  // Layer 10 — Chamber Integration infrastructure (registries, bridges, lifecycle)
  readonly chamberIntegration: ChamberIntegrationServices;

  // Discovery manifest
  readonly registeredChambers: readonly string[];
  readonly activeChambers: readonly string[];
}
