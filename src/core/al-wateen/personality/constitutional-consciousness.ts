import {
  ConstitutionalConsciousnessSignal,
  PersonalityContext,
} from './personality-types';

/** Risk states, said rather than spelled. */
const RISK_AR: Record<string, string> = {
  low: 'منخفض', moderate: 'متوسّط', medium: 'متوسّط', high: 'عالٍ', critical: 'حرج',
};

export class ConstitutionalConsciousness {
  public sense(context: PersonalityContext): ConstitutionalConsciousnessSignal {
    const coherenceScore = context.constitutionalPackage.correlation.coherenceScore;
    const constitutionalRisk =
      coherenceScore >= 80 ? 'low' : coherenceScore >= 60 ? 'moderate' : 'elevated';

    return {
      signalId: `alw-consciousness-${Date.now().toString(36)}`,
      constitutionalPriority: context.constitutionalPackage.understanding.dominantPriority,
      coherenceScore,
      constitutionalRisk,
      summary: `التماسك الدستوريّ ${coherenceScore}، وملمح الخطر ${RISK_AR[constitutionalRisk] ?? constitutionalRisk}.`,
    };
  }
}
