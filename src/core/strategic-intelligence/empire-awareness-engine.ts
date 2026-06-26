import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { StrategicRuntimeValidationError } from './strategic-intelligence-errors';
import { StrategicIntelligenceInput } from './strategic-intelligence-types';

export class EmpireAwarenessEngine {
  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime,
    private readonly executiveRuntime?: ExecutiveIntelligenceRuntime
  ) {}

  public observeEmpire(): StrategicIntelligenceInput {
    const constitutionState = this.constitutionRuntime.getState();
    if (!constitutionState?.loaded) {
      throw new StrategicRuntimeValidationError('Constitution Runtime must be loaded before strategic observation.');
    }

    return {
      constitutionState,
      constitutionEvents: this.constitutionRuntime.getEvents(),
      executiveState: this.executiveRuntime?.getSnapshot(),
    };
  }
}
