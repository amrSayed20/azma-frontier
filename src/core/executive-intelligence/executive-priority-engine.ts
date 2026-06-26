import { ConstitutionPriority } from '../constitution-runtime';
import { ExecutivePipelineInput, ExecutivePriorityProfile, ExecutiveRiskAssessment, ExecutiveSituationUnderstanding } from './executive-intelligence-types';

const PRIORITY_WEIGHT: Record<ConstitutionPriority, number> = {
  low: 10,
  normal: 25,
  high: 50,
  critical: 80,
  constitutional: 100,
};

export class ExecutivePriorityEngine {
  public rank(
    input: ExecutivePipelineInput,
    situation: ExecutiveSituationUnderstanding,
    risk: ExecutiveRiskAssessment
  ): ExecutivePriorityProfile {
    const constitutionalPriority = input.action.priority;
    let executivePriority = constitutionalPriority;

    if (risk.overallRisk === 'critical') {
      executivePriority = 'constitutional';
    } else if (risk.overallRisk === 'high' && executivePriority !== 'constitutional') {
      executivePriority = 'critical';
    }

    const weight = PRIORITY_WEIGHT[executivePriority] + Math.min(input.evaluation.priorityScore, 100);

    return {
      actionId: input.action.actionId,
      constitutionalPriority,
      executivePriority,
      weight,
      rationale: `Priority derived from constitutional decision ${input.evaluation.decision}, risk ${risk.overallRisk}, and ${situation.opportunities.length} opportunities.`,
    };
  }
}
