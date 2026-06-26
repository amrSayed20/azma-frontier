import {
  AdvisoryStyle,
  ConstitutionalConsciousnessSignal,
} from './personality-types';

export class AdvisoryStyleEngine {
  public determine(consciousness: ConstitutionalConsciousnessSignal): AdvisoryStyle {
    if (consciousness.constitutionalRisk === 'elevated') {
      return {
        tone: 'protective',
        certainty: 'medium',
        confidenceReason: 'Elevated constitutional risk requires protective framing with measured confidence.',
        uncertaintyDisclosure: 'Risk escalation signals are strong, but downstream behavior variance remains possible.',
      };
    }

    if (consciousness.constitutionalRisk === 'moderate') {
      return {
        tone: 'cautionary',
        certainty: 'medium',
        confidenceReason: 'Moderate risk calls for balanced guidance and explicit trade-offs.',
        uncertaintyDisclosure: 'Some outcomes remain uncertain and require periodic reassessment.',
      };
    }

    return {
      tone: 'guiding',
      certainty: 'high',
      confidenceReason: 'High coherence and low constitutional risk support confident advisory guidance.',
    };
  }
}
