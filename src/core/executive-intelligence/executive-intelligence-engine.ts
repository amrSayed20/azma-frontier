import { ConstitutionActionContext, ConstitutionEvaluationResult, ConstitutionEventRecord, ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveDecisionPipeline } from './executive-decision-pipeline';
import { ExecutiveEventProcessor } from './executive-event-processor';
import { ExecutiveMemoryBridge } from './executive-memory-bridge';
import { ExecutiveDecisionPackage, ExecutiveRuntimeStateSnapshot } from './executive-intelligence-types';
import { ExecutiveRuntimeState } from './executive-runtime-state';
import { ExecutiveValidationLayer } from './executive-validation-layer';

export class ExecutiveIntelligenceEngine {
  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime,
    private readonly eventProcessor: ExecutiveEventProcessor,
    private readonly decisionPipeline: ExecutiveDecisionPipeline,
    private readonly memoryBridge: ExecutiveMemoryBridge,
    private readonly validationLayer: ExecutiveValidationLayer,
    private readonly runtimeState: ExecutiveRuntimeState
  ) {}

  public processConstitutionDecision(
    action: ConstitutionActionContext,
    evaluation: ConstitutionEvaluationResult
  ): ExecutiveDecisionPackage {
    this.validationLayer.validateRuntime(this.constitutionRuntime);

    const syntheticEvent: ConstitutionEventRecord = {
      eventId: `exec-event-${action.actionId}-${Date.now().toString(36)}`,
      eventType: 'action-evaluated',
      source: 'constitution-runtime',
      payload: {
        actionId: action.actionId,
        title: action.title,
      },
      actionId: action.actionId,
      articleId: evaluation.articleId,
      timestamp: new Date(),
    };

    const input = this.eventProcessor.toPipelineInput(syntheticEvent, action, evaluation);
    const decisionPackage = this.decisionPipeline.process(input);

    this.memoryBridge.bridge(decisionPackage);
    this.runtimeState.markObservedEvent(syntheticEvent.eventId);
    this.runtimeState.recordDecisionPackage(decisionPackage);

    return decisionPackage;
  }

  public processObservedConstitutionEvents(
    resolver: (eventRecord: ConstitutionEventRecord) =>
      | { readonly action: ConstitutionActionContext; readonly evaluation: ConstitutionEvaluationResult }
      | undefined
  ): readonly ExecutiveDecisionPackage[] {
    this.validationLayer.validateRuntime(this.constitutionRuntime);

    const events = this.eventProcessor.collectPendingEvents(this.constitutionRuntime, this.runtimeState);
    const packages: ExecutiveDecisionPackage[] = [];

    for (const eventRecord of events) {
      this.runtimeState.markObservedEvent(eventRecord.eventId);

      const resolved = resolver(eventRecord);
      if (!resolved) {
        continue;
      }

      const input = this.eventProcessor.toPipelineInput(eventRecord, resolved.action, resolved.evaluation);
      const decisionPackage = this.decisionPipeline.process(input);
      this.memoryBridge.bridge(decisionPackage);
      this.runtimeState.recordDecisionPackage(decisionPackage);
      packages.push(decisionPackage);
    }

    return packages;
  }

  public getLatestDecisionPackage(): ExecutiveDecisionPackage | undefined {
    return this.memoryBridge.getLatestPackage();
  }

  public getRuntimeSnapshot(): ExecutiveRuntimeStateSnapshot {
    return this.runtimeState.snapshot();
  }
}
