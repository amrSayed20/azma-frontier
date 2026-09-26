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
  /**
   * The sovereign asset this generation became.
   *
   * FOUND 2026-09-25: editing was offered on uploaded assets alone, and the
   * reason was not a hidden control — this record never carried which asset
   * the Chamber had created, so there was nothing to act on. Null on records
   * written before the link was declared.
   */
  readonly assetId?:    string | null;
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
  readonly animationModels?:    readonly { readonly modelId: string; readonly nameAr: string; readonly noteAr?: string; readonly durationSeconds: number }[];
  /**
   * Every duration the designated models can actually produce, in order, read
   * from the fleet. The Chamber offered 4, 6 and 8 written by hand while the
   * cinematic model is verified to 56 seconds.
   */
  readonly durationLadder?:     readonly number[];
  /** The shapes every designated VIDEO model accepts — horizontal, vertical, square. */
  readonly aspectOptions?:      readonly string[];
  /** The shapes every designated IMAGE model accepts. A picture has a shape too. */
  readonly imageAspectOptions?: readonly string[];
}

export function QiyamahChamberClient({
  dict,
  chamberVision,
  generationAvailable = true,
  animationModels = [],
  durationLadder = [],
  aspectOptions = [],
  imageAspectOptions = [],
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
  /**
   * ── FOUR ACTS, NOT TWO ──────────────────────────────────────
   *
   *   The Founder, 2026-09-25: «مربعات الانتاج صوره او فيديو فقط اين مربع
   *   اختيار التعديل؟» — and again, plainly: «اريد حقل اختيار مثل
   *   بطاقه صوره وفيديو وتعديل وانفوجرافيك — لا بالاسفل.»
   *
   *   I had put editing and the infographic where they were true but unseen:
   *   editing on a card at the bottom of the gallery, the infographic as the
   *   fourteenth style tile of fourteen. Both were reachable and neither was
   *   an act a Creator could choose when deciding what to make. They are four
   *   acts of creation, and the Chamber of creation offers four.
   */
  const [mediaType,          setMediaType]          = useState<'image' | 'video' | 'edit' | 'infographic'>('image');
  const [durationSeconds,    setDurationSeconds]    = useState<number>(6);
  // The shape of the scene. Defaults to the first the designated models all
  // accept, so a Creator who never touches it still gets something valid.
  const [aspectRatio,        setAspectRatio]        = useState<string>('16:9');
  // Which fleet's shapes are offered follows the act: a clip's fleet for a
  // clip, a picture's for a picture. An edit keeps the shape of its source.
  /** A clip is made from a described idea, or from a still the Creator owns. */
  const [videoSource, setVideoSource] = useState<'idea' | 'asset'>('idea');

  const shapesForAct = mediaType === 'video' ? aspectOptions : imageAspectOptions;

  /**
   * Acts that begin from something the Creator already owns. They take an
   * asset and an instruction; an idea, a style, a duration and a shape all
   * belong to the thing being made from nothing, and are not asked for here.
   */
  const actsOnOwnAsset = mediaType === 'edit' || (mediaType === 'video' && videoSource === 'asset');

  /**
   * ── WHAT THIS WILL COST, BEFORE IT IS SPENT ───────────────────────────
   *
   *   FOUND 2026-09-26: the engine for this was complete — cost engine,
   *   credit ledger, trial service, its own comment reading «Creator must
   *   know cost BEFORE creation starts» — and no chamber in the Empire
   *   called it. Nothing new is built here. A door is opened.
   */
  /**
   * ── THE RESULT'S OWN NAME ─────────────────────────────────────────────
   *
   *   The Chamber showed a Creator the asset it had just made for them and
   *   did not know WHICH asset it was: the id came back in the response and
   *   was thrown away. So nothing could be done to a fresh result without
   *   scrolling to the gallery and finding it again by eye — the one thing
   *   the newest creation workspaces do not make anyone do.
   */
  const [generatedAssetId, setGeneratedAssetId] = useState<string | null>(null);

  const [upscaleState, setUpscaleState] = useState<'idle' | 'running' | 'ready' | 'failed'>('idle');
  const [upscaleError, setUpscaleError] = useState<string | null>(null);

  const [cost, setCost] = useState<{
    workAr: string; estimatedAzmaUnits: number | null; priced: boolean;
    canProceed: boolean; availableUnits: number; trialAvailable: boolean; blockerAr?: string;
  } | null>(null);
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
  /**
   * ── THE CREATOR'S WORD ON WHAT WAS MADE FOR THEM ──────────────────
   *
   *   The Founder, 2026-09-25, asked for a review before the work is treated
   *   as done. Measured first: every generated asset is already deposited as
   *   INTERMEDIATE — the Vault's own word for «not the Creator's final word»
   *   — and nothing in the Empire read that state. The asset is safe from the
   *   moment it exists; what was missing was the Creator saying it is right.
   */
  const [acceptedAssetIds, setAcceptedAssetIds] = useState<readonly string[]>([]);
  const [acceptingAssetId, setAcceptingAssetId] = useState<string | null>(null);

  const acceptAsset = async (assetId: string) => {
    setAcceptingAssetId(assetId);
    try {
      const res = await fetch(`/api/vault/assets/${encodeURIComponent(assetId)}/accept`, { method: 'POST' });
      if (res.ok) setAcceptedAssetIds((prev) => [...prev, assetId]);
    } catch { /* the question went unanswered; the asset is unharmed either way */ }
    setAcceptingAssetId(null);
  };
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
  /** Every VISUAL asset the Creator owns — the picker's authority. */
  const [vaultVisuals, setVaultVisuals] = useState<readonly { assetId: string; url: string }[]>([]);
  /** The storage addresses of everything the Creator has accepted — it lives in the Vault now. */
  const [acceptedUris, setAcceptedUris] = useState<readonly string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** The act's own door, separate from the section at the foot of the page. */
  const actDoorInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetchers ───────────────────────────────────────────────────────────
  const fetchGenerations = () => {
    fetch('/api/qiyamah/generations')
      .then((r) => r.json())
      .then((result) => { if (result.status === 'succeeded') setGenerations(result.generations); })
      .catch(() => { /* gallery is an enhancement, not a gate */ });
  };

  /**
   * ── TWO LISTS, ONE CALL, AND THEY ARE NOT THE SAME LIST ────────────────
   *
   *   MEASURED 2026-09-26: `uploadedItems` filters to
   *   `providerId === 'creator-upload'` — assets the Creator brought from
   *   their own device, which is what its name says and what the upload
   *   section needs. It is NOT the Vault. Building the act's asset picker on
   *   it offered one tile out of thirty-five, because thirty-four of the
   *   Creator's pictures were made by the Chamber, not uploaded.
   *
   *   The picker's authority is every VISUAL asset the Creator owns, whatever
   *   produced it. Both come from the one request; neither is inferred from
   *   the other.
   */
  const fetchUploadedItems = () => {
    fetch('/api/vault/assets')
      .then((r) => r.json())
      .then((result) => {
        if (result.status !== 'succeeded' || !Array.isArray(result.assets)) return;
        const all = result.assets as {
          assetId: string; secureStorageUri?: string; capabilityTarget?: string; lifecycleState?: string;
        }[];
        setVaultVisuals(
          all
            .filter((a) => a.capabilityTarget === 'VISUAL' && Boolean(a.secureStorageUri))
            .map((a) => ({ assetId: a.assetId, url: a.secureStorageUri as string })),
        );
        // ── The Founder, 2026-09-26: «لماذا تتجمّع الأصول في القيامة؟ مكانها
        //    الطبيعي بعد الاعتماد هو الخزانة».
        //
        //    He is right, and it is what makes the acceptance step mean
        //    something. القيامة is a chamber of creation, not a warehouse:
        //    what is still in hand stays on its floor, and what the Creator
        //    has accepted has a home. The truth is the asset's own
        //    lifecycleState — FINAL — not a list this page happens to
        //    remember, so it survives a reload and a different device.
        setAcceptedUris(
          all.filter((a) => a.lifecycleState === 'FINAL' && a.secureStorageUri)
             .map((a) => a.secureStorageUri as string),
        );
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

  /**
   * ── AN OLD DEMAND DOES NOT GREET THE NEXT ONE ───────────────────────────
   *
   *   The Founder, 2026-09-26: «المطالبة القديمة تظل موجودة بحقل النص بعد
   *   الخروج من الحجرة والعودة إليها».
   *
   *   MEASURED on the live release, walking his exact path — exit by the
   *   door, the Foyer, the القيامة card — and by the browser's back button,
   *   in a fresh context: all three fields came back empty, and nothing was
   *   in sessionStorage or localStorage. It does not reproduce there, and
   *   saying «works for me» would be worthless to him.
   *
   *   The mechanism that produces exactly what he describes is the browser's
   *   own form restoration — session restore and bfcache write the previous
   *   text back into the <textarea> in the DOM after load. React holds these
   *   as controlled inputs whose state is '', and a controlled input whose
   *   value has not CHANGED is never re-rendered, so React never overwrites
   *   what the browser put there. The Creator reads an old demand while the
   *   Chamber believes the field is empty — which is why «بناء المشهد» sits
   *   disabled in front of visible text.
   *
   *   So the DOM is made to agree with the state on entry, once. It clears
   *   only what the browser restored, because React's own value for every one
   *   of these fields is '' at this moment.
   */
  useEffect(() => {
    const clearRestored = () => {
      for (const field of document.querySelectorAll<HTMLTextAreaElement>('.genesis-section textarea')) {
        if (field.value !== '') field.value = '';
      }
    };
    clearRestored();
    // A bfcache restore fires `pageshow` with persisted=true, and that can
    // land AFTER this component has mounted — so clearing once at mount is
    // not enough on the path most likely to show the fault.
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) clearRestored(); };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

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
  /**
   * Returns the new asset's id, so a caller that needed an asset in hand — an
   * act standing in front of an empty picker — can select it immediately
   * instead of asking the Creator to find it again among a hundred.
   */
  const uploadFile = async (file: File): Promise<string | null> => {
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
        if (newItem.capabilityTarget === 'VISUAL' && newItem.assetId && newItem.url) {
          setVaultVisuals((prev) => prev.some((a) => a.assetId === newItem.assetId)
            ? prev
            : [{ assetId: newItem.assetId, url: newItem.url }, ...prev]);
        }
        return newItem.assetId || null;
      }
      setUploadError(data.message ?? 'فشل الرفع — حاوِل مرة أخرى.');
      return null;
    } catch {
      setUploadError('البوابة لا تستجيب — حاوِل مرة أخرى.');
      return null;
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
      let op: { state: string; producing: boolean; succeeded: boolean; assetId?: string | null; assetUrl: string | null; failureReason: string | null } | null = null;
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
        setGeneratedAssetId(op.assetId ?? null);
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
        // The route decides between an image path and a video path, so it is
        // told what is being MADE. The act the Creator chose — an infographic,
        // an edit — shapes the request above; it is not a third kind of file.
        mediaType: mediaType === 'video' ? 'video' : 'image',
      };
      if (mediaType === 'video') {
        requestBody['durationSeconds'] = durationSeconds;
      }
      // A picture has a shape too, and the route has always accepted it.
      if (shapesForAct.includes(aspectRatio)) {
        requestBody['aspectRatio'] = aspectRatio;
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
        setGeneratedAssetId(result.asset.assetId ?? null);
        // What was MADE, not which act was chosen: an infographic is a
        // picture, and an edit returns one. Only video is video.
        setGeneratedAssetType(mediaType === 'video' ? 'video' : 'image');
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
    setGeneratedAssetId(null);
    setGeneratedAssetType(null);
    setUpscaleState('idle');
    setUpscaleError(null);
    setMediaType('image');
    setVideoSource('idea');
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

  /**
   * Everything of the Creator's that can be edited: what the Chamber made for
   * them, and what they brought. Both lists are already loaded; neither was
   * ever offered as a starting point for an act.
   */
  /**
   * Assets whose bytes the browser could not fetch. SEEN 2026-09-26 on the
   * live release: two tiles in the picker were black and empty. An asset the
   * Creator cannot SEE is one they would pick blind — and the edit route
   * resolves the same address off disk, so it would refuse them anyway with
   * «تعذّر الوصول إلى هذه الصورة». Offering them is offering a refusal.
   */
  const [unreachableAssetIds, setUnreachableAssetIds] = useState<readonly string[]>([]);

  const editableAssets = (() => {
    /**
     * ── THE VAULT SAYS WHICH ASSETS EXIST; THE GALLERY SAYS WHAT THEY ARE
     *    CALLED ────────────────────────────────────────────────────────────
     *
     *   The Founder, 2026-09-26: «ما زال تحريك الصورة يتم من أسفل الصورة —
     *   المربع لأعلى لا يعمل».
     *
     *   MEASURED, and he was exactly right. The card at the bottom resolves
     *   the sovereign id by matching the Vault's stored URI — «exact key; no
     *   guess», as `openAnimate` has always said. This picker trusted
     *   `generation.assetId` instead, and PRODUCTION proved that field was
     *   being written with the FILE id: `POST /api/vault/assets/<it>/edit`
     *   answered `404 الأصل غير موجود`. Every tile built from a generation
     *   carried an id the Vault has never held.
     *
     *   The root is repaired in generation-service, and the rows already
     *   written that way are repaired by migration. This is the second lock:
     *   the picker is built from the VAULT, which is the authority on what
     *   exists, and takes a generation's words only as a label, joined by
     *   the same exact key the card trusts. A tile can no longer carry an id
     *   the Vault does not hold, whatever any record says.
     */
    const wordsByUri = new Map<string, string>();
    for (const g of generations) {
      if (g.mediaType === 'video') continue;
      wordsByUri.set(g.assetUrl, g.originalIdea ?? g.prompt);
    }
    return vaultVisuals
      .filter((a) => !unreachableAssetIds.includes(a.assetId))
      .map((a) => ({ assetId: a.assetId, url: a.url, label: wordsByUri.get(a.url) ?? 'أصلٌ رفعته' }));
  })();

  useEffect(() => {
    // A selection that has just been proven unreadable must not survive the
    // tile that carried it — otherwise the run button stays lit on an asset
    // the route will refuse, and the refusal reads as the Creator's fault.
    if (editingAssetId && unreachableAssetIds.includes(editingAssetId)) setEditingAssetId(null);
    if (animateAssetId && unreachableAssetIds.includes(animateAssetId)) setAnimateAssetId(null);
  }, [unreachableAssetIds, editingAssetId, animateAssetId]);

  const COST_CAPABILITY_OF_ACT = {
    image: 'image-generation',
    infographic: 'image-generation',
    video: 'video-generation',
    edit: 'image-editing',
  } as const;

  useEffect(() => {
    let abandoned = false;
    setCost(null);
    void (async () => {
      try {
        const res = await fetch('/api/sovereign/economy/estimate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ capability: COST_CAPABILITY_OF_ACT[mediaType] }),
        });
        if (!res.ok || abandoned) return;
        setCost(await res.json());
      } catch {
        // A price we cannot fetch is simply not shown. It never blocks the work.
      }
    })();
    return () => { abandoned = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType]);

  const hasGalleryContent = generations.length > 0 || uploadedItems.length > 0;

  const buildSceneDisabled = stage === 'constructing' || (inputMode === 'idea' ? !idea.trim() : !externalPrompt.trim());

  /**
   * ── A DOOR WHERE THE ASSET IS NEEDED ────────────────────────────────────
   *
   *   The Founder, 2026-09-26: «لا يمكن رفع أصل من الجهاز... خاصية السحب
   *   والإفلات لا تؤتي بنتيجة».
   *
   *   MEASURED against the live release: the mechanism was not broken. A
   *   click-to-choose uploaded a real file, and a synthetic drop fired with
   *   defaultPrevented=true and reached the server. What was broken is WHERE:
   *   the Empire's only upload door sat at y=1340, below a 1200px viewport,
   *   in a separate section at the foot of the page — while the act that
   *   needs an asset stands at the top. A browser does not scroll the page
   *   for a Creator who is holding a file, so there was nothing under the
   *   cursor to drop onto. «لا تؤتي بنتيجة» was an exact description.
   *
   *   No second upload is built. This is the same `uploadFile`, the same
   *   route, the same Vault — placed where the hand already is, and it hands
   *   the act what it just received so nobody has to go looking for it.
   */
  const AssetDoor = ({ onReceived }: { onReceived: (assetId: string) => void }) => {
    const take = async (file: File | undefined) => {
      if (!file || isUploading) return;
      const assetId = await uploadFile(file);
      if (assetId) onReceived(assetId);
    };
    return (
      <div
        className={`asset-door${isDragging ? ' asset-door--over' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="ارفع صورةً من جهازك"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); void take(e.dataTransfer.files[0]); }}
        onClick={() => !isUploading && actDoorInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && actDoorInputRef.current?.click()}
      >
        <input
          ref={actDoorInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { void take(e.target.files?.[0]); e.target.value = ''; }}
        />
        <span className="asset-door-icon" aria-hidden="true">⬆</span>
        <span className="asset-door-label">
          {isUploading ? 'جارٍ الرفع…' : 'أو ارفع صورةً من جهازك — اسحبها هنا أو انقر'}
        </span>
      </div>
    );
  };

  const StyleRegistry = ({ disabled }: { disabled?: boolean }) => (
    <div className="style-registry" role="radiogroup" aria-label="نمط التجسيد">
      <p className="style-registry-label">نمط التجسيد</p>
      <div className="style-registry-available">
        {/* The infographic left this grid on 2026-09-26: it became one of the
            four acts, and a capability with two doors lets the act a Creator
            chose disagree with what the Chamber makes. ALL_STYLES keeps it —
            the review line still names a style by id. */}
        {ALL_STYLES.filter((s) => s.id !== 'infographic').map((s) => (
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
      // ── The Founder, 2026-09-26: «الأصل الناتج من التحريك لا يُعرض بالأعلى
      //    في حقل عرض الصورة أو الفيديو».
      //
      //    An act run from the top produced a real asset and showed it only
      //    beside the card it started from. Every act now lands in the one
      //    place this Chamber shows a result, with the next acts on it —
      //    which is the whole point of the loop closing.
      if (animatingRecordId === null) {
        setGeneratedAssetUrl(result.asset.secureStorageUri);
        setGeneratedAssetId(result.asset.assetId);
        setGeneratedAssetType('video');
        setStage('result');
        triggerInvitation();
      }
      setAnimatingRecordId(null);
    } catch {
      setAnimateError('البوابة لا تستجيب. أعِد المحاولة.');
      setAnimateState('failed');
    }
  }

  /**
   * Raise an asset's resolution. The Founder approved it on 2026-09-26 after
   * the inventory showed four of its five parts were already built and
   * unreachable. It takes no instruction — an upscale is told nothing, it is
   * asked only which asset, and the engine runs in a mode that invents
   * nothing, as the Empire's own benchmark for it requires.
   */
  async function handleUpscaleAsset(assetId: string) {
    setUpscaleState('running');
    setUpscaleError(null);
    try {
      const res = await fetch(`/api/vault/assets/${assetId}/upscale`, { method: 'POST' });
      const result = await res.json();
      if (result.status !== 'succeeded') {
        // The route speaks Arabic and names no engine. Shown as it is.
        setUpscaleError(result.message ?? 'تعذّر رفع الدقّة.');
        setUpscaleState('failed');
        return;
      }
      // The Vault is re-read rather than guessed at, and the Creator is shown
      // the raised asset in place of the one they were looking at.
      fetchGenerations();
      setGeneratedAssetId(result.asset.assetId);
      setGeneratedAssetUrl(result.asset.secureStorageUri);
      setGeneratedAssetType('image');
      setUpscaleState('ready');
    } catch {
      setUpscaleError('تعذّر الاتصال. لم يُحفظ شيء.');
      setUpscaleState('failed');
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
      // An edit is an act like any other: what it makes is shown where this
      // Chamber shows what it makes.
      setGeneratedAssetUrl(result.asset.secureStorageUri);
      setGeneratedAssetId(result.asset.assetId);
      setGeneratedAssetType('image');
      setStage('result');
      triggerInvitation();
    } catch {
      setEditError('تعذّر الاتصال. لم يُحفظ شيء.');
      setEditState('failed');
    }
  }

  return (
    <main className="qiyamah-viewport">
      <ChamberDemonstration
        chamberId="qiyamah-chamber"
        outcomeAr="أصلٌ سياديّ تملكه — صورةٌ أو إنفوغرافٌ أو مقطعٌ — محفوظٌ في خزانتك باسمك، ثمّ هو طيّعٌ لك تُعدّله وتُحرّكه."
        stepsAr={[
            'صِف فكرتك في جملةٍ أو جملتين، أو أحضر محثّك الجاهز.',
            'اختر ما تصنع: صورة، أو مقطعاً تختار مدّته وامتداده، أو إنفوغرافاً يُجيد الحرف والترتيب.',
            'ابنِ المشهد — تقرأ القيامة فكرتك وتوسّعها قبل التجسيد.',
            'جسِّد، والناتج يُودَع خزانتك أصلاً سياديّاً باسمك.',
            'ثمّ أعِد عليه: عدّله بكلماتك، أو حرّك صورتك إلى مقطع.',
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
              {/* The four acts of creation, chosen before anything else. */}
              <div className="media-type-toggle" role="radiogroup" aria-label="ماذا تصنع؟">
                {([
                  ['image',       'صورة',      'مشهدٌ أصليّ من فكرتك'],
                  ['video',       'فيديو',     'مقطعٌ تختار مدّته وامتداده'],
                  ['infographic', 'إنفوغرافيك', 'حرفٌ مقروء وترتيبٌ منظّم'],
                  ['edit',        'تعديل',      'غيّر في أصلٍ تملكه'],
                ] as const).map(([mode, label, hint]) => (
                  <button
                    key={mode}
                    role="radio"
                    aria-checked={mediaType === mode}
                    className={`media-type-btn${mediaType === mode ? ' media-type-btn--active' : ''}`}
                    onClick={() => {
                      setMediaType(mode);
                      // The infographic BINDS one designated model, and the
                      // Empire refuses rather than substitutes for it. Choosing
                      // the act chooses the style it requires.
                      if (mode === 'infographic') setStyle('infographic');
                      else if (style === 'infographic') setStyle('cinematic');
                    }}
                    disabled={stage === 'constructing'}
                    title={hint}
                  >
                    <span className="media-type-name">{label}</span>
                    <span className="media-type-hint">{hint}</span>
                  </button>
                ))}
              </div>

              {/* ── WHERE A CLIP COMES FROM ─────────────────────────────
                  The Founder, twice: «التحريك موجود ولكنه غير ظاهر إلا عند
                  الضغط على الصورة». It was true and unfindable — a control
                  on a card at the bottom of the gallery. Animating a still
                  IS making a clip from an asset you own, so it belongs
                  inside the فيديو act, not as a fifth box beside four he
                  named. Nothing new is built: the same route, the same
                  handler, the same model choice. What changed is where. */}
              {mediaType === 'video' && animationModels.length > 0 && (
                <div className="source-toggle" role="radiogroup" aria-label="مصدر المقطع">
                  {([
                    ['idea',  'من فكرتك',        'يُبنى المشهد من وصفك'],
                    ['asset', 'من أصلٍ تملكه',   'تُبعث الحركة في صورةٍ لديك'],
                  ] as const).map(([src, label, hint]) => (
                    <button
                      key={src}
                      role="radio"
                      aria-checked={videoSource === src}
                      className={`source-btn${videoSource === src ? ' source-btn--active' : ''}`}
                      onClick={() => setVideoSource(src)}
                      disabled={stage === 'constructing'}
                    >
                      <span className="source-name">{label}</span>
                      <span className="source-hint">{hint}</span>
                    </button>
                  ))}
                </div>
              )}

              {mediaType === 'video' && videoSource === 'asset' && (
                <div className="edit-act" role="group" aria-label="تحريك أصل">
                  {editableAssets.length === 0 && !animateAssetId ? (
                    <>
                      {/* An empty picker used to be a dead end. It is now the
                          one place a Creator most needs the door. */}
                      <p className="edit-act-empty">
                        لا صورَ لديك بعد — ارفع واحدةً من جهازك، أو أنشئ صورةً ثمّ عُد.
                      </p>
                      <AssetDoor onReceived={setAnimateAssetId} />
                    </>
                  ) : (
                    <>
                      <p className="edit-act-label">أيّ صورةٍ تُحرّك؟</p>
                      <div className="edit-act-assets">
                        {editableAssets.map((a) => (
                          <button
                            key={a.assetId}
                            type="button"
                            className={`edit-act-asset${animateAssetId === a.assetId ? ' edit-act-asset--on' : ''}`}
                            onClick={() => setAnimateAssetId(a.assetId)}
                            disabled={animateState === 'running'}
                            title={a.label}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={a.url}
                              alt={a.label}
                              onError={() => setUnreachableAssetIds((prev) =>
                                prev.includes(a.assetId) ? prev : [...prev, a.assetId])}
                            />
                          </button>
                        ))}
                      </div>
                      <AssetDoor onReceived={setAnimateAssetId} />

                      <label className="edit-act-label" htmlFor="video-animate-instruction">
                        كيف تتحرّك؟
                      </label>
                      <textarea
                        id="video-animate-instruction"
                        className="edit-act-input"
                        autoComplete="off"
                        rows={2}
                        maxLength={1000}
                        value={animateInstruction}
                        onChange={(e) => setAnimateInstruction(e.target.value)}
                        placeholder="مثال: تقترب الكاميرا ببطء، ويتحرّك الدخان إلى الأعلى."
                        disabled={animateState === 'running'}
                      />

                      {animationModels.length > 1 && (
                        <div className="asset-animate-models" role="radiogroup" aria-label="نوع الحركة">
                          {animationModels.map((m) => (
                            <label key={m.modelId} className="asset-animate-model-option">
                              <input
                                type="radio"
                                name="video-act-animate-model"
                                checked={animateModelId === m.modelId}
                                onChange={() => setAnimateModelId(m.modelId)}
                                disabled={animateState === 'running'}
                              />
                              <span className="animate-model-name">{m.nameAr}</span>
                              {m.noteAr && <span className="animate-model-note">{m.noteAr}</span>}
                            </label>
                          ))}
                        </div>
                      )}

                      {animateState === 'running' && (
                        <p className="edit-act-status" role="status">الحركة قيد البعث… لا تغلق الصفحة.</p>
                      )}
                      {animateState === 'failed' && animateError && (
                        <p className="edit-act-error" role="alert">{animateError}</p>
                      )}

                      <button
                        className="edit-act-run"
                        disabled={animateState === 'running' || !animateAssetId || animateInstruction.trim().length === 0}
                        onClick={() => void handleAnimateAsset()}
                      >
                        {animateState === 'running' ? '⏳ الحركة جارية…' : '▶ ابعث الحركة'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* An act that works on an asset the Creator owns takes that
                  asset and an instruction — never an idea. */}
              {!actsOnOwnAsset && (
                <>
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
                      autoComplete="off"
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
                      autoComplete="off"
                      placeholder="اكتب محثك الخاص بأي لغة…"
                      value={externalPrompt}
                      onChange={(e) => setExternalPrompt(e.target.value)}
                      rows={4}
                      disabled={stage === 'constructing'}
                    />
                  </div>
                </>
              )}
                </>
              )}

              {/* An edit has no style to choose — it changes an asset that
                  already has one. An infographic's style is the act itself, and
                  it BINDS a designated model, so it is not re-offered as one
                  choice among fourteen. */}
              {(mediaType === 'image' || (mediaType === 'video' && videoSource === 'idea')) && (
                <StyleRegistry disabled={stage === 'constructing'} />
              )}
              {mediaType === 'infographic' && (
                <p className="act-bound-note">
                  الإنفوغرافيك له رَيْشتُه وحده — تُجيد الحرف المقروء والتخطيط المنظّم، ولا تُستبدَل بسواها.
                </p>
              )}

              {/* ── THE ACT OF EDITING, WHERE AN ACT IS CHOSEN ──────────────
                  It existed — on a card at the bottom of the gallery, reachable
                  and unseen. The Founder asked for it among the acts a Creator
                  chooses from. Nothing new is built: the same instruction, the
                  same route, the same handler. What changed is where it is. */}
              {mediaType === 'edit' && (
                <div className="edit-act" role="group" aria-label="تعديل أصل">
                  {editableAssets.length === 0 && !editingAssetId ? (
                    <>
                      <p className="edit-act-empty">
                        لا أصولَ لديك بعد — ارفع صورةً من جهازك، أو أنشئ واحدةً ثمّ عُد.
                      </p>
                      <AssetDoor onReceived={setEditingAssetId} />
                    </>
                  ) : (
                    <>
                      <p className="edit-act-label">أيّ أصلٍ تُعدّل؟</p>
                      <div className="edit-act-assets">
                        {editableAssets.map((a) => (
                          <button
                            key={a.assetId}
                            type="button"
                            className={`edit-act-asset${editingAssetId === a.assetId ? ' edit-act-asset--on' : ''}`}
                            onClick={() => setEditingAssetId(a.assetId)}
                            disabled={editState === 'running'}
                            title={a.label}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={a.url}
                              alt={a.label}
                              onError={() => setUnreachableAssetIds((prev) =>
                                prev.includes(a.assetId) ? prev : [...prev, a.assetId])}
                            />
                          </button>
                        ))}
                      </div>
                      <AssetDoor onReceived={setEditingAssetId} />

                      <label className="edit-act-label" htmlFor="edit-act-instruction">
                        ما الذي تريد تغييره فيه؟
                      </label>
                      <textarea
                        id="edit-act-instruction"
                        className="edit-act-input"
                        autoComplete="off"
                        rows={3}
                        maxLength={1000}
                        value={editInstruction}
                        onChange={(e) => setEditInstruction(e.target.value)}
                        placeholder="مثال: غيّر الخلفية إلى رفوف مكتبة خشبية، وأبقِ الباقي كما هو."
                        disabled={editState === 'running'}
                      />

                      {editState === 'running' && (
                        <p className="edit-act-status" role="status">التعديل قيد التنفيذ… لا تغلق الصفحة.</p>
                      )}
                      {editState === 'failed' && editError && (
                        <p className="edit-act-error" role="alert">{editError}</p>
                      )}

                      <button
                        className="edit-act-run"
                        disabled={editState === 'running' || !editingAssetId || editInstruction.trim().length === 0}
                        onClick={() => { if (editingAssetId) void handleEditAsset(editingAssetId); }}
                      >
                        {editState === 'running' ? '⏳ التعديل جارٍ…' : '✎ نفّذ التعديل'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {mediaType === 'video' && videoSource === 'idea' && durationLadder.length > 0 && (
                <div className="duration-picker" role="group" aria-label="مدة الفيديو">
                  <p className="duration-label">
                    مدة الفيديو
                    <span className="duration-max">حتّى {durationLadder[durationLadder.length - 1]} ثانية</span>
                  </p>
                  {/* MEASURED 2026-09-25: this list read 4, 6, 8 — written by hand
                      in the interface — while the designated cinematic model is
                      VERIFIED to 56 seconds. It is now every duration the
                      designated models can actually produce, read from the fleet,
                      so it cannot drift from what they accept. */}
                  <div className="duration-options">
                    {durationLadder.map((d) => (
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

              {!actsOnOwnAsset && shapesForAct.length > 1 && (
                <div className="aspect-picker" role="group" aria-label="امتداد المشهد">
                  <p className="duration-label">امتداد المشهد</p>
                  {/* The Founder asked for it and it did not exist. Only shapes
                      every designated model accepts are offered — offering one
                      that half of them refuse would be offering a refusal. */}
                  <div className="duration-options">
                    {shapesForAct.map((ratio) => {
                      const label = ratio === '16:9' ? 'أفقيّ' : ratio === '9:16' ? 'رأسيّ' : 'مربّع';
                      return (
                        <button
                          key={ratio}
                          type="button"
                          className={`duration-btn aspect-btn${aspectRatio === ratio ? ' duration-btn--active' : ''}`}
                          onClick={() => setAspectRatio(ratio)}
                          disabled={stage === 'constructing'}
                          title={ratio}
                        >
                          <span className={`aspect-glyph aspect-glyph--${ratio.replace(':', '-')}`} aria-hidden="true" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {constructionError && (
                <p className="construction-error" role="alert">{constructionError}</p>
              )}

              {cost && (
                <p className={`cost-line${cost.canProceed ? '' : ' cost-line--blocked'}`} role="status">
                  {cost.priced && cost.estimatedAzmaUnits !== null
                    ? <>{cost.workAr} — <strong>{cost.estimatedAzmaUnits}</strong> وحدة سياديّة</>
                    : <>{cost.workAr} — الكُلفة غير مُقدَّرة بعد</>}
                  <span className="cost-balance">رصيدك {cost.availableUnits}</span>
                  {cost.trialAvailable && <span className="cost-trial">تجربتك سارية</span>}
                  {cost.blockerAr && <span className="cost-blocker">{cost.blockerAr}</span>}
                </p>
              )}

              {stage === 'constructing' ? (
                <div className="construction-progress">
                  <div className="construction-spinner" aria-hidden="true" />
                  <p className="construction-text pulse-text">
                    {producingNotice ?? (inputMode === 'idea' ? 'القيامة تبني المشهد السيادي…' : 'القيامة تقرأ محثك…')}
                  </p>
                </div>
              ) : actsOnOwnAsset ? null : (
                /* An edit has its own act and its own button. Offering
                   «بناء المشهد» beside it would offer a second thing to
                   press that does something else entirely. */
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                  : mediaType === 'infographic'
                  ? 'تُرتَّب الآن المعلومة في صورةٍ تُقرأ...'
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
              {/* ── THE LOOP CLOSES ON THE RESULT ─────────────────────────
                  MEASURED 2026-09-26 against the newest creation workspaces:
                  they keep the result in place and offer the next act ON it.
                  This Chamber sent a Creator back to the top to choose an act,
                  then down to the gallery to find the asset they were already
                  looking at. Every act below already existed. What is new is
                  that the result knows its own name, so they can be offered
                  here. Nothing is regenerated and nothing is re-uploaded. */}
              {generatedAssetId && (
                <div className="next-acts" role="group" aria-label="ماذا تفعل بهذا الآن؟">
                  <p className="next-acts-label">وماذا الآن؟</p>
                  <div className="next-acts-row">
                    <button
                      className="next-act"
                      disabled={acceptingAssetId === generatedAssetId || acceptedAssetIds.includes(generatedAssetId)}
                      onClick={() => void acceptAsset(generatedAssetId)}
                    >
                      {acceptedAssetIds.includes(generatedAssetId) ? '✓ معتمَد' : '✓ اعتمده'}
                    </button>

                    {generatedAssetType !== 'video' && (
                      <>
                        <button
                          className="next-act"
                          onClick={() => {
                            setMediaType('edit');
                            setEditingAssetId(generatedAssetId);
                            setEditInstruction('');
                            setEditState('ready');
                            setStage('idea');
                          }}
                        >
                          ✎ عدّل عليه
                        </button>

                        {animationModels.length > 0 && (
                          <button
                            className="next-act"
                            onClick={() => {
                              setMediaType('video');
                              setVideoSource('asset');
                              setAnimateAssetId(generatedAssetId);
                              setAnimateInstruction('');
                              setAnimateState('ready');
                              setStage('idea');
                            }}
                          >
                            ▶ ابعث فيه الحركة
                          </button>
                        )}

                        <button
                          className="next-act"
                          disabled={upscaleState === 'running'}
                          onClick={() => void handleUpscaleAsset(generatedAssetId)}
                        >
                          {upscaleState === 'running' ? '⏳ الدقّة تُرفع…' : '⤢ ارفع دقّته'}
                        </button>
                      </>
                    )}
                  </div>
                  {upscaleState === 'ready' && (
                    <p className="next-acts-note" role="status">رُفعت الدقّة، وهذا هو الناتج الجديد.</p>
                  )}
                  {upscaleState === 'failed' && upscaleError && (
                    <p className="next-acts-error" role="alert">{upscaleError}</p>
                  )}
                </div>
              )}

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

      {/* ── The floor of the workshop — what is still in hand ───────────
          The Founder, 2026-09-26: «لماذا تتجمّع الأصول في القيامة؟ مكانها
          الطبيعي بعد الاعتماد هو الخزانة». This was «إرثك السيادي» and held
          everything ever made, for ever. A legacy is kept in a vault; a
          workshop floor holds the work in hand. */}
      {hasGalleryContent && (
        <section className="your-generations" aria-label="تحت يدك">
          <h3>تحت يدك</h3>
          {acceptedUris.length > 0 && (
            <p className="moved-to-vault">
              {acceptedUris.length} أصلاً اعتمدتَه انتقل إلى خزانتك.{' '}
              <button
                type="button"
                className="moved-to-vault-link"
                onClick={() => goTo('/sovereign-vault-palace')}
              >
                افتح قصر الخزانة ←
              </button>
            </p>
          )}
          <div className="generations-grid">

            {generations.filter((g) => !acceptedUris.includes(g.assetUrl)).map((g) => (
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
                      {/* ── EDITING WHAT THE CHAMBER ITSELF CREATED ─────────────
                          The Founder, 2026-09-25: «أين مربع اختيار التعديل على
                          صورة أو فيديو؟»

                          MEASURED: the edit panel was offered on uploaded assets
                          alone. A Creator could edit a picture they brought from
                          their own device and could NOT edit one القيامة had just
                          made for them — in the Chamber of creation itself. The
                          route never restricted it; only the interface did. */}
                      {g.mediaType !== 'video' && g.assetId && (
                        <button
                          className="gallery-edit-btn"
                          aria-label="عدّل هذه الصورة"
                          title="عدّل هذه الصورة"
                          onClick={() => {
                            setEditingAssetId(editingAssetId === g.assetId ? null : (g.assetId ?? null));
                            setEditInstruction('');
                            setEditState('ready');
                          }}
                        >
                          ✎ تعديل
                        </button>
                      )}
                      {g.assetId && !acceptedAssetIds.includes(g.assetId) && (
                        <button
                          className="gallery-edit-btn gallery-accept-btn"
                          aria-label="اعتمد هذا الأصل"
                          title="اعتمده أصلاً نهائيّاً في خزانتك"
                          disabled={acceptingAssetId === g.assetId}
                          onClick={() => void acceptAsset(g.assetId as string)}
                        >
                          {acceptingAssetId === g.assetId ? '…' : '✓ اعتماد'}
                        </button>
                      )}
                      {g.assetId && acceptedAssetIds.includes(g.assetId) && (
                        <span className="gallery-accepted-mark" title="أصلٌ معتمد بكلمتك">✓ معتمد</span>
                      )}
                      {/* Its label was the bare glyph ▶, which a Creator reads as
                          «play», not «animate». A control says what it does. */}
                      {g.mediaType !== 'video' && animationModels.length > 0 && (
                        <button
                          className="gallery-edit-btn gallery-animate-btn"
                          aria-label="حرّك هذه الصورة"
                          title="حرّك هذه الصورة إلى مقطع"
                          onClick={() => void openAnimate(g)}
                        >
                          ▶ تحريك
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
                        <p className="asset-animate-model">
                          <span className="animate-model-name">{animationModels[0].nameAr}</span>
                          {animationModels[0].noteAr && (
                            <span className="animate-model-note">{animationModels[0].noteAr}</span>
                          )}
                        </p>
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
                              <span className="animate-model-name">{m.nameAr}</span>
                              {m.noteAr && <span className="animate-model-note">{m.noteAr}</span>}
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
