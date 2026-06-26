import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { FutureSimulationRuntime } from '../future-simulation';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { createSovereignIntelligenceBusRuntime } from './bus-bootstrap';
import { SovereignIntelligenceBusRuntime } from './sovereign-intelligence-bus-runtime';

export class SovereignIntelligenceBusApi {
  private readonly runtime: SovereignIntelligenceBusRuntime;

  constructor(
    constitutionRuntime: ConstitutionRuntime,
    executiveRuntime: ExecutiveIntelligenceRuntime,
    strategicRuntime: StrategicIntelligenceRuntime,
    futureSimulationRuntime: FutureSimulationRuntime
  ) {
    this.runtime = createSovereignIntelligenceBusRuntime(
      constitutionRuntime,
      executiveRuntime,
      strategicRuntime,
      futureSimulationRuntime
    );
  }

  public synchronize() {
    return this.runtime.synchronizeIntelligence();
  }

  public diagnostics() {
    return this.runtime.getDiagnostics();
  }

  public snapshot() {
    return this.runtime.getSnapshot();
  }

  public recentPublished(limit: number = 20) {
    return this.runtime.getRecentPublishedMessages(limit);
  }

  public recentRouted(limit: number = 20) {
    return this.runtime.getRecentRoutedMessages(limit);
  }
}
