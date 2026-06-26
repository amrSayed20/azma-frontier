import { ExecutivePipelineInput, ExecutiveRisk, ExecutiveRiskAssessment, ExecutiveRiskLevel, ExecutiveSituationUnderstanding } from './executive-intelligence-types';

export class ExecutiveRiskAnalyzer {
  public analyze(input: ExecutivePipelineInput, situation: ExecutiveSituationUnderstanding): ExecutiveRiskAssessment {
    const risks: ExecutiveRisk[] = [];

    if (input.evaluation.decision === 'deny') {
      risks.push(this.createRisk(input.action.actionId, 'critical', 'Constitutional Denial', 'Action is constitutionally denied.', 'Reject or redesign the action before founder submission.'));
    }

    if (input.evaluation.status === 'non-compliant') {
      risks.push(this.createRisk(input.action.actionId, 'high', 'Compliance Breach', 'Action is non-compliant with constitutional policy.', 'Provide remediation bundle and escalate to Founder.'));
    }

    if (input.evaluation.violations.length > 0) {
      risks.push(this.createRisk(input.action.actionId, 'high', 'Violation Presence', 'One or more constitutional violations were detected.', 'Attach mitigations to executive recommendation package.'));
    }

    if (situation.opportunities.length === 0) {
      risks.push(this.createRisk(input.action.actionId, 'medium', 'Low Opportunity Signal', 'No high-value opportunities were detected.', 'Prefer conservative planning and request founder arbitration.'));
    }

    const overallRisk = this.resolveOverallRisk(risks);

    return {
      actionId: input.action.actionId,
      overallRisk,
      risks,
    };
  }

  private createRisk(actionId: string, level: ExecutiveRiskLevel, title: string, impact: string, mitigation: string): ExecutiveRisk {
    return {
      riskId: `exec-risk-${actionId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      level,
      title,
      impact,
      mitigation,
    };
  }

  private resolveOverallRisk(risks: readonly ExecutiveRisk[]): ExecutiveRiskLevel {
    if (risks.some((risk) => risk.level === 'critical')) {
      return 'critical';
    }

    if (risks.some((risk) => risk.level === 'high')) {
      return 'high';
    }

    if (risks.some((risk) => risk.level === 'medium')) {
      return 'medium';
    }

    return 'low';
  }
}
