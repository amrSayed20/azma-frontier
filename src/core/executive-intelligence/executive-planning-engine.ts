import { ExecutiveDecisionPlan, ExecutivePipelineInput, ExecutivePriorityProfile, ExecutiveRecommendation } from './executive-intelligence-types';

export class ExecutivePlanningEngine {
  public buildPlan(
    input: ExecutivePipelineInput,
    priority: ExecutivePriorityProfile,
    recommendations: readonly ExecutiveRecommendation[]
  ): ExecutiveDecisionPlan {
    const awaitingFounderApproval = recommendations.some((recommendation) => recommendation.requiresFounderApproval);

    return {
      planId: `exec-plan-${input.action.actionId}`,
      actionId: input.action.actionId,
      status: awaitingFounderApproval ? 'awaiting-founder-approval' : 'pending-founder-review',
      priority: priority.executivePriority,
      steps: [
        {
          stepId: `exec-step-${input.action.actionId}-1`,
          order: 1,
          intent: 'observe',
          title: 'Capture constitutional event and executive context.',
          blocking: false,
        },
        {
          stepId: `exec-step-${input.action.actionId}-2`,
          order: 2,
          intent: 'analyze',
          title: 'Finalize situation and risk analysis package.',
          blocking: false,
        },
        {
          stepId: `exec-step-${input.action.actionId}-3`,
          order: 3,
          intent: 'recommend',
          title: 'Compile executive recommendations and priority posture.',
          blocking: false,
        },
        {
          stepId: `exec-step-${input.action.actionId}-4`,
          order: 4,
          intent: 'submit',
          title: 'Submit package to Founder and pause until approval when required.',
          blocking: awaitingFounderApproval,
        },
      ],
      submissionNote: awaitingFounderApproval
        ? 'Founder approval is required before any dispatch-level execution.'
        : 'Founder review requested for governance transparency before dispatch.',
    };
  }
}
