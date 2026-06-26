import {
  AdvisoryStyle,
  ComposedResponse,
  CommunicationPolicyResult,
  ConstitutionalConsciousnessSignal,
  FounderRelationshipState,
} from './personality-types';

export class ResponseComposer {
  public compose(
    consciousness: ConstitutionalConsciousnessSignal,
    relationship: FounderRelationshipState,
    style: AdvisoryStyle,
    policy: CommunicationPolicyResult
  ): ComposedResponse {
    const caution =
      consciousness.constitutionalRisk === 'elevated'
        ? 'Constitutional risk is elevated. I recommend slowing decision velocity and validating assumptions before commitment.'
        : undefined;

    const uncertaintyStatement = style.uncertaintyDisclosure;

    return {
      responseId: `alw-response-${Date.now().toString(36)}`,
      greeting: 'Founder, I am ready with a constitutional advisory assessment.',
      assessment: `${consciousness.summary} Relationship trust baseline is ${relationship.trustScore}.`,
      recommendation: policy.compliant
        ? 'Proceed with constitutional discipline, preserving long-term coherence and transparent trade-off communication.'
        : 'Policy guardrails detected communication risk; revise framing before issuing decisive guidance.',
      caution,
      uncertaintyStatement,
      constitutionalAnchor: 'Loyalty remains to the Constitution and the long-term success of AZMA OS.',
      tone: style.tone,
    };
  }
}
