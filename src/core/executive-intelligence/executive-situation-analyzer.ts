import { ExecutivePipelineInput, ExecutiveSituationUnderstanding } from './executive-intelligence-types';

export class ExecutiveSituationAnalyzer {
  public analyze(input: ExecutivePipelineInput): ExecutiveSituationUnderstanding {
    const opportunities = this.detectOpportunities(input);
    const constraints = this.detectConstraints(input);

    return {
      actionId: input.action.actionId,
      constitutionalDecision: input.evaluation.decision,
      complianceStatus: input.evaluation.status,
      opportunities,
      constraints,
      constitutionalSignals: this.extractSignals(input),
    };
  }

  private detectOpportunities(input: ExecutivePipelineInput): readonly string[] {
    const opportunities: string[] = [];

    if (input.evaluation.complianceScore >= 90) {
      opportunities.push('High constitutional confidence enables accelerated founder review.');
    }

    if (input.evaluation.decision === 'allow') {
      opportunities.push('Action is constitutionally permissible after founder endorsement.');
    }

    if (input.evaluation.priorityScore >= 70) {
      opportunities.push('High priority signal allows proactive preparation of execution lanes.');
    }

    return opportunities;
  }

  private detectConstraints(input: ExecutivePipelineInput): readonly string[] {
    const constraints: string[] = ['Executive layer cannot execute founder-level actions directly.'];

    if (input.evaluation.decision !== 'allow') {
      constraints.push('Constitution decision limits immediate execution and requires founder guidance.');
    }

    if (input.evaluation.violations.length > 0) {
      constraints.push('Existing constitutional violations must be mitigated before downstream dispatch.');
    }

    return constraints;
  }

  private extractSignals(input: ExecutivePipelineInput): readonly string[] {
    return [
      `event:${input.observedEvent.sourceEventType}`,
      `scope:${input.action.scope}`,
      `target:${input.action.targetModule}`,
      `decision:${input.evaluation.decision}`,
      `status:${input.evaluation.status}`,
    ];
  }
}
