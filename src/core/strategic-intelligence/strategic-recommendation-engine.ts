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
        title: 'إحاطةُ المؤسس الاستراتيجيّة',
        summary: 'ارفع حزمةً استراتيجيّةً بعيدةَ المدى لتوجيه الدستور ووجهة الإمبراطوريّة.',
        targetAudience: 'founder',
        advisoryOnly: true,
        requiresFounderApproval: true,
      },
      {
        recommendationId: 'str-rec-exec-alignment',
        title: 'المحاذاةُ التنفيذيّة الاستراتيجيّة',
        summary: 'أشِر على الوعي التنفيذيّ بالأولويّات الاستراتيجيّة وموقف التهديد لدورات التخطيط القادمة.',
        targetAudience: 'executive-intelligence',
        advisoryOnly: true,
        requiresFounderApproval: false,
      },
    ];

    if (threats.some((threat) => threat.level === 'critical' || threat.level === 'high')) {
      recommendations.push({
        recommendationId: 'str-rec-risk-shield',
        title: 'درعُ الخطر الاستراتيجيّ',
        summary: 'أشِر بضماناتٍ دستوريّةٍ وبنيويّةٍ استباقيّة لاحتواء الأخطار الاستراتيجيّة الناشئة.',
        targetAudience: 'founder',
        advisoryOnly: true,
        requiresFounderApproval: true,
      });
    }

    if (opportunities.length > threats.length && forecast.confidence >= 75 && objectives.every((objective) => objective.status !== 'at-risk')) {
      recommendations.push({
        recommendationId: 'str-rec-growth-window',
        title: 'نافذةُ نموٍّ استراتيجيّة',
        summary: 'أشِر بموقف جاهزيّةٍ لاقتناص الفرص بعيدة المدى ضمن الضمانات الدستوريّة.',
        targetAudience: 'executive-intelligence',
        advisoryOnly: true,
        requiresFounderApproval: false,
      });
    }

    return recommendations;
  }
}
