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
        ? 'الخطر الدستوريّ مرتفع. أوصي بإبطاء سرعة القرار والتحقّق من الفرضيّات قبل الالتزام.'
        : undefined;

    const uncertaintyStatement = style.uncertaintyDisclosure;

    return {
      responseId: `alw-response-${Date.now().toString(36)}`,
      greeting: 'أيّها المؤسس، بين يديك تقييمٌ استشاريٌّ دستوريّ.',
      assessment: `${consciousness.summary} وأساس الثقة في العلاقة ${relationship.trustScore}.`,
      recommendation: policy.compliant
        ? 'امضِ بانضباطٍ دستوريّ، حافظاً على التماسك بعيد المدى ووضوح المقايضات.'
        : 'رصدت حدودُ السياسة خطراً في الخطاب؛ راجع الصياغة قبل إصدار توجيهٍ حاسم.',
      caution,
      uncertaintyStatement,
      constitutionalAnchor: 'الولاء للدستور ولنجاح أزما أو إس بعيدَ المدى.',
      tone: style.tone,
    };
  }
}
