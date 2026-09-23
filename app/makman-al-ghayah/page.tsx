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
import { useConstitutionalNavigation } from '@/src/constitutional-navigation';
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

/** What the Empire can do about a requirement — its own words, not a provider's. */
const AVAILABILITY_AR: Record<string, string> = {
  OBSERVABLE_INTERNALLY:   'تُرصَد داخل الإمبراطورية',
  REQUIRES_INVESTIGATION:  'تحتاج تحقيقاً في حجّة الدامغة',
  NOT_CURRENTLY_OBTAINABLE:'غير متاحة حالياً',
};

const GAP_CLASS_AR: Record<string, string> = {
  OBSERVATION_GAP: 'فجوة رصد',
  FULFILLMENT_GAP: 'فجوة إنجاز',
  NO_ACTIVE_GAP:   'لا فجوة قائمة',
};

const OBSERVATION_OUTCOME_AR: Record<string, string> = {
  AUTHORIZED: 'وصولٌ مأذون',
  DENIED:     'وصولٌ ممنوع',
};

/** A Goal as the Chamber actually knows it — read, never assumed. */
interface GoalDetail {
  readonly goalId: string;
  /** Present = this Goal IS a Milestone Goal; the value is the Purpose it serves. */
  readonly sovereignPurposeStatement?: string;
  readonly successCriteria?: { criterionId: string; description: string }[];
}

interface ObservationRow { observationId: string; outcome: string; observedAtMs: number }
interface RequirementRow {
  criterionId: string;
  criterionDescriptionSnapshot: string;
  gapClass: string;
  questionStatement: string;
  availability: string;
}
interface RequestRow extends RequirementRow { requestId: string }

export default function MakmanAlGhayah() {
  const { goTo } = useConstitutionalNavigation();
  const realProduction = useSyncExternalStore(subscribeToNothing, getRealProductionSnapshot, getRealProductionServerSnapshot);
  const compiledGraph  = useSyncExternalStore(subscribeToNothing, getCompiledGraphSnapshot, getCompiledGraphServerSnapshot);

  const descriptionRef          = useRef<HTMLTextAreaElement>(null);
  const pacingPreferenceRef     = useRef<HTMLSelectElement>(null);
  const transitionPreferenceRef = useRef<HTMLSelectElement>(null);
  const scheduledPublishAtRef   = useRef<HTMLInputElement>(null);

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

  // ── CINEMATIC Result Polling ─────────────────────────────────────────
  // Polls /api/ras-amr/resolution/[operationId] until the FFmpeg encoder
  // deposits the real MP4 into the Vault. Only activated for CINEMATIC
  // canvases (NARRATIVE/DIRECTORIAL produce DYNAMIC results with no opId).
  const [renderOperationId,   setRenderOperationId]   = useState<string | null>(null);
  const [renderPollingStatus, setRenderPollingStatus] = useState<'idle' | 'polling' | 'succeeded' | 'failed'>('idle');

  // ── Publication of the finished film — Article 9 ───────────────────────────
  //
  // Phase E closed /renders/ behind an ownership gate: a finished film is the
  // Creator's, and nobody else's, until they say otherwise. This is where they
  // say otherwise. Without it the protection would be a wall — the same defect
  // found in Phase D, where a constitutional rule had a condition the Creator
  // had no way to satisfy.
  //
  // Publishing and withdrawing are offered together, always. A Creator handed a
  // door they cannot shut has been handed a hazard.
  const [shareState, setShareState] = useState<'idle' | 'working'>('idle');
  const [shareUrl,   setShareUrl]   = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [renderVaultAssetId,  setRenderVaultAssetId]  = useState<string | null>(null);

  // ── Fulfillment + Gap + Investigation (per selected goal) ──────────
  // ── THE MIDDLE OF THE CHAIN, WHICH HAD NO CONTROLS ──────────────────────
  //
  //   MEASURED 2026-09-23: five capabilities this Chamber declares in the
  //   Truth registry had a working route and no way for a Creator to reach
  //   them — define-success, observe-reality, mark-milestone,
  //   name-knowledge-requirements, issue-knowledge-requests. The chain
  //   الغاية ← الهدف ← [تعريف النجاح ← رصد الواقع] ← التقييم ← الفجوة was
  //   wired from its middle: assessment ran against a definition the Creator
  //   had no means to state.
  //
  //   The Goal's own record decides what is offered — read through read-goal,
  //   never inferred. `sovereignPurposeStatement` present means this Goal IS
  //   a Milestone Goal; that is the Chamber's own rule, not this page's.
  const [goalDetail,          setGoalDetail]          = useState<GoalDetail | null>(null);
  const [isReadingGoal,       setIsReadingGoal]       = useState(false);
  const [isDesignating,       setIsDesignating]       = useState(false);
  const [criteriaDraft,       setCriteriaDraft]       = useState('');
  const [isSavingCriteria,    setIsSavingCriteria]    = useState(false);
  const [observations,        setObservations]        = useState<ObservationRow[] | null>(null);
  const [isReadingObs,        setIsReadingObs]        = useState(false);
  const [requirements,        setRequirements]        = useState<RequirementRow[] | null>(null);
  const [isNamingReqs,        setIsNamingReqs]        = useState(false);
  const [knowledgeRequests,   setKnowledgeRequests]   = useState<RequestRow[] | null>(null);
  const [isIssuingRequests,   setIsIssuingRequests]   = useState(false);
  /** Why a step could not proceed — the Chamber's real reason, in Arabic. */
  const [goalNotice,          setGoalNotice]          = useState<string | null>(null);

  const [fulfillmentResult,   setFulfillmentResult]   = useState<Record<string, unknown> | null>(null);
  const [gapResult,           setGapResult]           = useState<Record<string, unknown> | null>(null);
  const [investigationResult, setInvestigationResult] = useState<Record<string, unknown> | null>(null);
  const [isAssessing,         setIsAssessing]         = useState(false);

  // ── The door, for a visitor the Empire does not yet know ──────────────────
  //
  //   OD-003. MEASURED with Playwright against production: an anonymous
  //   visitor who opened this chamber was not turned toward anything. The page
  //   loaded and then fetched data they are not entitled to:
  //
  //       401 /api/sovereign/entry/purpose  ·  401 /api/sovereign/entry/creator-goal
  //
  //   Every refusal was correct — the server-side authorization is intentional
  //   and is untouched by this. What the visitor experienced was a room of the
  //   Empire that simply did not work, while four other chambers already turned
  //   a stranger toward the door.
  //
  //   This asks the server who is here and, if nobody, sends them to /signup —
  //   the unified identity entry, where the Google gate is. It is not a
  //   suppression of the 401s: the requests below still run for a Creator, and
  //   still fail for anyone else. It is the chamber telling a stranger where
  //   the door is instead of letting them stand in an empty room.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (!data.authenticated) goTo('/signup');
      })
      // A guard that cannot reach the server does not strand anyone either.
      .catch(() => goTo('/signup'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchPurpose();
    void fetchGoals();
  }, []);

  useEffect(() => {
    if (!renderOperationId || renderPollingStatus !== 'polling') return;
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch(`/api/ras-amr/resolution/${encodeURIComponent(renderOperationId)}`);
        if (cancelled) return;
        const data = await r.json() as { status: string; vaultAssetId?: string };
        if (data.status === 'succeeded') {
          setRenderPollingStatus('succeeded');
          if (data.vaultAssetId) setRenderVaultAssetId(data.vaultAssetId);
        } else if (data.status === 'failed') {
          setRenderPollingStatus('failed');
        }
      } catch { /* network glitch — next tick retries */ }
    };
    void poll();
    const id = setInterval(() => { void poll(); }, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [renderOperationId, renderPollingStatus]);

  const fetchPurpose = async () => {
    try {
      const r = await fetch('/api/sovereign/entry/purpose');
      if (r.ok) {
        // The route returns the whole SovereignPurpose record, not a bare
        // string; only its statement is renderable text.
        const data = await r.json() as { purpose: { purposeStatement?: string } | null };
        const statement = data.purpose?.purposeStatement ?? null;
        setSovereignPurpose(statement);
        if (statement) setPurposeInput(statement);
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
      const data = await r.json() as { purpose?: { purposeStatement?: string }; error?: string };
      const savedStatement = data.purpose?.purposeStatement;
      if (r.ok && savedStatement) {
        setSovereignPurpose(savedStatement);
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
            ...(scheduledPublishAtRef.current?.value
              ? { scheduledPublishAt: new Date(scheduledPublishAtRef.current.value).getTime() }
              : {}),
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
      const journey = result as MakmanFirstCustomerJourneyResult;
      setRealDistributionResult(journey);
      const opId = journey.bridgeResult.renderState.activeOperationId;
      if (opId) {
        setRenderOperationId(opId);
        setRenderPollingStatus('polling');
      }
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

  /**
   * read-goal — what this Goal actually is, before anything is offered about it.
   *
   * Every control below depends on a fact only the Chamber holds: is this a
   * Milestone Goal, and what has the Creator already defined? Asking is the
   * difference between an interface that states the Goal's condition and one
   * that guesses it.
   */
  const readGoal = async (goalId: string) => {
    setIsReadingGoal(true);
    try {
      const res = await fetch(`/api/sovereign/entry/creator-goal/${goalId}`);
      if (!res.ok) { setGoalDetail(null); setGoalNotice('تعذّرت قراءة هذا الهدف.'); return; }
      const body = await res.json() as { goal?: GoalDetail };
      setGoalDetail(body.goal ?? null);
      setCriteriaDraft((body.goal?.successCriteria ?? []).map((c) => c.description).join('\n'));
    } catch {
      setGoalDetail(null);
      setGoalNotice('تعذّر الوصول إلى الحجرة الآن.');
    } finally { setIsReadingGoal(false); }
  };

  /** The Creator selects a Goal: everything read about the previous one is dropped. */
  const selectGoal = (goalId: string) => {
    const next = selectedGoalId === goalId ? null : goalId;
    setSelectedGoalId(next);
    setGoalDetail(null); setGoalNotice(null); setCriteriaDraft('');
    setObservations(null); setRequirements(null); setKnowledgeRequests(null);
    setFulfillmentResult(null); setGapResult(null); setInvestigationResult(null);
    if (next) void readGoal(next);
  };

  /** mark-milestone — this Goal serves the Sovereign Purpose. */
  const handleDesignateMilestone = async (goalId: string) => {
    setIsDesignating(true); setGoalNotice(null);
    try {
      const res = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/milestone`, { method: 'PUT' });
      if (res.ok) { await readGoal(goalId); return; }
      // The Chamber's own refusal, said plainly: a Purpose must exist first.
      setGoalNotice(res.status === 400
        ? 'عرِّف غايتك السيادية أوّلاً — المرحلة تخدم غايةً قائمة.'
        : 'لم يُعثر على هذا الهدف.');
    } catch { setGoalNotice('تعذّر الوصول إلى الحجرة الآن.'); }
    finally { setIsDesignating(false); }
  };

  /**
   * define-success — the Creator states what success means, in their words.
   *
   * One criterion per line. The route replaces the list entirely, so what is
   * shown in the field IS what will be recorded — nothing is merged behind
   * the Creator's back.
   */
  const handleSaveCriteria = async (goalId: string) => {
    const criteria = criteriaDraft.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (criteria.length === 0) { setGoalNotice('اكتب معياراً واحداً على الأقل — سطرٌ لكل معيار.'); return; }
    setIsSavingCriteria(true); setGoalNotice(null);
    try {
      const res = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/success-criteria`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: criteria.map((description) => ({ description })) }),
      });
      if (res.ok) { await readGoal(goalId); setGoalNotice('حُفظ تعريف النجاح.'); return; }
      setGoalNotice(res.status === 400
        ? 'عيِّن هذا الهدف مرحلةً للغاية قبل تعريف نجاحه.'
        : 'لم يُعثر على هذا الهدف.');
    } catch { setGoalNotice('تعذّر الوصول إلى الحجرة الآن.'); }
    finally { setIsSavingCriteria(false); }
  };

  /**
   * observe-reality — what the Empire has actually seen, not what it hopes.
   *
   * An Observation is a real platform signal. An empty list is a true answer
   * and is shown as one: no signal means no observation, never a placeholder.
   */
  const handleReadObservations = async (goalId: string) => {
    setIsReadingObs(true); setGoalNotice(null);
    try {
      const res = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/observations`);
      if (!res.ok) { setGoalNotice('تعذّر قراءة ما رُصد لهذا الهدف.'); return; }
      const body = await res.json() as { observations?: ObservationRow[] };
      setObservations(body.observations ?? []);
    } catch { setGoalNotice('تعذّر الوصول إلى الحجرة الآن.'); }
    finally { setIsReadingObs(false); }
  };

  /** name-knowledge-requirements — what must be learned; it learns nothing itself. */
  const handleNameRequirements = async (goalId: string) => {
    setIsNamingReqs(true); setGoalNotice(null);
    try {
      const res = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/gap-investigation`);
      if (res.ok) {
        const body = await res.json() as { requirements?: { requirements?: RequirementRow[] } | RequirementRow[] };
        const r = Array.isArray(body.requirements) ? body.requirements : (body.requirements?.requirements ?? []);
        setRequirements(r);
        return;
      }
      setGoalNotice(res.status === 422
        ? 'اطلب تقييم الإنجاز أوّلاً — المتطلبات تُشتقّ من التقييم.'
        : 'لم يُعثر على هذا الهدف.');
    } catch { setGoalNotice('تعذّر الوصول إلى الحجرة الآن.'); }
    finally { setIsNamingReqs(false); }
  };

  /**
   * issue-knowledge-requests — the Empire states, formally, what it must answer.
   *
   * It does not invoke الحُجّة الدامغة and does not resolve anything. The
   * requests are issued and remain unanswered; that answer belongs to the
   * Chamber of Evidence, and the interface must not pretend otherwise.
   */
  const handleIssueRequests = async (goalId: string) => {
    setIsIssuingRequests(true); setGoalNotice(null);
    try {
      const res = await fetch(`/api/sovereign/entry/creator-goal/${goalId}/knowledge-requests`);
      if (res.ok) {
        const body = await res.json() as { batch?: { requests?: RequestRow[] } };
        setKnowledgeRequests(body.batch?.requests ?? []);
        return;
      }
      setGoalNotice(res.status === 422
        ? 'اطلب تقييم الإنجاز أوّلاً — الطلبات تُصدَر عن فجواته.'
        : 'لم يُعثر على هذا الهدف.');
    } catch { setGoalNotice('تعذّر الوصول إلى الحجرة الآن.'); }
    finally { setIsIssuingRequests(false); }
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
        goTo('/imperial-foyer');
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
                لتسجيل هدف استراتيجي، انطلق أولاً إلى حجرة رأس الأمر.
              </p>
            </div>
          )}

          {goals.length > 0 && (
            <div className="makman-goals-list">
              {goals.map((goal) => (
                <div
                  key={goal.goalId}
                  className={`makman-goal-card ${selectedGoalId === goal.goalId ? 'goal-selected' : ''}`}
                  onClick={() => selectGoal(goal.goalId)}
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
                      {isReadingGoal && <p className="project-status">قراءة الهدف…</p>}

                      {/* 1 - the Milestone: does this Goal serve the Purpose? */}
                      {!isReadingGoal && goalDetail && !goalDetail.sovereignPurposeStatement && (
                        <>
                          <p className="project-status">هذا الهدف ليس مرحلةً للغاية بعد.</p>
                          <button
                            className={`import-btn ${isDesignating ? 'importing' : ''}`}
                            onClick={(e) => { e.stopPropagation(); void handleDesignateMilestone(goal.goalId); }}
                            disabled={isDesignating}
                          >
                            {isDesignating ? 'التعيين جارٍ…' : '◈ عيِّن هذا الهدف مرحلةً للغاية'}
                          </button>
                        </>
                      )}
                      {goalDetail?.sovereignPurposeStatement && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            مرحلةٌ تخدم غايتك: «{goalDetail.sovereignPurposeStatement}»
                          </p>
                        </div>
                      )}

                      {/* 2 - the Creator states what success means */}
                      {goalDetail?.sovereignPurposeStatement && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            {goalDetail.successCriteria && goalDetail.successCriteria.length > 0
                              ? `معايير النجاح المُعرَّفة: ${goalDetail.successCriteria.length}`
                              : 'لم تُعرَّف معايير النجاح بعد.'}
                          </p>
                          {goalDetail.successCriteria?.map((c) => (
                            <p key={c.criterionId} className="project-status">— {c.description}</p>
                          ))}
                          <textarea
                            className="cyber-input textarea"
                            value={criteriaDraft}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setCriteriaDraft(e.target.value)}
                            placeholder="سطرٌ لكل معيار — ما الذي يجب أن يقع حتى تَعُدّ هذا الهدف ناجحاً؟"
                            rows={3}
                          />
                          <button
                            className={`import-btn ${isSavingCriteria ? 'importing' : ''}`}
                            onClick={(e) => { e.stopPropagation(); void handleSaveCriteria(goal.goalId); }}
                            disabled={isSavingCriteria}
                          >
                            {isSavingCriteria ? 'الحفظ جارٍ…' : '✎ احفظ تعريف النجاح'}
                          </button>
                        </div>
                      )}

                      {/* 3 - what the Empire has actually observed */}
                      <button
                        className={`import-btn ${isReadingObs ? 'importing' : ''}`}
                        onClick={(e) => { e.stopPropagation(); void handleReadObservations(goal.goalId); }}
                        disabled={isReadingObs}
                      >
                        {isReadingObs ? 'القراءة جارية…' : '◉ ما رصدته الإمبراطورية'}
                      </button>
                      {observations && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            {observations.length === 0
                              ? 'لا رصد بعد — لم تصل إشارةٌ واحدة عن هذا الهدف.'
                              : `الرصد المسجَّل: ${observations.length}`}
                          </p>
                          {observations.slice(0, 6).map((o) => (
                            <p key={o.observationId} className="project-status">
                              — {OBSERVATION_OUTCOME_AR[o.outcome] ?? o.outcome} · {new Date(o.observedAtMs).toLocaleDateString('ar')}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* 4 - assessment (already existed) */}
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

                      {/* 5 - name what the Empire must learn */}
                      <button
                        className={`import-btn ${isNamingReqs ? 'importing' : ''}`}
                        onClick={(e) => { e.stopPropagation(); void handleNameRequirements(goal.goalId); }}
                        disabled={isNamingReqs}
                      >
                        {isNamingReqs ? 'الاشتقاق جارٍ…' : '❑ سمِّ ما يجب أن تتعلّمه الإمبراطورية'}
                      </button>
                      {requirements && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            {requirements.length === 0
                              ? 'لا متطلبات معرفية — لا فجوة قائمة تحتاج تعلُّماً.'
                              : `متطلبات معرفية: ${requirements.length}`}
                          </p>
                          {requirements.map((r) => (
                            <p key={r.criterionId} className="project-status">
                              — {r.questionStatement} · {GAP_CLASS_AR[r.gapClass] ?? r.gapClass} · {AVAILABILITY_AR[r.availability] ?? r.availability}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* 6 - issue the requests; they remain unanswered here */}
                      <button
                        className={`import-btn ${isIssuingRequests ? 'importing' : ''}`}
                        onClick={(e) => { e.stopPropagation(); void handleIssueRequests(goal.goalId); }}
                        disabled={isIssuingRequests}
                      >
                        {isIssuingRequests ? 'الإصدار جارٍ…' : '✉ أصدر طلبات المعرفة'}
                      </button>
                      {knowledgeRequests && (
                        <div className="goal-assessment-result">
                          <p className="project-status">
                            {knowledgeRequests.length === 0
                              ? 'لا طلبات تُصدَر — لا فجوة قائمة.'
                              : `طلباتٌ صادرة: ${knowledgeRequests.length} — تبقى دون جواب حتى تُحقَّق في حجّة الدامغة.`}
                          </p>
                          {knowledgeRequests.map((r) => (
                            <p key={r.requestId} className="project-status">
                              — {r.questionStatement} · {AVAILABILITY_AR[r.availability] ?? r.availability}
                            </p>
                          ))}
                        </div>
                      )}

                      {goalNotice && <p className="project-status">{goalNotice}</p>}
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
              <div className="form-group">
                <label>تاريخ النشر — فوري إذا تُرك فارغاً</label>
                <input
                  ref={scheduledPublishAtRef}
                  type="datetime-local"
                  className="cyber-input"
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                />
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
                  {(realDistributionResult.bridgeResult.publication as { scheduledPublishAt?: number }).scheduledPublishAt
                    ? ` — مجدول: ${new Date((realDistributionResult.bridgeResult.publication as { scheduledPublishAt: number }).scheduledPublishAt).toLocaleString('ar-EG')}`
                    : ' — نُشر فوراً'}
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

            <div className="makman-channel-row">
              <span className="makman-channel-active">◎ خاص — النشر الداخلي فعّال</span>
              <span className="makman-channel-unavailable">يوتيوب — غير متاح حاليًا</span>
            </div>

            {/* ── CINEMATIC Encoding Result ──────────────────────────── */}
            {/* Polls until the real MP4 is deposited in the Vault.       */}
            {/* Shown only when the canvas type was CINEMATIC (opId set). */}
            {realDistributionResult && renderPollingStatus === 'polling' && (
              <div className="cinematic-result-panel neon-border">
                <p className="project-status">⏳ الترميز السينمائي جارٍ — يتم بناء ملف MP4 الحقيقي…</p>
                <p className="makman-capability-hint">ستظهر النتيجة هنا فور اكتمال الترميز — لا حاجة لإعادة التحميل</p>
              </div>
            )}

            {realDistributionResult && renderPollingStatus === 'succeeded' && (
              <div className="cinematic-result-panel neon-border-gold">
                <p className="project-status cinematic-result-label">✅ هذا هو الناتج النهائي — ملف MP4 حقيقي مُنتَج بالكامل</p>
                {renderOperationId && (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={`/renders/${renderOperationId}.mp4`}
                    controls
                    playsInline
                    className="cinematic-final-video"
                    aria-label="الناتج السينمائي النهائي"
                  />
                )}
                <div className="action-row" style={{ marginTop: '12px' }}>
                  <button
                    className="import-btn"
                    onClick={() => window.location.assign('/sovereign-vault-palace')}
                  >
                    📥 عرض في القصر السيادي
                  </button>

                  {renderOperationId && !shareUrl && (
                    <button
                      className="import-btn"
                      disabled={shareState === 'working'}
                      onClick={async () => {
                        setShareState('working'); setShareError(null);
                        try {
                          const r = await fetch(`/api/renders/${encodeURIComponent(renderOperationId)}/publish`, { method: 'POST' });
                          const d = await r.json();
                          if (d.status === 'succeeded') setShareUrl(`${window.location.origin}${d.publicUrl}`);
                          else setShareError(d.message ?? 'تعذّر النشر.');
                        } catch { setShareError('تعذّر النشر.'); }
                        setShareState('idle');
                      }}
                    >
                      {shareState === 'working' ? '…' : '🔗 انشر برابط'}
                    </button>
                  )}

                  {renderOperationId && shareUrl && (
                    <button
                      className="import-btn"
                      disabled={shareState === 'working'}
                      onClick={async () => {
                        setShareState('working'); setShareError(null);
                        try {
                          const r = await fetch(`/api/renders/${encodeURIComponent(renderOperationId)}/publish`, { method: 'DELETE' });
                          const d = await r.json();
                          if (d.status === 'succeeded') { setShareUrl(null); setShareCopied(false); }
                          else setShareError(d.message ?? 'تعذّر السحب.');
                        } catch { setShareError('تعذّر السحب.'); }
                        setShareState('idle');
                      }}
                    >
                      🚫 اسحب النشر
                    </button>
                  )}
                </div>

                {shareUrl && (
                  <div className="cinematic-share-panel">
                    <p className="makman-capability-hint">
                      من يحمل هذا الرابط يرى عملك. ما عداه لا يراه أحد — ولك سحبه متى شئت.
                    </p>
                    <div className="action-row">
                      <input className="cinematic-share-link" readOnly value={shareUrl} aria-label="رابط النشر" />
                      <button
                        className="import-btn"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            setShareCopied(true);
                          } catch {
                            // Clipboard access can be refused; the link is on
                            // screen and selectable, so nothing is lost.
                            setShareCopied(false);
                          }
                        }}
                      >
                        {shareCopied ? '✓ نُسخ' : '⧉ انسخ'}
                      </button>
                    </div>
                  </div>
                )}

                {shareError && <p className="project-status narrative-integrity-violation">{shareError}</p>}
              </div>
            )}

            {realDistributionResult && renderPollingStatus === 'failed' && (
              <p className="project-status narrative-integrity-violation">
                ⚠ فشل الترميز السينمائي — تحقق من سجلات الخادم أو أعد إنتاج التجميع
              </p>
            )}

            {/* When canvas type is NARRATIVE or DIRECTORIAL, renderState.status = DYNAMIC  */}
            {/* — no encoding operation is created, so renderOperationId stays null.         */}
            {realDistributionResult && renderPollingStatus === 'idle' && !renderOperationId && (
              <div className="cinematic-result-panel neon-border">
                <p className="project-status">
                  ⚡ التجميع مكتمل — هذا مخرج بنيوي ديناميكي يُستهلَك مباشرةً. لا يُنتَج ملف وسائط لهذا النوع من القماش.
                </p>
              </div>
            )}
          </section>
        ) : (
          <div className="makman-capability-hint neon-border">
            <p>لتسجيل هدف استراتيجي جديد: أكمل إنتاجك في رأس الأمر ← صهر القماش ← أرسل إلى مكمن الغاية.</p>
          </div>
        )}

        {/* ── Import from Vault ──────────────────────────────────── */}
        <div className="makman-vault-link">
          <button className="import-btn" onClick={() => window.location.assign('/sovereign-vault-palace')}>
            📥 استيراد من القصر السيادي
          </button>
        </div>

      </div>
    </main>
    </MakmanExperience>
  );
}
