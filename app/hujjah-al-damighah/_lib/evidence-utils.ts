import type { InvestigationDTO, EvidenceItemDTO } from '../actions';
import {
  SourceAuthority,
  EvidenceRelevance,
  gradeRelevance,
  authorityLabelAr,
  relevanceLabelAr,
  interpretationNoteAr,
} from '@/src/chambers/hujjah-al-damighah/domain/evidence-authority';

export { SourceAuthority, EvidenceRelevance, authorityLabelAr, relevanceLabelAr, interpretationNoteAr };

/**
 * The authority carried on a DTO item, as the policy's own type.
 *
 * The DTO crosses a server boundary and arrives as a plain string, so it is
 * read back through the policy rather than trusted as one.
 */
export function authorityOf(item: EvidenceItemDTO): SourceAuthority {
  return item.sourceAuthority === SourceAuthority.SCRIPTURE
    ? SourceAuthority.SCRIPTURE
    : item.sourceAuthority === SourceAuthority.DOCUMENTED
      ? SourceAuthority.DOCUMENTED
      : SourceAuthority.UNATTRIBUTED;
}

export function isScriptureItem(item: EvidenceItemDTO): boolean {
  return authorityOf(item) === SourceAuthority.SCRIPTURE;
}

/** How directly this item bears on the question. */
export function relevanceOf(item: EvidenceItemDTO): EvidenceRelevance {
  return gradeRelevance(item.confidenceScore);
}

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

// ── Constitutional Evidence Tiers (Article I) ─────────────────────
export type ConstitutionalTier = 1 | 2 | 3 | 4 | 5;

export const CONSTITUTIONAL_TIER_AR: Record<ConstitutionalTier, string> = {
  1: 'حقيقة موثّقة',
  2: 'دليل قوي',
  3: 'سياق داعم',
  4: 'ادعاء قيد الفحص',
  5: 'رواية شائعة',
};

export function getConstitutionalTier(tier: KnowledgeTier): ConstitutionalTier {
  if (tier === 'verified' || tier === 'primary')                       return 1;
  if (tier === 'consensus' || tier === 'professional' || tier === 'scholarly') return 2;
  if (tier === 'historical')                                           return 3;
  if (tier === 'circulated' || tier === 'oral')                        return 4;
  return 5; // legend, unknown
}

export interface KnowledgeLayer { labelAr: string; tier: KnowledgeTier }
export interface EvidenceBuckets {
  supported:  EvidenceItemDTO[];
  narratives: EvidenceItemDTO[];
  disputed:   EvidenceItemDTO[];
  unverified: EvidenceItemDTO[];
}

/**
 * The layer an evidence item is displayed at.
 *
 * Takes the item rather than its score so that no call site can resolve a layer
 * without its authority. That was the shape of the original fault: twelve places
 * asked for a label using only a keyword-match score, and a Qur'anic verse
 * retrieved on a weak match came back labelled «مصدر مجهول».
 */
/**
 * The collections of the Sunnah, by the names the chamber itself writes into an
 * attribution. A closed list the Empire authored — not a guess at free text.
 */
const SUNNAH_COLLECTIONS = [
  'صحيح البخاري', 'صحيح مسلم', 'سنن أبي داود', 'جامع الترمذي',
  'سنن النسائي', 'سنن ابن ماجه', 'موطأ الإمام مالك',
  'الأربعون النووية', 'الأربعون القدسية',
] as const;

/** Whether this evidence is a Prophetic narration from a named collection. */
export function isNarration(item: EvidenceItemDTO): boolean {
  const first = item.attributionAr?.split('\n')[0] ?? '';
  return SUNNAH_COLLECTIONS.some((c) => first.includes(c));
}

/**
 * Whether the chamber can say where this text came from.
 *
 * Two ways it can. Either the source wrote a citation — a collection and a
 * number, a sura and a verse — or the chamber classified it as a documented
 * source when it arrived, which is what DOCUMENTED means. The live page showed
 * why both count: entries from the Arabic encyclopedia carry no citation line,
 * so a check on the citation alone let them fall to «مصدر مجهول» — the chamber
 * calling an encyclopedia it deliberately consulted an unknown source.
 */
export function isAttributed(item: EvidenceItemDTO): boolean {
  if (item.attributionAr?.trim()) return true;
  return authorityOf(item) === SourceAuthority.DOCUMENTED;
}

export function resolveKnowledgeLayer(item: EvidenceItemDTO, domain: DomainId): KnowledgeLayer {
  const score = item.confidenceScore;
  const level = item.confidenceLevel;

  // Standing is a property of the text, not of how the question was worded. A
  // verse is displayed as a verse whatever it scored; how well it bears on this
  // particular question is shown separately and never folded in here.
  if (authorityOf(item) === SourceAuthority.SCRIPTURE) {
    return { labelAr: 'نص قرآني', tier: 'verified' };
  }

  // A narration is displayed as a narration from its own collection, whatever
  // the match score. The score measures how closely its wording touches the
  // question; it says nothing about what the text is. Left to the bands below,
  // a narration from صحيح البخاري whose words happened not to overlap the
  // question would have been labelled «تراث شفهي», «مصدر مجهول», or
  // «موروث وأسطورة». The chamber must never put those words on the Sunnah.
  // What the scholars said of a narration is its grade, and the grade travels
  // in its attribution with the name of whoever issued it.
  if (isNarration(item)) {
    return { labelAr: 'حديث نبوي', tier: 'primary' };
  }

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
  // Below this line sit the words the chamber uses for material whose origin it
  // cannot name: oral tradition, circulated claim, unknown source, folklore.
  // They describe a *source*, and this is a *match* score — so a text the
  // chamber can point to in a named book must never fall into them however
  // loosely its wording touched the question. It is a documented source with a
  // distant bearing, and the bearing is reported in its own words elsewhere.
  if (isAttributed(item)) {
    return { labelAr: 'مصدر موثَّق', tier: 'historical' };
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

  // Scripture is never bucketed by keyword score. These buckets feed the words
  // «متعارض» and «غير محقَّق», and a verse whose wording did not overlap the
  // question is neither: it is a documented text with a distant bearing, which
  // the relevance line says in its own words. Sorting it into «unverified»
  // would have the chamber call the Qur'an unverified.
  // Neither is a narration. These buckets feed the words «متعارض» and «غير
  // محقَّق», and a narration from a named collection whose wording did not
  // overlap the question is neither of those — it is a documented text with a
  // distant bearing, which the relevance line says in its own words. Sorting it
  // into «unverified» would have the chamber call صحيح البخاري unverified.
  const carried = ev.filter((e) => isScriptureItem(e) || isNarration(e));
  const rest = ev.filter((e) => !isScriptureItem(e) && !isNarration(e));

  return {
    supported:  [...carried, ...rest.filter(e => e.confidenceLevel === 'HIGH' && e.confidenceScore >= 0.80)],
    narratives: rest.filter(e => (e.confidenceLevel === 'HIGH'    && e.confidenceScore <  0.80)
                              || (e.confidenceLevel === 'MODERATE' && e.confidenceScore >= 0.60)),
    disputed:   rest.filter(e =>  e.confidenceLevel === 'MODERATE' && e.confidenceScore <  0.60),
    unverified: rest.filter(e =>  e.confidenceLevel === 'LOW'),
  };
}

/**
 * Counts scripture the way Arabic counts.
 *
 * The chamber wrote «8 نص قرآني» on the live page. Arabic does not count that
 * way: one and two have their own forms, three through ten take the plural, and
 * eleven upward returns to the singular accusative. The Creator reads this.
 */
export function countScripture(count: number): string {
  if (count === 1) return 'نص قرآني واحد';
  if (count === 2) return 'نصان قرآنيان';
  if (count >= 3 && count <= 10) return `${count} نصوص قرآنية`;
  return `${count} نصاً قرآنياً`;
}

/**
 * The proof, written out so the Creator can take it anywhere.
 *
 * The chamber was built so that someone arguing a case can leave holding
 * something they can actually use. Until now nothing left it: the gateway
 * offered a new investigation and a deposit into the Vault, and no way at all to
 * carry the proof out.
 *
 * What travels is the text, what kind of source it is, and how closely it bears
 * on the question — because a quotation that arrives without its standing can be
 * used to say anything, and the Creator would be the one holding it. Nothing
 * here names a repository: what is named is the kind of thing the evidence is.
 */
export function evidenceForTaking(
  item: EvidenceItemDTO,
  query: string,
  domain: DomainId,
): string {
  const authority = authorityOf(item);
  const lines: string[] = [
    `«${item.extractedText.trim()}»`,
    '',
  ];

  // Where it is found travels first, above the gradings the chamber reports —
  // a quotation a Creator cannot trace is one they cannot defend.
  if (item.attributionAr?.trim()) lines.push(item.attributionAr.trim(), '');

  lines.push(
    `حجّية المصدر: ${authorityLabelAr(authority)}`,
    `صلة النص بالسؤال: ${relevanceLabelAr(relevanceOf(item))}`,
    `طبقة الدليل: ${resolveKnowledgeLayer(item, domain).labelAr}`,
    `الموضوع: ${query.trim()}`,
  );

  const note = interpretationNoteAr(authority);
  if (note) lines.push(note);

  lines.push('', `— حجرة المعرفة السيادية، ${new Date().toLocaleDateString('ar-SA')}`);
  return lines.join('\n');
}

/**
 * The one line an evidence board has room for: where this text is found.
 *
 * The board shows sixty to a hundred characters of a passage, so a citation
 * that lives only inside the gateway is a citation most Creators never see —
 * they would have to open every item to learn which of them is a narration and
 * which a verse. This is the first line of the attribution: the collection and
 * number, or the sura and verse. The gradings follow in the gateway, where
 * there is room for scholars who disagree.
 */
export function sourceLineOf(item: EvidenceItemDTO): string {
  const attribution = item.attributionAr?.trim();
  if (!attribution) return '';
  return attribution.split('\n')[0]!.replace(/\.$/, '').trim();
}

/** The scripture evidence in this investigation, strongest bearing first. */
export function scriptureEvidence(dto: InvestigationDTO): EvidenceItemDTO[] {
  return dto.evidence
    .filter(isScriptureItem)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * The standing of the strongest source in this investigation.
 *
 * What the Creator is told about authority. Separate from the match rate, which
 * is what the percentage has always actually measured.
 */
export function topAuthority(dto: InvestigationDTO): SourceAuthority {
  if (dto.evidence.some(isScriptureItem)) return SourceAuthority.SCRIPTURE;
  if (dto.evidence.some((e) => authorityOf(e) === SourceAuthority.DOCUMENTED)) {
    return SourceAuthority.DOCUMENTED;
  }
  return SourceAuthority.UNATTRIBUTED;
}

export function verdictText(dto: InvestigationDTO, format: OutputFormat, _query: string, domain: DomainId): string {
  if (!dto.success || dto.evidence.length === 0) {
    return 'لا يوجد ما يكفي من الأدلة في المستودعات المعرفية.\nتُوصي المحكمة بإعادة صياغة القضية.';
  }
  const b   = bucketEvidence(dto);
  const pct = `${Math.round(dto.averageEvidenceScore * 100)}%`;
  const top = resolveKnowledgeLayer(dto.evidence[0]!, domain);

  if (format === 'short') {
    return b.supported.length > 0
      ? `القضية تستند إلى ${b.supported.length} دليل قاطع — مطابقة الأدلة للسؤال: ${pct}.`
      : `القضية تستند إلى طبقات معرفية متعددة. أعلى طبقة: ${top.labelAr}. مطابقة الأدلة للسؤال: ${pct}.`;
  }
  if (format === 'medium') {
    return [
      `بعد التداول عبر ${dto.totalSourcesScanned} طبقة معرفية:`,
      b.supported.length  > 0 ? `وُجدت ${b.supported.length} أدلة قاطعة.`         : 'لم تُوجد أدلة قاطعة.',
      b.disputed.length   > 0 ? `${b.disputed.length} ادعاءات تحتاج إلى تمحيص.`   : null,
      `معدل مطابقة الأدلة للسؤال: ${pct}.`,
    ].filter(Boolean).join('\n');
  }
  return [
    `فُحصت عبر ${dto.totalSourcesScanned} طبقة — معدل المطابقة: ${pct}`,
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
    return `بناءً على ${dto.totalSourcesScanned} طبقة معرفية، وُجدت ${b.supported.length} أدلة قاطعة بنسبة مطابقة ${pct}%.${conflict}`;
  }
  if (b.narratives.length > 0) {
    return `لا توجد أدلة قاطعة، لكن ${b.narratives.length} رواية داعمة تؤيد الموقف بمطابقة معتدلة (${pct}%).`;
  }
  return `بعد مراجعة ${dto.totalSourcesScanned} طبقة معرفية، لم يُعثر على دليل موثَّق. القضية تحتاج إلى دراسة أعمق.`;
}

// ── Verdict Explanation — Article III ────────────────────────────
// Explains WHY confidence reached this level. Never announces the number alone.
export function generateVerdictExplanation(dto: InvestigationDTO, domain: DomainId): string {
  const b   = bucketEvidence(dto);
  const pct = Math.round(dto.averageEvidenceScore * 100);
  const lines: string[] = [];

  // The authority of the sources is stated before anything is said about match
  // rate, because the two are different claims and the second used to be spoken
  // in the first's name. A verse was displayed while the document announced
  // «الثقة ضعيفة … لم تُوثَّق بما يكفي» — both sentences drawn from one number
  // that measures neither standing nor documentation.
  const scripture = scriptureEvidence(dto);
  if (scripture.length > 0) {
    lines.push(
      `حجّية المصدر: ${countScripture(scripture.length)} — قطعي الثبوت، ولا تتغير حجّيته بصياغة السؤال.`,
    );
    lines.push(
      `وصلة النص بالسؤال تُقاس وحدها: أقربها ${relevanceLabelAr(relevanceOf(scripture[0]!))}.`,
    );
    lines.push(interpretationNoteAr(SourceAuthority.SCRIPTURE)!);
  }

  // What the percentage measures, said in the percentage's own name.
  if (pct >= 75) {
    lines.push('مطابقة الأدلة للسؤال مرتفعة — النصوص المسترجَعة تتناول المسألة مباشرة.');
  } else if (pct >= 55) {
    lines.push('مطابقة الأدلة للسؤال معتدلة — النصوص تتناول المسألة جزئياً.');
  } else if (pct >= 40) {
    lines.push('مطابقة الأدلة للسؤال محدودة — أكثر النصوص يتناول المسألة من طرف.');
  } else {
    lines.push('مطابقة الأدلة للسؤال ضعيفة — هذا وصف لقرب النصوص من سؤالك، لا حكم على حجّيتها.');
  }

  const nonScriptureSupported = b.supported.filter((e) => !isScriptureItem(e));
  if (nonScriptureSupported.length > 0) {
    const top = resolveKnowledgeLayer(nonScriptureSupported[0]!, domain);
    lines.push(`رفع المطابقة: ${nonScriptureSupported.length} دليل قاطع — أعلاها من مستوى "${top.labelAr}".`);
  }
  if (b.disputed.length > 0) {
    lines.push(`خفّض المطابقة: ${b.disputed.length} ادعاء متنازع عليه يتطلب مزيداً من التمحيص.`);
  }
  if (b.unverified.length > 0) {
    lines.push(`ما يزال مجهولاً: ${b.unverified.length} رواية لم يتم التحقق منها في المستودعات المتاحة.`);
  }

  return lines.join(' ');
}

// ── What Remains Unknown — Article V ─────────────────────────────
export function generateUnknownRemains(dto: InvestigationDTO, query: string): string {
  const b       = bucketEvidence(dto);
  const preview = query.slice(0, 38);

  if (b.unverified.length > 0 && b.disputed.length > 0) {
    return `في قضية "${preview}…" يبقى ${b.unverified.length + b.disputed.length} جانب دون يقين كامل. المعرفة هنا تتوسع باستمرار.`;
  }
  if (b.unverified.length > 0) {
    return `${b.unverified.length} رواية في هذه القضية لم يتم التحقق منها بعد. ثمة مساحة للاكتشاف.`;
  }
  if (b.disputed.length > 0) {
    return `الخلاف حول ${b.disputed.length} جوانب لم يُحسم — هذا ليس ضعفاً في المعرفة، بل دليل على حيويتها.`;
  }
  return 'هذا التحقيق يفتح أسئلة تستحق الاستمرار. المعرفة لا تنتهي عند حكم واحد.';
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
