/**
 * AZMA OS – Hujjah Al-Damighah
 * The Imperial Court of Knowledge.
 * Constitutional Amendment I — Final Experience Reconstruction.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './hujjah-al-damighah.css';
import { runInvestigation, type InvestigationDTO, type EvidenceItemDTO } from './actions';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';

// ── Knowledge Domain Catalogue ────────────────────────────────────────────

const KNOWLEDGE_DOMAINS = [
  { id: 'religious',  nameAr: 'ديني', fullAr: 'عقائدي / فقهي' },
  { id: 'medical',    nameAr: 'طبي',  fullAr: 'تشريحي / حديث'  },
  { id: 'scientific', nameAr: 'علمي', fullAr: 'فيزياء / فلك'   },
  { id: 'history',    nameAr: 'تاريخ', fullAr: 'وثائقي / مخطوطات' },
  { id: 'culture',    nameAr: 'ثقافة', fullAr: 'فلسفة / أدب'   },
] as const;

type DomainId     = typeof KNOWLEDGE_DOMAINS[number]['id'];
type OutputFormat = 'short' | 'medium' | 'long';
type Phase = 'entering' | 'idle' | 'examining' | 'stillness' | 'revealing' | 'complete';
type Mood  = 'idle' | 'preparing' | 'investigating' | 'silence' | 'revelation' | 'reflection';
type KnowledgeTier =
  | 'verified'
  | 'primary'
  | 'consensus'
  | 'historical'
  | 'scholarly'
  | 'circulated'
  | 'oral'
  | 'legend';

interface KnowledgeLayer { labelAr: string; tier: KnowledgeTier }

// ── AZMA OS Companion Script ──────────────────────────────────────────────

const COMPANION = {
  entry:     'أنت في المكان الذي تُولد فيه الأدلة. ما الذي تريد إثباته؟',
  idle:      'المحكمة تنتظر. الدليل لا يُستعجل.',
  complete:  'القضية فُحصت. ما تحمله الآن يمكن الدفاع عنه.',
  departure: 'تفكيرك الآن مختلف. هذا هو المقصود.',
} as const;

// ── Article VII: Knowledge Layer Classification (No Provider Names) ────────

function resolveKnowledgeLayer(score: number, level: string, domain: DomainId): KnowledgeLayer {
  if (level === 'HIGH' && score >= 0.85) return { labelAr: 'دليل موثَّق',        tier: 'verified'    };
  if (level === 'HIGH' && score >= 0.75) return { labelAr: 'سجلّ أوّلي',          tier: 'primary'     };
  if (level === 'HIGH' || score >= 0.65) {
    if (domain === 'scientific' || domain === 'medical')
                                          return { labelAr: 'إجماع علمي',          tier: 'consensus'   };
    return                                       { labelAr: 'تفسير علمي',          tier: 'scholarly'   };
  }
  if (score >= 0.50) {
    if (domain === 'history')             return { labelAr: 'رواية تاريخية',       tier: 'historical'  };
    return                                       { labelAr: 'تفسير علمي',          tier: 'scholarly'   };
  }
  if (score >= 0.35) {
    if (domain === 'religious')           return { labelAr: 'تراث شفهي',           tier: 'oral'        };
    return                                       { labelAr: 'ادعاء منتشر',         tier: 'circulated'  };
  }
  if (domain === 'culture')               return { labelAr: 'رواية ثقافية',        tier: 'oral'        };
  return                                         { labelAr: 'موروث وأسطورة',       tier: 'legend'      };
}

// ── Evidence Taxonomy (Final Verdict Categories) ──────────────────────────

interface EvidenceBuckets {
  supported:  EvidenceItemDTO[];
  narratives: EvidenceItemDTO[];
  disputed:   EvidenceItemDTO[];
  unverified: EvidenceItemDTO[];
}

function bucketEvidence(dto: InvestigationDTO): EvidenceBuckets {
  const ev = dto.evidence;
  return {
    supported:  ev.filter(e => e.confidenceLevel === 'HIGH'     && e.confidenceScore >= 0.80),
    narratives: ev.filter(e => (e.confidenceLevel === 'HIGH'    && e.confidenceScore <  0.80)
                              || (e.confidenceLevel === 'MODERATE' && e.confidenceScore >= 0.60)),
    disputed:   ev.filter(e =>  e.confidenceLevel === 'MODERATE' && e.confidenceScore <  0.60),
    unverified: ev.filter(e =>  e.confidenceLevel === 'LOW'),
  };
}

// ── Verdict Text (The Final Pronouncement) ─────────────────────────────────

function verdictText(
  dto: InvestigationDTO,
  format: OutputFormat,
  query: string,
  domain: DomainId,
): string {
  if (!dto.success || dto.evidence.length === 0) {
    return 'لا يوجد ما يكفي من الأدلة في المستودعات المعرفية.\nتُوصي المحكمة بإعادة صياغة القضية.';
  }

  const ev = dto.evidence;
  const buckets = bucketEvidence(dto);
  const pct = (s: number) => `${Math.round(s * 100)}%`;
  const topLayer = resolveKnowledgeLayer(ev[0]!.confidenceScore, ev[0]!.confidenceLevel, domain);

  if (format === 'short') {
    if (buckets.supported.length > 0) {
      return `القضية تستند إلى ${buckets.supported.length} دليل قاطع. مستوى الثقة: ${pct(dto.averageEvidenceScore)}.`;
    }
    return `القضية تستند إلى طبقات معرفية متعددة. أعلى طبقة: ${topLayer.labelAr}. الثقة: ${pct(dto.averageEvidenceScore)}.`;
  }

  if (format === 'medium') {
    return [
      `بعد التداول عبر ${dto.totalSourcesScanned} طبقة معرفية:`,
      '',
      buckets.supported.length > 0
        ? `وُجدت ${buckets.supported.length} أدلة قاطعة تدعم القضية.`
        : 'لم تُوجد أدلة قاطعة في هذه الطبقة.',
      buckets.disputed.length > 0
        ? `${buckets.disputed.length} ادعاءات تحتاج إلى تمحيص إضافي.`
        : null,
      `معدل الثقة العام: ${pct(dto.averageEvidenceScore)}.`,
    ].filter(Boolean).join('\n');
  }

  // Complete — full epistemic record
  return [
    'الحكم المفصَّل:',
    '',
    `فُحصت القضية عبر ${dto.totalSourcesScanned} طبقة معرفية.`,
    `معدل الثقة الكلي: ${pct(dto.averageEvidenceScore)}`,
    '',
    buckets.supported.length  > 0 ? `● أدلة قاطعة: ${buckets.supported.length}`   : '○ لا أدلة قاطعة',
    buckets.narratives.length > 0 ? `◐ روايات داعمة: ${buckets.narratives.length}` : null,
    buckets.disputed.length   > 0 ? `◑ متنازع عليها: ${buckets.disputed.length}`   : null,
    buckets.unverified.length > 0 ? `○ غير متحقق منها: ${buckets.unverified.length}` : null,
    '',
    'راجع التصنيف الكامل أدناه.',
  ].filter(s => s !== null && s !== undefined).join('\n') as string;
}

// ── Evidence Category Component ────────────────────────────────────────────

interface EvidenceCategoryProps {
  titleAr: string;
  type:    'supported' | 'narratives' | 'disputed' | 'unverified';
  items:   EvidenceItemDTO[];
  domain:  DomainId;
}

function EvidenceCategory({ titleAr, type, items, domain }: EvidenceCategoryProps) {
  if (items.length === 0) return null;

  const marks: Record<EvidenceCategoryProps['type'], string> = {
    supported:  '●',
    narratives: '◐',
    disputed:   '◑',
    unverified: '○',
  };

  return (
    <div className={`evidence-category category-${type}`}>
      <div className="category-header">
        <span className="category-mark">{marks[type]}</span>
        <span className="category-title">{titleAr}</span>
        <span className="category-count">({items.length})</span>
      </div>
      <div className="category-items">
        {items.map((ev, idx) => {
          const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, domain);
          return (
            <div
              key={ev.id}
              className="evidence-entry"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <span className={`entry-tier tier-${layer.tier}`}>{layer.labelAr}</span>
              <p className="entry-text">&ldquo;{ev.extractedText}&rdquo;</p>
              <span className="entry-score">{Math.round(ev.confidenceScore * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function HujjahAlDamighah() {
  const router = useRouter();

  const [phase, setPhase]                     = useState<Phase>('entering');
  const [veilReceding, setVeilReceding]       = useState(false);
  const [companionText, setCompanionText]     = useState('');
  const [companionVisible, setCompanionVisible] = useState(false);
  const [showProveIt, setShowProveIt]         = useState(false);

  const [activeDomain, setActiveDomain]   = useState<DomainId>('religious');
  const [query, setQuery]                 = useState('');
  const [outputFormat, setOutputFormat]   = useState<OutputFormat>('short');
  const [result, setResult]               = useState<InvestigationDTO | null>(null);
  const [verdict, setVerdict]             = useState('');

  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proveItTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Article VI: Mood (Article VI — emotional state of the court) ───────

  const mood: Mood =
    phase === 'examining'  ? 'investigating' :
    phase === 'stillness'  ? 'silence'       :
    phase === 'revealing'  ? 'revelation'    :
    phase === 'complete'   ? 'reflection'    :
    (phase === 'idle' && query.length > 0) ? 'preparing' :
    'idle';

  // ── Companion ──────────────────────────────────────────────────────────

  const showCompanion = useCallback((text: string) => {
    setCompanionText(text);
    setCompanionVisible(true);
  }, []);

  const hideCompanion = useCallback(() => setCompanionVisible(false), []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => showCompanion(COMPANION.idle), 30_000);
  }, [showCompanion]);

  // ── Entry sequence ─────────────────────────────────────────────────────

  useEffect(() => {
    const t1 = setTimeout(() => setVeilReceding(true), 60);
    const t2 = setTimeout(() => setPhase('idle'), 700);
    const t3 = setTimeout(() => showCompanion(COMPANION.entry), 900);
    const t4 = setTimeout(() => {
      setShowProveIt(true);
      proveItTimerRef.current = setTimeout(() => setShowProveIt(false), 3_800);
    }, 1_500);
    const t5 = setTimeout(() => resetIdleTimer(), 700);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      if (proveItTimerRef.current) clearTimeout(proveItTimerRef.current);
      if (idleTimerRef.current)    clearTimeout(idleTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Case Submission ────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || phase === 'examining' || phase === 'stillness') return;

    hideCompanion();
    setPhase('examining');
    setResult(null);
    setVerdict('');
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    const dto = await runInvestigation(trimmedQuery, activeDomain);

    // Article IX — The Moment of Truth: silence before certainty
    setPhase('stillness');
    await new Promise<void>((resolve) => setTimeout(resolve, 500));

    setPhase('revealing');
    setResult(dto);
    if (dto.success) {
      setVerdict(verdictText(dto, outputFormat, trimmedQuery, activeDomain));
    }

    setTimeout(() => {
      setPhase('complete');
      showCompanion(COMPANION.complete);
    }, 920);
  }

  // ── Domain Change ──────────────────────────────────────────────────────

  function handleDomainChange(id: DomainId) {
    setActiveDomain(id);
    if (phase === 'complete') {
      setResult(null);
      setVerdict('');
      setPhase('idle');
      hideCompanion();
    }
    resetIdleTimer();
  }

  // ── Format Change ──────────────────────────────────────────────────────

  function handleFormatChange(fmt: OutputFormat) {
    setOutputFormat(fmt);
    if (result?.success) {
      setVerdict(verdictText(result, fmt, query.trim(), activeDomain));
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────

  const isExamining = phase === 'examining' || phase === 'stillness';
  const hasVerdict  = (phase === 'revealing' || phase === 'complete') && result !== null;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <main className={`hujjah-viewport breathing mood-${mood}`} dir="rtl">

      {/* ── Entry Veil ────────────────────────────────────────────────── */}
      <div
        className={`entry-veil ${veilReceding ? 'veil-receding' : ''}`}
        aria-hidden="true"
      />

      {/* ── Atmospheric Background ────────────────────────────────────── */}
      <div className="neon-layer" aria-hidden="true">
        <div className="cyber-grid" />
        <div className="ambient-depth-gradient" />
        <div className="ambient-secondary-glow" />
      </div>

      {/* ── Article I/II: Crown Bar — Companion has its own space ─────── */}
      <div className="crown-bar">
        <LivingCompanion message={companionText} visible={companionVisible} />
        <div className="crown-nav">
          <button
            className="sovereign-exit-btn"
            onClick={() => {
              showCompanion(COMPANION.departure);
              setTimeout(() => router.push('/ras-amr'), 800);
            }}
          >
            ⮜ العودة
          </button>
        </div>
      </div>

      {/* ── Imperial Court Layout ─────────────────────────────────────── */}
      <div className="imperial-court-layout">

        {/* ── Knowledge Archives — left alcove ────────────────────────── */}
        <aside className="knowledge-archives living-frame-archives">

          <div className="archives-header">
            <div className="archives-classification">KNOWLEDGE ARCHIVES</div>
            <h2 className="archives-title">أرشيف المعرفة</h2>
          </div>

          <div className="archive-domains">
            {KNOWLEDGE_DOMAINS.map((domain) => (
              <div
                key={domain.id}
                className={`archive-domain ${activeDomain === domain.id ? 'archive-domain-active' : ''}`}
                onClick={() => handleDomainChange(domain.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleDomainChange(domain.id)}
                aria-pressed={activeDomain === domain.id}
              >
                <span className="archive-domain-mark" aria-hidden="true">◈</span>
                <div className="archive-domain-labels">
                  <span className="archive-domain-name">{domain.nameAr}</span>
                  <span className="archive-domain-sub">{domain.fullAr}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="archive-divider" />

          {/* Archive Records — evidence fragments after deliberation */}
          {hasVerdict && result!.evidence.length > 0 && (
            <div className="archive-records custom-scroll">
              <div className="archive-records-label">سجلات الجلسة</div>
              {result!.evidence.map((ev, idx) => {
                const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, activeDomain);
                return (
                  <div
                    key={ev.id}
                    className={`archive-record tier-record-${layer.tier}`}
                    style={{ animationDelay: `${idx * 55}ms` }}
                  >
                    <span className={`archive-record-tier tier-${layer.tier}`}>
                      {layer.labelAr}
                    </span>
                    <p className="archive-record-excerpt">
                      {(ev.contextWindow || ev.extractedText).slice(0, 55)}...
                    </p>
                    <span className="archive-record-score">
                      {Math.round(ev.confidenceScore * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Scanning indicator during examination */}
          {isExamining && (
            <div className="archive-scanning">
              <div className="scanning-label">تُفهرَس الأرشيفات</div>
              <div className="scanning-bars">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="scanning-bar" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Court Space ─────────────────────────────────────────── */}
        <section className="court-space">

          {/* Court Frieze — architectural header */}
          <div className="court-frieze">
            <span className="frieze-rule" aria-hidden="true" />
            <span className="frieze-glyph" aria-hidden="true">⚖</span>
            <span className="frieze-title">المحكمة الإمبراطورية للمعرفة</span>
            <span className="frieze-glyph" aria-hidden="true">⚖</span>
            <span className="frieze-rule" aria-hidden="true" />
          </div>

          {/* Case Podium — formal declaration surface */}
          <div className="case-podium">
            <div className="podium-inscription">قدّم قضيتك للمحكمة</div>
            <form className="case-form" onSubmit={handleSubmit}>
              <div className="case-declaration-wrapper">
                <input
                  type="text"
                  className="case-declaration"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); resetIdleTimer(); }}
                  placeholder="فكرتك، ادعاءك، سؤالك..."
                  disabled={isExamining}
                  autoComplete="off"
                  aria-label="القضية المراد رفعها"
                />
                {showProveIt && !query && (
                  <span className="prove-it-overlay" aria-hidden="true">أثبت ذلك.</span>
                )}
              </div>
              <button
                type="submit"
                className={`imperial-seal-btn ${isExamining ? 'seal-examining' : ''}`}
                disabled={isExamining || !query.trim()}
                aria-label={isExamining ? 'جارٍ التداول' : 'رفع القضية'}
              >
                {isExamining
                  ? <><span className="seal-spinner" aria-hidden="true" /><span>يتداول المحرك</span></>
                  : <><span aria-hidden="true">⚖</span><span>رفع القضية</span></>
                }
              </button>
            </form>
          </div>

          {/* Deliberation Hall — the active space */}
          <div className="deliberation-hall custom-scroll">

            {/* Idle — court awaits */}
            {(phase === 'entering' || phase === 'idle') && !result && (
              <div className="court-idle-state">
                <div className="idle-seal" aria-hidden="true">⚖</div>
                <p className="idle-inscription">المحكمة في انتظار القضية</p>
                <p className="idle-subtext">الدليل لا يُطلب. يُبنى.</p>
              </div>
            )}

            {/* Examining — deliberation in progress */}
            {phase === 'examining' && (
              <div className="court-deliberating" aria-live="polite">
                <div className="deliberation-ring" aria-hidden="true" />
                <p className="deliberation-inscription">المحكمة تتداول الطبقات المعرفية...</p>
              </div>
            )}

            {/* Article IX — Stillness: truth deserves silence */}
            {phase === 'stillness' && (
              <div className="moment-of-truth" aria-hidden="true">
                <div className="truth-rule" />
                <span className="truth-word">لحظة...</span>
                <div className="truth-rule" />
              </div>
            )}

            {/* Verdict Sanctum — the Final Verdict */}
            {hasVerdict && result && (
              <div className="verdict-sanctum">

                {/* Error */}
                {!result.success && (
                  <div className="verdict-error" role="alert">
                    <p>{result.error ?? 'تعذّر الاتصال بالمستودعات المعرفية.'}</p>
                  </div>
                )}

                {/* Final Verdict — the court pronouncement */}
                {result.success && (
                  <div className="final-verdict living-frame-verdict">
                    <div className="verdict-crown">
                      <span className="verdict-glyph" aria-hidden="true">⚖</span>
                      <span className="verdict-crown-title">الحكم النهائي</span>
                      <div className="verdict-format-selector">
                        {(['short', 'medium', 'long'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            className={`verdict-fmt-btn ${outputFormat === fmt ? 'vfmt-active' : ''}`}
                            onClick={() => handleFormatChange(fmt)}
                          >
                            {fmt === 'short' ? 'موجز' : fmt === 'medium' ? 'مفصَّل' : 'كامل'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {verdict
                      ? <p className="verdict-declaration">{verdict}</p>
                      : <p className="verdict-empty">لا توجد أدلة كافية لإصدار حكم.</p>
                    }
                  </div>
                )}

                {/* Evidence Taxonomy — the full classified record */}
                {result.success && result.evidence.length > 0 && (() => {
                  const buckets = bucketEvidence(result);
                  return (
                    <div className="evidence-taxonomy">
                      <div className="taxonomy-header">
                        <span className="taxonomy-rule" />
                        <span className="taxonomy-title">السجل المصنَّف</span>
                        <span className="taxonomy-rule" />
                      </div>
                      <EvidenceCategory
                        titleAr="الأدلة المؤيدة"
                        type="supported"
                        items={buckets.supported}
                        domain={activeDomain}
                      />
                      <EvidenceCategory
                        titleAr="الروايات الداعمة"
                        type="narratives"
                        items={buckets.narratives}
                        domain={activeDomain}
                      />
                      <EvidenceCategory
                        titleAr="الادعاءات المتنازع عليها"
                        type="disputed"
                        items={buckets.disputed}
                        domain={activeDomain}
                      />
                      <EvidenceCategory
                        titleAr="البيانات غير المتحقق منها"
                        type="unverified"
                        items={buckets.unverified}
                        domain={activeDomain}
                      />
                      {buckets.supported.length === 0 && (
                        <div className="open-questions">
                          <span className="oq-mark">?</span>
                          <span className="oq-text">أسئلة مفتوحة — لم تُوجد أدلة قاطعة. القضية تحتاج إلى دراسة إضافية.</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Dispatch — send to other chambers */}
                {result.success && verdict && (
                  <div className="court-dispatch">
                    <span className="dispatch-label">إرسال إلى</span>
                    <div className="dispatch-btns">
                      <button
                        className="dispatch-btn push-qiyamah"
                        onClick={() => router.push('/qiyamah-chamber')}
                        aria-label="إرسال إلى غرفة القيامة"
                      >
                        القيامة
                      </button>
                      <button
                        className="dispatch-btn push-vault"
                        onClick={() => router.push('/sovereign-vault-palace')}
                        aria-label="إرسال إلى الخزانة السيادية"
                      >
                        الخزانة
                      </button>
                      <button
                        className="dispatch-btn push-makman"
                        onClick={() => router.push('/makman-al-ghayah')}
                        aria-label="إرسال إلى مكمن الغاية"
                      >
                        مكمن الغاية
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}
