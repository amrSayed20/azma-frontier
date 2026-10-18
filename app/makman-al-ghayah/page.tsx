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
import { takeDemandFor, resolveDemand, spokenDemandArrival } from '@/src/sovereign-creation-demand/arrival';
import './makman-al-ghayah.css';
import { ChamberDemonstration } from '@/src/chamber-demonstration';
import { planReframe, executeReframe, sweepRetention, type RetentionView } from './reframe-actions';
import {
  listCloudAccounts, unlinkCloudAccount, uploadAssetToCloud,
  listDistributableAssets, resolveAssetForDistribution,
  connectTelegramBot, listDistributionReceipts,
  telegramAppCredentialsForBrowser, linkTelegramUserAccount, recordTelegramUserPublication,
  type CloudView, type DistributableAsset, type DistributionRecordView,
} from './cloud-actions';
import { SOVEREIGN_ASSET_DRAG_TYPE, readDraggedAssetId } from '@/src/vault/sovereign-asset-drag';
import { reframablePlatforms } from '@/src/platform-reframe/platform-target';

/** The plan as the page displays it — the server's own shape, narrowed. */
interface ReframePlanView {
  masterAspectRatio: string | null;
  rows: readonly { platform: string; label: string; verdict: string; balanceCost: number; spokenAr: string }[];
  totalBalanceCost: number;
  reframeCount: number;
}

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

// RAS AL AMR EXECUTION DIRECTIVE — PHASE 4: the finished MP4 Ras Al-Amr
// rendered for this exact assembly (same one-shot sessionStorage convention).
interface RasAmrRenderHandoff {
  operationId: string;
  fileUrl: string;
}
let cachedRasAmrRender: RasAmrRenderHandoff | null | undefined = undefined;
function getRasAmrRenderSnapshot(): RasAmrRenderHandoff | null {
  if (cachedRasAmrRender === undefined) {
    cachedRasAmrRender = null;
    try {
      const raw = sessionStorage.getItem('azma.transfer.rasAmrRender');
      if (raw) {
        sessionStorage.removeItem('azma.transfer.rasAmrRender');
        const parsed = JSON.parse(raw) as Partial<RasAmrRenderHandoff>;
        if (typeof parsed.operationId === 'string' && typeof parsed.fileUrl === 'string' && parsed.fileUrl.startsWith('/api/ras-amr/render/')) {
          cachedRasAmrRender = { operationId: parsed.operationId, fileUrl: parsed.fileUrl };
        }
      }
    } catch { /* no finished file was handed over */ }
  }
  return cachedRasAmrRender;
}
function getRasAmrRenderServerSnapshot(): RasAmrRenderHandoff | null {
  return null;
}

const GOAL_STATUS_AR: Record<string, string> = {
  CREATED:     'مُنشأ',
  PLANNED:     'مُخطَّط',
  IN_PROGRESS: 'قيد التنفيذ',
  BLOCKED:     'موقوف',
  COMPLETED:   'مكتمل',
  FAILED:      'فشل',
  ARCHIVED:    'مطويّة',
};

/**
 * What came back from the linking journey, said in the Chamber's own words.
 *
 * The Creator returns from Google's screen carrying a short code. Each one
 * has a single remedy, and that remedy is what they are told — never a
 * provider's message, and never a status number.
 */
const CLOUD_OUTCOME_AR: Record<string, string> = {
  linked:          '✓ رُبِط حسابك — صار بإمكانك الرفع إليه.',
  declined:        'لم تمنح الإذن، ولم يتغيّر شيء.',
  expired:         'طال الوقت قبل إتمام الربط. ابدأ من جديد.',
  mismatch:        'لم نتعرّف على هذه العودة. ابدأ الربط من جديد.',
  unauthorized:    'انتهت جلستك. سجّل دخولك ثمّ أعد الربط.',
  'already-granted': 'حسابك يمنح الإذن لأزما بالفعل. احذف أزما من أذونات حساب جوجل ثمّ اربطه من جديد.',
  failed:          'تعذّر ربط الحساب. أعد المحاولة.',
};

/**
 * What an account is called when the provider gave no name of its own.
 *
 * A list that says «حساب جوجل درايف» for a Telegram channel is a list nobody
 * can revoke from with confidence — the same reason the Drive binding asks for
 * `openid email` at all.
 */
/**
 * ── THE DESTINATIONS A CREATOR MAY LINK, AS DATA ──────────────────────────
 *
 *   Before this table the panel carried a hand-written block per provider, and
 *   adding four more that way is precisely the drift the directive forbids:
 *   «Do NOT build four unrelated account systems.»
 *
 *   `offerKey` is the LINKING flow, not the provider — one Meta consent opens
 *   both a Page and an Instagram professional account, so they share a key and
 *   a button and differ only in what they publish.
 *
 *   `capabilityAr` is what the destination can actually do, shown next to the
 *   connection state, because «متصل» and «يمكن النشر إليه» are not the same
 *   claim and the Creator must be able to tell them apart.
 */
const LINKABLE_DESTINATIONS: ReadonlyArray<{
  offerKey: string;
  labelAr: string;
  href: string;
  providers: readonly string[];
  capabilityAr: string;
}> = [
  { offerKey: 'youtube', labelAr: 'يوتيوب', href: '/api/cloud/youtube/start',
    providers: ['youtube'], capabilityAr: 'فيديو إلى قناتك' },
  { offerKey: 'meta', labelAr: 'فيسبوك وإنستجرام', href: '/api/cloud/meta/start',
    providers: ['facebook-page', 'instagram-business'],
    capabilityAr: 'صفحاتك وحسابات إنستجرام الاحترافيّة' },
  { offerKey: 'tiktok', labelAr: 'تيك توك', href: '/api/cloud/tiktok/start',
    providers: ['tiktok'], capabilityAr: 'مسوّدة تُتمّها من التطبيق' },
];

const PROVIDER_FALLBACK_AR: Record<string, string> = {
  'google-drive': 'حساب جوجل درايف',
  telegram:       'وجهة تيليجرام',
  dropbox:        'حساب دروبوكس',
  'telegram-user':      'وجهة تيليجرام',
  youtube:              'قناة يوتيوب',
  'facebook-page':      'صفحة فيسبوك',
  'instagram-business': 'حساب إنستجرام',
  tiktok:               'حساب تيك توك',
};

/** The icon that tells one kind of destination from another at a glance. */
const PROVIDER_MARK: Record<string, string> = {
  'google-drive': '◈', telegram: '✈', 'telegram-user': '✦',
  youtube: '▶', 'facebook-page': '❖', 'instagram-business': '◉', tiktok: '♪',
};

/** The platforms, named as a Creator names them — never as an API key. */
const PLATFORM_AR: Record<string, string> = {
  youtube:            'يوتيوب',
  tiktok:             'تيك توك',
  instagram:          'إنستغرام',
  'instagram-story':  'إنستغرام ستوري',
  'instagram-reel':   'إنستغرام ريل',
  facebook:           'فيسبوك',
  x:                  'إكس',
  linkedin:           'لينكدإن',
  snapchat:           'سناب شات',
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
  gapCategory: string;
  /** The engine's own English sentence — for engineers, never for the Creator. */
  questionStatement: string;
  availability: string;
}
interface RequestRow extends RequirementRow { requestId: string }

/**
 * The question the Empire must answer, said in Arabic.
 *
 * MEASURED live 2026-09-23: rendering the engine's `questionStatement`
 * verbatim put English in front of the Creator — «The Empire has no recorded
 * consumption events from which to assess…» — which the Empire does not do.
 *
 * This is not translation of foreign evidence. The engine builds that
 * sentence from three of its own templates keyed by gapCategory, and the
 * criterion inside it is the Creator's own wording. The Chamber simply says
 * its own sentence in its own language. If a category ever appears that is
 * not one of the three, the Creator sees their own criterion — never English.
 */
const GAP_QUESTION_AR: Record<string, (criterion: string) => string> = {
  EVIDENCE_AVAILABILITY: (c) => `لا إشاراتِ وصولٍ مسجَّلة يُقاس عليها «${c}». ما الإشارات التي وصلت عن هذا النشر؟`,
  EVIDENCE_SUFFICIENCY:  (c) => `الإشارات المسجَّلة لا تكفي للحكم على «${c}». ما البيانات التي تُثبت تحقّقه؟`,
  FULFILLMENT_ABSENT:    (c) => `الأدلّة القائمة تُرجّح أنّ «${c}» لم يتحقّق بعد. ما المعرفة اللازمة لفهم هذه الفجوة؟`,
};

function spokenQuestion(row: RequirementRow): string {
  return GAP_QUESTION_AR[row.gapCategory]?.(row.criterionDescriptionSnapshot)
    ?? row.criterionDescriptionSnapshot;
}

export default function MakmanAlGhayah() {
  const { goTo } = useConstitutionalNavigation();
  const realProduction = useSyncExternalStore(subscribeToNothing, getRealProductionSnapshot, getRealProductionServerSnapshot);
  const compiledGraph  = useSyncExternalStore(subscribeToNothing, getCompiledGraphSnapshot, getCompiledGraphServerSnapshot);
  const rasAmrRender   = useSyncExternalStore(subscribeToNothing, getRasAmrRenderSnapshot, getRasAmrRenderServerSnapshot);

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
  // Which shelf is open, and how many stand on each. The counts come from the
  // server with every response, so «٧ مطويّة» is sayable without loading one.
  const [showingArchived,   setShowingArchived]   = useState(false);
  const [goalCounts,        setGoalCounts]        = useState<{ open: number; archived: number }>({ open: 0, archived: 0 });
  const [archivingGoalId,   setArchivingGoalId]   = useState<string | null>(null);
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
  // ── PREPARING ONE ASSET FOR THE PLATFORMS A CREATOR CHOSE ──────────────
  //   Nothing here spends until the Creator's own word arrives as `approved`.
  const [chosenPlatforms,     setChosenPlatforms]     = useState<string[]>([]);
  const [reframePlan,         setReframePlan]         = useState<ReframePlanView | null>(null);
  const [reframeBalance,      setReframeBalance]      = useState<number | null>(null);
  const [reframeBusy,         setReframeBusy]         = useState<'idle' | 'planning' | 'producing'>('idle');
  const [reframeNotice,       setReframeNotice]       = useState<string | null>(null);
  const [reframeDone,         setReframeDone]         = useState<{ label: string; assetId: string; storageUri: string }[]>([]);
  const [retention,           setRetention]           = useState<RetentionView | null>(null);
  // ── THE CREATOR'S OWN CLOUD ────────────────────────────────────────────
  //   The Empire owns nothing there. It holds one permission, shown here so
  //   it can be withdrawn as easily as it was granted.
  const [cloud,               setCloud]               = useState<CloudView | null>(null);
  const [cloudBusy,           setCloudBusy]           = useState<string | null>(null);
  const [cloudNotice,         setCloudNotice]         = useState<string | null>(null);
  // ── TELEGRAM: the Creator's own bot, handed over directly ──────────────
  //   Telegram issues no authorization URL, so there is no journey to a
  //   provider's screen and back. The credential is typed here, verified
  //   against Telegram, sealed — and both fields are CLEARED the moment the
  //   answer arrives, so a bot token never sits in a rendered input.
  const [tgToken,             setTgToken]             = useState('');
  const [tgChat,              setTgChat]              = useState('');
  const [tgBusy,              setTgBusy]              = useState(false);
  // ── THE RECEIPTS — the publish state that survives a refresh ───────────
  const [receipts,            setReceipts]            = useState<readonly DistributionRecordView[]>([]);
  // ── TELEGRAM BY THE CREATOR'S OWN ACCOUNT ──────────────────────────────
  //   FOUNDER'S RULING, 2026-10-04: the session never reaches the AZMA
  //   server. So none of this state ever holds one — a QR image, an identity
  //   the browser read, and a list of destinations. PARTIAL ZERO-CUSTODY.
  const [tgUserBusy,          setTgUserBusy]          = useState(false);
  const [tgQrDataUrl,         setTgQrDataUrl]         = useState<string | null>(null);
  const [tgIdentity,          setTgIdentity]          = useState<{ telegramUserId: string; username: string | null; displayName: string } | null>(null);
  const [tgDestinations,      setTgDestinations]      = useState<readonly { peerId: string; title: string; roleAr: string }[]>([]);
  const [tgNeedsPassword,     setTgNeedsPassword]     = useState(false);
  const [tgPassword,          setTgPassword]          = useState('');
  const tgPasswordResolver = useRef<((value: string) => void) | null>(null);
  // ── THE CARRIER: a sovereign asset on its way out of the Empire ────────
  //   `vaultDoor` is a VIEW of the Vault, never a second registry. `carried`
  //   is the one asset currently staged for distribution — a reference the
  //   server resolved, not bytes the browser handed over.
  const [vaultDoor,           setVaultDoor]           = useState<readonly DistributableAsset[]>([]);
  const [carried,             setCarried]             = useState<DistributableAsset | null>(null);
  const [dropState,           setDropState]           = useState<'idle' | 'over' | 'resolving' | 'rejected'>('idle');
  const [carryNotice,         setCarryNotice]         = useState<string | null>(null);

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
  /**
   * A Creation Demand written for this Chamber by الحُجّة الدامغة: the
   * objective the investigation calls for, and what would evidence it.
   * It is shown where it is always visible, and fills the Goal's description
   * when the packaging desk is open — Makman registers a Goal only against a
   * graph compiled in Ras Al Amr, and this does not pretend otherwise.
   */
  const [arrivedDemand,       setArrivedDemand]       = useState<string | null>(null);
  const [demandNotice,        setDemandNotice]        = useState<string | null>(null);

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
    // ── THE SWEEP RUNS WHERE THE CREATOR ACTUALLY IS ─────────────────────
    //   This Empire has no background worker — it says so in its own source.
    //   So a rendition's fifteen days end when its owner next opens the
    //   Chamber, and they are TOLD what happened and what is about to.
    void sweepRetention().then(setRetention);
    void listCloudAccounts().then(setCloud);
    void listDistributableAssets().then(setVaultDoor);
    void listDistributionReceipts().then(setReceipts);
    // The link journey ends on Google's screen and returns here with a code.
    // The Chamber says what happened — the provider's own words never do.
    try {
      const outcome = new URLSearchParams(window.location.search).get('cloud');
      if (outcome) {
        setCloudNotice(CLOUD_OUTCOME_AR[outcome] ?? 'تعذّر ربط الحساب.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch { /* a URL we cannot read changes nothing */ }
  }, []);

  useEffect(() => {
    const assetId = takeDemandFor(sessionStorage, 'makman-al-ghayah');
    if (!assetId) return;
    // ── ONE ASSET, ASKED FOR BY NAME ───────────────────────────────────────
    //   MEASURED 2026-09-29: this fetched the Creator's ENTIRE vault — 128
    //   assets, 131KB — on every open of the chamber, to read one string out
    //   of one asset's metadata. `resolveDemand` takes a list, so the single
    //   asset arrives as a list of one and its four honest states are
    //   untouched: a 404 is `not-in-vault`, an unreachable Vault is still
    //   `vault-unreachable`, and neither is guessed at.
    fetch(`/api/vault/assets/${encodeURIComponent(assetId)}`)
      .then(async (r) => {
        if (r.status === 404) return [] as { assetId: string; metadata?: Record<string, unknown> }[];
        if (!r.ok) return null;
        const res = await r.json() as { status?: string; asset?: { assetId: string; metadata?: Record<string, unknown> } };
        return res.status === 'succeeded' && res.asset ? [res.asset] : null;
      })
      .catch(() => null)
      .then((assets) => {
        const arrival = resolveDemand(assets, assetId);
        if (arrival.kind === 'arrived') { setArrivedDemand(arrival.demandAr); setDemandNotice(null); }
        else setDemandNotice(spokenDemandArrival(arrival));
      });
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

  const fetchGoals = async (archived = showingArchived) => {
    setIsFetchingGoals(true);
    try {
      const r = await fetch(`/api/sovereign/entry/creator-goal${archived ? '?archived=1' : ''}`);
      if (r.ok) {
        const data = await r.json() as {
          status: string;
          goals: GoalSummary[];
          counts?: { open: number; archived: number };
        };
        if (data.status === 'succeeded') {
          setGoals(data.goals);
          if (data.counts) setGoalCounts(data.counts);
        }
      }
    } catch { /* silent */ }
    finally { setIsFetchingGoals(false); }
  };

  /**
   * Put a goal away, or take it back out — Article 6.1's «الحذف التشغيلي»,
   * never «الإتلاف النهائي». Nothing is erased and there is no control here
   * that could erase it.
   */
  const handleSetArchived = async (goalId: string, archived: boolean) => {
    setArchivingGoalId(goalId);
    try {
      const r = await fetch(`/api/sovereign/entry/creator-goal/${encodeURIComponent(goalId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      });
      const d = await r.json() as { status?: string; message?: string };
      setGoalNotice(d.message ?? (r.ok ? null : 'تعذّر تنفيذ الطلب.'));
      if (d.status === 'succeeded') {
        if (selectedGoalId === goalId) setSelectedGoalId(null);
        await fetchGoals();
      }
    } catch {
      setGoalNotice('تعذّر الوصول إلى الخادم.');
    } finally {
      setArchivingGoalId(null);
    }
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
            // The MP4 already rendered in Ras Al-Amr — distribution serves it
            // instead of rendering the film again (verified server-side).
            ...(rasAmrRender ? { completedRenderOperationId: rasAmrRender.operationId } : {}),
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

  /**
   * Deliver one sovereign asset to Telegram FROM THIS BROWSER.
   *
   * ─── THE SERVER IS NEVER IN THE MIDDLE OF THIS ──────────────────────────
   *
   *   The bytes are fetched from `/generated-assets/…`, which already refuses
   *   anyone but this asset's owner — so no second door was built for them.
   *   They go to Telegram directly from here, over MTProto, using the session
   *   that lives in this browser and has never been sent anywhere.
   *
   *   The server learns exactly three things afterwards: which asset, which
   *   destination, and what message id came back. It did not witness the send
   *   and cannot verify it — that would need the session the Empire agreed
   *   never to hold. PARTIAL ZERO-CUSTODY, and the receipt says so by
   *   carrying `telegram-user` as its provider.
   */
  const publishByCreatorBrowser = async (
    asset: DistributableAsset,
    acc: { accountId: string; clientTarget: string | null },
  ): Promise<{ messageAr: string }> => {
    if (!acc.clientTarget) return { messageAr: 'هذه الوجهة بلا مقصدٍ محفوظ — اربطها من جديد.' };
    const app = await telegramAppCredentialsForBrowser();
    if (!app.ok) return { messageAr: app.messageAr };

    let bytes: Uint8Array;
    let mimeType: string;
    try {
      const got = await fetch(asset.previewUri, { credentials: 'same-origin' });
      if (!got.ok) return { messageAr: 'لم نجد بايتات هذا الأصل.' };
      mimeType = got.headers.get('content-type') ?? 'application/octet-stream';
      bytes = new Uint8Array(await got.arrayBuffer());
    } catch {
      return { messageAr: 'لم نجد بايتات هذا الأصل.' };
    }

    const tg = await import('./telegram-user-client');
    const dot = asset.previewUri.lastIndexOf('.');
    const outcome = await tg.publish({
      apiId: app.apiId, apiHash: app.apiHash,
      peerId: acc.clientTarget,
      bytes, mimeType,
      fileName: `AZMA — ${asset.assetId}${dot >= 0 ? asset.previewUri.slice(dot) : ''}`,
    });

    // The receipt is written either way — a store that records only successes
    // makes a failed publication indistinguishable from one never attempted.
    const recorded = await recordTelegramUserPublication({
      assetId: asset.assetId,
      accountId: acc.accountId,
      providerMessageId: outcome.messageId ?? '',
      ...(outcome.ok ? {} : { failureReason: outcome.failure ?? 'unreachable' }),
    });
    if (outcome.ok) return { messageAr: recorded.messageAr };
    return {
      messageAr:
        outcome.failure === 'unauthorised' ? 'انتهى إذن تيليجرام في هذا المتصفّح — اربط حسابك من جديد.'
        : outcome.failure === 'rejected' ? 'لم تُقبَل هذه الوسيلة في وجهتك.'
        : 'لم نصل إلى تيليجرام الآن. أعد المحاولة.',
    };
  };

  // ── EACH DESTINATION'S OWN STATE ───────────────────────────────────────
  //   Counted per provider. One count for all of them would report «مرتبط»
  //   for a Drive that was never linked, on the strength of a Telegram
  //   channel that was.
  const driveAccounts = (cloud?.accounts ?? []).filter((a) => a.provider === 'google-drive');
  const telegramAccounts = (cloud?.accounts ?? []).filter((a) => a.provider === 'telegram');

  return (
    <MakmanExperience>
    <main className="makman-viewport">
      <ChamberDemonstration
        chamberId="makman-al-ghayah"
        outcomeAr="غايةٌ مُعلَنة وأهدافٌ تُقاس عليها — وتقريرٌ صادقٌ عن الفجوة بين ما أردتَه وما وقع."
        stepsAr={[
            'أعلن غايتك السياديّة — فكلّ هدفٍ بعدها يخدمها.',
            'عيّن هدفاً مرحلةً لها، ثمّ عرّف ما يُعدّ نجاحاً فيه.',
            'اقرأ ما رصدته الإمبراطوريّة فعلاً، ثمّ اطلب التقييم.',
            'سمِّ ما يجب أن تتعلّمه، وأصدر طلبات المعرفة.',
        ]}
      />

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

        {/* ── THE DOOR OUT OF THE EMPIRE, WHERE ARRIVING EYES LAND ────────
            FOUNDER, 2026-10-03, after a real Google link: «وصلت إلى مكمن
            الغاية ولم أجد أي وسيلة ظاهرة لربط Google Drive».

            MEASURED, then LOOKED AT. The panel was present, visible and
            above the fold by 135px — and its button was cut off below it,
            under twenty-one goal cards. Counting its presence said it was
            there; a screenshot said nobody would ever find it.

            A connection status belongs where a Creator's eye lands on
            arrival, not at the end of a list. It is the FIRST section of
            this Chamber now, and it states its condition in one line
            before anything is asked of it. */}
        <section className="makman-cloud-panel neon-border" data-testid="makman-cloud">
          <div className="panel-header">
            <div className="neon-tag">التوزيع الخارجي</div>
            <h2>☁ حساباتك السحابيّة</h2>
          </div>

          {/* The condition of each destination, said before anything is asked.
              One line per provider, because one line for both would report a
              closed door as the state of an open one. */}
          <p className="makman-cloud-state">
            {!cloud ? 'يُقرأ…'
              : !cloud.available ? '◌ جوجل درايف — غير مهيّأ في الإمبراطوريّة بعد'
              : driveAccounts.length > 0 ? `● جوجل درايف — مرتبط (${driveAccounts.length})`
              : '○ جوجل درايف — غير مرتبط'}
          </p>
          <p className="makman-cloud-state">
            {!cloud ? 'يُقرأ…'
              : !cloud.telegramAvailable ? '◌ تيليجرام — غير مهيّأ في الإمبراطوريّة بعد'
              : telegramAccounts.length > 0 ? `● تيليجرام — مرتبط (${telegramAccounts.length})`
              : '○ تيليجرام — غير مرتبط'}
          </p>

          {cloud?.accounts.map((acc) => (
            <div key={acc.accountId} className="makman-plan-row makman-done-row">
              <span>
                {PROVIDER_MARK[acc.provider] ?? '◈'}{' '}
                {acc.accountLabel ?? PROVIDER_FALLBACK_AR[acc.provider] ?? 'حسابٌ مرتبط'}
                {' · '}
                <span className="makman-receipt-when">{PROVIDER_FALLBACK_AR[acc.provider] ?? acc.provider}</span>
              </span>
              <button
                className="makman-unlink-btn"
                disabled={cloudBusy !== null}
                onClick={async () => {
                  setCloudBusy(acc.accountId);
                  // ── UNLINKING A SESSION THE SERVER DOES NOT HOLD ────────
                  //   Revoking the row alone would leave the authorization
                  //   alive in this browser AND standing in the Creator's own
                  //   Telegram session list — the opposite of what «فُكَّ
                  //   الربط» promises. So Telegram is told first, here.
                  if (acc.provider === 'telegram-user') {
                    const app = await telegramAppCredentialsForBrowser();
                    if (app.ok) {
                      const tg = await import('./telegram-user-client');
                      await tg.forgetSession({ apiId: app.apiId, apiHash: app.apiHash });
                    }
                  }
                  const r = await unlinkCloudAccount(acc.accountId);
                  setCloudNotice(r.messageAr);
                  setCloud(await listCloudAccounts());
                  setCloudBusy(null);
                }}
              >
                {cloudBusy === acc.accountId ? '…' : '✕ فُكَّ الربط'}
              </button>
            </div>
          ))}

          {cloud?.available && (
            <a className="makman-download-btn" href="/api/cloud/google/start">
              {/* DRIVE accounts, not all accounts. A Creator who linked a
                  Telegram channel and no Drive would otherwise be invited to
                  «اربط حساباً آخر» for a provider they never linked once. */}
              {driveAccounts.length > 0 ? '+ اربط حساباً آخر' : '+ اربط جوجل درايف'}
            </a>
          )}

          {cloud?.available && driveAccounts.length === 0 && (
            <p className="makman-capability-hint">
              يُرفع عملُك إلى حسابك أنت. والإمبراطوريّة لا تملك فيه شيئاً — ترى الملفّات التي تُنشئها هي وحدها.
            </p>
          )}

          {/* ── THE SOCIAL DESTINATIONS, ONE ROW EACH, FROM DATA ───────────
              «Do NOT build four unrelated account systems.» So there is one
              list and one rule: a destination states whether the Empire can
              offer it at all, how many of the Creator's accounts are linked
              through it, and what it is actually able to publish.

              A provider the Empire holds no credential for says «غير مهيّأ»,
              and a platform that has not yet opened its door to THIS Creator
              says «قيد مراجعة المنصّة». Neither draws a button — never a
              control that cannot work, and never a door that slams. */}
          {LINKABLE_DESTINATIONS.map((d) => {
            const linked = (cloud?.accounts ?? []).filter((a) => d.providers.includes(a.provider));
            // ── THE STATE, NOT A BOOLEAN ────────────────────────────────
            //   `offers[key] === true` meant «the Empire holds a key» and was
            //   drawn as «+ اربط». The server now answers the question the
            //   Creator actually has — can I finish this today — and the row
            //   draws that answer, reason and all.
            const state = cloud?.destinations?.[d.offerKey];
            const open = state?.access === 'OPEN';
            return (
              <div key={d.offerKey} className="makman-destination-row">
                <p className="makman-cloud-state">
                  {!cloud || !state ? 'يُقرأ…'
                    : state.access === 'NOT_CONFIGURED' ? `◌ ${d.labelAr} — ${state.reasonAr}`
                    : state.access === 'AWAITING_PLATFORM_REVIEW' ? `◌ ${d.labelAr} — قيد مراجعة المنصّة`
                    : linked.length > 0 ? `● ${d.labelAr} — مرتبط (${linked.length})`
                    : `○ ${d.labelAr} — غير مرتبط`}
                </p>
                <p className="makman-capability-hint">
                  {/* The reason, where the capability would be — because a
                      capability the platform has not opened is not a capability
                      yet. For «غير مهيّأ» the heading above already said it all. */}
                  {state?.access === 'AWAITING_PLATFORM_REVIEW' ? state.reasonAr : d.capabilityAr}
                </p>
                {open && (
                  <a className="makman-download-btn" href={d.href}>
                    {linked.length > 0 ? `+ اربط حساباً آخر — ${d.labelAr}` : `+ اربط ${d.labelAr}`}
                  </a>
                )}
              </div>
            );
          })}

          {/* ── TELEGRAM: NO JOURNEY TO A PROVIDER'S SCREEN ────────────────
              Google's link is an anchor to `/api/cloud/google/start` because
              the grant is made on Google's own page. Telegram issues no such
              page: the Creator holds the credential already, and hands it
              over here.

              The token field is `type="password"` with autocomplete off, and
              BOTH fields are cleared the instant the answer returns — so a
              bot token never remains in a rendered input, and never lands in
              the browser's saved form values. */}
          {cloud?.telegramAvailable && (
            <div className="makman-telegram-link">
              <p className="makman-capability-hint">
                ✈ تيليجرام — أنشئ بوتاً من @BotFather، أضفه مشرفاً في قناتك، ثمّ ضَع رمزه ووجهتك.
              </p>
              <input
                id="makman-telegram-token"
                className="makman-telegram-input"
                type="password"
                autoComplete="off"
                dir="ltr"
                placeholder="رمز البوت من @BotFather"
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                disabled={tgBusy}
              />
              <input
                id="makman-telegram-chat"
                className="makman-telegram-input"
                type="text"
                autoComplete="off"
                dir="ltr"
                placeholder="@اسم_القناة أو معرّف المحادثة"
                value={tgChat}
                onChange={(e) => setTgChat(e.target.value)}
                disabled={tgBusy}
              />
              <button
                type="button"
                className="makman-download-btn"
                data-testid="makman-telegram-connect"
                disabled={tgBusy || tgToken.trim().length === 0 || tgChat.trim().length === 0}
                onClick={async () => {
                  setTgBusy(true);
                  setCloudNotice(null);
                  const r = await connectTelegramBot(tgToken, tgChat);
                  // Cleared on EVERY outcome, success or refusal: a rejected
                  // token is still a token, and it does not stay on screen.
                  setTgToken('');
                  setTgChat('');
                  setCloudNotice(r.messageAr);
                  setCloud(await listCloudAccounts());
                  setTgBusy(false);
                }}
              >
                {tgBusy ? 'يُتحقَّق من تيليجرام…' : '+ اربط وجهة تيليجرام'}
              </button>
            </div>
          )}

          {/* ── TELEGRAM BY THE CREATOR'S OWN ACCOUNT ──────────────────────
              FOUNDER'S RULING, 2026-10-04: the session must never reach the
              AZMA server. So everything below that touches Telegram runs in
              this browser, and the only things that cross to the server are a
              label, a destination id, and afterwards a message id.

              PARTIAL ZERO-CUSTODY, in his own words — never «zero custody».
              The session lives in this browser's storage, on AZMA's origin.

              GramJS is two megabytes and is reached ONLY through
              `await import()` inside these handlers, so a Creator who never
              links Telegram never downloads a byte of it. */}
          {cloud?.telegramUserAvailable && (
            <div className="makman-telegram-link">
              <p className="makman-capability-hint">
                ✦ تيليجرام — بحسابك أنت. امسح الرمز بتطبيقك كما تفعل مع تيليجرام على الحاسوب.
                إذنُك يبقى في متصفّحك، ولا يصل خادمَ أزما.
              </p>

              {tgQrDataUrl && (
                <div className="makman-tg-qr">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tgQrDataUrl} alt="رمز الدخول إلى تيليجرام" width={200} height={200} />
                  <p className="makman-capability-hint">
                    تيليجرام ← الإعدادات ← الأجهزة ← ربط جهاز سطح المكتب
                  </p>
                </div>
              )}

              {tgNeedsPassword && (
                <>
                  <input
                    id="makman-telegram-2fa"
                    className="makman-telegram-input"
                    type="password"
                    autoComplete="off"
                    dir="ltr"
                    placeholder="كلمة التحقّق بخطوتين"
                    value={tgPassword}
                    onChange={(e) => setTgPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="makman-download-btn"
                    onClick={() => {
                      const resolve = tgPasswordResolver.current;
                      tgPasswordResolver.current = null;
                      setTgNeedsPassword(false);
                      const given = tgPassword;
                      setTgPassword('');
                      resolve?.(given);
                    }}
                  >
                    ↵ تابِع
                  </button>
                </>
              )}

              {tgDestinations.length > 0 && (
                <>
                  <p className="makman-capability-hint">◆ اختر وجهةً تنشر فيها</p>
                  {tgDestinations.map((d) => (
                    <button
                      key={d.peerId}
                      type="button"
                      className="makman-download-btn"
                      disabled={tgUserBusy}
                      onClick={async () => {
                        setTgBusy(true);
                        const r = await linkTelegramUserAccount({
                          telegramUserId: tgIdentity?.telegramUserId ?? '',
                          username: tgIdentity?.username ?? null,
                          peerId: d.peerId,
                          peerTitle: d.title,
                        });
                        setCloudNotice(r.messageAr);
                        setTgDestinations([]);
                        setCloud(await listCloudAccounts());
                        setTgBusy(false);
                      }}
                    >
                      ✦ {d.title} — {d.roleAr}
                    </button>
                  ))}
                </>
              )}

              <button
                type="button"
                className="makman-download-btn"
                data-testid="makman-telegram-user-connect"
                disabled={tgUserBusy}
                onClick={async () => {
                  setTgBusy(true);
                  setCloudNotice(null);
                  setTgQrDataUrl(null);
                  try {
                    const app = await telegramAppCredentialsForBrowser();
                    if (!app.ok) { setCloudNotice(app.messageAr); setTgBusy(false); return; }
                    const tg = await import('./telegram-user-client');
                    const qrlib = await import('qrcode');

                    // An already-authorized browser skips the scan entirely.
                    if (!tg.hasStoredSession()) {
                      const who = await tg.authorizeWithQr({
                        apiId: app.apiId, apiHash: app.apiHash,
                        onQrUrl: async (url: string) => {
                          setTgQrDataUrl(await qrlib.toDataURL(url, { width: 200, margin: 1 }));
                        },
                        onPassword: () => new Promise<string>((resolve) => {
                          tgPasswordResolver.current = resolve;
                          setTgNeedsPassword(true);
                        }),
                      });
                      setTgIdentity(who);
                    } else {
                      // Already authorized in this browser — no scan is owed.
                      setTgIdentity(await tg.identify({ apiId: app.apiId, apiHash: app.apiHash }));
                    }
                    setTgQrDataUrl(null);
                    setTgDestinations(await tg.listDestinations({ apiId: app.apiId, apiHash: app.apiHash }));
                  } catch (e) {
                    setCloudNotice('لم يتمّ الربط. أعد المحاولة.');
                    console.error('[telegram-user] link failed:', e instanceof Error ? e.message : e);
                  }
                  setTgBusy(false);
                }}
              >
                {tgUserBusy ? 'يُنتظر تيليجرام…' : '✦ اربط حسابك في تيليجرام'}
              </button>
            </div>
          )}

          {cloudNotice && <p className="project-status">{cloudNotice}</p>}

          {/* ── THE CARRIER: FROM THE VAULT, INTO THE DISTRIBUTION ──────────
              FOUNDER, 2026-10-04, after a live test: «THE ASSET DOES NOT MOVE
              WITH THE DRAG. THE DROP TARGET DOES NOT RECEIVE THE ASSET.»

              MEASURED before touching anything: this Chamber had ZERO drag or
              drop handlers — no source, no target, no dataTransfer contract —
              while رأس الأمر, الحجّة and القيامة all had one. The drag did not
              fail; there was nothing built to receive it. And the only path to
              an upload ran through `reframeDone`, session state filled only by
              a reframe finished minutes earlier, so an asset ALREADY in the
              Vault had no route at all.

              What moves is an ASSET ID. Never a File, never a Blob, never
              bytes. The server resolves it through the ownership boundary it
              already has, and the Vault stays the source of truth. */}
          <div className="makman-carrier">

            {/* The drop target. It states its own condition and never claims
                acceptance before the resolution returns. */}
            <div
              className={`makman-drop-target drop-${dropState}${carried ? ' drop-carrying' : ''}`}
              data-testid="makman-drop-target"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDropState('over'); }}
              onDragLeave={() => setDropState((s) => (s === 'over' ? 'idle' : s))}
              onDrop={async (e) => {
                e.preventDefault();
                const assetId = readDraggedAssetId(e.dataTransfer);
                if (!assetId) {
                  // A desktop file, a URL, a text selection — none is sovereign.
                  setDropState('rejected');
                  setCarryNotice('ما أُفلِت ليس أصلاً سياديّاً من خزانتك.');
                  return;
                }
                setDropState('resolving');
                setCarryNotice(null);
                const outcome = await resolveAssetForDistribution(assetId);
                if (outcome.ok) {
                  setCarried(outcome.asset);
                  setDropState('idle');
                } else {
                  setDropState('rejected');
                  setCarryNotice(outcome.messageAr);
                }
              }}
            >
              {carried ? (
                <div className="makman-carried">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={carried.previewUri} alt="" className="makman-carried-thumb" />
                  <span className="makman-carried-name">◈ {carried.labelAr}</span>
                  <button
                    className="makman-unlink-btn"
                    onClick={() => { setCarried(null); setCarryNotice(null); }}
                  >
                    ✕ أزِله
                  </button>
                </div>
              ) : (
                <p className="makman-drop-hint">
                  {dropState === 'over' ? '◉ أفلِته هنا'
                    : dropState === 'resolving' ? 'يُتحقَّق من ملكيّتك…'
                    : dropState === 'rejected' ? '✕ لم يُقبَل'
                    : '⇣ اسحب أصلاً من خزانتك إلى هنا — أو اضغط عليه'}
                </p>
              )}
            </div>

            {carryNotice && <p className="project-status">{carryNotice}</p>}

            {/* ── THE DESTINATION, ONCE SOMETHING IS CARRIED ──────────────── */}
            {carried && cloud?.accounts.map((acc) => {
              // ── A LINKED ACCOUNT ITS PLATFORM NOW REFUSES ─────────────
              //   Linking is not permission to publish, and a platform may
              //   narrow what it admits after a grant was made. Offering
              //   «انشره في» here would promise first and fail after — the
              //   worse half of the same debt. The reason replaces the
              //   button; the account itself stays, because nothing is
              //   wrong with it.
              const refusedAr = cloud?.accountRefusals?.[acc.accountId];
              if (refusedAr) {
                return (
                  <p key={acc.accountId} className="makman-capability-hint">
                    {PROVIDER_MARK[acc.provider] ?? '✦'}{' '}
                    {acc.accountLabel ?? 'وجهتك'} — {refusedAr}
                  </p>
                );
              }
              return (
              <button
                key={acc.accountId}
                className="makman-download-btn"
                disabled={cloudBusy !== null}
                onClick={async () => {
                  setCloudBusy(`${carried.assetId}:${acc.accountId}`);
                  setCarryNotice(null);
                  // ── WHO DELIVERS, DECIDED BY THE PROVIDER ───────────────
                  //   For every server-delivered provider the Empire spends a
                  //   credential it holds. For `telegram-user` it holds none,
                  //   so the delivery happens HERE, in the Creator's browser,
                  //   and the server is told only what came back.
                  const r = acc.provider === 'telegram-user'
                    ? await publishByCreatorBrowser(carried, acc)
                    : await uploadAssetToCloud(carried.assetId, acc.accountId);
                  setCarryNotice(r.messageAr);
                  setCloud(await listCloudAccounts());
                  // The receipt, re-read from the database — so what the
                  // screen says next came from the table, not from a
                  // remembered success.
                  setReceipts(await listDistributionReceipts());
                  setCloudBusy(null);
                }}
              >
                {cloudBusy === `${carried.assetId}:${acc.accountId}`
                  ? (acc.provider === 'google-drive' ? 'يُرفع…' : 'يُنشَر…')
                  : acc.provider === 'google-drive'
                    ? `☁ ارفعه إلى ${acc.accountLabel ?? 'حسابك'}`
                    // TikTok is never «انشره»: without its audit the file lands
                    // as a draft its owner must finish by hand.
                    : acc.provider === 'tiktok'
                      ? `♪ أرسِله مسوّدةً إلى ${acc.accountLabel ?? 'تيك توك'}`
                      : `${PROVIDER_MARK[acc.provider] ?? '✦'} انشره في ${acc.accountLabel ?? 'وجهتك'}`}
              </button>
              );
            })}

            {carried && cloud?.accounts.length === 0 && (
              <p className="makman-capability-hint">اربط حساباً سحابيّاً أعلاه لترفع هذا الأصل إليه.</p>
            )}

            {/* ── WHAT ACTUALLY LEFT THE EMPIRE ────────────────────────────
                FOUNDER'S ORDER, 2026-10-04: «Refresh/re-enter the relevant
                area and confirm the published state remains truthful».

                A message shown once after a publication proves nothing an
                hour later. This list is read from `distribution_receipts` on
                every entry to the Chamber — so «✓ نُشِر» on this screen is
                the database speaking, and a failure stays visible as a
                failure instead of vanishing with the page. */}
            {receipts.length > 0 && (
              <>
                <p className="makman-capability-hint">◆ سجلّ التوزيع الخارجي</p>
                <div data-testid="makman-receipts">
                  {receipts.map((r) => (
                    <div key={r.receiptId} className="makman-plan-row makman-done-row">
                      <span>
                        {r.status === 'PUBLISHED' ? '✓ نُشِر' : '✕ لم يُنشَر'}
                        {' — '}{r.providerLabelAr}{' · '}{r.whereAr}
                      </span>
                      <span className="makman-receipt-when">
                        {new Date(r.atMs).toLocaleString('ar-EG')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── THE VAULT DOOR ──────────────────────────────────────────
                A VIEW of the Vault, never a second registry. Every card is
                draggable AND pressable: «كل أصل قابل للاختيار بالضغط لمن لا
                يستخدم السحب والإفلات». */}
            <p className="makman-capability-hint">◆ أصولك في الخزانة السيادية</p>
            <div className="makman-vault-door" data-testid="makman-vault-door">
              {vaultDoor.length === 0 && (
                <p className="project-status">لا أصول في خزانتك بعد.</p>
              )}
              {vaultDoor.map((a) => (
                <button
                  key={a.assetId}
                  type="button"
                  className={`makman-vault-card${carried?.assetId === a.assetId ? ' vault-card-on' : ''}`}
                  draggable
                  onDragStart={(e) => {
                    // The Empire's one sovereign-asset drag contract.
                    e.dataTransfer.setData(SOVEREIGN_ASSET_DRAG_TYPE, a.assetId);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={async () => {
                    setDropState('resolving');
                    setCarryNotice(null);
                    const outcome = await resolveAssetForDistribution(a.assetId);
                    if (outcome.ok) { setCarried(outcome.asset); setDropState('idle'); }
                    else { setDropState('rejected'); setCarryNotice(outcome.messageAr); }
                  }}
                  title={a.labelAr}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.previewUri} alt="" className="makman-vault-thumb" draggable={false} />
                  <span className="makman-vault-kind">{a.kindAr}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

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

          {/* ── WHAT HAPPENED TO YOUR PLATFORM COPIES, AND WHAT IS ABOUT TO ──
              FOUNDER: «الإتلاف النهائي بعد إخبار صاحب الأصل» — so the telling
              is not a courtesy after the act, it is a condition of it. Shown
              at the top of the Chamber, where a Creator entering cannot miss
              it, and never as a number they must go looking for. */}
          {retention && (retention.dueSoon.length > 0 || retention.destroyed.length > 0 || retention.spared.length > 0) && (
            <div className="makman-retention-notice" data-testid="makman-retention">
              {retention.dueSoon.map((r, i) => (
                <p key={`due-${i}`} style={{ margin: '2px 0' }}>
                  ⏳ نسختُك لـ<strong>{r.label}</strong> تُتلَف خلال {r.daysLeft === 1 ? 'يومٍ واحد' : `${r.daysLeft} أيّام`} — نزِّلها أو ارفعها الآن.
                </p>
              ))}
              {retention.destroyed.map((r, i) => (
                <p key={`gone-${i}`} style={{ margin: '2px 0' }}>
                  ✕ انتهت مدّةُ نسختِك لـ<strong>{r.label}</strong> فأُتلِفت — وأصلُك الأب في خزانتك كما هو.
                </p>
              ))}
              {retention.spared.map((r, i) => (
                <p key={`kept-${i}`} style={{ margin: '2px 0' }}>
                  ◈ نسختُك لـ<strong>{r.label}</strong>: {r.reasonAr}
                </p>
              ))}
            </div>
          )}

          {(arrivedDemand || demandNotice) && (
            <div className="makman-capability-hint" data-testid="makman-demand">
              {arrivedDemand && (
                <>
                  <p><strong>مطالبة غائيّة وصلت من حجّة الدامغة</strong></p>
                  <p>{arrivedDemand}</p>
                  <p>يُسجَّل الهدف من رسمٍ مُجمَّع في رأس الأمر — والمطالبة محفوظة في خزانتك.</p>
                </>
              )}
              {demandNotice && <p>{demandNotice}</p>}
            </div>
          )}

          {/* ── THE TWO SHELVES ──────────────────────────────────────────────
              FOUNDER, 2026-09-29: «امنع تكدس الاصول والغايات بصفه عامه داخل
              الحجره». The archived shelf is named and countable but never
              loaded with the room — Article 6.1's «إخفاء الأصل من العرض
              العادي» is a hiding from ordinary display, not from the
              Creator. */}
          {(goalCounts.open > 0 || goalCounts.archived > 0) && (
            <div className="makman-goal-shelves" role="tablist" aria-label="الغايات">
              <button
                role="tab"
                aria-selected={!showingArchived}
                className={`makman-shelf-btn ${!showingArchived ? 'shelf-active' : ''}`}
                onClick={() => { setShowingArchived(false); void fetchGoals(false); }}
              >
                القائمة ({goalCounts.open})
              </button>
              <button
                role="tab"
                aria-selected={showingArchived}
                className={`makman-shelf-btn ${showingArchived ? 'shelf-active' : ''}`}
                onClick={() => { setShowingArchived(true); void fetchGoals(true); }}
              >
                المطويّة ({goalCounts.archived})
              </button>
            </div>
          )}

          {goals.length === 0 && showingArchived && !isFetchingGoals && (
            <p className="project-status">لا غايةَ مطويّة.</p>
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
                      {/* ── PUT AWAY, NEVER DESTROYED ────────────────────
                          Article 6.5: «الحذف التشغيلي لا يساوي الإتلاف
                          النهائي». There is no control here that erases a
                          goal, and the route behind this one has no DELETE. */}
                      <button
                        className={`import-btn ${archivingGoalId === goal.goalId ? 'importing' : ''}`}
                        disabled={archivingGoalId === goal.goalId}
                        title={showingArchived
                          ? 'تعود الغاية إلى قائمتك'
                          : 'تُخفى من قائمتك ولا تُحذف — تستعيدها متى شئت'}
                        onClick={(e) => { e.stopPropagation(); void handleSetArchived(goal.goalId, !showingArchived); }}
                      >
                        {archivingGoalId === goal.goalId
                          ? '…'
                          : showingArchived ? '↩ استعِد الغاية' : '🗀 اطوِ الغاية'}
                      </button>

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
                              — {spokenQuestion(r)} · {GAP_CLASS_AR[r.gapClass] ?? r.gapClass} · {AVAILABILITY_AR[r.availability] ?? r.availability}
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
                              — {spokenQuestion(r)} · {AVAILABILITY_AR[r.availability] ?? r.availability}
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

            {rasAmrRender ? (
              // RAS AL AMR EXECUTION DIRECTIVE — PHASE 4: the final MP4 was
              // already produced in Ras Al-Amr; Makman receives it for
              // distribution and publishing only.
              <div className="master-display neon-border-gold">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={rasAmrRender.fileUrl} controls playsInline preload="metadata" className="cinematic-final-video" aria-label="ملف MP4 النهائي من رأس الأمر" />
                <p className="project-title">{realProduction?.title ?? 'إنتاج من رأس الأمر'}</p>
                <p className="project-status">وصل ملف MP4 النهائي من رأس الأمر — جاهز للتسجيل والتوزيع</p>
              </div>
            ) : realProduction ? (
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
                <textarea ref={descriptionRef} className="cyber-input textarea" rows={3} defaultValue={arrivedDemand ?? 'الوصف الافتراضي للعمل الفني...'} />
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
                    src={renderOperationId.startsWith('op_rasamr_')
                      // The film rendered in Ras Al-Amr streams from its authenticated route.
                      ? `/api/ras-amr/render/${renderOperationId}/file`
                      : `/renders/${renderOperationId}.mp4`}
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

                {/* ── THE PLATFORMS, AND WHAT EACH ONE NEEDS ──────────────
                    FOUNDER: «مقاس الأصل ليس ثابتا في جميع المنصات... فتقوم
                    بتغير الابعاد لتتناسب مع المنصات المحددة من المستخدم».
                    The Creator reads the whole answer — including its price —
                    before any part of it is approved. */}
                {renderVaultAssetId && (
                  <div className="makman-reframe-panel" data-testid="makman-reframe">
                    <p className="makman-capability-hint">
                      ◈ لأيّ منصّةٍ تريد تجهيز هذا الأصل؟ المقاسُ يختلف بينها.
                    </p>

                    <div className="makman-platform-grid" role="group" aria-label="المنصّات">
                      {reframablePlatforms().map((p) => {
                        const on = chosenPlatforms.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            aria-pressed={on}
                            className={`makman-platform-btn ${on ? 'platform-on' : ''}`}
                            onClick={() => {
                              setReframePlan(null);
                              setReframeNotice(null);
                              setChosenPlatforms((prev) =>
                                prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
                            }}
                          >
                            {PLATFORM_AR[p] ?? p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className={`import-btn ${reframeBusy === 'planning' ? 'importing' : ''}`}
                      disabled={chosenPlatforms.length === 0 || reframeBusy !== 'idle'}
                      onClick={async () => {
                        setReframeBusy('planning');
                        setReframeNotice(null);
                        setReframeDone([]);
                        const outcome = await planReframe(renderVaultAssetId, chosenPlatforms);
                        if (outcome.ok) {
                          setReframePlan(outcome.plan as ReframePlanView);
                          setReframeBalance(outcome.availableUnits);
                        } else {
                          setReframePlan(null);
                          setReframeNotice(outcome.messageAr);
                        }
                        setReframeBusy('idle');
                      }}
                    >
                      {reframeBusy === 'planning' ? 'يُفحص…' : '◈ افحص المقاسات'}
                    </button>

                    {reframePlan && (
                      <div className="makman-plan" data-testid="makman-reframe-plan">
                        {reframePlan.rows.map((row) => (
                          <p key={row.platform} className={`makman-plan-row verdict-${row.verdict}`}>
                            {row.spokenAr}
                            {row.balanceCost > 0 && <span className="plan-cost"> · {row.balanceCost} وحدة</span>}
                          </p>
                        ))}

                        {/* The whole price, said once, before the word that spends it. */}
                        {reframePlan.reframeCount > 0 ? (
                          <>
                            <p className="makman-plan-total">
                              الإجمالي: {reframePlan.totalBalanceCost} وحدة
                              {reframeBalance !== null && ` · رصيدك ${reframeBalance}`}
                            </p>
                            <button
                              className={`import-btn ${reframeBusy === 'producing' ? 'importing' : ''}`}
                              disabled={reframeBusy !== 'idle'
                                || (reframeBalance !== null && reframeBalance < reframePlan.totalBalanceCost)}
                              onClick={async () => {
                                setReframeBusy('producing');
                                setReframeNotice(null);
                                // `true` is the Creator's explicit word. The
                                // server refuses anything else.
                                const outcome = await executeReframe(renderVaultAssetId, chosenPlatforms, true);
                                setReframeNotice([
                                  outcome.messageAr,
                                  ...outcome.refused.map((r) => `${r.label}: ${r.reasonAr}`),
                                ].join(' '));
                                setReframeDone(outcome.produced.map((r) => ({
                                  label: r.label, assetId: r.assetId, storageUri: r.storageUri,
                                })));
                                if (outcome.produced.length > 0) setReframePlan(null);
                                setReframeBusy('idle');
                              }}
                            >
                              {reframeBusy === 'producing'
                                ? 'يُجهَّز…'
                                : `✓ وافق واخصم ${reframePlan.totalBalanceCost} وحدة`}
                            </button>
                          </>
                        ) : (
                          <p className="makman-plan-total">لا شيء يحتاج إعادة تأطير — ولا خصم.</p>
                        )}
                      </div>
                    )}

                    {/* ── AND NOW IT IS THEIRS TO TAKE ────────────────────
                        Constitution v1.1: مكمن is the only centre of external
                        distribution — «سواء بالرفع أو النشر أو التحميل لجهاز
                        صاحب الأصل». The download is that third door, and it
                        is the one that needs nothing but a link. */}
                    {reframeDone.length > 0 && (
                      <div className="makman-plan" data-testid="makman-reframe-done">
                        {reframeDone.map((d) => (
                          <div key={d.assetId} className="makman-plan-row verdict-fits-as-is makman-done-row">
                            <span>✓ جاهزٌ لـ{d.label}</span>
                            <span className="makman-doors">
                              <a className="makman-download-btn" href={d.storageUri} download>
                                ↓ نزِّله إلى جهازك
                              </a>
                              {/* ── THE SECOND DOOR: THE CREATOR'S OWN CLOUD ──
                                  Shown only when an account is actually linked.
                                  A button that would fail is not offered — and
                                  an account whose platform refuses this Creator
                                  WOULD fail, so it is left out here. The reason
                                  is stated once, in the destinations panel
                                  above; repeating it beside every reframed
                                  variant would bury it. */}
                              {cloud?.accounts.filter((acc) => !cloud?.accountRefusals?.[acc.accountId]).map((acc) => (
                                <button
                                  key={acc.accountId}
                                  className="makman-download-btn"
                                  disabled={cloudBusy !== null}
                                  onClick={async () => {
                                    setCloudBusy(d.assetId + acc.accountId);
                                    const r = await uploadAssetToCloud(d.assetId, acc.accountId);
                                    setCloudNotice(r.messageAr);
                                    setCloudBusy(null);
                                  }}
                                >
                                  {cloudBusy === d.assetId + acc.accountId
                                    ? 'يُرفع…'
                                    : `☁ ارفعه إلى ${acc.accountLabel ?? 'حسابك'}`}
                                </button>
                              ))}
                            </span>
                          </div>
                        ))}
                        <p className="makman-retention-notice">
                          نسخُ المنصّات محفوظةٌ في خزانتك <strong>خمسة عشر يوماً</strong>، ثمّ تُتلَف —
                          وأصلُك الأب يبقى بلا حدّ. خُذ ما تريد الآن أو ارفعه إلى حسابك.
                        </p>
                      </div>
                    )}

                    {reframeNotice && <p className="project-status">{reframeNotice}</p>}

                  </div>
                )}
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
