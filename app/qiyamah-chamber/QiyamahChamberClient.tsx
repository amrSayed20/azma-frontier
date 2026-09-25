/**
 * AZMA OS – Qiyamah Chamber (The Generative Genesis Forge)
 * Native Name: حجرة القيامة
 *
 * SOVEREIGN EMBODIMENT CONTRACT — upgrades:
 *   • TWO input modes: Idea mode (simple idea → Qiyamah builds prompt)
 *                      External mode (Creator brings own prompt → Qiyamah reads it)
 *   • All 13 styles operational — no locked styles
 *   • Download button in result stage
 *   • Delete from gallery with inline confirmation
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useConstitutionalNavigation } from '@/src/constitutional-navigation';
import './qiyamah-chamber.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { resolveAvailableActions } from '@/src/button-engine';
import { resolveChamberFromPath } from '@/src/imperial-awareness-engine';
import {
  MATERIAL_KEY,
  takeMaterialIdentity,
  resolveArrival,
  spokenArrival,
} from './_lib/material-from-investigation';
import type { ChamberState } from '@/src/button-engine';
import { useInstallInvitation } from '@/src/install-experience';
import type { ImperialVisionDocument } from '@/src/chamber-vision';
import { ChamberDemonstration } from '@/src/chamber-demonstration';

// All 14 styles — operational, none locked. 'infographic' (2026-09-22) requires Nano Banana 2 server-side.
const ALL_STYLES: Array<{ id: string; nameAr: string; tagline: string }> = [
  { id: 'cinematic',    nameAr: 'سينمائي',      tagline: 'ملحمي 35mm' },
  { id: 'realistic',    nameAr: 'واقعي',         tagline: 'دقة فائقة 8K' },
  { id: 'advertising',  nameAr: 'إعلاني',        tagline: 'استوديو فاخر' },
  { id: 'documentary',  nameAr: 'وثائقي',        tagline: 'أصيل وأرشيفي' },
  { id: 'creative',     nameAr: 'فني / إبداعي',  tagline: 'تعبير حر' },
  { id: 'scifi',        nameAr: 'خيال علمي',     tagline: 'مستقبل تقني' },
  { id: 'animation',    nameAr: 'أنيميشن',       tagline: 'فن حي' },
  { id: 'fantasy',      nameAr: 'فانتازيا',      tagline: 'أسطوري سحري' },
  { id: 'portrait',     nameAr: 'بورتريه',       tagline: 'تعبير إنساني' },
  { id: 'fashion',      nameAr: 'أزياء',         tagline: 'موضة راقية' },
  { id: 'architecture', nameAr: 'معماري',        tagline: 'هندسة بصرية' },
  { id: 'historical',   nameAr: 'تاريخي',        tagline: 'توثيق الحقب' },
  { id: 'abstract',     nameAr: 'تجريدي',        tagline: 'حرية بصرية' },
  { id: 'infographic',  nameAr: 'إنفوغرافيك',    tagline: 'معلومات مرئية' },
];

type JourneyStage =
  | 'idea'
  | 'constructing'
  | 'review'
  | 'generating'
  | 'result'
  | 'error';

type InputMode = 'idea' | 'external';

interface GenerationRecord {
  readonly recordId:    string;
  readonly prompt:      string;
  readonly style:       string | null;
  readonly assetUrl:    string;
  readonly generatedAt: number;
  readonly originalIdea?: string | null;
  readonly mediaType?:  string;
}

interface UploadedItem {
  readonly assetId:          string;
  readonly url:              string;
  readonly capabilityTarget: string;
  readonly uploadedAt:       number;
}

interface QiyamahChamberClientProps {
  readonly dict:                Dictionary;
  readonly chamberVision?:      ImperialVisionDocument;
  readonly generationAvailable?: boolean;
  /** Models verified and active for animating an image — derived by the page from the fleet. */
  readonly animationModels?:    readonly { readonly modelId: string; readonly displayName: string; readonly durationSeconds: number }[];
}

export function QiyamahChamberClient({
  dict,
  chamberVision,
  generationAvailable = true,
  animationModels = [],
}: QiyamahChamberClientProps) {
  const { goTo } = useConstitutionalNavigation();
  const { triggerInvitation } = useInstallInvitation();

  // Which Chamber the Creator is standing in, asked of the sovereign registry
  // rather than written here. This is the one call site that stands inside a
  // Chamber, so it is where the Awareness Engine actually learns the answer on
  // a real journey — a resolver nobody calls would be authority without a
  // consumer. It changes no decision: Awareness receives the Chamber, and what
  // it may decide with it remains the owner's question.
  const chamber = resolveChamberFromPath(usePathname());

  // ── Identity ────────────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState<string | null>(null);

  // ── Gallery data ────────────────────────────────────────────────────────────
  const [generations,   setGenerations]   = useState<readonly GenerationRecord[]>([]);
  const [uploadedItems, setUploadedItems] = useState<readonly UploadedItem[]>([]);

  // ── Input mode ──────────────────────────────────────────────────────────────
  const [inputMode, setInputMode] = useState<InputMode>('idea');

  // ── Journey state machine ───────────────────────────────────────────────────
  const [stage,              setStage]              = useState<JourneyStage>('idea');
  const [idea,               setIdea]               = useState('');
  /** The Vault asset the current idea was taken from, when it came from Hujjah. */
  const [materialAssetId,    setMaterialAssetId]    = useState<string | null>(null);
  /** The actual condition of an arrival that brought no material. */
  const [materialNotice,     setMaterialNotice]     = useState<string | null>(null);
  const [externalPrompt,     setExternalPrompt]     = useState('');
  const [qiyamahReading,     setQiyamahReading]     = useState('');
  const [style,              setStyle]              = useState('cinematic');
  const [mediaType,          setMediaType]          = useState<'image' | 'video'>('image');
  const [durationSeconds,    setDurationSeconds]    = useState<number>(6);
  const [constructedPrompt,  setConstructedPrompt]  = useState('');
  // Tracks the initial Qiyamah expansion so the Creator can restore it after editing
  const [originalConstructedPrompt, setOriginalConstructedPrompt] = useState('');
  const [constructionError,  setConstructionError]  = useState<string | null>(null);
  const [generatedAssetUrl,  setGeneratedAssetUrl]  = useState<string | null>(null);
  const [generatedAssetType, setGeneratedAssetType] = useState<'image' | 'video' | null>(null);
  const [generationError,    setGenerationError]    = useState<string | null>(null);
  const [generationErrorReason, setGenerationErrorReason] = useState<string | null>(null);

  // ── Delete confirmation ─────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── PHASE D CLOSURE — editing an asset the Creator already owns ──────────
  //
  // The capability existed at POST /api/vault/assets/[assetId]/edit and nothing
  // in the Creator's experience could reach it. This is the entry, placed on
  // the card where the Creator already sees the asset — no new page, no second
  // engine, no second API. Article 3.1: editing inside an asset is Qiyamah's,
  // and this is Qiyamah.
  //
  // `editState` is one of: null (not editing) | 'ready' | 'running' | 'failed'.
  // Success is never shown from here — it is shown by the derived asset
  // appearing in the gallery, which only happens after it is really saved.
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState('');

  // ── animate-asset — a still brought into motion ──────────────────────────
  //
  // Chamber Truth: animate-asset, POST /api/vault/assets/[assetId]/animate.
  // Offered on the card where the image already is, like editing — and only
  // when the fleet has a model verified to take an image (animationModels).
  // The asset behind a generation card is found by exact equality of its
  // stored URI in the Creator's own Vault list, never by position.
  /** Contract §7's line while a production runs without an open request. */
  const [producingNotice, setProducingNotice] = useState<string | null>(null);
  const [animatingRecordId, setAnimatingRecordId] = useState<string | null>(null);
  const [animateAssetId, setAnimateAssetId] = useState<string | null>(null);
  const [animateInstruction, setAnimateInstruction] = useState('');
  const [animateModelId, setAnimateModelId] = useState<string>(animationModels[0]?.modelId ?? '');
  const [animateState, setAnimateState] = useState<'ready' | 'running' | 'failed'>('ready');
  const [animateError, setAnimateError] = useState<string | null>(null);
  const [animatedResult, setAnimatedResult] = useState<{ forRecordId: string; assetId: string; url: string } | null>(null);
  const [editState, setEditState] = useState<'ready' | 'running' | 'failed'>('ready');
  const [editError, setEditError] = useState<string | null>(null);
  const [editedAssetId, setEditedAssetId] = useState<string | null>(null);
  // Set only when the route refuses with 'requires-adoption' — Article 5.5.
  // The Creator is then offered the act that lifts it, rather than a dead end.
  const [needsAdoption, setNeedsAdoption] = useState(false);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const [isDragging,    setIsDragging]    = useState(false);
  const [isUploading,   setIsUploading]   = useState(false);
  const [uploadError,   setUploadError]   = useState<string | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<UploadedItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetchers ───────────────────────────────────────────────────────────
  const fetchGenerations = () => {
    fetch('/api/qiyamah/generations')
      .then((r) => r.json())
      .then((result) => { if (result.status === 'succeeded') setGenerations(result.generations); })
      .catch(() => { /* gallery is an enhancement, not a gate */ });
  };

  const fetchUploadedItems = () => {
    fetch('/api/vault/assets')
      .then((r) => r.json())
      .then((result) => {
        if (result.status !== 'succeeded' || !Array.isArray(result.assets)) return;
        const items: UploadedItem[] = result.assets
          .filter((a: { metadata?: { providerId?: string } }) => a.metadata?.providerId === 'creator-upload')
          .map((a: { assetId: string; secureStorageUri: string; capabilityTarget: string; createdAt: number }) => ({
            assetId:          a.assetId,
            url:              a.secureStorageUri ?? '',
            capabilityTarget: a.capabilityTarget ?? '',
            uploadedAt:       a.createdAt,
          }));
        setUploadedItems(items);
      })
      .catch(() => { /* silent */ });
  };

  /**
   * ─── MATERIAL FROM THE CHAMBER OF EVIDENCE ────────────────────────────────
   *
   *   Hujjah keeps an investigation in the Vault and crosses here with only
   *   its identity in `azma.transfer.investigation`. That envelope is journey
   *   state: read once, removed once. The material itself is the Vault asset,
   *   owned by the Creator, and it is resolved through the Vault's own list —
   *   `/api/vault/assets` answers only with what THIS session owns — so a
   *   stale or forged envelope naming someone else's asset resolves to
   *   nothing, and an anonymous visitor never gets this far (the identity
   *   check above sends them to the door first).
   *
   *   Where it lands is the one place Qiyamah can genuinely take text up:
   *   the idea input, from which the existing path — expand, then generate —
   *   turns it into an image or a video. Nothing is added to the interface;
   *   the material arrives inside a workflow that already exists.
   *
   *   `azma.qiyamah.material` keeps the identity for this tab so a refresh
   *   re-resolves the same asset instead of losing it. Identity only: the
   *   text is re-read from the Vault, never from the browser.
   */
  const resolveMaterialIntoIdea = (assetId: string) => {
    fetch('/api/vault/assets')
      .then((r) => r.json())
      .then((result: { status?: string; assets?: Array<{ assetId: string; metadata?: Record<string, unknown> }> }) =>
        // Ownership is decided by the Vault: the asset is either in this
        // Creator's list or it does not exist for them. A list we never got
        // is not an empty list, and `null` keeps those two apart.
        result.status === 'succeeded' && Array.isArray(result.assets) ? result.assets : null)
      .catch(() => null)
      .then((assets) => {
        const arrival = resolveArrival(assets, assetId);
        if (arrival.kind === 'arrived') {
          setInputMode('idea');
          setIdea(arrival.idea);
          setMaterialAssetId(assetId);
          setMaterialNotice(null);
          return;
        }
        // The material did not arrive. The chamber says which of the three
        // things happened rather than presenting an empty field as normal.
        if (arrival.kind === 'not-in-vault') {
          try { sessionStorage.removeItem(MATERIAL_KEY); } catch { /* ignore */ }
        }
        setMaterialNotice(spokenArrival(arrival));
      });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; displayName?: string | null }) => {
      // '/creator-access' — a route that has never existed. MEASURED on
      // production: https://azmaos.com/creator-access -> 404. Every visitor who
      // opened this chamber without a session was sent to «هذا المسار غير موجود
      // داخل الإمبراطورية» — stranded at the door by the guard meant to direct
      // them. Found by sweeping the journey adversarially rather than by any
      // test, because a guard that redirects somewhere wrong still "guards".
      //
      // '/signup' is the door: it carries the Google gate, and links to /login
      // for an account made before it.
        if (!data.authenticated) { goTo('/signup'); return; }
        setDisplayName(data.displayName ?? null);
        fetchGenerations();
        fetchUploadedItems();
        let materialAssetId: string | null = null;
        try { materialAssetId = takeMaterialIdentity(sessionStorage); } catch { /* no storage, no material shortcut */ }
        if (materialAssetId) resolveMaterialIntoIdea(materialAssetId);
      })
      .catch(() => goTo('/signup'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Upload handler ──────────────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/vault/assets/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.status === 'succeeded' && data.asset) {
        const newItem: UploadedItem = {
          assetId:          data.asset.assetId ?? '',
          url:              data.asset.secureStorageUri ?? '',
          capabilityTarget: data.asset.capabilityTarget ?? '',
          uploadedAt:       data.asset.createdAt ?? Date.now(),
        };
        setUploadedAsset(newItem);
        setUploadedItems((prev) => {
          const without = prev.filter((u) => u.assetId !== newItem.assetId);
          return [newItem, ...without];
        });
      } else {
        setUploadError(data.message ?? 'فشل الرفع — حاوِل مرة أخرى.');
      }
    } catch {
      setUploadError('البوابة لا تستجيب — حاوِل مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Stage: IDEA → CONSTRUCTING ──────────────────────────────────────────────
  const handleBuildScene = async () => {
    const isIdleInput = inputMode === 'idea' ? !idea.trim() : !externalPrompt.trim();
    if (isIdleInput) return;

    setStage('constructing');
    setConstructionError(null);

    try {
      let body: Record<string, string>;
      if (inputMode === 'idea') {
        body = { idea: idea.trim(), style };
      } else {
        body = { externalPrompt: externalPrompt.trim(), style, mode: 'external' };
      }

      const res = await fetch('/api/qiyamah/expand', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (data.status === 'succeeded') {
        if (inputMode === 'idea') {
          setConstructedPrompt(data.prompt);
          setOriginalConstructedPrompt(data.prompt);
        } else {
          setQiyamahReading(data.qiyamahReading);
          setConstructedPrompt(data.qiyamahReading);
          setOriginalConstructedPrompt(data.qiyamahReading);
        }
        setStage('review');
      } else {
        setConstructionError(data.message ?? 'فشل بناء المشهد — حاوِل مرة أخرى.');
        setStage('idea');
      }
    } catch {
      setConstructionError('البوابة لا تستجيب — حاوِل مرة أخرى.');
      setStage('idea');
    }
  };

  // ── Stage: REVIEW → GENERATING ──────────────────────────────────────────────
  /**
   * ─── A PRODUCTION'S TRUTH IS THE OPERATION, NOT THE SOCKET ────────────────
   *
   *   On 2026-09-22 operation ce90a828 finished — a 6 MB video deposited in
   *   the Founder's Vault — while this chamber said «البوابة لا تستجيب. أعِد
   *   المحاولة.» The connection had died at ~125 s; the production ran on for
   *   362 s. The message was true about the socket and false about the work,
   *   and «أعِد المحاولة» invited a second paid production for a video that
   *   already existed.
   *
   *   So a video request no longer waits on its own connection. It is
   *   accepted (202) with an operation id, and this observes that operation
   *   until the server says what became of it. A lost connection is now a
   *   reason to ASK, never a verdict.
   *
   *   `intentKey` is minted before the request and kept for the tab: if the
   *   202 itself is lost, the same key asks again and is handed the operation
   *   that already exists — no duplicate, no second charge.
   */
  const OPERATION_KEY = 'azma.qiyamah.videoOperation';

  function rememberOperation(record: { intentKey: string; operationId?: string }) {
    try { sessionStorage.setItem(OPERATION_KEY, JSON.stringify(record)); } catch { /* ignore */ }
  }
  function forgetOperation() {
    try { sessionStorage.removeItem(OPERATION_KEY); } catch { /* ignore */ }
  }
  function rememberedOperation(): { intentKey: string; operationId?: string } | null {
    try {
      const raw = sessionStorage.getItem(OPERATION_KEY);
      return raw ? (JSON.parse(raw) as { intentKey: string; operationId?: string }) : null;
    } catch { return null; }
  }

  /**
   * Follow one production to its end. Never turns a failed poll into a
   * verdict: an unanswered question is asked again.
   */
  async function observeProduction(operationId: string) {
    // Deliberately sets no state before it knows anything: the first thing
    // this does is await. A resumed production announces itself only once the
    // server has confirmed it is running — state from evidence, not from
    // intention (and no synchronous setState inside the resume effect).
    let announced = false;
    const deadline = Date.now() + 20 * 60 * 1000; // longer than any provider render
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      // Contract §5: the operation's fields are the response itself.
      let op: { state: string; producing: boolean; succeeded: boolean; assetUrl: string | null; failureReason: string | null } | null = null;
      try {
        const res = await fetch(`/api/qiyamah/operations/${operationId}`);
        if (res.ok) op = await res.json();
      } catch { /* the question went unanswered; ask again */ }
      if (!op) continue;
      if (op.producing) {
        if (!announced) {
          setStage('constructing');
          // Contract §7: while the operation is still working, this is what
          // the Creator is told — not a scene-building line written for a
          // request that is still open, because this one is not.
          setProducingNotice('الإنتاج ما زال جارياً.');
          setGenerationError(null);
          announced = true;
        }
        continue;
      }
      if (op.succeeded && op.assetUrl) {
        setProducingNotice(null);
        setGeneratedAssetUrl(op.assetUrl);
        setGeneratedAssetType('video');
        setStage('result');
        fetchGenerations();
        triggerInvitation();
        forgetOperation();
        return;
      }
      // A real, server-side terminal failure — the only kind that may be
      // shown as one.
      // A real, attributable failure — said in the Creator's language, with no
      // engine or model named (contract §5 with §10).
      setProducingNotice(null);
      setGenerationError(spokenFailure(op.failureReason));
      setStage('error');
      forgetOperation();
      return;
    }
    // Still running after the longest render we know of: say so truthfully —
    // this is not a failure, and the chamber does not call it one.
    setProducingNotice('الإنتاج ما زال جارياً.');
    setGenerationError('الإنتاج ما زال جارياً. سيظهر في معرضك فور اكتماله.');
    setStage('error');
  }

  /** Contract §5/§10: a true reason, in the Creator's words, naming no engine. */
  function spokenFailure(reason: string | null): string {
    switch (reason) {
      case 'CAPACITY_EXHAUSTED': return 'تعذّر إتمام الإنتاج — نفد رصيد الإمبراطوريّة لهذا النوع من الإنتاج.';
      case 'TOOK_TOO_LONG':      return 'تعذّر إتمام الإنتاج — استغرق وقتاً أطول من المسموح.';
      case 'OUTPUT_NOT_VIDEO':   return 'تعذّر إتمام الإنتاج — لم يكن الناتج فيديو صالحاً.';
      case 'NO_OUTPUT':          return 'تعذّر إتمام الإنتاج — انتهى دون ناتج.';
      case 'STORAGE_FAILED':     return 'تعذّر إتمام الإنتاج — لم يُحفَظ الناتج.';
      case 'REFUSED_BY_ENGINE':  return 'تعذّر إتمام الإنتاج — رُفض الطلب.';
      default:                   return 'تعذّر إتمام الإنتاج.';
    }
  }

  // On arrival, resume any production this tab started and never saw finish.
  // Deferred to the next tick so the resume can never touch state during the
  // effect itself — the chamber renders first, then asks the server.
  useEffect(() => {
    const kept = rememberedOperation();
    if (!kept) return;
    const timer = setTimeout(() => {
      if (kept.operationId) void observeProduction(kept.operationId);
      else void recoverByIntentKey(kept.intentKey);
    }, 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The 202 was lost before its operation id arrived. Ask the server whether
   * this intent already has a production — with the same key, so the answer
   * can only ever be the operation that exists.
   */
  async function recoverByIntentKey(intentKey: string) {
    try {
      const res = await fetch('/api/qiyamah/operations/by-intent/' + encodeURIComponent(intentKey));
      if (!res.ok) { forgetOperation(); return; }
      // Contract §6: { found, operationId, state }.
      const found = await res.json();
      if (found?.found && typeof found.operationId === 'string') {
        rememberOperation({ intentKey, operationId: found.operationId });
        void observeProduction(found.operationId);
      } else {
        forgetOperation();
      }
    } catch { /* leave it remembered; the next arrival asks again */ }
  }

  const handleEmbodyScene = async () => {
    if (!constructedPrompt.trim()) return;
    setStage('generating');
    setGenerationError(null);
    setGenerationErrorReason(null);
    try {
      const ideaForRecord = inputMode === 'idea' ? idea.trim() : externalPrompt.trim();
      const requestBody: Record<string, unknown> = {
        prompt: constructedPrompt.trim(),
        style,
        idea: ideaForRecord,
        mediaType,
      };
      if (mediaType === 'video') {
        requestBody['durationSeconds'] = durationSeconds;
      }
      // Minted BEFORE the request and remembered: this is what makes a lost
      // response recoverable instead of repeatable.
      const intentKey = (globalThis.crypto?.randomUUID?.() ?? String(Date.now()));
      if (mediaType === 'video') {
        requestBody['intentKey'] = intentKey;
        rememberOperation({ intentKey });
      }

      const response = await fetch('/api/qiyamah/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(requestBody),
      });
      // Guard: Cloudflare may return HTML (not JSON) on gateway timeout or 5xx intercept.
      // If the response is not JSON, surface the generic gateway error instead of
      // letting response.json() throw and losing the distinction between
      // a real provider failure (now 422, JSON) and a gateway timeout (non-JSON).
      const ct = response.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) {
        // The edge answered instead of AZMA. For a video this says nothing
        // about the production — it may be running right now — so the
        // chamber asks rather than declares.
        if (mediaType === 'video') {
          setGenerationError('انقطع الاتصال بالعملية. نتحقق من حالة الإنتاج…');
          void recoverByIntentKey(intentKey);
          return;
        }
        setGenerationError('البوابة لا تستجيب. أعِد المحاولة.');
        setStage('error');
        return;
      }
      const result = await response.json();
      // A video is ACCEPTED, not completed: its truth is the operation.
      if (result.status === 'accepted' && typeof result.operationId === 'string') {
        rememberOperation({ intentKey, operationId: result.operationId });
        void observeProduction(result.operationId);
        return;
      }
      if (result.status === 'succeeded') {
        setGeneratedAssetUrl(result.asset.assetUrl);
        setGeneratedAssetType(mediaType);
        setStage('result');
        fetchGenerations();
        triggerInvitation();
      } else {
        // The attempt's own id and the stage it broke at, so a failure the
        // Creator reports can be found in the server's trail rather than
        // reduced to «التوليد لم ينجح».
        const trace = typeof result.operationId === 'string'
          ? ` — العملية ${result.operationId.slice(0, 8)}${typeof result.stage === 'string' ? ` · ${result.stage}` : ''}`
          : '';
        setGenerationError((result.message ?? 'التوليد لم ينجح.') + trace);
        setGenerationErrorReason(result.reason ?? null);
        setStage('error');
      }
    } catch {
      // The socket broke. For a video that is not a verdict: the production
      // may be under way, and «أعِد المحاولة» would invite paying for it twice.
      const kept = rememberedOperation();
      if (mediaType === 'video' && kept) {
        setGenerationError('انقطع الاتصال بالعملية. نتحقق من حالة الإنتاج…');
        if (kept.operationId) void observeProduction(kept.operationId);
        else void recoverByIntentKey(kept.intentKey);
        return;
      }
      setGenerationError('البوابة لا تستجيب. أعِد المحاولة.');
      setStage('error');
    }
  };

  // ── Delete generation (from generation_records + vault_assets + disk) ──────
  const handleDeleteGeneration = async (recordId: string) => {
    try {
      const res = await fetch(`/api/qiyamah/generations/${recordId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'succeeded') {
        setGenerations((prev) => prev.filter((g) => g.recordId !== recordId));
        setDeleteConfirmId(null);
      }
    } catch { /* silent — gallery is enhancement */ }
  };

  // ── Delete uploaded vault asset ─────────────────────────────────────────────
  const handleDeleteUpload = async (assetId: string) => {
    try {
      const res = await fetch(`/api/vault/assets/${assetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'succeeded') {
        setUploadedItems((prev) => prev.filter((u) => u.assetId !== assetId));
        setDeleteConfirmId(null);
      }
    } catch { /* silent — gallery is enhancement */ }
  };

  // ── Reset: return to idea stage ─────────────────────────────────────────────
  const resetJourney = () => {
    setIdea('');
    setExternalPrompt('');
    setQiyamahReading('');
    setConstructedPrompt('');
    setOriginalConstructedPrompt('');
    setConstructionError(null);
    setGeneratedAssetUrl(null);
    setGeneratedAssetType(null);
    setMediaType('image');
    setDurationSeconds(6);
    setGenerationError(null);
    setGenerationErrorReason(null);
    setStage('idea');
  };

  const handleExit = () => {
    try {
      sessionStorage.setItem('azma.return.session', JSON.stringify({
        origin: 'qiyamah-chamber',
        constitutionalAct: 'creation',
      }));
    } catch { /* ignore */ }
    goTo('/imperial-foyer');
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const activeIndicatorStage: 'thought' | 'prompt' | 'visual' =
    stage === 'idea' || stage === 'constructing' ? 'thought'
    : stage === 'review'                          ? 'prompt'
    : 'visual';

  const isActivelyGenerating = stage === 'generating';

  const errorChamberState: ChamberState =
    generationErrorReason === 'unauthorized'       ? 'unauthorized'
    : generationErrorReason === 'payment-required' ? 'payment-required'
    : 'error';

  const [errorAction]    = (stage === 'error' && generationError)
    ? resolveAvailableActions({ threshold: 'chamber', chamberState: errorChamberState, chamber })
    : [];
  const [completeAction] = (stage === 'result')
    ? resolveAvailableActions({ threshold: 'chamber', chamberState: 'complete', chamber })
    : [];

  const hasGalleryContent = generations.length > 0 || uploadedItems.length > 0;

  const buildSceneDisabled = stage === 'constructing' || (inputMode === 'idea' ? !idea.trim() : !externalPrompt.trim());

  const StyleRegistry = ({ disabled }: { disabled?: boolean }) => (
    <div className="style-registry" role="radiogroup" aria-label="نمط التجسيد">
      <p className="style-registry-label">نمط التجسيد</p>
      <div className="style-registry-available">
        {ALL_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={style === s.id}
            className={`style-tile${style === s.id ? ' style-tile--selected' : ''}`}
            onClick={() => !disabled && setStyle(s.id)}
            disabled={disabled}
          >
            <span className="style-tile-name">{s.nameAr}</span>
            <span className="style-tile-tagline">{s.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /**
   * The Creator takes responsibility for an asset whose history predates the
   * sovereign model — Constitution Article 5.5.
   *
   * It invents no past. It records that the owner accepts building on it from
   * here, which is the one thing that can honestly be said about an asset
   * whose origin nobody can prove.
   */
  async function handleAdoptAsset(assetId: string) {
    setEditState('running');
    setEditError(null);
    try {
      const res = await fetch(`/api/vault/assets/${assetId}/adopt`, { method: 'POST' });
      const result = await res.json();
      if (result.status !== 'succeeded') {
        setEditError(result.message ?? 'تعذّر الاعتماد.');
        setEditState('failed');
        return;
      }
      // Adopted — the edit the Creator already asked for may now proceed.
      setNeedsAdoption(false);
      setEditState('ready');
      setEditError(null);
    } catch {
      setEditError('تعذّر الاتصال. لم يتغيّر شيء.');
      setEditState('failed');
    }
  }

  /**
   * Send an edit to the sovereign path and show only what actually happened.
   *
   * It does NOT construct an asset, a lineage or a storage path — the route
   * does all of that through deriveAsset and depositAsset. This function's only
   * jobs are to ask, to wait honestly, and to refresh the gallery so the
   * Creator sees the real derived asset rather than a claim about it.
   */
  async function openAnimate(record: GenerationRecord) {
    setAnimateError(null);
    setAnimateState('ready');
    setAnimateInstruction('');
    setAnimatedResult(null);
    // The sovereign identity behind this card: the Vault asset whose stored
    // URI equals this generation's. Owner-scoped list; exact key; no guess.
    try {
      const listed = await fetch('/api/vault/assets').then((r) => r.json());
      const match = listed.status === 'succeeded'
        ? (listed.assets as { assetId: string; secureStorageUri?: string }[]).filter((a) => a.secureStorageUri === record.assetUrl)
        : [];
      if (match.length !== 1) {
        setAnimateAssetId(null);
        setAnimateError('لم تُعثر على هذه الصورة في خزائنك.');
        setAnimateState('failed');
        setAnimatingRecordId(record.recordId);
        return;
      }
      setAnimateAssetId(match[0].assetId);
      setAnimatingRecordId(record.recordId);
    } catch {
      setAnimateError('البوابة لا تستجيب. أعِد المحاولة.');
      setAnimateState('failed');
      setAnimatingRecordId(record.recordId);
    }
  }

  async function handleAnimateAsset() {
    const instruction = animateInstruction.trim();
    if (!animateAssetId || instruction.length === 0 || !animateModelId) return;
    setAnimateState('running');
    setAnimateError(null);
    try {
      const res = await fetch(`/api/vault/assets/${animateAssetId}/animate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          modelId: animateModelId,
          // The chosen model's own verified duration — the fleet's, not a number written here.
          durationSeconds: animationModels.find((m) => m.modelId === animateModelId)?.durationSeconds ?? 5,
        }),
      });
      const result = await res.json();
      if (result.status !== 'succeeded') {
        const trace = typeof result.operationId === 'string' ? ` — العملية ${result.operationId.slice(0, 8)}` : '';
        setAnimateError((result.message ?? 'تعذّر تنفيذ التحريك.') + trace);
        setAnimateState('failed');
        return;
      }
      // Said only once the derived asset is really in the Vault: the gallery
      // is re-read from the server, and the video shown is the stored file.
      fetchGenerations();
      setAnimatedResult({ forRecordId: animatingRecordId ?? '', assetId: result.asset.assetId, url: result.asset.secureStorageUri });
      setAnimateState('ready');
      setAnimatingRecordId(null);
    } catch {
      setAnimateError('البوابة لا تستجيب. أعِد المحاولة.');
      setAnimateState('failed');
    }
  }

  async function handleEditAsset(assetId: string) {
    const instruction = editInstruction.trim();
    if (instruction.length === 0) return;

    setEditState('running');
    setEditError(null);
    setEditedAssetId(null);
    setNeedsAdoption(false);

    try {
      const res = await fetch(`/api/vault/assets/${assetId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });
      const result = await res.json();

      if (result.status !== 'succeeded') {
        // The route already speaks Arabic and names no engine. Shown as it is.
        setEditError(result.message ?? 'تعذّر تنفيذ التعديل.');
        // A legacy asset is not a failure — it is a consent the owner has not
        // yet given. Offer the act instead of leaving them at a wall.
        setNeedsAdoption(result.reason === 'requires-adoption');
        setEditState('failed');
        return;
      }

      // The derived asset is real and saved. Re-read the Vault rather than
      // inserting a local guess — what the Creator sees is what was stored.
      const listed = await fetch('/api/vault/assets').then((r) => r.json());
      if (listed.status === 'succeeded') {
        const items: UploadedItem[] = listed.assets
          .filter((a: { secureStorageUri?: string }) => Boolean(a.secureStorageUri))
          .map((a: { assetId: string; secureStorageUri: string; capabilityTarget: string; createdAt: number }) => ({
            assetId: a.assetId,
            url: a.secureStorageUri,
            capabilityTarget: a.capabilityTarget,
            uploadedAt: a.createdAt,
          }));
        setUploadedItems(items);
      }

      setEditedAssetId(result.asset.assetId);
      setEditState('ready');
      setEditingAssetId(null);
      setEditInstruction('');
    } catch {
      setEditError('تعذّر الاتصال. لم يُحفظ شيء.');
      setEditState('failed');
    }
  }

  return (
    <main className="qiyamah-viewport">
      <ChamberDemonstration
        chamberId="qiyamah-chamber"
        outcomeAr="صورةٌ أو فيديو أصليّ، محفوظٌ في خزانتك باسمك — لا معاينةً تزول بإغلاق الصفحة."
        stepsAr={[
            'صِف فكرتك في جملةٍ أو جملتين، أو أحضر محثّك الجاهز.',
            'اختر ما تُريده: صورة أم فيديو، وبأيّ نمطٍ بصريّ.',
            'ابنِ المشهد — تقرأ القيامة فكرتك وتوسّعها قبل التجسيد.',
            'جسِّد. الناتج يُودَع خزانتك فور اكتماله.',
        ]}
      />


      {/* ── Background ─────────────────────────────────────────────────── */}
      <div className="forge-background" aria-hidden="true">
        <div className="crimson-nebula" />
        <div className="cyber-grid-red" />
      </div>

      {/* ── Header Strip ───────────────────────────────────────────────── */}
      <header className="qiyamah-header">
        <button className="sovereign-exit-btn" onClick={handleExit}>
          ⮜ قلب الإمبراطورية
        </button>

        <div className="qiyamah-identity">
          <span className="chamber-label">حجرة القيامة</span>
          {chamberVision && (
            <span className="chamber-vision-ar" title={chamberVision.philosophy}>
              {chamberVision.philosophyAr}
            </span>
          )}
          {/* MEASURED by walking in as a visitor 2026-09-24: this line read
              «ENTER WITH AN IDEA — LEAVE WITH A REAL, SAVED IMAGE» to every
              Creator, above their own name in Arabic. The Chamber's vision is
              already said in Arabic directly above it, so this was the same
              promise in a tongue the Empire does not speak. Removed, not
              hidden — the Remove-not-cover rule. */}
          <span className="creator-name">
            {displayName ? `أهلاً، ${displayName}` : 'أهلاً بك'}
          </span>
        </div>

        <div className={`generation-status${isActivelyGenerating ? ' status-active' : ''}`}>
          <span className="status-dot" />
          <span className="status-text">{isActivelyGenerating ? 'قيد التوليد' : 'جاهزة'}</span>
        </div>
      </header>

      {/* ── Journey Indicator ──────────────────────────────────────────── */}
      <nav className="stage-indicator" aria-label="مراحل القيامة">
        <span className={`stage-step${activeIndicatorStage === 'thought' ? ' is-active' : ''}`}>
          الفكرة
        </span>
        <span className="stage-arrow" aria-hidden="true">→</span>
        <span className={`stage-step${activeIndicatorStage === 'prompt' ? ' is-active' : ''}`}>
          المشهد
        </span>
        <span className="stage-arrow" aria-hidden="true">→</span>
        <span className={`stage-step${activeIndicatorStage === 'visual' ? ' is-active' : ''}`}>
          التجسيد
        </span>
      </nav>

      {/* ── Main Workspace ─────────────────────────────────────────────── */}
      <div className="qiyamah-workspace">

        {/* Generation Section */}
        <section className="genesis-section">
          <span className="section-label">بؤرة التوليد</span>

          {/* Provider unavailable — truthful blocked state */}
          {!generationAvailable &&
            stage !== 'generating' &&
            stage !== 'result' &&
            stage !== 'error' && (
            <div className="provider-unavailable" role="status">
              <span className="unavailable-icon" aria-hidden="true">◎</span>
              <p className="unavailable-title">بؤرة التوليد في انتظار مزود</p>
              <p className="unavailable-sub">
                Image generation requires a provider credential to be configured on this server.
              </p>
            </div>
          )}

          {/* ── STAGE: IDEA / CONSTRUCTING ─────────────────────────────── */}
          {generationAvailable &&
            (stage === 'idea' || stage === 'constructing') && (
            <div className="genesis-form">

              {/* Mode tab switcher */}
              <div className="mode-tab-switcher" role="tablist" aria-label="وضع الإدخال">
                <button
                  role="tab"
                  aria-selected={inputMode === 'idea'}
                  className={`mode-tab${inputMode === 'idea' ? ' mode-tab--active' : ''}`}
                  onClick={() => setInputMode('idea')}
                  disabled={stage === 'constructing'}
                >
                  فكرة بسيطة
                </button>
                <button
                  role="tab"
                  aria-selected={inputMode === 'external'}
                  className={`mode-tab${inputMode === 'external' ? ' mode-tab--active' : ''}`}
                  onClick={() => setInputMode('external')}
                  disabled={stage === 'constructing'}
                >
                  محث جاهز
                </button>
              </div>

              <div className="pulse-core" />

              {inputMode === 'idea' ? (
                <>
                  <p className="genesis-invitation">
                    أعطِ القيامة فكرتك — وهي تحوّلها إلى مشهد سيادي.
                  </p>
                  <div className="idea-field-group">
                    <label className="idea-field-label" htmlFor="qiyamah-idea">
                      {materialAssetId && idea.trim().length > 0 ? 'فكرتك — من تحقيقك في حجّة الدامغة' : 'فكرتك'}
                    </label>
                    <textarea
                      id="qiyamah-idea"
                      className="idea-textarea"
                      placeholder="أي فكرة بسيطة — في جملة أو جملتين…"
                      value={idea}
                      onChange={(e) => { setIdea(e.target.value); setMaterialNotice(null); if (e.target.value.trim().length === 0) setMaterialAssetId(null); }}
                      rows={3}
                      disabled={stage === 'constructing'}
                    />
                    {materialNotice && <p className="material-notice">{materialNotice}</p>}
                  </div>
                </>
              ) : (
                <>
                  <p className="genesis-invitation">
                    أحضِر محثك الخاص — وستقرأه القيامة وتقترح صياغتها.
                  </p>
                  <div className="idea-field-group">
                    <label className="idea-field-label" htmlFor="qiyamah-external">
                      محثك الجاهز
                    </label>
                    <textarea
                      id="qiyamah-external"
                      className="idea-textarea"
                      placeholder="اكتب محثك الخاص بأي لغة…"
                      value={externalPrompt}
                      onChange={(e) => setExternalPrompt(e.target.value)}
                      rows={4}
                      disabled={stage === 'constructing'}
                    />
                  </div>
                </>
              )}

              <StyleRegistry disabled={stage === 'constructing'} />

              {/* Media type toggle — صورة / فيديو */}
              <div className="media-type-toggle" role="radiogroup" aria-label="نوع المحتوى">
                <button
                  role="radio"
                  aria-checked={mediaType === 'image'}
                  className={`media-type-btn${mediaType === 'image' ? ' media-type-btn--active' : ''}`}
                  onClick={() => setMediaType('image')}
                  disabled={stage === 'constructing'}
                >
                  صورة
                </button>
                <button
                  role="radio"
                  aria-checked={mediaType === 'video'}
                  className={`media-type-btn${mediaType === 'video' ? ' media-type-btn--active' : ''}`}
                  onClick={() => setMediaType('video')}
                  disabled={stage === 'constructing'}
                >
                  فيديو
                </button>
              </div>

              {mediaType === 'video' && (
                <div className="duration-picker" role="group" aria-label="مدة الفيديو">
                  <p className="duration-label">مدة الفيديو</p>
                  <div className="duration-options">
                    {([4, 6, 8] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`duration-btn${durationSeconds === d ? ' duration-btn--active' : ''}`}
                        onClick={() => setDurationSeconds(d)}
                        disabled={stage === 'constructing'}
                      >
                        {d}ث
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {constructionError && (
                <p className="construction-error" role="alert">{constructionError}</p>
              )}

              {stage === 'constructing' ? (
                <div className="construction-progress">
                  <div className="construction-spinner" aria-hidden="true" />
                  <p className="construction-text pulse-text">
                    {producingNotice ?? (inputMode === 'idea' ? 'القيامة تبني المشهد السيادي…' : 'القيامة تقرأ محثك…')}
                  </p>
                </div>
              ) : (
                <button
                  className="trigger-genesis-btn"
                  onClick={handleBuildScene}
                  disabled={buildSceneDisabled}
                >
                  {inputMode === 'idea' ? 'بناء المشهد ⭍' : 'اقرأ المحث ⭍'}
                </button>
              )}
            </div>
          )}

          {/* ── STAGE: REVIEW ──────────────────────────────────────────── */}
          {stage === 'review' && inputMode === 'idea' && (
            <div className="genesis-form review-form">
              {/* Two-panel: original idea (read-only) + Qiyamah scene (editable) */}
              <div className="external-comparison">
                <div className="comparison-panel">
                  <p className="comparison-label">فكرتك الأصلية</p>
                  <p className="comparison-text">{idea}</p>
                  <p className="comparison-style-tag">
                    {ALL_STYLES.find((s) => s.id === style)?.nameAr ?? style}
                  </p>
                </div>
                <div className="comparison-divider" aria-hidden="true">→</div>
                <div className="comparison-panel comparison-panel--reading">
                  <p className="comparison-label">المشهد الذي فهمته القيامة</p>
                  <p className="comparison-text">{originalConstructedPrompt}</p>
                </div>
              </div>

              <div className="external-prompt-choice">
                <p className="external-choice-label">المشهد النهائي للتجسيد — عدّله إن شئت</p>
                <textarea
                  className="idea-textarea"
                  value={constructedPrompt}
                  onChange={(e) => setConstructedPrompt(e.target.value)}
                  rows={4}
                  aria-label="المشهد النهائي — قابل للتعديل"
                />
                <div className="choice-shortcuts">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setConstructedPrompt(idea)}
                  >
                    أبقِ فكرتي كما هي
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setConstructedPrompt(originalConstructedPrompt)}
                  >
                    استعِد فهم القيامة
                  </button>
                </div>
              </div>

              <button
                className="trigger-genesis-btn"
                onClick={handleEmbodyScene}
                disabled={!constructedPrompt.trim()}
              >
                جسّد الفكرة ⭍
              </button>

              <button className="back-idea-btn" onClick={() => setStage('idea')}>
                ← تعديل الفكرة
              </button>
            </div>
          )}

          {stage === 'review' && inputMode === 'external' && (
            <div className="genesis-form review-form">
              <div className="external-comparison">
                <div className="comparison-panel">
                  <p className="comparison-label">محثك الأصلي</p>
                  <p className="comparison-text">{externalPrompt}</p>
                </div>
                <div className="comparison-divider" aria-hidden="true">→</div>
                <div className="comparison-panel comparison-panel--reading">
                  <p className="comparison-label">المشهد الذي فهمته القيامة</p>
                  <p className="comparison-text">{qiyamahReading}</p>
                </div>
              </div>

              <div className="external-prompt-choice">
                <p className="external-choice-label">المشهد النهائي للتجسيد — عدّله إن شئت</p>
                <textarea
                  className="idea-textarea"
                  value={constructedPrompt}
                  onChange={(e) => setConstructedPrompt(e.target.value)}
                  rows={4}
                  aria-label="المشهد النهائي — قابل للتعديل"
                />
                <div className="choice-shortcuts">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setConstructedPrompt(externalPrompt)}
                  >
                    استخدم محثي الأصلي
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setConstructedPrompt(originalConstructedPrompt)}
                  >
                    استعِد فهم القيامة
                  </button>
                </div>
              </div>

              <button
                className="trigger-genesis-btn"
                onClick={handleEmbodyScene}
                disabled={!constructedPrompt.trim()}
              >
                جسّد الفكرة ⭍
              </button>

              <button className="back-idea-btn" onClick={() => setStage('idea')}>
                ← تعديل المحث
              </button>
            </div>
          )}

          {/* ── STAGE: GENERATING ──────────────────────────────────────── */}
          {stage === 'generating' && (
            <div className="genesis-progress">
              <div className="progress-circle">
                <span className="ritual-glyph">✦</span>
              </div>
              <p className="generating-text pulse-text">
                {mediaType === 'video'
                  ? 'يتم الآن توليد الفيديو السيادي...'
                  : 'تتم الآن عملية النفخ والبعث الرقمي...'}
              </p>
            </div>
          )}

          {/* ── STAGE: ERROR ───────────────────────────────────────────── */}
          {stage === 'error' && generationError && (
            <div className="error-state">
              <div className="error-icon">⚠</div>
              <p className="error-message">{generationError}</p>
              {errorAction ? (
                errorAction.kind === 'navigate' ? (
                  <a className="trigger-genesis-btn error-action-link" href={errorAction.href}>
                    {t(dict, errorAction.labelKey)}
                  </a>
                ) : (
                  <button className="trigger-genesis-btn" onClick={resetJourney}>
                    {t(dict, errorAction.labelKey)}
                  </button>
                )
              ) : (
                <button className="trigger-genesis-btn" onClick={resetJourney}>
                  حاوِل مرة أخرى
                </button>
              )}
            </div>
          )}

          {/* ── STAGE: RESULT ──────────────────────────────────────────── */}
          {stage === 'result' && (
            <div className="master-result">
              <div className="master-badge">
                {generatedAssetType === 'video' ? '✨ الفيديو السيادي المكتمل ✨' : '✨ الماستر السيادي المكتمل ✨'}
              </div>
              {generatedAssetType === 'video' && generatedAssetUrl && (
                <video
                  className="master-preview-video"
                  src={generatedAssetUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  aria-label="الفيديو السيادي المُولَّد"
                />
              )}
              {generatedAssetType !== 'video' && generatedAssetUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="master-preview"
                  src={generatedAssetUrl}
                  alt="الماستر السيادي المُولَّد"
                />
              )}
              <p className="closing-beat">
                {displayName
                  ? <><strong>{displayName}</strong>، هذا الآن جزء من إرثك السيادي.</>
                  : <>تم التخليق. هذا الآن جزء من إرثك السيادي.</>}
              </p>
              <div className="result-actions">
                {generatedAssetUrl && (
                  <a
                    className="download-btn"
                    href={generatedAssetUrl}
                    download
                  >
                    {generatedAssetType === 'video' ? 'تحميل الفيديو ↓' : 'تحميل الصورة ↓'}
                  </a>
                )}
                {completeAction && (
                  <button className="trigger-genesis-btn" onClick={resetJourney}>
                    {t(dict, completeAction.labelKey)}
                  </button>
                )}
                <button
                  className="vault-path-btn"
                  onClick={() => window.location.assign('/sovereign-vault-palace')}
                >
                  📥 عرض في القصر السيادي
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Upload Section (secondary — below generation, visually reduced) */}
        <section className="upload-section upload-section--secondary">
          <span className="section-label upload-section-label">رفع أصل سيادي</span>
          <p className="upload-invitation">
            ارفع ملفاً من جهازك وسيُودَع مباشرة في خزانتك السيادية.
          </p>

          {!uploadedAsset ? (
            <>
              <div
                className={`upload-zone${isDragging ? ' upload-zone--dragging' : ''}${isUploading ? ' upload-zone--uploading' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) void uploadFile(file);
                }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="اسحب ملفاً أو انقر للاختيار"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFile(file);
                    e.target.value = '';
                  }}
                />
                {isUploading ? (
                  <span className="upload-zone-label pulse-text">جارٍ الرفع...</span>
                ) : (
                  <>
                    <span className="upload-zone-icon">⬆</span>
                    <span className="upload-zone-label">اسحب هنا أو انقر للاختيار</span>
                    <span className="upload-zone-hint">صورة · فيديو · صوت — حتى 50MB</span>
                  </>
                )}
              </div>
              {uploadError && <p className="upload-error">{uploadError}</p>}
            </>
          ) : (
            <div className="upload-success">
              <div className="success-badge">✓ وصل الأصل إلى خزانتك السيادية</div>

              {uploadedAsset.capabilityTarget === 'VISUAL' && uploadedAsset.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="uploaded-preview" src={uploadedAsset.url} alt="الأصل المرفوع" />
              )}
              {uploadedAsset.capabilityTarget === 'MOTION' && uploadedAsset.url && (
                <video
                  className="uploaded-preview uploaded-preview-video"
                  src={uploadedAsset.url}
                  controls
                  preload="metadata"
                />
              )}
              {uploadedAsset.capabilityTarget === 'AUDIO' && uploadedAsset.url && (
                <audio
                  className="uploaded-preview-audio"
                  src={uploadedAsset.url}
                  controls
                  preload="metadata"
                />
              )}

              <div className="upload-actions">
                <button
                  className="vault-path-btn"
                  onClick={() => window.location.assign('/sovereign-vault-palace')}
                >
                  📥 عرض في القصر السيادي
                </button>
                <button className="secondary-btn" onClick={() => setUploadedAsset(null)}>
                  رفع أصل آخر
                </button>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ── Gallery — only when the Creator has real content ───────────── */}
      {hasGalleryContent && (
        <section className="your-generations" aria-label="الإرث السيادي">
          <h3>إرثك السيادي</h3>
          <div className="generations-grid">

            {generations.map((g) => (
              <div className="generation-card" key={g.recordId}>
                <span className="gallery-type-badge badge-generated">مُولَّد</span>
                {g.mediaType === 'video' ? (
                  g.assetUrl ? (
                    <video
                      className="generation-thumb generation-thumb-video"
                      src={g.assetUrl}
                      muted
                      preload="metadata"
                      aria-label="معاينة الفيديو المُولَّد"
                    />
                  ) : (
                    <div className="gallery-video-placeholder">
                      <span className="gallery-video-placeholder-icon">▶</span>
                      <span className="gallery-video-placeholder-text">فيديو</span>
                    </div>
                  )
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="generation-thumb" src={g.assetUrl} alt={g.prompt} />
                )}
                <div className="generation-meta">
                  <p className="generation-prompt">{g.originalIdea ?? g.prompt}</p>
                  <span className="generation-date">
                    {new Date(g.generatedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="generation-card-actions">
                  {deleteConfirmId === g.recordId ? (
                    <div className="delete-confirm">
                      <p className="delete-confirm-text">حذف هذا الأصل نهائيًا؟</p>
                      <div className="delete-confirm-btns">
                        <button
                          className="delete-confirm-yes"
                          onClick={() => void handleDeleteGeneration(g.recordId)}
                        >
                          نعم، احذف
                        </button>
                        <button
                          className="delete-confirm-cancel"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card-action-row">
                      <a
                        className="gallery-download-btn"
                        href={g.assetUrl}
                        download
                        aria-label={g.mediaType === 'video' ? 'تحميل هذا الفيديو' : 'تحميل هذه الصورة'}
                      >
                        ↓
                      </a>
                      {/* Offered only for images, and only when a model verified to
                          animate an image is active — the page derives that from the
                          fleet. No model, no control. */}
                      {g.mediaType !== 'video' && animationModels.length > 0 && (
                        <button
                          className="gallery-edit-btn gallery-animate-btn"
                          aria-label="حرّك هذه الصورة"
                          onClick={() => void openAnimate(g)}
                        >
                          ▶
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        aria-label="حذف هذا التوليد"
                        onClick={() => setDeleteConfirmId(g.recordId)}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {animatingRecordId === g.recordId && (
                    <div className="asset-edit-panel asset-animate-panel">
                      <label className="asset-edit-label" htmlFor={`animate-${g.recordId}`}>
                        كيف تريد أن تتحرّك هذه الصورة؟
                      </label>
                      <textarea
                        id={`animate-${g.recordId}`}
                        className="asset-edit-input"
                        value={animateInstruction}
                        onChange={(e) => setAnimateInstruction(e.target.value)}
                        placeholder="مثال: أبقِ التكوين كما هو بينما تتقدّم الكاميرا ببطء ويتغيّر الضوء طبيعياً."
                        rows={3}
                        maxLength={1000}
                        disabled={animateState === 'running'}
                      />
                      {/* The model is a real choice only when the fleet offers more
                          than one; a single model is stated, not dressed as a menu. */}
                      {animationModels.length === 1 ? (
                        <p className="asset-animate-model">النموذج: {animationModels[0].displayName}</p>
                      ) : (
                        <div className="asset-animate-models" role="radiogroup" aria-label="نموذج الحركة">
                          {animationModels.map((m) => (
                            <label key={m.modelId} className="asset-animate-model-option">
                              <input
                                type="radio"
                                name={`animate-model-${g.recordId}`}
                                value={m.modelId}
                                checked={animateModelId === m.modelId}
                                onChange={() => setAnimateModelId(m.modelId)}
                                disabled={animateState === 'running'}
                              />
                              {m.displayName}
                            </label>
                          ))}
                        </div>
                      )}
                      {animateState === 'running' && (
                        <p className="asset-edit-status" role="status">
                          التحريك قيد التنفيذ — قد يستغرق دقائق. لا تغلق الصفحة.
                        </p>
                      )}
                      {animateState === 'failed' && animateError && (
                        <p className="asset-edit-error" role="alert">{animateError}</p>
                      )}
                      <div className="asset-edit-actions">
                        <button
                          className="asset-edit-run asset-animate-run"
                          disabled={animateState === 'running' || !animateAssetId || animateInstruction.trim().length === 0}
                          onClick={() => void handleAnimateAsset()}
                        >
                          {animateState === 'running' ? 'جارٍ…' : 'حرّك'}
                        </button>
                        <button
                          className="asset-edit-cancel"
                          disabled={animateState === 'running'}
                          onClick={() => { setAnimatingRecordId(null); setAnimateError(null); }}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Shown only after the derived video is really in the Vault: the
                      src is the stored file, and the gallery above was re-read. */}
                  {animatedResult && animatedResult.forRecordId === g.recordId && (
                    <div className="asset-animate-result">
                      <video className="generation-thumb generation-thumb-video asset-animate-video" src={animatedResult.url} controls playsInline />
                      <p className="asset-edit-status">تحرّكت الصورة وحُفظ الفيديو أصلاً جديداً في خزائنك.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {uploadedItems.map((u) => (
              <div className="generation-card" key={u.assetId}>
                <span className="gallery-type-badge badge-uploaded">مرفوع</span>
                {u.capabilityTarget === 'VISUAL' && u.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="generation-thumb"
                    src={u.url}
                    alt="أصل مرفوع"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {u.capabilityTarget === 'MOTION' && u.url && (
                  <video
                    className="generation-thumb"
                    src={u.url}
                    muted
                    preload="metadata"
                    aria-label="معاينة الفيديو المرفوع"
                  />
                )}
                {u.capabilityTarget === 'AUDIO' && u.url && (
                  <audio
                    className="gallery-audio-thumb"
                    src={u.url}
                    controls
                    preload="metadata"
                  />
                )}
                <div className="generation-meta">
                  <p className="generation-prompt">أصل مرفوع</p>
                  <span className="generation-date">
                    {new Date(u.uploadedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="generation-card-actions">
                  {deleteConfirmId === u.assetId ? (
                    <div className="delete-confirm">
                      <p className="delete-confirm-text">حذف هذا الأصل نهائيًا؟</p>
                      <div className="delete-confirm-btns">
                        <button
                          className="delete-confirm-yes"
                          onClick={() => void handleDeleteUpload(u.assetId)}
                        >
                          نعم، احذف
                        </button>
                        <button
                          className="delete-confirm-cancel"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card-action-row">
                      {u.url && (
                        <a
                          className="gallery-download-btn"
                          href={u.url}
                          download
                          aria-label="تحميل هذا الأصل"
                        >
                          ↓
                        </a>
                      )}
                      {/* Offered only for images, because only images can be
                          edited today. A control for a capability that does not
                          exist is a promise the Empire cannot keep. */}
                      {u.capabilityTarget === 'VISUAL' && (
                        <button
                          className="gallery-edit-btn"
                          aria-label="تعديل هذه الصورة"
                          onClick={() => {
                            setEditingAssetId(u.assetId);
                            setEditInstruction('');
                            setEditState('ready');
                            setEditError(null);
                          }}
                        >
                          ✎
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        aria-label="حذف هذا الأصل"
                        onClick={() => setDeleteConfirmId(u.assetId)}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {editingAssetId === u.assetId && (
                    <div className="asset-edit-panel">
                      <label className="asset-edit-label" htmlFor={`edit-${u.assetId}`}>
                        ما الذي تريد تغييره في هذه الصورة؟
                      </label>
                      <textarea
                        id={`edit-${u.assetId}`}
                        className="asset-edit-input"
                        value={editInstruction}
                        onChange={(e) => setEditInstruction(e.target.value)}
                        placeholder="مثال: غيّر الخلفية إلى رفوف مكتبة خشبية، وأبقِ الباقي كما هو."
                        rows={3}
                        maxLength={1000}
                        disabled={editState === 'running'}
                      />

                      {editState === 'running' && (
                        <p className="asset-edit-status" role="status">
                          التعديل قيد التنفيذ… لا تغلق الصفحة.
                        </p>
                      )}

                      {editState === 'failed' && editError && (
                        <p className="asset-edit-error" role="alert">{editError}</p>
                      )}

                      {needsAdoption && (
                        <button
                          className="asset-adopt-btn"
                          onClick={() => void handleAdoptAsset(u.assetId)}
                        >
                          اعتمد هذا الأصل
                        </button>
                      )}

                      <div className="asset-edit-actions">
                        <button
                          className="asset-edit-run"
                          disabled={editState === 'running' || editInstruction.trim().length === 0}
                          onClick={() => void handleEditAsset(u.assetId)}
                        >
                          {editState === 'running' ? 'جارٍ…' : 'نفّذ التعديل'}
                        </button>
                        <button
                          className="asset-edit-cancel"
                          disabled={editState === 'running'}
                          onClick={() => { setEditingAssetId(null); setEditError(null); }}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Said only after the derived asset is really in the Vault —
                      the gallery above has already been re-read from it. */}
                  {editedAssetId && editedAssetId === u.assetId && (
                    <p className="asset-edit-saved" role="status">
                      حُفظت النسخة الجديدة في خزائنك.
                    </p>
                  )}
                </div>
              </div>
            ))}

          </div>
        </section>
      )}

    </main>
  );
}
