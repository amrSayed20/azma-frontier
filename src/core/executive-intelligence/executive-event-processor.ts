import { ConstitutionActionContext, ConstitutionEvaluationResult, ConstitutionEventRecord, ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveEventProcessingError } from './executive-intelligence-errors';
import { ExecutiveObservedEvent, ExecutivePipelineInput } from './executive-intelligence-types';
import { ExecutiveRuntimeState } from './executive-runtime-state';

export class ExecutiveEventProcessor {
  public collectPendingEvents(
    constitutionRuntime: ConstitutionRuntime,
    state: ExecutiveRuntimeState
  ): readonly ConstitutionEventRecord[] {
    return constitutionRuntime
      .getEvents()
      .filter((eventRecord) => !state.hasProcessedEvent(eventRecord.eventId));
  }

  public toObservedEvent(eventRecord: ConstitutionEventRecord): ExecutiveObservedEvent {
    return {
      eventId: eventRecord.eventId,
      sourceEventType: eventRecord.eventType,
      actionId: eventRecord.actionId,
      recordedAt: eventRecord.timestamp,
      payload: eventRecord.payload,
    };
  }

  public toPipelineInput(
    eventRecord: ConstitutionEventRecord,
    action: ConstitutionActionContext,
    evaluation: ConstitutionEvaluationResult
  ): ExecutivePipelineInput {
    const observedEvent = this.toObservedEvent(eventRecord);

    if (action.actionId !== evaluation.actionId) {
      throw new ExecutiveEventProcessingError('Cannot create pipeline input from mismatched action and evaluation identifiers.');
    }

    return {
      observedEvent,
      action,
      evaluation,
    };
  }
}
