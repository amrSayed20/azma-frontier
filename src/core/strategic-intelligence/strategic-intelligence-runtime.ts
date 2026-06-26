import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { createStrategicIntelligenceEngine } from './strategic-intelligence-bootstrap';
import { StrategicIntelligenceEngine } from './strategic-intelligence-engine';
import { StrategicIntelligencePackage, StrategicRuntimeStateSnapshot } from './strategic-intelligence-types';

export class StrategicIntelligenceRuntime {
  private readonly engine: StrategicIntelligenceEngine;

  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime = new ConstitutionRuntime(),
    private readonly executiveRuntime?: ExecutiveIntelligenceRuntime
  ) {
    this.engine = createStrategicIntelligenceEngine(this.constitutionRuntime, this.executiveRuntime);
  }

  public generatePackage(): StrategicIntelligencePackage {
    return this.engine.generateStrategicIntelligencePackage();
  }

  public getLatestPackage(): StrategicIntelligencePackage | undefined {
    return this.engine.getLatestStrategicPackage();
  }

  public getSnapshot(): StrategicRuntimeStateSnapshot {
    return this.engine.getRuntimeStateSnapshot();
  }
}
