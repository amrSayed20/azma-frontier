import {
  AlWateenIntegrationRuntime,
  DoctrineRuntime,
} from '../al-wateen';
import { FutureSimulationRuntime } from '../future-simulation';
import { BriefingDistributor } from './briefing-distributor';
import { CouncilSession } from './council-session';
import { CouncilState } from './council-state';
import { FounderSessionManager } from './founder-session-manager';
import { CouncilRuntime } from './council-runtime';
import { RuntimeMemory } from './runtime-memory';
import { RuntimeSynchronizer } from './runtime-synchronizer';

export function createCouncilRuntime(
  alWateenRuntime: AlWateenIntegrationRuntime,
  doctrineRuntime: DoctrineRuntime,
  futureSimulationRuntime: FutureSimulationRuntime
): CouncilRuntime {
  return new CouncilRuntime(
    new FounderSessionManager(new CouncilSession()),
    new RuntimeSynchronizer(alWateenRuntime, doctrineRuntime, futureSimulationRuntime),
    new BriefingDistributor(),
    new RuntimeMemory(),
    new CouncilState(),
    alWateenRuntime
  );
}
