import { ExecutivePipelineInput, ExecutivePriorityProfile, ExecutiveRecommendation, ExecutiveRiskAssessment, ExecutiveSituationUnderstanding } from './executive-intelligence-types';

export class ExecutiveRecommendationEngine {
  public recommend(
    input: ExecutivePipelineInput,
    situation: ExecutiveSituationUnderstanding,
    risk: ExecutiveRiskAssessment,
    priority: ExecutivePriorityProfile
  ): readonly ExecutiveRecommendation[] {
    const recommendations: ExecutiveRecommendation[] = [];

    recommendations.push({
      recommendationId: `exec-rec-${input.action.actionId}-constitutional-brief`,
      actionId: input.action.actionId,
      title: 'ارفع الإحاطةَ التنفيذيّة الدستوريّة',
      summary: 'سلِّم المؤسسَ فهماً دستوريّاً كاملاً وتحليلَ خطرٍ وحزمةَ توصية.',
      requiresFounderApproval: true,
      targetDecision: this.mapDecision(input.evaluation.decision),
      executionConstraints: ['no-direct-founder-execution', 'runtime-only', 'constitutional-obedience'],
    });

    if (risk.overallRisk === 'critical' || input.evaluation.decision === 'escalate') {
      recommendations.push({
        recommendationId: `exec-rec-${input.action.actionId}-escalation`,
        actionId: input.action.actionId,
        title: 'ابدأ التصعيدَ التنفيذيّ',
        summary: 'صعِّد إلى المؤسس بسياق الخطر الحرج والدليل الدستوريّ.',
        requiresFounderApproval: true,
        targetDecision: 'escalate',
        executionConstraints: ['founder-approval-required', 'no-automatic-dispatch'],
      });
    }

    if (situation.opportunities.length > 0 && input.evaluation.decision === 'allow') {
      recommendations.push({
        recommendationId: `exec-rec-${input.action.actionId}-preparedness`,
        actionId: input.action.actionId,
        title: 'هيّئ جاهزيّةَ تنفيذٍ مشروطة',
        summary: 'هيّئ خطواتِ جاهزيّةٍ لا تُنفِّذ، لتُرسَل بعد الموافقة.',
        requiresFounderApproval: false,
        targetDecision: 'approve',
        executionConstraints: ['readiness-only', 'dispatch-after-founder-approval'],
      });
    }

    recommendations.push({
      recommendationId: `exec-rec-${input.action.actionId}-priority`,
      actionId: input.action.actionId,
      title: 'طبِّق ضبطَ الأولويّة التنفيذيّة',
      summary: `Apply executive priority ${priority.executivePriority} with weight ${priority.weight}.`,
      requiresFounderApproval: false,
      targetDecision: 'defer',
      executionConstraints: ['priority-governance', 'constitutional-alignment'],
    });

    return recommendations;
  }

  private mapDecision(value: ExecutivePipelineInput['evaluation']['decision']): ExecutiveRecommendation['targetDecision'] {
    if (value === 'allow') {
      return 'approve';
    }

    if (value === 'deny') {
      return 'reject';
    }

    return value;
  }
}
