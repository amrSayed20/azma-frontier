import type { InvestigationDTO, EvidenceItemDTO } from '../actions';

export const KNOWLEDGE_DOMAINS = [
  { id: 'religious',  nameAr: 'ديني',  fullAr: 'عقائدي / فقهي'      },
  { id: 'medical',    nameAr: 'طبي',   fullAr: 'تشريحي / حديث'       },
  { id: 'scientific', nameAr: 'علمي',  fullAr: 'فيزياء / فلك'        },
  { id: 'history',    nameAr: 'تاريخ', fullAr: 'وثائقي / مخطوطات'    },
  { id: 'culture',    nameAr: 'ثقافة', fullAr: 'فلسفة / أدب'         },
] as const;

export type DomainId       = (typeof KNOWLEDGE_DOMAINS)[number]['id'];
export type OutputFormat   = 'short' | 'medium' | 'long';
export type KnowledgeTier  =
  | 'verified' | 'primary' | 'consensus' | 'historical'
  | 'scholarly' | 'professional' | 'circulated' | 'oral' | 'legend' | 'unknown';

export interface KnowledgeLayer { labelAr: string; tier: KnowledgeTier }
export interface EvidenceBuckets {
  supported:  EvidenceItemDTO[];
  narratives: EvidenceItemDTO[];
  disputed:   EvidenceItemDTO[];
  unverified: EvidenceItemDTO[];
}

export function resolveKnowledgeLayer(score: number, level: string, domain: DomainId): KnowledgeLayer {
  if (level === 'HIGH' && score >= 0.88) return { labelAr: 'دليل موثَّق',      tier: 'verified'     };
  if (level === 'HIGH' && score >= 0.75) return { labelAr: 'مصدر أوّلي',        tier: 'primary'      };
  if (level === 'HIGH' || score >= 0.65) {
    if (domain === 'scientific')         return { labelAr: 'دليل علمي',          tier: 'consensus'    };
    if (domain === 'medical')            return { labelAr: 'رأي متخصص',          tier: 'professional' };
    return                                      { labelAr: 'تفسير أكاديمي',      tier: 'scholarly'    };
  }
  if (score >= 0.50) {
    if (domain === 'history')            return { labelAr: 'سجل تاريخي',         tier: 'historical'   };
    return                                      { labelAr: 'تفسير أكاديمي',      tier: 'scholarly'    };
  }
  if (score >= 0.35) {
    if (domain === 'religious')          return { labelAr: 'تراث شفهي',           tier: 'oral'         };
    return                                      { labelAr: 'ادعاء منتشر',         tier: 'circulated'   };
  }
  if (score < 0.20)                      return { labelAr: 'مصدر مجهول',          tier: 'unknown'      };
  return                                        { labelAr: 'موروث وأسطورة',       tier: 'legend'       };
}

export function bucketEvidence(dto: InvestigationDTO): EvidenceBuckets {
  const ev = dto.evidence;
  return {
    supported:  ev.filter(e => e.confidenceLevel === 'HIGH'     && e.confidenceScore >= 0.80),
    narratives: ev.filter(e => (e.confidenceLevel === 'HIGH'    && e.confidenceScore <  0.80)
                             || (e.confidenceLevel === 'MODERATE' && e.confidenceScore >= 0.60)),
    disputed:   ev.filter(e =>  e.confidenceLevel === 'MODERATE' && e.confidenceScore <  0.60),
    unverified: ev.filter(e =>  e.confidenceLevel === 'LOW'),
  };
}

export function verdictText(dto: InvestigationDTO, format: OutputFormat, _query: string, domain: DomainId): string {
  if (!dto.success || dto.evidence.length === 0) {
    return 'لا يوجد ما يكفي من الأدلة في المستودعات المعرفية.\nتُوصي المحكمة بإعادة صياغة القضية.';
  }
  const b   = bucketEvidence(dto);
  const pct = `${Math.round(dto.averageEvidenceScore * 100)}%`;
  const top = resolveKnowledgeLayer(dto.evidence[0]!.confidenceScore, dto.evidence[0]!.confidenceLevel, domain);

  if (format === 'short') {
    return b.supported.length > 0
      ? `القضية تستند إلى ${b.supported.length} دليل قاطع — مستوى الثقة: ${pct}.`
      : `القضية تستند إلى طبقات معرفية متعددة. أعلى طبقة: ${top.labelAr}. الثقة: ${pct}.`;
  }
  if (format === 'medium') {
    return [
      `بعد التداول عبر ${dto.totalSourcesScanned} طبقة معرفية:`,
      b.supported.length  > 0 ? `وُجدت ${b.supported.length} أدلة قاطعة.`         : 'لم تُوجد أدلة قاطعة.',
      b.disputed.length   > 0 ? `${b.disputed.length} ادعاءات تحتاج إلى تمحيص.`   : null,
      `معدل الثقة: ${pct}.`,
    ].filter(Boolean).join('\n');
  }
  return [
    `فُحصت عبر ${dto.totalSourcesScanned} طبقة — معدل الثقة: ${pct}`,
    b.supported.length  > 0 ? `● قاطع: ${b.supported.length}`       : '○ لا أدلة قاطعة',
    b.narratives.length > 0 ? `◐ داعم: ${b.narratives.length}`       : null,
    b.disputed.length   > 0 ? `◑ متنازع: ${b.disputed.length}`       : null,
    b.unverified.length > 0 ? `○ غير محقق: ${b.unverified.length}`   : null,
  ].filter((s): s is string => s !== null).join('\n');
}

export function generateReasoningSummary(dto: InvestigationDTO): string {
  const b   = bucketEvidence(dto);
  const pct = Math.round(dto.averageEvidenceScore * 100);
  if (b.supported.length > 0) {
    const conflict = b.disputed.length > 0
      ? ` تعارضت ${b.disputed.length} روايات مع هذه الأدلة.`
      : '';
    return `بناءً على ${dto.totalSourcesScanned} طبقة معرفية، وُجدت ${b.supported.length} أدلة قاطعة بنسبة ثقة ${pct}%.${conflict}`;
  }
  if (b.narratives.length > 0) {
    return `لا توجد أدلة قاطعة، لكن ${b.narratives.length} رواية داعمة تؤيد الموقف بثقة معتدلة (${pct}%).`;
  }
  return `بعد مراجعة ${dto.totalSourcesScanned} طبقة معرفية، لم يُعثر على دليل موثَّق. القضية تحتاج إلى دراسة أعمق.`;
}

export function generateNextInvestigation(query: string, buckets: EvidenceBuckets): string {
  if (buckets.disputed.length > 0) {
    return `ما الذي يجعل بعض الروايات تتعارض مع الأدلة الداعمة في قضية "${query}"؟`;
  }
  if (buckets.unverified.length > 0) {
    return `هل يمكن التحقق من الروايات غير الموثَّقة في هذه القضية من خلال مصادر أولية؟`;
  }
  return `ما السياق التاريخي والفلسفي الذي يُعزز نتائج هذا التحقيق؟`;
}
