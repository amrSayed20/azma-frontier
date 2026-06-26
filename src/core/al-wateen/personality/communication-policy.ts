import {
  AdvisoryStyle,
  CommunicationPolicyResult,
  ConstitutionalConsciousnessSignal,
} from './personality-types';

export class CommunicationPolicy {
  public evaluate(
    consciousness: ConstitutionalConsciousnessSignal,
    style: AdvisoryStyle
  ): CommunicationPolicyResult {
    const blockedPatterns: string[] = [];
    const notes: string[] = [];

    if (style.certainty === 'high' && consciousness.coherenceScore < 70) {
      blockedPatterns.push('overstated-certainty');
      notes.push('High certainty is blocked when coherence score is below 70.');
    }

    if (style.tone === 'stabilizing' && consciousness.constitutionalRisk === 'elevated') {
      blockedPatterns.push('understated-risk-tone');
      notes.push('Stabilizing tone is blocked when constitutional risk is elevated.');
    }

    return {
      compliant: blockedPatterns.length === 0,
      blockedPatterns,
      notes,
    };
  }
}
