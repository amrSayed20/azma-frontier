import { ConstitutionalUnderstanding, CorrelatedIntelligenceView, AlWateenIntelligenceStreams } from './al-wateen-integration-types';

/** The engine's decision states, said rather than spelled. */
const DECISION_AR: Record<string, string> = {
  escalate: 'تصعيد', proceed: 'مضيّ', hold: 'إيقاف', reject: 'رفض', defer: 'تأجيل',
};

export class ConstitutionalUnderstandingEngine {
  public build(
    streams: AlWateenIntelligenceStreams,
    correlation: CorrelatedIntelligenceView
  ): ConstitutionalUnderstanding {
    const dominantPriority = streams.constitutionEvaluation?.decision === 'escalate'
      ? 'constitutional'
      : streams.constitutionEvaluation?.decision === 'deny'
      ? 'critical'
      : streams.constitutionEvaluation?.decision === 'defer'
      ? 'high'
      : 'normal';

    return {
      understandingId: `alw-understanding-${Date.now().toString(36)}`,
      generatedAt: new Date(),
      dominantPriority,
      constitutionalSummary: `صحّة الدستور ${correlation.constitutionalHealth}، والقرار ${DECISION_AR[streams.constitutionEvaluation?.decision ?? ''] ?? streams.constitutionEvaluation?.decision ?? 'غير متاح'}.`,
      executiveSummary: `الجاهزيّة التنفيذيّة ${correlation.executiveReadiness} عبر ${streams.executiveState.totalDecisionPackages} حزمة.`,
      strategicSummary: `الجاهزيّة الاستراتيجيّة ${correlation.strategicReadiness}، ورُصدت ${streams.strategicState.totalPackages} حزمة.`,
      futureSummary: `ثقة محاكاة المستقبل ${correlation.futureConfidence} عبر ${streams.futureSimulationState.totalSimulatedPaths} مسارٍ مُحاكى.`,
      busSummary: `صحّة مزامنة الناقل ${correlation.synchronizationHealth}، و${streams.busSynchronization.length} رسالةً موجَّهة.`,
      perceptionSummary: `تغطية الإدراك ${correlation.perceptionCoverage} من ${streams.perceptionState.totalObservations} رصدة.`,
    };
  }
}
