import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveFounderApprovalError, ExecutiveValidationError } from './executive-intelligence-errors';
import { ExecutivePipelineInput, ExecutiveRecommendation } from './executive-intelligence-types';

export class ExecutiveValidationLayer {
  public validateRuntime(constitutionRuntime: ConstitutionRuntime): void {
    const state = constitutionRuntime.getState();
    if (!state?.loaded) {
      throw new ExecutiveValidationError('Constitution Runtime must be loaded before executive processing.');
    }
  }

  public validatePipelineInput(input: ExecutivePipelineInput): void {
    if (!input.action.actionId || !input.evaluation.actionId) {
      throw new ExecutiveValidationError('Action and evaluation identifiers are required.');
    }

    if (input.action.actionId !== input.evaluation.actionId) {
      throw new ExecutiveValidationError('Action identifier mismatch between context and evaluation result.');
    }

    if (input.evaluation.complianceScore < 0 || input.evaluation.complianceScore > 100) {
      throw new ExecutiveValidationError('Compliance score must be between 0 and 100.');
    }

    if (input.evaluation.priorityScore < 0 || input.evaluation.priorityScore > 100) {
      throw new ExecutiveValidationError('Priority score must be between 0 and 100.');
    }
  }

  public validateFounderAuthority(
    input: ExecutivePipelineInput,
    recommendations: readonly ExecutiveRecommendation[]
  ): void {
    const founderSensitive =
      input.action.actionType === 'founder-interaction' || input.evaluation.decision === 'escalate';

    if (!founderSensitive) {
      return;
    }

    const hasFounderApprovalGate = recommendations.some((recommendation) => recommendation.requiresFounderApproval);

    if (!hasFounderApprovalGate) {
      throw new ExecutiveFounderApprovalError('Founder-sensitive actions must include founder approval gating.');
    }
  }
}
