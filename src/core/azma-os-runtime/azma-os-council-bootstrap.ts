/**
 * AZMA OS — Council Runtime Bootstrap
 *
 * Convenience factory that wires all upstream dependencies and produces
 * a ready-to-use CouncilRuntime with fully-default sub-runtimes.
 * Kept separate from the main OS bootstrap to isolate the al-wateen
 * dependency chain and keep initializeAzmaOs() readable.
 *
 * Dependency order (each line depends only on those above it):
 *   1. ConstitutionRuntime       — Layer 1 (no deps)
 *   2. ExecutiveIntelligenceRuntime — uses ConstitutionRuntime
 *   3. StrategicIntelligenceRuntime — uses Constitution + Executive
 *   4. FutureSimulationRuntime   — uses Constitution + Executive + Strategic
 *   5. SovereignIntelligenceBusApi  — uses all four above
 *   6. SovereignPerceptionRuntime   — uses all five above
 *   7. AlWateenIntegrationRuntime   — uses all six above
 *   8. DoctrineRuntime           — self-contained
 *   9. CouncilRuntime            — uses AlWateen + Doctrine + Future
 */

import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { FutureSimulationRuntime } from '../future-simulation';
import { SovereignIntelligenceBusApi } from '../sovereign-intelligence-bus';
import { SovereignPerceptionRuntime } from '../sovereign-perception';
import { AlWateenIntegrationRuntime } from '../al-wateen/living-intelligence/al-wateen-integration-runtime';
import { DoctrineRuntime } from '../al-wateen/decision-doctrine/doctrine-runtime';
import { createCouncilRuntime } from '../sovereign-high-council-runtime/runtime-bootstrap';
import type { CouncilRuntime } from '../sovereign-high-council-runtime/council-runtime';

export function createDefaultCouncilRuntime(): CouncilRuntime {
  const constitution = new ConstitutionRuntime();
  const executive = new ExecutiveIntelligenceRuntime(constitution);
  const strategic = new StrategicIntelligenceRuntime(constitution, executive);
  const future = new FutureSimulationRuntime(constitution, executive, strategic);
  const busApi = new SovereignIntelligenceBusApi(constitution, executive, strategic, future);
  const perception = new SovereignPerceptionRuntime(
    constitution,
    executive,
    strategic,
    future,
    busApi,
  );
  const alWateen = new AlWateenIntegrationRuntime(
    constitution,
    executive,
    strategic,
    future,
    busApi,
    perception,
  );
  const doctrine = new DoctrineRuntime();

  return createCouncilRuntime(alWateen, doctrine, future);
}
