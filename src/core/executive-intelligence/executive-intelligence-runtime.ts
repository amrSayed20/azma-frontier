import { ConstitutionActionContext, ConstitutionEvaluationResult, ConstitutionEventRecord, ConstitutionRuntime } from '../constitution-runtime';
import { createExecutiveIntelligenceEngine } from './executive-intelligence-bootstrap';
import { ExecutiveIntelligenceEngine } from './executive-intelligence-engine';
import { ExecutiveDecisionPackage, ExecutiveRuntimeStateSnapshot } from './executive-intelligence-types';

export class ExecutiveIntelligenceRuntime {
  private readonly engine: ExecutiveIntelligenceEngine;

  constructor(private readonly constitutionRuntime: ConstitutionRuntime = new ConstitutionRuntime()) {
    this.engine = createExecutiveIntelligenceEngine(this.constitutionRuntime);
  }

  public processDecision(
    action: ConstitutionActionContext,
    evaluation: ConstitutionEvaluationResult
  ): ExecutiveDecisionPackage {
    return this.engine.processConstitutionDecision(action, evaluation);
  }

  public evaluateAndProcess(action: ConstitutionActionContext): ExecutiveDecisionPackage {
    const evaluation = this.constitutionRuntime.evaluate(action);
    return this.engine.processConstitutionDecision(action, evaluation);
  }

  public processObservedEvents(
    resolver: (eventRecord: ConstitutionEventRecord) =>
      | { readonly action: ConstitutionActionContext; readonly evaluation: ConstitutionEvaluationResult }
      | undefined
  ): readonly ExecutiveDecisionPackage[] {
    return this.engine.processObservedConstitutionEvents(resolver);
  }

  public getLatestDecisionPackage(): ExecutiveDecisionPackage | undefined {
    return this.engine.getLatestDecisionPackage();
  }

  public getSnapshot(): ExecutiveRuntimeStateSnapshot {
    return this.engine.getRuntimeSnapshot();
  }
}
