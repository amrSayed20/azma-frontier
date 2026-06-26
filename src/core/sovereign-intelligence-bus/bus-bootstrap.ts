import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { FutureSimulationRuntime } from '../future-simulation';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { AuthorityBoundaryGuard } from './authority-boundary-guard';
import { BusMemory } from './bus-memory';
import { BusRuntimeState } from './bus-runtime-state';
import { ConstitutionalMessageRouter } from './constitutional-message-router';
import { DiagnosticsLayer } from './diagnostics-layer';
import { EventExchangeEngine } from './event-exchange-engine';
import { IntelligenceContextDistributor } from './intelligence-context-distributor';
import { IntelligenceSynchronizer } from './intelligence-synchronizer';
import { PriorityRoutingEngine } from './priority-routing-engine';
import { SovereignIntelligenceBusRuntime } from './sovereign-intelligence-bus-runtime';

export function createSovereignIntelligenceBusRuntime(
  constitutionRuntime: ConstitutionRuntime,
  executiveRuntime: ExecutiveIntelligenceRuntime,
  strategicRuntime: StrategicIntelligenceRuntime,
  futureSimulationRuntime: FutureSimulationRuntime
): SovereignIntelligenceBusRuntime {
  return new SovereignIntelligenceBusRuntime(
    constitutionRuntime,
    executiveRuntime,
    strategicRuntime,
    futureSimulationRuntime,
    new ConstitutionalMessageRouter(),
    new EventExchangeEngine(),
    new AuthorityBoundaryGuard(),
    new PriorityRoutingEngine(),
    new IntelligenceSynchronizer(new IntelligenceContextDistributor()),
    new BusMemory(),
    new BusRuntimeState(),
    new DiagnosticsLayer()
  );
}
