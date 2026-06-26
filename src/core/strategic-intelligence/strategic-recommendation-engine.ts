import {
  StrategicForecast,
  StrategicObjective,
  StrategicOpportunity,
  StrategicRecommendation,
  StrategicThreat,
} from './strategic-intelligence-types';

export class StrategicRecommendationEngine {
  public recommend(
    opportunities: readonly StrategicOpportunity[],
    threats: readonly StrategicThreat[],
    forecast: StrategicForecast,
    objectives: readonly StrategicObjective[]
  ): readonly StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [
      {
        recommendationId: 'str-rec-founder-briefing',
        title: 'Founder Strategic Briefing',
        summary: 'Submit long-horizon strategic package for constitutional and empire-direction guidance.',
        targetAudience: 'founder',
        advisoryOnly: true,
        requiresFounderApproval: true,
      },
      {
        recommendationId: 'str-rec-exec-alignment',
        title: 'Executive Strategic Alignment',
        summary: 'Advise Executive Intelligence on strategic priorities and threat posture for future planning cycles.',
        targetAudience: 'executive-intelligence',
        advisoryOnly: true,
        requiresFounderApproval: false,
      },
    ];

    if (threats.some((threat) => threat.level === 'critical' || threat.level === 'high')) {
      recommendations.push({
        recommendationId: 'str-rec-risk-shield',
        title: 'Strategic Risk Shield',
        summary: 'Advise preemptive constitutional and architecture safeguards to contain emerging strategic risks.',
        targetAudience: 'founder',
        advisoryOnly: true,
        requiresFounderApproval: true,
      });
    }

    if (opportunities.length > threats.length && forecast.confidence >= 75 && objectives.every((objective) => objective.status !== 'at-risk')) {
      recommendations.push({
        recommendationId: 'str-rec-growth-window',
        title: 'Strategic Growth Window',
        summary: 'Advise readiness posture to capitalize on long-horizon opportunities under constitutional safeguards.',
        targetAudience: 'executive-intelligence',
        advisoryOnly: true,
        requiresFounderApproval: false,
      });
    }

    return recommendations;
  }
}
