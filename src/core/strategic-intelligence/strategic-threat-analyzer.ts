import { StrategicSituationSnapshot, StrategicThreat } from './strategic-intelligence-types';
import { measureOperationalState } from '../../operational-truth/measure';

export class StrategicThreatAnalyzer {
  /**
   * MEASURED on production 2026-09-24: the Council's leading threat was
   * «Growing event complexity can outpace strategy adaptation» — while every
   * Stripe key was missing, so no Creator could subscribe or pay, and the
   * heap sat at 91%. Neither fact could reach this analyser, because nothing
   * it read had ever looked at the machine.
   *
   * What is actually wrong is now named, and named FIRST: these are pushed
   * ahead of the long-horizon abstractions, because the Council reads the
   * leading threat and a closed revenue path outranks a trend.
   */
  public analyze(situation: StrategicSituationSnapshot): readonly StrategicThreat[] {
    const threats: StrategicThreat[] = [];
    const operational = measureOperationalState();

    for (const provider of operational.missingRevenueProviders) {
      threats.push({
        threatId: `th-revenue-provider-${provider.key.toLowerCase()}`,
        title: 'طريق الإيراد مغلق',
        level: 'critical',
        urgencyHorizon: 'immediate',
        rationale: `${provider.nameAr} غير مهيّأ. لا يستطيع مُنشئٌ أن يشترك أو يدفع، ولا تكسب الإمبراطوريّة شيئاً مهما كانت صحّة وثائقها.`,
        mitigationDirection: 'هيّئ مفاتيح الدفع في بيئة الخادم، ثم تحقّق من اشتراكٍ حقيقيٍّ واحد.',
      });
    }

    if (operational.memoryTier !== 'NORMAL' && operational.heapUtilizationPct !== null) {
      threats.push({
        threatId: 'th-memory-pressure',
        title: 'ضغطُ الذاكرة',
        level: operational.memoryTier === 'CRITICAL' ? 'critical' : 'medium',
        urgencyHorizon: 'immediate',
        rationale: `استهلاك الذاكرة ${operational.heapUtilizationPct}٪، وهو فوق عتبة الإمبراطوريّة.`,
        mitigationDirection: 'افحص ما يحتجز الذاكرة في العمليّة الحيّة قبل أن يسقط التشغيل.',
      });
    }

    if (operational.diskTier !== 'NORMAL' && operational.diskUsedPct !== null) {
      threats.push({
        threatId: 'th-disk-pressure',
        title: 'امتلاءُ القرص',
        level: operational.diskTier === 'CRITICAL' ? 'critical' : 'medium',
        urgencyHorizon: 'immediate',
        rationale: `امتلاء القرص ${operational.diskUsedPct}٪، وهو فوق عتبة الإمبراطوريّة.`,
        mitigationDirection: 'أفرِغ ما يمكن إفراغه، أو زِد السعة قبل أن يتوقّف الإيداع.',
      });
    }

    if (situation.constitutionalHealth < 70) {
      threats.push({
        threatId: 'th-constitutional-drift',
        title: 'Constitutional Drift Risk',
        level: 'high',
        urgencyHorizon: 'multi-year',
        rationale: 'Constitutional health below strategic threshold indicates governance drift risk.',
        mitigationDirection: 'Increase constitutional policy reinforcement and strategic review cadence.',
      });
    }

    if (situation.infrastructureHealth < 65) {
      threats.push({
        threatId: 'th-infrastructure-fragility',
        title: 'Infrastructure Fragility',
        level: 'medium',
        urgencyHorizon: 'annual',
        rationale: 'Infrastructure health indicates potential execution reliability decay over time.',
        mitigationDirection: 'Strengthen runtime resilience planning and infrastructure observability.',
      });
    }

    threats.push({
      threatId: 'th-strategic-latency',
      title: 'Strategic Latency Accumulation',
      level: situation.eventCount > 50 ? 'medium' : 'low',
      urgencyHorizon: 'long-term',
      rationale: 'Growing event complexity can outpace strategy adaptation if not continuously correlated.',
      mitigationDirection: 'Sustain long-horizon trend tracking and objective recalibration.',
    });

    return threats;
  }
}
