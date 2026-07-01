/**
 * AZMA OS – Hujjah Al-Damighah
 * Phase 11 · Phase Three · First Living Chamber
 * Where Evidence Is Born.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './hujjah-al-damighah.css';
import { runInvestigation, type InvestigationDTO } from './actions';

// ── Domain catalogue ──────────────────────────────────────────────────────

const KNOWLEDGE_DOMAINS = [
  { id: 'religious',  nameAr: 'ديني (عقائدي/فقهي)' },
  { id: 'medical',    nameAr: 'طبي (تشريحي/حديث)' },
  { id: 'scientific', nameAr: 'علمي (فيزياء/فلك)' },
  { id: 'history',    nameAr: 'تاريخي (وثائقي/مخطوطات)' },
  { id: 'culture',    nameAr: 'ثقافي (فلسفة/أدب)' },
] as const;

type DomainId = typeof KNOWLEDGE_DOMAINS[number]['id'];
type OutputFormat = 'short' | 'medium' | 'long';
type Phase = 'entering' | 'idle' | 'examining' | 'stillness' | 'revealing' | 'complete';

// ── AZMA OS companion script ──────────────────────────────────────────────

const COMPANION = {
  entry:    'أنت في المكان الذي تُولد فيه الأدلة. أحضر فكرتك. ما تحمله عند خروجك لن يُقهر. ما الذي تحاول إثباته؟',
  idle:     'خذ وقتك. الدليل لا يُستعجل.',
  complete: 'ها هو ما يمكن الدفاع عنه.',
  departure:'تفكيرك الآن مختلف. هذا هو المقصود.',
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────

function confidenceLabelAr(level: string): string {
  switch (level) {
    case 'HIGH':       return 'دليل قاطع';
    case 'MODERATE':   return 'دليل محتمل';
    case 'LOW':        return 'دليل أولي';
    default:           return 'غير مُحدد';
  }
}

function synthesizeCapsule(
  dto: InvestigationDTO,
  format: OutputFormat,
  query: string,
): string {
  if (!dto.success || dto.evidence.length === 0) {
    return 'لم يُعثر على أدلة كافية. حاول صياغة الفكرة بطريقة مختلفة.';
  }
  const ev = dto.evidence;
  const pct = (score: number) => `${Math.round(score * 100)}%`;

  if (format === 'short') {
    return `الحجة المركزية:\n"${query}"\n\nتم فحصها عبر ${dto.totalSourcesScanned} مرجع.\nمؤشر الثقة: ${pct(ev[0]!.confidenceScore)}\nالمصدر: ${ev[0]!.sourceProvider}`;
  }
  if (format === 'medium') {
    return ev.slice(0, 2).map((e, i) =>
      `الدليل ${i + 1}:\n"${query}"\n— ${e.sourceProvider} (${pct(e.confidenceScore)})`
    ).join('\n\n');
  }
  return (
    `الفكرة المُقطَّرة:\n"${query}"\n\nفُحصت عبر ${dto.totalSourcesScanned} مرجع.\n\n` +
    ev.map((e, i) =>
      `${i + 1}. المصدر: ${e.sourceProvider}\n   الثقة: ${pct(e.confidenceScore)} — ${confidenceLabelAr(e.confidenceLevel)}`
    ).join('\n\n')
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export default function HujjahAlDamighah() {
  const router = useRouter();

  // Phase state machine
  const [phase, setPhase] = useState<Phase>('entering');

  // Entry veil
  const [veilReceding, setVeilReceding] = useState(false);

  // AZMA OS companion
  const [companionText, setCompanionText]     = useState('');
  const [companionVisible, setCompanionVisible] = useState(false);

  // "Prove it." one-time placeholder
  const [showProveIt, setShowProveIt] = useState(false);

  // User input
  const [activeDomain, setActiveDomain] = useState<DomainId>('religious');
  const [query, setQuery]               = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('short');

  // Intelligence results
  const [result, setResult]             = useState<InvestigationDTO | null>(null);
  const [capsule, setCapsule]           = useState('');

  // Refs
  const idleTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proveItTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Companion helpers ──────────────────────────────────────────────────

  const showCompanion = useCallback((text: string) => {
    setCompanionText(text);
    setCompanionVisible(true);
  }, []);

  const hideCompanion = useCallback(() => {
    setCompanionVisible(false);
  }, []);

  // ── Idle timer ─────────────────────────────────────────────────────────

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      showCompanion(COMPANION.idle);
    }, 30_000);
  }, [showCompanion]);

  // ── Entry sequence ─────────────────────────────────────────────────────

  useEffect(() => {
    // Veil recedes (reveals the chamber)
    const t1 = setTimeout(() => setVeilReceding(true), 60);

    // Phase transitions to idle after reveal
    const t2 = setTimeout(() => setPhase('idle'), 700);

    // AZMA OS speaks the entry message
    const t3 = setTimeout(() => showCompanion(COMPANION.entry), 900);

    // "Prove it." appears once
    const t4 = setTimeout(() => {
      setShowProveIt(true);
      proveItTimerRef.current = setTimeout(() => setShowProveIt(false), 3_800);
    }, 1_500);

    // Start idle timer
    const t5 = setTimeout(() => resetIdleTimer(), 700);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      if (proveItTimerRef.current) clearTimeout(proveItTimerRef.current);
      if (idleTimerRef.current)    clearTimeout(idleTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit / Investigation ─────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || phase === 'examining' || phase === 'stillness') return;

    // Companion retreats — chamber takes over
    hideCompanion();
    setPhase('examining');
    setResult(null);
    setCapsule('');
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    const dto = await runInvestigation(trimmedQuery, activeDomain);

    // Constitutional stillness moment before revelation (~500ms)
    setPhase('stillness');
    await new Promise<void>((resolve) => setTimeout(resolve, 500));

    // Reveal evidence
    setPhase('revealing');
    setResult(dto);
    if (dto.success) {
      setCapsule(synthesizeCapsule(dto, outputFormat, trimmedQuery));
    }

    // After gravity-settle animations complete, companion speaks
    setTimeout(() => {
      setPhase('complete');
      showCompanion(COMPANION.complete);
    }, 920);
  }

  // ── Domain change ──────────────────────────────────────────────────────

  function handleDomainChange(id: DomainId) {
    setActiveDomain(id);
    if (phase === 'complete') {
      setResult(null);
      setCapsule('');
      setPhase('idle');
      hideCompanion();
    }
    resetIdleTimer();
  }

  // ── Format change ──────────────────────────────────────────────────────

  function handleFormatChange(fmt: OutputFormat) {
    setOutputFormat(fmt);
    if (result?.success) {
      setCapsule(synthesizeCapsule(result, fmt, query.trim()));
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────

  const isExamining  = phase === 'examining' || phase === 'stillness';
  const hasEvidence  = (phase === 'revealing' || phase === 'complete') && result?.success;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <main className="hujjah-viewport breathing" dir="rtl">

      {/* ── Entry veil — radial recession ─────────────────────────────── */}
      <div
        className={`entry-veil ${veilReceding ? 'veil-receding' : ''}`}
        aria-hidden="true"
      />

      {/* ── Atmospheric background ─────────────────────────────────────── */}
      <div className="neon-layer" aria-hidden="true">
        <div className="cyber-grid" />
        <div className="ambient-depth-gradient" />
      </div>

      {/* ── AZMA OS Living Companion ──────────────────────────────────── */}
      <div
        className={`azma-companion ${companionVisible && companionText ? 'companion-visible' : 'companion-hidden'}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="companion-sigil" aria-hidden="true">✦</span>
        <span className="companion-text">{companionText}</span>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div className="top-nav-links">
        <button
          className="sovereign-exit-btn"
          onClick={() => {
            showCompanion(COMPANION.departure);
            setTimeout(() => router.push('/ras-amr'), 800);
          }}
        >
          ⮜ العودة لرأس الأمر
        </button>
      </div>

      {/* ── Three-column chamber grid ─────────────────────────────────── */}
      <div className="chamber-grid-layout">

        {/* ── LEFT: Knowledge Sources ─────────────────────────────────── */}
        <aside className="control-panel domain-desk neon-border">
          <header className="panel-header">
            <div className="neon-tag">KNOWLEDGE SOURCES</div>
            <h2>مصادر المعرفة</h2>
          </header>

          {/* Domain selector — always visible */}
          <div className="domains-container custom-scroll">
            {KNOWLEDGE_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                className={`domain-btn ${activeDomain === domain.id ? 'active' : ''}`}
                onClick={() => handleDomainChange(domain.id)}
              >
                <span className="domain-indicator" aria-hidden="true" />
                {domain.nameAr}
              </button>
            ))}
          </div>

          {/* Evidence source cards — appear with gravity after examination */}
          {hasEvidence && result!.evidence.length > 0 && (
            <div className="evidence-sources-section">
              <div className="sources-divider" />
              <p className="sources-label">الأدلة المستخرجة ({result!.totalSourcesScanned} مرجع)</p>
              <div className="evidence-sources-list custom-scroll">
                {result!.evidence.map((ev, idx) => (
                  <div
                    key={ev.id}
                    className="ev-source-card"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <span className={`ev-badge ev-badge-${ev.confidenceLevel.toLowerCase()}`}>
                      {confidenceLabelAr(ev.confidenceLevel)}
                    </span>
                    <p className="ev-source-text">
                      {ev.contextWindow
                        ? ev.contextWindow.slice(0, 100) + '...'
                        : ev.extractedText.slice(0, 100) + '...'}
                    </p>
                    <span className="ev-provider">— {ev.sourceProvider}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examination state — sources loading indicator */}
          {isExamining && (
            <div className="sources-examining-state">
              <div className="sources-divider" />
              <p className="sources-examining-text">يتم الاستعلام من المستودعات...</p>
              <div className="sources-loading-bars">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="loading-bar"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── CENTER: Evidence Space ───────────────────────────────────── */}
        <section
          className={`center-stage evidence-space ${isExamining ? 'examining' : ''}`}
          role="main"
        >
          {/* Knowledge Pulse — intellectually alive during examination */}
          <div className="knowledge-pulse-layer" aria-hidden="true" />

          {/* Inquiry form */}
          <div className="evidence-form-wrapper">
            <form
              className="oracle-search-form neon-border-gold"
              onSubmit={handleSubmit}
            >
              <div className="oracle-input-wrapper">
                <input
                  type="text"
                  className="oracle-input"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    resetIdleTimer();
                  }}
                  placeholder="أدخل فكرتك السيادية..."
                  disabled={isExamining}
                  autoComplete="off"
                  aria-label="الفكرة المراد إثباتها"
                />
                {/* "Prove it." — one-time atmospheric placeholder */}
                {showProveIt && !query && (
                  <span className="prove-it-overlay" aria-hidden="true">
                    أثبت ذلك.
                  </span>
                )}
              </div>
              <button
                type="submit"
                className={`oracle-submit-btn ${isExamining ? 'btn-examining' : ''}`}
                disabled={isExamining || !query.trim()}
                aria-label={isExamining ? 'جارٍ الفحص' : 'فحص الفكرة'}
              >
                {isExamining ? 'جارٍ الفحص' : 'فحص ✦'}
              </button>
            </form>
          </div>

          {/* Stillness moment — truth deserves silence before revelation */}
          {phase === 'stillness' && (
            <div className="stillness-moment" aria-hidden="true">
              <div className="stillness-line" />
            </div>
          )}

          {/* Evidence display area */}
          <div className="oracle-display custom-scroll neon-border">

            {/* Idle state */}
            {(phase === 'entering' || (phase === 'idle' && !result)) && (
              <div className="empty-state">
                <p>المحرك في وضع الاستعداد.</p>
                <p className="empty-subtext">الدليل لا يُطلب. يُبنى.</p>
              </div>
            )}

            {/* Examining state */}
            {phase === 'examining' && (
              <div className="examining-state" aria-live="polite">
                <div className="examining-pulse-ring" aria-hidden="true" />
                <p className="examining-text">يفحص المحرك المستودعات...</p>
              </div>
            )}

            {/* Stillness state */}
            {phase === 'stillness' && (
              <div className="stillness-state" aria-hidden="true">
                <div className="stillness-divider-line" />
              </div>
            )}

            {/* Error state */}
            {(phase === 'revealing' || phase === 'complete') && result && !result.success && (
              <div className="error-state" role="alert">
                <p>{result.error ?? 'تعذّر الاتصال بمحركات المعرفة.'}</p>
              </div>
            )}

            {/* Evidence results */}
            {hasEvidence && result!.evidence.length > 0 && (
              <div className="results-list" role="list">
                {result!.evidence.map((ev, idx) => (
                  <article
                    key={ev.id}
                    className={`result-card ev-result-card ev-card-${ev.confidenceLevel.toLowerCase()}`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                    role="listitem"
                  >
                    <span className={`ev-result-badge ev-badge-${ev.confidenceLevel.toLowerCase()}`}>
                      {confidenceLabelAr(ev.confidenceLevel)}
                    </span>
                    <p className="result-text ev-result-text">
                      &ldquo;{ev.extractedText}&rdquo;
                    </p>
                    <div className="result-meta">
                      <span className="result-source">{ev.sourceProvider}</span>
                      <span className="ev-score">
                        {Math.round(ev.confidenceScore * 100)}%
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty evidence (engine returned success but no evidence) */}
            {hasEvidence && result!.evidence.length === 0 && (
              <div className="empty-state">
                <p>لم يُعثر على أدلة كافية.</p>
                <p className="empty-subtext">حاول صياغة فكرتك بطريقة مختلفة.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT: Distillation Engine ──────────────────────────────── */}
        <aside
          className={`control-panel synthesis-desk neon-border ${isExamining ? 'distillation-active' : ''}`}
        >
          <header className="panel-header">
            <div className="neon-tag">DISTILLATION ENGINE</div>
            <h2>محرك التقطير</h2>
          </header>

          {/* Output format selector */}
          <div className="format-selector">
            <label className="gold-label">حجم الإخراج:</label>
            <div className="format-tabs">
              {(['short', 'medium', 'long'] as const).map((fmt) => (
                <button
                  key={fmt}
                  className={`f-tab ${outputFormat === fmt ? 'active' : ''}`}
                  onClick={() => handleFormatChange(fmt)}
                >
                  {fmt === 'short' ? 'مكثّف' : fmt === 'medium' ? 'موسّع' : 'شامل'}
                </button>
              ))}
            </div>
          </div>

          {/* Distilled evidence capsule */}
          <div className="synthesis-workspace">
            <label className="gold-label">الكبسولة المقطّرة:</label>

            <div className={`distillation-capsule ${isExamining ? 'capsule-examining' : ''}`}>
              {isExamining ? (
                <div className="capsule-examining-state">
                  <div className="capsule-spinner" aria-hidden="true" />
                  <span className="capsule-status-text">جارٍ التقطير...</span>
                </div>
              ) : capsule ? (
                <p className="capsule-text">{capsule}</p>
              ) : (
                <p className="capsule-placeholder">ستظهر الحجة المقطّرة هنا بعد الفحص.</p>
              )}
            </div>
          </div>

          {/* Sovereign Dispatch Matrix */}
          <div className="dispatch-actions-grid">
            <button
              className="route-btn push-qiyamah"
              disabled={!capsule}
              onClick={() => router.push('/qiyamah-chamber')}
              aria-label="إرسال إلى غرفة القيامة"
            >
              <span className="btn-icon" aria-hidden="true">👁️</span>
              القيامة
            </button>
            <button
              className="route-btn push-vault"
              disabled={!capsule}
              onClick={() => router.push('/sovereign-vault-palace')}
              aria-label="إرسال إلى الخزانة السيادية"
            >
              <span className="btn-icon" aria-hidden="true">👑</span>
              الخزانة
            </button>
            <button
              className="route-btn push-makman"
              disabled={!capsule}
              onClick={() => router.push('/makman-al-ghayah')}
              aria-label="إرسال إلى مكمن الغاية"
            >
              <span className="btn-icon" aria-hidden="true">🚀</span>
              مكمن الغاية
            </button>
          </div>
        </aside>

      </div>
    </main>
  );
}
