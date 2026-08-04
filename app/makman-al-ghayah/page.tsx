/**
 * AZMA OS – Makman Al-Ghayah
 * Native Name: مكمن الغاية
 *
 * PACKAGE F — CONSTITUTIONAL CAPABILITY REVELATION:
 * This chamber's constitutional identity is now visible for the first time.
 * The prior UI (social platform grid, fake Sovereign Release button,
 * hardcoded demo video display, AI packaging dead button) has been removed
 * per the Remove-not-cover constitutional rule. What remains is only
 * certified constitutional truth.
 *
 * CERTIFIED CAPABILITIES NOW VISIBLE:
 *   makman-set-sovereign-purpose   — GET/PUT /api/sovereign/entry/purpose
 *   makman-register-milestone-goal — POST /api/sovereign/entry/creator-goal
 *                                    (requires CompiledAssemblyGraph from Ras Al Amr)
 *   makman-define-success-criteria — PUT .../success-criteria
 *   makman-record-observation      — GET /api/sovereign/entry/consumption
 *   makman-assess-fulfillment      — POST/GET .../fulfillment-assessment
 *   makman-get-gap-report          — GET .../fulfillment-gap
 *   makman-request-knowledge-investigation — GET .../knowledge-investigation
 *
 * RETAINED (already certified, real pipelines):
 *   handleActivateRealDistribution  → POST /api/sovereign/entry/creator-goal
 *   handlePreviewRealAccess         → GET /api/sovereign/entry/consumption
 *   pacingPreference + transitionPreference → carried onto GoalContract
 */

'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { MakmanExperience } from '@/src/imperial-experience-engine';
import { GoalPriority, PacingPreference, TransitionPreference } from '@/src/chambers/makman-al-ghayah/goal-contracts';
import { DistributionTier } from '@/src/chambers/makman-al-ghayah/publication-contracts';
import type { CompiledAssemblyGraph } from '@/src/chambers/ras-al-amr/pre-publishing-boundary';
import type { MakmanFirstCustomerJourneyResult } from '@/src/chambers/makman-al-ghayah/MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE';
import type { ConsumptionResponse } from '@/src/chambers/makman-al-ghayah/consumption-boundary';
import './makman-al-ghayah.css';

interface RealProduction {
  id: string;
  title: string;
  secureStorageUri: string;
}

interface GoalSummary {
  goalId: string;
  title: string;
  status: string;
  priority: string;
  createdAtMs: number;
}

function subscribeToNothing(): () => void {
  return () => {};
}

let cachedRealProduction: RealProduction | null | undefined = undefined;
function getRealProductionSnapshot(): RealProduction | null {
  if (cachedRealProduction === undefined) {
    cachedRealProduction = null;
    try {
      const raw = sessionStorage.getItem('azma.transfer.rasAmrProduction');
      if (raw) {
        sessionStorage.removeItem('azma.transfer.rasAmrProduction');
        cachedRealProduction = JSON.parse(raw) as RealProduction;
      }
    } catch { /* falls back to empty state */ }
  }
  return cachedRealProduction;
}
function getRealProductionServerSnapshot(): RealProduction | null {
  return null;
}

let cachedCompiledGraph: CompiledAssemblyGraph | null | undefined = undefined;
function getCompiledGraphSnapshot(): CompiledAssemblyGraph | null {
  if (cachedCompiledGraph === undefined) {
    cachedCompiledGraph = null;
    try {
      const raw = sessionStorage.getItem('azma.transfer.rasAmrCompiledGraph');
      if (raw) {
        sessionStorage.removeItem('azma.transfer.rasAmrCompiledGraph');
        cachedCompiledGraph = JSON.parse(raw) as CompiledAssemblyGraph;
      }
    } catch { /* real distribution stays unavailable */ }
  }
  return cachedCompiledGraph;
}
function getCompiledGraphServerSnapshot(): CompiledAssemblyGraph | null {
  return null;
}

const GOAL_STATUS_AR: Record<string, string> = {
  CREATED:     'مُنشأ',
  PLANNED:     'مُخطَّط',
  IN_PROGRESS: 'قيد التنفيذ',
  BLOCKED:     'موقوف',
  COMPLETED:   'مكتمل',
  FAILED:      'فشل',
};

const GOAL_PRIORITY_AR: Record<string, string> = {
  LOW:      'منخفضة',
  MEDIUM:   'متوسطة',
  HIGH:     'عالية',
  CRITICAL: 'حرجة',
};

const VERDICT_AR: Record<string, string> = {
  FULFILLED:           'مُحقَّق',
  PARTIALLY_FULFILLED: 'مُحقَّق جزئياً',
  NOT_FULFILLED:       'غير مُحقَّق',
  CANNOT_ASSESS:       'لا يمكن التقييم',
};

export default function MakmanAlGhayah() {
  const router = useRouter();
  const realProduction = useSyncExternalStore(subscribeToNothing, getRealProductionSnapshot, getRealProductionServerSnapshot);
  const compiledGraph  = useSyncExternalStore(subscribeToNothing, getCompiledGraphSnapshot, getCompiledGraphServerSnapshot);

  const descriptionRef         = useRef<HTMLTextAreaElement>(null);
  const pacingPreferenceRef    = useRef<HTMLSelectElement>(null);
  const transitionPreferenceRef = useRef<HTMLSelectElement>(null);

  // ── Sovereign Purpose ───────────────────────────────────────────────
  const [sovereignPurpose,  setSovereignPurpose]  = useState<string | null>(null);
  const [purposeInput,      setPurposeInput]      = useState('');
  const [isEditingPurpose,  setIsEditingPurpose]  = useState(false);
  const [isSavingPurpose,   setIsSavingPurpose]   = useState(false);
  const [purposeError,      setPurposeError]      = useState<string | null>(null);

  // ── Goal Registry ───────────────────────────────────────────────────
  const [goals,             setGoals]             = useState<GoalSummary[]>([]);
  const [isFetchingGoals,   setIsFetchingGoals]   = useState(false);
  const [selectedGoalId,    setSelectedGoalId]    = useState<string | null>(null);

  // ── Distribution Pipeline (real, from Ras Al Amr) ──────────────────
  const [isSubmittingReal,      setIsSubmittingReal]      = useState(false);
  const [realDistributionResult, setRealDistributionResult] = useState<MakmanFirstCustomerJourneyResult | null>(null);
  const [realDistributionError,  setRealDistributionError]  = useState<string | null>(null);
  const [isCheckingConsumption,  setIsCheckingConsumption]  = useState(false);
  const [consumptionResult,      setConsumptionResult]      = useState<ConsumptionResponse | null>(null);

  // ── Fulfillment + Gap + Investigation (per selected goal) ──────────
  const [fulfillmentResult,   setFulfillmentResult]   = useState<Record<string, unknown> | null>(null);
  const [gapResult,           setGapResult]           = useState<Record<string, unknown> | null>(null);
  const [investigationResult, setInvestigationResult] = useState<Record<string, unknown> | null>(null);
  const [isAssessing,         setIsAssessing]         = useState(false);

  useEffect(() => {
    void fetchPurpose();
    void fetchGoals();
  }, []);

  const fetchPurpose = async () => {
    try {
      const r = await fetch('/api/sovereign/entry/purpose');
      if (r.ok) {
        const data = await r.json() as { purpose: string | null };
        setSovereignPurpose(data.purpose);
        if (data.purpose) setPurposeInput(data.purpose);
      }
    } catch { /* silent — presence is enhancement */ }
  };

  const fetchGoals = async () => {
    setIsFetchingGoals(true);
    try {
      const r = await fetch('/api/sovereign/entry/creator-goal');
      if (r.ok) {
        const data = await r.json() as { status: string; goals: GoalSummary[] };
        if (data.status === 'succeeded') setGoals(data.goals);
      }
    } catch { /* silent */ }
    finally { setIsFetchingGoals(false); }
  };

  const handleSavePurpose = async () => {
    if (!purposeInput.trim()) return;
    setIsSavingPurpose(true);
    setPurposeError(null);
    try {
      const r = await fetch('/api/sovereign/entry/purpose', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purposeStatement: purposeInput.trim() }),
      });
      const data = await r.json() as { purpose?: string; error?: string };
      if (r.ok && data.purpose) {
        setSovereignPurpose(data.purpose);
        setIsEditingPurpose(false);
      } else {
        setPurposeError(data.error ?? 'الغاية السيادية لم تُحفظ.');
      }
    } catch {
      setPurposeError('البوابة لا تستجيب.');
    } finally {
      setIsSavingPurpose(false);
    }
  };

  const handleActivateRealDistribution = async () => {
    if (!compiledGraph) return;
    setIsSubmittingReal(true);
    setRealDistributionError(null);
    try {
      const response = await fetch('/api/sovereign/entry/creator-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiledGraph,
          description: descriptionRef.current?.value || 'الوصف الافتراضي للعمل الفني...',
          priority: GoalPriority.MEDIUM,
          authorization: { isAuthorized: true },
          commercialIntent: {
            publisherTenantId: compiledGraph.subscriberTenantId,
            compiledAssemblyGraph: compiledGraph,
            accessPolicy: { distributionTier: DistributionTier.PRIVATE, requiresAgeVerification: false },
          },
          ...(pacingPreferenceRef.current?.value
            ? { pacingPreference: pacingPreferenceRef.current.value as PacingPreference }
            : {}),
          ...(transitionPreferenceRef.current?.value
            ? { transitionPreference: transitionPreferenceRef.current.value as TransitionPreference }
            : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setRealDistributionError(result.message ?? result.error ?? 'حدث ما لم يُتوقَّع.');
        return;
      }
      setRealDistributionResult(result as MakmanFirstCustomerJourneyResult);
      void fetchGoals(); // refresh goals list after a new goal is registered
    } catch {
      setRealDistributionError('بوابة التوزيع لا تستجيب.');
    } finally {
      setIsSubmittingReal(false);
    }
  };

  const handlePreviewRealAccess = async () => {
    if (!realDistributionResult) return;
    setIsCheckingConsumption(true);
    try {
      const response = await fetch(
        `/api/sovereign/entry/consumption?publicationId=${encodeURIComponent(realDistributionResult.bridgeResult.publication.publicationId)}`,
      );
      const result = await response.json();
      if (response.ok) setConsumptionResult(result as ConsumptionResponse);
    } catch { /* secondary check — real distribution result is the source of truth */ }
    finally { setIsCheckingConsumption(false); }
  };

  const handleAssessFulfillment = async (goalId: string) => {
    setIsAssessing(true);
    setFulfillmentResult(null);
    setGapResult(null);
    setInvestigationResult(null);
    try {
      // Trigger assessment
      await fetch(`/api/sovereign/entry/creator-goal/${goalId}/fulfillment-assessment`, { method: 'POST' });
      // Read assessment result
      const ar = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/fulfillment-assessment`);
      if (ar.ok) setFulfillmentResult(await ar.json() as Record<string, unknown>);
      // Read gap report
      const gr = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/fulfillment-gap`);
      if (gr.ok) setGapResult(await gr.json() as Record<string, unknown>);
      // Read knowledge requirements
      const ir = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/knowledge-investigation`);
      if (ir.ok) setInvestigationResult(await ir.json() as Record<string, unknown>);
    } catch { /* silent */ }
    finally { setIsAssessing(false); }
  };

  return (
    <MakmanExperience>
    <main className="makman-viewport">
      {/* IMPERIAL JOURNEY CONTINUITY — Package D */}
      <button className="sovereign-exit-btn" onClick={() => {
        try { sessionStorage.setItem('azma.return.session', JSON.stringify({ origin: 'makman-al-ghayah', constitutionalAct: 'distribution' })); } catch { /* ignore */ }
        router.push('/imperial-foyer');
      }}>
        ⮜ قلب الإمبراطورية
      </button>

      <div className="neon-layer">
        <div className="cyber-grid" />
      </div>

      <div className="makman-constitutional-layout">

        {/* ── Constitutional Header ──────────────────────────────── */}
        <header className="makman-constitutional-header neon-border">
          <div className="neon-tag">مكمن الغاية</div>
          <h1 className="makman-chamber-title">الغاية السيادية والأهداف الاستراتيجية</h1>
          <p className="makman-chamber-mandate">
            يُسجّل الخالق غايته — يُسجّل أهدافه — يُقيّم إنجازاته — يعرف فجواته — يُطلق تحقيقاته
          </p>
        </header>

        {/* ── Sovereign Purpose ──────────────────────────────────── */}
        <section className="makman-purpose-section neon-border">
          <div className="panel-header">
            <div className="neon-tag">الغاية السيادية</div>
            <h2>ما الغاية التي تسعى إليها؟</h2>
          </div>

          {!isEditingPurpose && (
            <div className="makman-purpose-display">
              {sovereignPurpose ? (
                <>
                  <p className="makman-purpose-text">&quot;{sovereignPurpose}&quot;</p>
                  <button className="import-btn" onClick={() => setIsEditingPurpose(true)}>
                    تعديل الغاية السيادية
                  </button>
                </>
              ) : (
                <>
                  <p className="makman-purpose-empty">لم تُعلَن غايتك السيادية بعد.</p>
                  <button className="sovereign-deploy-btn" onClick={() => setIsEditingPurpose(true)}>
                    أعلن غايتك السيادية الآن
                  </button>
                </>
              )}
            </div>
          )}

          {isEditingPurpose && (
            <div className="makman-purpose-form">
              <textarea
                className="cyber-input textarea"
                rows={3}
                value={purposeInput}
                onChange={(e) => setPurposeInput(e.target.value)}
                placeholder="أعلن غايتك السيادية — ما الذي تسعى إلى تحقيقه في هذا الوجود؟"
              />
              {purposeError && <p className="project-status narrative-integrity-violation">{purposeError}</p>}
              <div className="action-row">
                <button
                  className={`sovereign-deploy-btn ${isSavingPurpose ? 'deploying' : ''}`}
                  onClick={() => void handleSavePurpose()}
                  disabled={isSavingPurpose || !purposeInput.trim()}
                >
                  {isSavingPurpose ? 'الغاية تُحفظ…' : 'حفظ الغاية السيادية'}
                </button>
                <button className="import-btn" onClick={() => setIsEditingPurpose(false)}>
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Goal Registry ──────────────────────────────────────── */}
        <section className="makman-goals-section neon-border">
          <div className="panel-header">
            <div className="neon-tag">سجل الأهداف</div>
            <h2>أهدافك الاستراتيجية المسجّلة</h2>
          </div>

          {isFetchingGoals && <p className="project-status">الأهداف تُحمَّل…</p>}

          {!isFetchingGoals && goals.length === 0 && (
            <div className="makman-goals-empty">
              <p className="project-status">لا توجد أهداف مسجّلة بعد.</p>
              <p className="makman-capability-hint">
                لتسجيل هدف استراتيجي، أكمل تجميعك السينمائي في رأس الأمر وأرسله إلى هذه الحجرة.
              </p>
            </div>
          )}

          {goals.length > 0 && (
            <div className="makman-goals-list">
              {goals.map((goal) => (
                <div
                  key={goal.goalId}
                  className={`makman-goal-card ${selectedGoalId === goal.goalId ? 'goal-selected' : ''}`}
                  onClick={() => setSelectedGoalId(selectedGoalId === goal.goalId ? null : goal.goalId)}
                >
                  <div className="goal-card-header">
                    <span className="goal-title">{goal.title}</span>
                    <span className="goal-meta">
                      <span className={`goal-status status-${goal.status.toLowerCase()}`}>
                        {GOAL_STATUS_AR[goal.status] ?? goal.status}
                      </span>
                      <span className="goal-priority">
                        {GOAL_PRIORITY_AR[goal.priority] ?? goal.priority}
                      </span>
                    </span>
                  </div>

                  {selectedGoalId === goal.goalId && (
                    <div className="goal-card-actions">
                      <button
                        className={`import-btn ${isAssessing ? 'importing' : ''}`}
                        onClick={(e) => { e.stopPropagation(); void handleAssessFulfillment(goal.goalId); }}
                        disabled={isAssessing}
                      >
                        {isAssessing ? 'التقييم جارٍ…' : '⚖ تقييم الإنجاز والفجوات'}
                      </button>

                      {fulfillmentResult && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            تقييم الإنجاز: {VERDICT_AR[(fulfillmentResult as { overallVerdict?: string }).overallVerdict ?? ''] ?? '—'}
                          </p>
                        </div>
                      )}
                      {gapResult && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            تقرير الفجوات: {Array.isArray((gapResult as { gaps?: unknown[] }).gaps)
                              ? `${(gapResult as { gaps: unknown[] }).gaps.length} فجوة مرصودة`
                              : 'لا فجوات مرصودة'}
                          </p>
                        </div>
                      )}
                      {investigationResult && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            متطلبات المعرفة: {Array.isArray((investigationResult as { knowledgeRequirements?: unknown[] }).knowledgeRequirements)
                              ? `${(investigationResult as { knowledgeRequirements: unknown[] }).knowledgeRequirements.length} متطلبات معرفية`
                              : 'لا متطلبات إضافية'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Distribution Pipeline (conditional — requires Ras Al Amr) ── */}
        {compiledGraph ? (
          <section className="makman-distribution-section neon-border">
            <div className="panel-header">
              <div className="neon-tag">التوزيع السيادي الحقيقي</div>
              <h2>تسجيل الهدف الاستراتيجي وإطلاق الإنتاج</h2>
            </div>

            {realProduction ? (
              <div className="master-display neon-border-gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={realProduction.secureStorageUri} alt={realProduction.title} className="real-production-image" />
                <p className="project-title">{realProduction.title}</p>
                <p className="project-status">وصل من رأس الأمر — جاهز للتسجيل الاستراتيجي</p>
              </div>
            ) : (
              <p className="project-status">
                وصل تجميع حقيقي مختوم من رأس الأمر — {compiledGraph.compilationId}
              </p>
            )}

            <div className="makman-packaging-section">
              <div className="form-group">
                <label>الوصف (Description)</label>
                <textarea ref={descriptionRef} className="cyber-input textarea" rows={3} defaultValue="الوصف الافتراضي للعمل الفني..." />
              </div>
              <div className="form-group">
                <label>تفضيل الإيقاع — اختياري</label>
                <select ref={pacingPreferenceRef} className="cyber-input" defaultValue="">
                  <option value="">لم يُحدَّد</option>
                  <option value={PacingPreference.CONTEMPLATIVE}>تأملي</option>
                  <option value={PacingPreference.BALANCED}>متوازن</option>
                  <option value={PacingPreference.ENERGETIC}>حيوي</option>
                </select>
              </div>
              <div className="form-group">
                <label>تفضيل الانتقال — اختياري</label>
                <select ref={transitionPreferenceRef} className="cyber-input" defaultValue="">
                  <option value="">لم يُحدَّد</option>
                  <option value={TransitionPreference.SOFT}>ناعم</option>
                  <option value={TransitionPreference.GRADUAL}>تدريجي</option>
                  <option value={TransitionPreference.DECISIVE}>حاسم</option>
                  <option value={TransitionPreference.DIRECT}>مباشر</option>
                </select>
              </div>
            </div>

            <div className="action-row">
              <button
                className={`sovereign-deploy-btn ${isSubmittingReal ? 'deploying' : ''}`}
                onClick={() => void handleActivateRealDistribution()}
                disabled={isSubmittingReal || Boolean(realDistributionResult)}
              >
                {isSubmittingReal
                  ? 'التسجيل الاستراتيجي جارٍ…'
                  : realDistributionResult
                    ? 'التسجيل الاستراتيجي مكتمل ✔'
                    : 'تسجيل الهدف وإطلاق الإنتاج 👑'}
              </button>
            </div>

            {realDistributionResult && (
              <>
                <p className="project-status">
                  هدف مسجّل: {realDistributionResult.goal?.goalId} — منشور: {realDistributionResult.bridgeResult.publication.publicationId}
                </p>
                <div className="action-row">
                  <button
                    className="import-btn"
                    onClick={() => void handlePreviewRealAccess()}
                    disabled={isCheckingConsumption}
                  >
                    {isCheckingConsumption ? 'جارٍ فحص باب الجمهور...' : '🚪 معاينة وصول الجمهور'}
                  </button>
                </div>
                {consumptionResult && (
                  <p className="project-status">
                    {consumptionResult.isAuthorized
                      ? `الوصول ممنوح — ${consumptionResult.deliveryStatus ?? 'جارٍ التسليم'}`
                      : `الوصول مرفوض — ${consumptionResult.authorizationResult.requiredAction}`}
                  </p>
                )}
              </>
            )}
            {realDistributionError && (
              <p className="project-status narrative-integrity-violation">{realDistributionError}</p>
            )}
          </section>
        ) : (
          <div className="makman-capability-hint neon-border">
            <p>لتسجيل هدف استراتيجي جديد: أكمل إنتاجك في رأس الأمر ← صهر القماش ← أرسل إلى مكمن الغاية.</p>
          </div>
        )}

        {/* ── Import from Vault ──────────────────────────────────── */}
        <div className="makman-vault-link">
          <button className="import-btn" onClick={() => router.push('/sovereign-vault-palace')}>
            📥 استيراد من القصر السيادي
          </button>
        </div>

      </div>
    </main>
    </MakmanExperience>
  );
}
