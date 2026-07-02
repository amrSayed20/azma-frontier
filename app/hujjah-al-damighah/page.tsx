/**
 * AZMA OS – Hujjah Al-Damighah
 * The Imperial Court of Knowledge.
 * Final Architectural Decree — Living Chamber, not a page.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './hujjah-al-damighah.css';
import { runInvestigation, type InvestigationDTO, type EvidenceItemDTO } from './actions';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { EvidenceGateway }    from './_components/EvidenceGateway';
import { VerdictDocument }    from './_components/VerdictDocument';
import { InvestigationFile }  from './_components/InvestigationFile';
import {
  KNOWLEDGE_DOMAINS,
  type DomainId,
  type OutputFormat,
  type KnowledgeTier,
  resolveKnowledgeLayer,
  bucketEvidence,
} from './_lib/evidence-utils';

// ── Types ─────────────────────────────────────────────────────────────────

type Phase = 'entering' | 'idle' | 'examining' | 'stillness' | 'revealing' | 'complete';
type Mood  = 'arrival' | 'listening' | 'investigation' | 'gathering' | 'reasoning' | 'silence' | 'verdict' | 'reflection';
type InvestigationStage = 'idle' | 'receiving' | 'collecting' | 'classifying' | 'deliberating';

// ── Narrative Stages ──────────────────────────────────────────────────────

const NARRATIVE_STAGES: { id: string; labelAr: string; mapsTo: InvestigationStage | Phase }[] = [
  { id: 'receiving',   labelAr: 'استقبال',    mapsTo: 'receiving'   },
  { id: 'collecting',  labelAr: 'جمع الأدلة', mapsTo: 'collecting'  },
  { id: 'classifying', labelAr: 'التصنيف',    mapsTo: 'classifying' },
  { id: 'deliberating',labelAr: 'التداول',    mapsTo: 'deliberating'},
  { id: 'silence',     labelAr: 'الصمت',      mapsTo: 'stillness'   },
  { id: 'verdict',     labelAr: 'الحكم',      mapsTo: 'complete'    },
];

const STAGE_TO_NARRATIVE: Record<InvestigationStage, number> = {
  idle: -1, receiving: 0, collecting: 1, classifying: 2, deliberating: 3,
};

function narrativeIndex(phase: Phase, stage: InvestigationStage): number {
  if (phase === 'examining') return STAGE_TO_NARRATIVE[stage] ?? 0;
  if (phase === 'stillness') return 4;
  if (phase === 'revealing' || phase === 'complete') return 5;
  return -1;
}

// ── Companion Script ──────────────────────────────────────────────────────

const COMPANION_MSGS: Record<string, string> = {
  entry:        'أنت في المكان الذي تُولد فيه الأدلة. ما الذي تريد إثباته؟',
  idle:         'المحكمة تنتظر. الدليل لا يُستعجل.',
  receiving:    'استقبال القضية. المحرك يُعدّ الطبقات المعرفية.',
  collecting:   'المحكمة تجمع الأدلة من طبقات المعرفة…',
  classifying:  'تصنيف الأدلة وترتيبها وفق المعيار المعرفي…',
  deliberating: 'التداول في القرار. اللحظة الحاسمة تقترب.',
  silence:      'لحظة الصمت قبل الحكم.',
  verdict:      'الحكم يُعلَن — القضية لا تنتهي.',
  complete:     'التحقيق مكتمل. ما تحمله الآن يمكن الدفاع عنه.',
  departure:    'تفكيرك الآن مختلف. هذا هو المقصود.',
  gatewayOpen:  'بوابة الدليل مفتوحة. كل دليل عالَم.',
  vaultSaved:   'الدليل محفوظ في الخزانة السيادية.',
};

// ── Mood Resolver ─────────────────────────────────────────────────────────

function resolveMood(phase: Phase, stage: InvestigationStage): Mood {
  if (phase === 'examining') {
    if (stage === 'receiving')   return 'investigation';
    if (stage === 'collecting')  return 'gathering';
    if (stage === 'classifying') return 'gathering';
    return                              'reasoning';
  }
  if (phase === 'stillness') return 'silence';
  if (phase === 'revealing') return 'verdict';
  if (phase === 'complete')  return 'reflection';
  return 'listening';
}

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// ── Evidence Category ─────────────────────────────────────────────────────

interface EvCatProps {
  titleAr: string;
  type:    'supported' | 'narratives' | 'disputed' | 'unverified';
  items:   EvidenceItemDTO[];
  domain:  DomainId;
  onSelect: (ev: EvidenceItemDTO) => void;
}

function EvidenceCategory({ titleAr, type, items, domain, onSelect }: EvCatProps) {
  if (items.length === 0) return null;
  const marks: Record<string, string> = {
    supported: '●', narratives: '◐', disputed: '◑', unverified: '○',
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
            <button
              key={ev.id}
              className="evidence-entry evidence-entry-btn"
              style={{ animationDelay: `${idx * 70}ms` }}
              onClick={() => onSelect(ev)}
              aria-label={`افتح بوابة الدليل: ${layer.labelAr}`}
            >
              <span className={`entry-tier tier-${layer.tier as KnowledgeTier}`}>{layer.labelAr}</span>
              <p className="entry-text">&ldquo;{ev.extractedText}&rdquo;</p>
              <span className="entry-score">{Math.round(ev.confidenceScore * 100)}%</span>
              <span className="entry-gateway-hint" aria-hidden="true">← بوابة</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function HujjahAlDamighah() {
  const router = useRouter();

  const [phase, setPhase]                       = useState<Phase>('entering');
  const [invStage, setInvStage]                 = useState<InvestigationStage>('idle');
  const [veilReceding, setVeilReceding]         = useState(false);
  const [isExiting, setIsExiting]               = useState(false);

  const [query, setQuery]                       = useState('');
  const [activeDomain, setActiveDomain]         = useState<DomainId>('religious');
  const [outputFormat, setOutputFormat]         = useState<OutputFormat>('short');
  const [result, setResult]                     = useState<InvestigationDTO | null>(null);
  const [sessionCount, setSessionCount]         = useState(0);

  const [companionText, setCompanionText]       = useState('');
  const [companionVisible, setCompanionVisible] = useState(false);
  const [textToSpeak, setTextToSpeak]           = useState('');
  const [showProveIt, setShowProveIt]           = useState(false);

  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItemDTO | null>(null);
  const [gatewayOpen, setGatewayOpen]           = useState(false);
  const [savedToVault, setSavedToVault]         = useState(false);

  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proveItTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Mood ────────────────────────────────────────────────────────────────

  const mood: Mood =
    (phase === 'entering' || phase === 'idle') && !query ? 'arrival'
    : (phase === 'idle' && query.length > 0)             ? 'listening'
    : resolveMood(phase, invStage);

  // ── Companion helpers ────────────────────────────────────────────────────

  const showCompanion = useCallback((text: string, alsoSpeak = false) => {
    setCompanionText(text);
    setCompanionVisible(true);
    if (alsoSpeak) setTextToSpeak(text);
  }, []);

  const hideCompanion = useCallback(() => setCompanionVisible(false), []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => showCompanion(COMPANION_MSGS.idle), 30_000);
  }, [showCompanion]);

  // ── Entry sequence ───────────────────────────────────────────────────────

  useEffect(() => {
    const t1 = setTimeout(() => setVeilReceding(true), 60);
    const t2 = setTimeout(() => setPhase('idle'), 700);
    const t3 = setTimeout(() => showCompanion(COMPANION_MSGS.entry), 900);
    const t4 = setTimeout(() => {
      setShowProveIt(true);
      proveItTimerRef.current = setTimeout(() => setShowProveIt(false), 3_800);
    }, 1_500);
    const t5 = setTimeout(() => resetIdleTimer(), 700);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      if (proveItTimerRef.current)    clearTimeout(proveItTimerRef.current);
      if (idleTimerRef.current)       clearTimeout(idleTimerRef.current);
      stageTimersRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Voice Transcript ─────────────────────────────────────────────────────

  const handleVoiceTranscript = useCallback((text: string) => {
    setQuery(text);
    setTimeout(() => {
      const form = document.getElementById('case-declaration-input')?.closest('form');
      if (form) form.requestSubmit();
    }, 50);
  }, []);

  // ── Case Submission ──────────────────────────────────────────────────────

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || phase === 'examining' || phase === 'stillness') return;

    hideCompanion();
    setPhase('examining');
    setResult(null);
    setSavedToVault(false);
    setGatewayOpen(false);
    setSelectedEvidence(null);
    setSessionCount((c) => c + 1);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Stage narrative simulation
    setInvStage('receiving');
    showCompanion(COMPANION_MSGS.receiving);

    const stageTimers: ReturnType<typeof setTimeout>[] = [];
    stageTimers.push(setTimeout(() => { setInvStage('collecting');  showCompanion(COMPANION_MSGS.collecting);  }, 700));
    stageTimers.push(setTimeout(() => { setInvStage('classifying'); showCompanion(COMPANION_MSGS.classifying); }, 1_900));
    stageTimers.push(setTimeout(() => { setInvStage('deliberating');showCompanion(COMPANION_MSGS.deliberating);}, 3_500));
    stageTimersRef.current = stageTimers;

    const dto = await runInvestigation(trimmedQuery, activeDomain);

    stageTimers.forEach(clearTimeout);
    setInvStage('deliberating');

    setResult(dto);

    // Moment of Truth: mandatory silence
    showCompanion(COMPANION_MSGS.silence);
    setPhase('stillness');
    await delay(1_600);

    setPhase('revealing');
    await delay(160);
    setPhase('complete');
    setInvStage('idle');

    const verdictMsg = COMPANION_MSGS.complete;
    showCompanion(verdictMsg, true);
    resetIdleTimer();
  }

  // ── Domain / Format Change ───────────────────────────────────────────────

  function handleDomainChange(id: DomainId) {
    setActiveDomain(id);
    if (phase === 'complete') {
      setResult(null);
      setPhase('idle');
      hideCompanion();
    }
    resetIdleTimer();
  }

  // ── Evidence Gateway ─────────────────────────────────────────────────────

  function handleEvidenceSelect(ev: EvidenceItemDTO) {
    setSelectedEvidence(ev);
    setGatewayOpen(true);
    showCompanion(COMPANION_MSGS.gatewayOpen);
  }

  function handleCloseGateway() {
    setGatewayOpen(false);
  }

  function handleNewInvestigationFromEvidence(evidenceContext: string) {
    setGatewayOpen(false);
    setQuery(evidenceContext.slice(0, 200));
    setResult(null);
    setPhase('idle');
    setSavedToVault(false);
    setTimeout(() => {
      document.getElementById('case-declaration-input')?.focus();
    }, 100);
  }

  function handleSaveEvidenceToVault(ev: EvidenceItemDTO) {
    // Store in sessionStorage for transfer to vault chamber
    try {
      const existing = JSON.parse(sessionStorage.getItem('azma.vault.evidence') ?? '[]') as EvidenceItemDTO[];
      const updated  = [...existing.filter((e) => e.id !== ev.id), ev];
      sessionStorage.setItem('azma.vault.evidence', JSON.stringify(updated));
    } catch { /* ignore */ }
    showCompanion(COMPANION_MSGS.vaultSaved);
  }

  // ── Investigation File Actions ───────────────────────────────────────────

  function handleContinue() {
    setResult(null);
    setPhase('idle');
    setSavedToVault(false);
    setTimeout(() => document.getElementById('case-declaration-input')?.focus(), 80);
  }

  function handleExpand() {
    if (!result) return;
    const expandQuery = `توسيع وتعمّق في: ${query.trim()}`;
    setQuery(expandQuery);
    setResult(null);
    setSavedToVault(false);
    setPhase('idle');
    setTimeout(() => {
      const form = document.getElementById('case-declaration-input')?.closest('form');
      if (form) form.requestSubmit();
    }, 80);
  }

  function handleSaveVault() {
    if (!result) return;
    try {
      sessionStorage.setItem('azma.transfer.investigation', JSON.stringify({
        query:           query.trim(),
        evidenceCount:   result.evidence.length,
        averageScore:    result.averageEvidenceScore,
        timestamp:       Date.now(),
        sessionNumber:   sessionCount,
      }));
    } catch { /* ignore */ }
    setSavedToVault(true);
    showCompanion(COMPANION_MSGS.vaultSaved);
  }

  function handleCinematicExit(destination: string) {
    if (result) {
      try {
        sessionStorage.setItem('azma.transfer.investigation', JSON.stringify({
          query: query.trim(), evidence: result.evidence, timestamp: Date.now(),
        }));
      } catch { /* ignore */ }
    }
    showCompanion(COMPANION_MSGS.departure);
    setIsExiting(true);
    setTimeout(() => router.push(destination), 720);
  }

  // ── Derived state ────────────────────────────────────────────────────────

  const isExamining   = phase === 'examining' || phase === 'stillness';
  const hasVerdict    = (phase === 'revealing' || phase === 'complete') && result !== null;
  const navIdx        = narrativeIndex(phase, invStage);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main
      className={`hujjah-viewport breathing mood-${mood} ${isExiting ? 'chamber-sealing' : ''}`}
      dir="rtl"
    >
      {/* Entry Veil */}
      <div className={`entry-veil ${veilReceding ? 'veil-receding' : ''}`} aria-hidden="true" />

      {/* Atmospheric Background */}
      <div className="neon-layer" aria-hidden="true">
        <div className="cyber-grid" />
        <div className="ambient-depth-gradient" />
        <div className="ambient-secondary-glow" />
      </div>

      {/* Crown Bar */}
      <div className="crown-bar">
        <LivingCompanion
          message={companionText}
          visible={companionVisible}
          textToSpeak={textToSpeak}
          onVoiceTranscript={handleVoiceTranscript}
        />
        <div className="crown-nav">
          <button
            className="sovereign-exit-btn"
            onClick={() => handleCinematicExit('/ras-amr')}
          >
            ⮜ العودة
          </button>
        </div>
      </div>

      {/* Imperial Court Layout */}
      <div className="imperial-court-layout">

        {/* Knowledge Archives — Left Alcove */}
        <aside className="knowledge-archives living-frame-archives">
          <div className="archives-header">
            <div className="archives-classification">KNOWLEDGE ARCHIVES</div>
            <h2 className="archives-title">أرشيف المعرفة</h2>
            {sessionCount > 0 && (
              <div className="archives-session-docket">جلسة #{sessionCount}</div>
            )}
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
                  <button
                    key={ev.id}
                    className={`archive-record tier-record-${layer.tier} archive-record-btn`}
                    style={{ animationDelay: `${idx * 55}ms` }}
                    onClick={() => handleEvidenceSelect(ev)}
                    aria-label={`افتح بوابة الدليل: ${layer.labelAr}`}
                  >
                    <span className={`archive-record-tier tier-${layer.tier}`}>{layer.labelAr}</span>
                    <p className="archive-record-excerpt">
                      {(ev.contextWindow || ev.extractedText).slice(0, 55)}…
                    </p>
                    <span className="archive-record-score">{Math.round(ev.confidenceScore * 100)}%</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Scanning indicator */}
          {isExamining && (
            <div className="archive-scanning" aria-live="polite">
              <div className="scanning-label">تُفهرَس الأرشيفات</div>
              <div className="scanning-bars">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="scanning-bar" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Court Space */}
        <section className="court-space">

          {/* Court Frieze */}
          <div className="court-frieze">
            <span className="frieze-rule" aria-hidden="true" />
            <span className="frieze-glyph" aria-hidden="true">⚖</span>
            <span className="frieze-title">المحكمة الإمبراطورية للمعرفة</span>
            <span className="frieze-glyph" aria-hidden="true">⚖</span>
            <span className="frieze-rule" aria-hidden="true" />
          </div>

          {/* Case Narrative Progress Bar — within court space, between frieze and podium */}
          {(isExamining || phase === 'revealing' || phase === 'complete') && (
            <div className="case-narrative-bar" aria-label="مراحل التحقيق" role="progressbar">
              {NARRATIVE_STAGES.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={`narrative-stage ${i === navIdx ? 'nstage-current' : i < navIdx ? 'nstage-done' : ''}`}>
                    <span className="nstage-dot" aria-hidden="true" />
                    <span className="nstage-label">{s.labelAr}</span>
                  </div>
                  {i < NARRATIVE_STAGES.length - 1 && (
                    <span className={`nstage-connector ${i < navIdx ? 'connector-done' : ''}`} aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Case Podium */}
          <div className="case-podium">
            <div className="podium-inscription">قدّم قضيتك للمحكمة</div>
            <form className="case-form" onSubmit={handleSubmit}>
              <div className="case-declaration-wrapper">
                <input
                  id="case-declaration-input"
                  type="text"
                  className="case-declaration"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); resetIdleTimer(); }}
                  placeholder="فكرتك، ادعاءك، سؤالك…"
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

          {/* Deliberation Hall */}
          <div className="deliberation-hall custom-scroll">

            {/* Idle State */}
            {(phase === 'entering' || phase === 'idle') && !result && (
              <div className="court-idle-state">
                <div className="idle-seal" aria-hidden="true">⚖</div>
                <p className="idle-inscription">المحكمة في انتظار القضية</p>
                <p className="idle-subtext">الدليل لا يُطلب. يُبنى.</p>
              </div>
            )}

            {/* Examining — Stage-Aware */}
            {phase === 'examining' && (
              <div className="court-deliberating" aria-live="polite" aria-atomic="true">
                <div className="deliberation-ring" aria-hidden="true" />
                <p className="deliberation-stage-label">
                  {invStage === 'receiving'    && 'استقبال القضية'}
                  {invStage === 'collecting'   && 'جمع الأدلة من طبقات المعرفة'}
                  {invStage === 'classifying'  && 'تصنيف الطبقات المعرفية'}
                  {invStage === 'deliberating' && 'التداول في القرار'}
                  {invStage === 'idle'         && 'التحقيق جارٍ'}
                </p>
                <p className="deliberation-inscription">المحكمة الإمبراطورية تعمل…</p>
              </div>
            )}

            {/* Moment of Truth */}
            {phase === 'stillness' && (
              <div className="moment-of-truth" aria-hidden="true">
                <div className="truth-rule" />
                <span className="truth-word">لحظة…</span>
                <div className="truth-rule" />
              </div>
            )}

            {/* Verdict Sanctum */}
            {hasVerdict && result && (
              <div className="verdict-sanctum">

                {!result.success && (
                  <div className="verdict-error" role="alert">
                    <p>{result.error ?? 'تعذّر الاتصال بالمستودعات المعرفية.'}</p>
                  </div>
                )}

                {result.success && (
                  <>
                    {/* Formal Verdict Document */}
                    <VerdictDocument
                      dto={result}
                      query={query.trim()}
                      domain={activeDomain}
                      outputFormat={outputFormat}
                      onFormatChange={setOutputFormat}
                    />

                    {/* Evidence Taxonomy — clickable gateways */}
                    {result.evidence.length > 0 && (() => {
                      const b = bucketEvidence(result);
                      return (
                        <div className="evidence-taxonomy">
                          <div className="taxonomy-header">
                            <span className="taxonomy-rule" />
                            <span className="taxonomy-title">السجل المصنَّف — انقر على أي دليل لفتح بوابته</span>
                            <span className="taxonomy-rule" />
                          </div>
                          <EvidenceCategory titleAr="الأدلة المؤيدة"               type="supported"  items={b.supported}  domain={activeDomain} onSelect={handleEvidenceSelect} />
                          <EvidenceCategory titleAr="الروايات الداعمة"             type="narratives" items={b.narratives} domain={activeDomain} onSelect={handleEvidenceSelect} />
                          <EvidenceCategory titleAr="الادعاءات المتنازع عليها"    type="disputed"   items={b.disputed}   domain={activeDomain} onSelect={handleEvidenceSelect} />
                          <EvidenceCategory titleAr="البيانات غير المتحقق منها"   type="unverified" items={b.unverified} domain={activeDomain} onSelect={handleEvidenceSelect} />
                          {b.supported.length === 0 && (
                            <div className="open-questions">
                              <span className="oq-mark">?</span>
                              <span className="oq-text">أسئلة مفتوحة — لم تُوجد أدلة قاطعة. القضية تحتاج إلى دراسة إضافية.</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Investigation File */}
                    <InvestigationFile
                      onContinue={handleContinue}
                      onExpand={handleExpand}
                      onTransferQiyamah={() => handleCinematicExit('/qiyamah-chamber')}
                      onSaveVault={handleSaveVault}
                      savedToVault={savedToVault}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Evidence Gateway — slides in from right */}
          <EvidenceGateway
            evidence={selectedEvidence}
            domain={activeDomain}
            open={gatewayOpen}
            onClose={handleCloseGateway}
            onNewInvestigation={handleNewInvestigationFromEvidence}
            onSaveToVault={handleSaveEvidenceToVault}
          />

        </section>
      </div>
    </main>
  );
}
