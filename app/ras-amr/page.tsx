/**
 * AZMA OS – Ras Al-Amr Chamber (Hollywood Master Director Console)
 * File: app/ras-amr/page.tsx
 *
 * IMPERIAL CHAMBER UNIFICATION, PACKAGE I (2026-07-23): wrapped in
 * RasAmrExperience (src/imperial-experience-engine/experiences/ras-amr/)
 * — additive only, no logic below changed. One real, pre-existing bug
 * fixed as a side effect of this wrap: the root <main>'s className was
 * 'ras-amr-chamber-viewport', which matched no rule in ras-amr.css (the
 * real selector is '.ras-amr-viewport') — the intended fixed/flex-column
 * layout was silently never applying. Corrected to the real class name.
 *
 * INTEGRATION PACKAGE III — THE FIRST CHAMBER-TO-CHAMBER OPERATIONAL
 * FLOW (2026-07-25): the Sovereign Summoning Bridge now enumerates and
 * consumes real assets from the real Sovereign Vault, via the same
 * GET /api/vault/assets route Integration Package II built for Vault
 * Palace — no new backend, no new orchestration layer, the smallest
 * real connection available. The fake vaultRepositories catalogue
 * (6 hardcoded categories, 18 fabricated item names) is removed
 * entirely, not hidden, per this platform's own remove-not-cover rule
 * — real categories are derived from whatever capabilityTarget values
 * actually exist in the Creator's real Vault. initialSmartQueue's 3
 * pre-seeded demo items are untouched — a separate, already-disclosed
 * gap this Package's own directive did not ask to close.
 *
 * INTEGRATION PACKAGE IV — FROM DIRECTION TO FULFILLMENT (2026-07-25):
 * the "forward to Makman" button now carries a real handoff payload
 * (sessionStorage, the exact same one-shot convention Vault Palace's
 * own cross-chamber transfers already use) whenever the active queue
 * item is a real, Vault-sourced asset — no fabricated title, no
 * fabricated preview reaches Makman. When the active item is one of
 * initialSmartQueue's pre-seeded demo entries (not real), navigation
 * behaves exactly as before this Package — no payload, Makman falls
 * back to its own existing display, nothing regresses.
 *
 * RAS AL AMR COMPLETION PACKAGE I — REAL DIRECTOR COMPILATION
 * (2026-07-25): Master Render no longer simulates — it calls the real,
 * already-certified POST /api/sovereign/entry/ras-al-amr/compile
 * (PrePublishingBoundary + VaultRehydrationBridge, untouched), building
 * a minimal, honest single-track, single-node SovereignCanvas from the
 * currently active REAL asset. Only enabled when the active item is
 * real — there is nothing genuine to compile from a demo seed item, and
 * per this Package's own success criteria the primary workflow no
 * longer relies on simulated compilation at all; the button is disabled
 * with a visible explanation rather than falling back to the old fake
 * timer. No Automatic Director logic, no new Hollywood tools, no
 * publishing/release, no changes to Makman — compilation ends at a real
 * CompiledAssemblyGraph shown in this Chamber's own console.
 *
 * THE CORRIDOR PACKAGE — RAS AL AMR TO MAKMAN (2026-07-25): the real
 * CompiledAssemblyGraph a successful Master Render produces is now kept
 * in state, and "forward to Makman" carries it onward — via the exact
 * same one-shot sessionStorage handoff convention already used for the
 * raw production payload — under its own key, separate from that raw
 * payload, so Makman can tell "a title/preview arrived" apart from "a
 * real sealed assembly arrived, ready to submit to real distribution."
 * Only ever set from a graph this Chamber itself really compiled — never
 * fabricated for a demo item.
 *
 * REAL SPATIAL ADJUSTMENT PACKAGE (2026-07-26): RasAlAmrStateManager
 * (src/chambers/ras-al-amr/ras-al-amr-state-manager.ts) was real, working,
 * pure/stateless logic with zero live callers — its only caller was an
 * orphaned chamber-integration adapter no app/ page ever imports. Council
 * authorized wiring it into the live Hollywood tools; investigation found
 * the six named tools (pixel-grade, neural-sync, chroma-forge, ai-director,
 * optical-flow) don't correspond to any real computation anywhere in this
 * platform — there is no LUT engine, no audio DSP, no optical-flow
 * interpolation to back them, and inventing plausible-looking values for
 * them would repeat the exact "fake precision" mistake just declined for
 * Hujjah Al-Damighah's orphaned confidence/verdict engines. Those five
 * buttons are therefore left exactly as they were — still cosmetic,
 * still disclosed as such — and this Package instead wires the ONE
 * directive kind with a real, simple, meaningful, Creator-authored shape
 * that needs no unbuilt rendering backend to mean something: Spatial
 * (position/scale/rotation — see SpatialDirective, assembly-contracts.ts).
 * A real per-session SovereignCanvas is now seeded when a real asset
 * becomes active; a real spatial-adjustment control lets the Creator set
 * genuine values, applied via RasAlAmrStateManager.applyMutation(); Master
 * Render now compiles that real, possibly-edited canvas instead of always
 * building a bare single-node one from scratch — so a real spatial edit
 * genuinely reaches the compiled output for the first time.
 *
 * REAL VISUAL + TEMPORAL ADJUSTMENT (2026-07-26, per the Chief Architect's
 * Minimum Construction directive — extend, don't duplicate): the same
 * honest pattern as Spatial, extended to the two other directive kinds
 * the assembly contracts already define with real, well-formed shapes.
 * pixel-grade and chroma-forge both drive ONE real Visual directive
 * (opacity/blendMode/optional colorGradeReferenceId — the chamber has
 * exactly one real 'visual' slot per node, so two buttons sharing one
 * real editor is honest, not a compromise). neural-sync drives a real
 * Temporal directive (start time/duration/trim) — "sync" has no real
 * audio-mixing field to back it, but timing on the master timeline is
 * the truthful reading of what synchronization means here. ai-director
 * and optical-flow remain untouched pending their own separately-scoped
 * packages (the former now has a real constitutional definition — the
 * Cinematic Direction Decision — but building it is a new package, not
 * this one; the latter needs a genuinely new contract field, which this
 * directive's own "don't invent speculative architecture" rule reserves
 * for an explicit future decision).
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RasAmrExperience } from '@/src/imperial-experience-engine';
import type { VaultAsset, AssetFamily } from '@/src/vault/sovereign-vault-types';
import type { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';
import { CanvasType } from '@/src/chambers/ras-al-amr/assembly-contracts';
import type { SovereignCanvas, SpatialDirective, TemporalDirective } from '@/src/chambers/ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '@/src/chambers/ras-al-amr/pre-publishing-boundary';
import { RasAlAmrStateManager } from '@/src/chambers/ras-al-amr/ras-al-amr-state-manager';
import { CanvasActionType } from '@/src/chambers/ras-al-amr/assembly-directive-payloads';
import type {
  UpdateNodeSpatialPayload,
  UpdateNodeTemporalPayload,
  UpdateNodeAdvancedPayload,
  VisualFilterDirective,
} from '@/src/chambers/ras-al-amr/assembly-directive-payloads';
import './ras-amr.css';

// Pure, stateless transformer (see its own header comment) — one shared
// instance is sufficient, no per-render instantiation needed.
const rasAlAmrStateManager = new RasAlAmrStateManager();

const DEFAULT_SPATIAL: SpatialDirective = {
  zIndex: 0,
  scaleX: 1,
  scaleY: 1,
  positionX: 0,
  positionY: 0,
  rotationDegrees: 0,
};

const DEFAULT_VISUAL: VisualFilterDirective = {
  opacity: 1,
  blendMode: 'NORMAL',
  colorGradeReferenceId: undefined,
};

const DEFAULT_TEMPORAL: TemporalDirective = {
  globalStartTimeSeconds: 0,
  playDurationSeconds: 5,
  trimStartSeconds: undefined,
  trimEndSeconds: undefined,
};

const BLEND_MODES: VisualFilterDirective['blendMode'][] = ['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY'];

const CAPABILITY_LABELS: Record<string, { name: string; icon: string }> = {
  VISUAL:      { name: 'الصور المولَّدة',    icon: '🖼️' },
  MOTION:      { name: 'الفيديوهات المولَّدة', icon: '🎬' },
  AUDIO:       { name: 'الأصوات المولَّدة',   icon: '🎙' },
  WRITING:     { name: 'النصوص المولَّدة',    icon: '📄' },
  DIRECTORIAL: { name: 'مخططات الإخراج',      icon: '🎯' },
};

function typeLabelForCapability(target: string): string {
  switch (target) {
    case 'VISUAL': return 'صورة';
    case 'MOTION':  return 'فيديو';
    case 'AUDIO':   return 'صوت';
    default:        return 'وثيقة';
  }
}

interface QueueItem {
  id: string;
  title: string;
  type: string;
  source: string;
  duration: string;
  status: string;
  /** INTEGRATION PACKAGE III/IV: true only for an item genuinely summoned
      from the real Sovereign Vault — never set on the demo seed items
      below. Governs whether a handoff to Makman carries real data. */
  isRealAsset?: boolean;
  secureStorageUri?: string;
  /** RAS AL AMR COMPLETION PACKAGE I: the real Vault asset's own family/
      capability (id doubles as the real Vault assetId for real items),
      carried through so a real compile can build a node without a
      second Vault lookup. */
  assetFamily?: AssetFamily;
  capabilityOrigin?: CapabilityTarget;
}

const initialSmartQueue: QueueItem[] = [
  { id: 'q-1', title: 'المشهد السريالي الأول', type: 'فيديو', source: 'حجرة القيامة', duration: '00:12', status: 'جاهز للصهر' },
  { id: 'q-2', title: 'البصمة الصوتية السيادية', type: 'صوت', source: 'خزنة الأصوات', duration: '01:05', status: 'مزامنة عصبية معلقة' },
  { id: 'q-3', title: 'مخطط الهوية البصرية الحية', type: 'علامة', source: 'خزنة العلامات', duration: '--:--', status: 'معالجة البكسل' },
];

const hollywoodTools = [
  { id: 'pixel-grade', label: 'المعالج النقطي للبكسل', icon: '🎯', category: 'manual' },
  { id: 'neural-sync', label: 'المزامنة العصبية للصوت', icon: '🎙', category: 'smart' },
  { id: 'chroma-forge', label: 'صهر النطاق اللوني الحركي', icon: '🎨', category: 'manual' },
  { id: 'ai-director', label: 'المخرج الذكي الآلي', icon: '🤖', category: 'smart' },
  { id: 'optical-flow', label: 'التدفق البصري الفائق', icon: '🌊', category: 'smart' },
  { id: 'master-render', label: 'التصوير النهائي السينمائي', icon: '🎬', category: 'manual' },
];

export default function RasAmrChamber() {
  const router = useRouter();
  
  // --- Core States ---
  const [queue, setQueue] = useState<QueueItem[]>(initialSmartQueue);
  const [activeAsset, setActiveAsset] = useState<QueueItem | null>(initialSmartQueue[0]);
  // CONSTITUTIONAL NOTE (Ras Al Amr Chamber Reconstruction, 2026-07-25):
  // 'smart' is the Automatic Director — a delegated directing AUTHORITY,
  // never an automation shortcut, workflow engine, or scripted pipeline.
  // Any future real implementation behind this mode must make genuine
  // editorial decisions on the Creator's behalf, always within the
  // Creator's own declared vision/goals/constraints (it may decide HOW to
  // direct, never redefine WHAT the Creator intends), and the delegation
  // it represents must remain limitable/revocable by the Creator at any
  // time. See src/chamber-vision/'s ras-amr Vision Document for the full
  // ruling. Today this state only drives which tools are shown/dimmed —
  // no real differentiated logic exists yet behind either mode.
  const [directingMode, setDirectingMode] = useState<'smart' | 'manual'>('smart');
  const [activeTool, setActiveTool] = useState<string>('ai-director');
  const [timelineProgress, setTimelineProgress] = useState<number>(45);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderStatus, setRenderStatus] = useState<string>('في وضع الاستعداد الإخراجي');
  // THE CORRIDOR PACKAGE: the real compiled graph from the most recent
  // successful Master Render — the only thing "forward to Makman" is
  // allowed to carry as a real, submittable assembly. compiledForAssetId
  // pins it to the exact active asset it was compiled from, so switching
  // the active asset after rendering can never forward a stale graph.
  const [compiledGraph, setCompiledGraph] = useState<CompiledAssemblyGraph | null>(null);
  const [compiledForAssetId, setCompiledForAssetId] = useState<string | null>(null);

  // REAL SPATIAL ADJUSTMENT PACKAGE: a real, single-node SovereignCanvas,
  // seeded whenever a real asset becomes active and mutated only through
  // RasAlAmrStateManager.applyMutation() — never hand-edited. Master
  // Render compiles exactly this object. Seeded during render (React's
  // documented "adjust state when a prop changes" pattern, tracked via
  // seededForAssetId) rather than in an effect, so a real spatial edit
  // survives ordinary re-renders instead of being wiped every time.
  const [sessionCanvas, setSessionCanvas] = useState<SovereignCanvas | null>(null);
  const [seededForAssetId, setSeededForAssetId] = useState<string | null>(null);
  const [spatialForm, setSpatialForm] = useState<SpatialDirective>(DEFAULT_SPATIAL);
  // REAL VISUAL + TEMPORAL ADJUSTMENT: same non-destructive pattern as
  // Spatial, one form each, reset alongside it whenever the session
  // canvas is reseeded for a newly-active real asset.
  const [visualForm, setVisualForm] = useState<VisualFilterDirective>(DEFAULT_VISUAL);
  const [temporalForm, setTemporalForm] = useState<TemporalDirective>(DEFAULT_TEMPORAL);

  const wantsRealCanvas = Boolean(activeAsset?.isRealAsset && activeAsset.assetFamily && activeAsset.capabilityOrigin);

  if (wantsRealCanvas && activeAsset!.id !== seededForAssetId) {
    // Pure/deterministic seed (no Date.now() — render must stay pure per
    // React's rules); real wall-clock timestamps are set where they
    // belong, inside event handlers: handleApplySpatialAdjustment's
    // mutation and triggerMasterRender's compile-time updatedAt.
    setSessionCanvas({
      canvasId: `canvas_${activeAsset!.id}`,
      // Overwritten server-side with the real, session-verified tenant id
      // at compile time regardless of what's carried here — see the
      // compile route's own note.
      subscriberTenantId: 'pending-server-verification',
      canvasType: CanvasType.CINEMATIC,
      title: activeAsset!.title,
      tracks: [
        {
          trackId: 'track-1',
          trackName: 'المسار الرئيسي',
          isMuted: false,
          isHidden: false,
          nodes: [
            {
              nodeId: 'node-1',
              assetId: activeAsset!.id,
              assetFamily: activeAsset!.assetFamily!,
              capabilityOrigin: activeAsset!.capabilityOrigin!,
            },
          ],
        },
      ],
      createdAt: 0,
      updatedAt: 0,
    });
    setSpatialForm(DEFAULT_SPATIAL);
    setVisualForm(DEFAULT_VISUAL);
    setTemporalForm(DEFAULT_TEMPORAL);
    setSeededForAssetId(activeAsset!.id);
  } else if (!wantsRealCanvas && seededForAssetId !== null) {
    setSessionCanvas(null);
    setSeededForAssetId(null);
  }

  const activeSpatialDirective = sessionCanvas?.tracks[0]?.nodes[0]?.spatial;

  const handleApplySpatialAdjustment = () => {
    if (!sessionCanvas) return;

    const mutation: UpdateNodeSpatialPayload = {
      actionType: CanvasActionType.UPDATE_SPATIAL,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      spatialUpdates: spatialForm,
    };

    const updatedCanvas = rasAlAmrStateManager.applyMutation(sessionCanvas, mutation);
    setSessionCanvas(updatedCanvas);
  };

  // pixel-grade + chroma-forge share this one real 'visual' directive slot.
  const activeVisualDirective = sessionCanvas?.tracks[0]?.nodes[0]?.customDirectives?.visual as
    | VisualFilterDirective
    | undefined;

  const handleApplyVisualAdjustment = () => {
    if (!sessionCanvas) return;

    const mutation: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      directiveKey: 'visual',
      directivePayload: visualForm,
    };

    const updatedCanvas = rasAlAmrStateManager.applyMutation(sessionCanvas, mutation);
    setSessionCanvas(updatedCanvas);
  };

  // neural-sync drives real timeline timing — the truthful reading of
  // "synchronization" available in the real assembly contracts today.
  const activeTemporalDirective = sessionCanvas?.tracks[0]?.nodes[0]?.temporal;

  const handleApplyTemporalAdjustment = () => {
    if (!sessionCanvas) return;

    const mutation: UpdateNodeTemporalPayload = {
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      temporalUpdates: temporalForm,
    };

    const updatedCanvas = rasAlAmrStateManager.applyMutation(sessionCanvas, mutation);
    setSessionCanvas(updatedCanvas);
  };

  // --- Summoning Bridge States ---
  const [isSummonOpen, setIsSummonOpen] = useState<boolean>(false);
  const [selectedVault, setSelectedVault] = useState<string>('');
  const [injectionFlash, setInjectionFlash] = useState<boolean>(false);

  // --- Real Sovereign Vault assets — the Summoning Bridge's real source ---
  const [vaultAssets, setVaultAssets] = useState<VaultAsset[]>([]);
  const [vaultAssetsLoaded, setVaultAssetsLoaded] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/vault/assets')
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 'succeeded') setVaultAssets(result.assets);
      })
      .catch(() => {
        // Honest degrade: an unreachable Vault means an empty Summoning
        // Bridge, not a crash — the same silent-catch pattern already
        // used throughout this platform's real API consumers.
      })
      .finally(() => setVaultAssetsLoaded(true));
  }, []);

  const realVaultCategories = useMemo(() => {
    const byTarget = new Map<string, VaultAsset[]>();
    for (const asset of vaultAssets) {
      const list = byTarget.get(asset.capabilityTarget) ?? [];
      list.push(asset);
      byTarget.set(asset.capabilityTarget, list);
    }
    return Array.from(byTarget.entries()).map(([target, assets]) => ({
      id: target,
      name: CAPABILITY_LABELS[target]?.name ?? target,
      icon: CAPABILITY_LABELS[target]?.icon ?? '◆',
      assets,
    }));
  }, [vaultAssets]);

  const activeVaultCategory = realVaultCategories.find((c) => c.id === selectedVault) ?? realVaultCategories[0];

  // --- Real-time Timeline Playhead Pulse ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineProgress(prev => (prev >= 100 ? 0 : prev + 0.15));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // --- Real Director Compilation: compiles the real, per-session
  // SovereignCanvas (sessionCanvas) — including any real spatial edits
  // the Creator applied — via the real, already-certified compile
  // endpoint. Never simulated.
  const canCompile = Boolean(activeAsset?.isRealAsset && activeAsset.secureStorageUri && sessionCanvas);

  const triggerMasterRender = async () => {
    if (!activeAsset?.isRealAsset || !sessionCanvas) return;

    setIsRendering(true);
    setRenderStatus('جاري الصهر الحقيقي عبر بوابة الدخول السيادية...');

    const canvas: SovereignCanvas = { ...sessionCanvas, updatedAt: Date.now() };

    try {
      const response = await fetch('/api/sovereign/entry/ras-al-amr/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvas }),
      });
      const result = await response.json();

      if (!response.ok) {
        setRenderStatus(`فشل الصهر الحقيقي — ${result.message ?? result.error ?? 'خطأ غير معروف'}`);
        return;
      }

      const compiled = result as CompiledAssemblyGraph;
      setCompiledGraph(compiled);
      setCompiledForAssetId(activeAsset.id);
      setRenderStatus(
        `تم الصهر الحقيقي بنجاح — ${compiled.compilationId} — ${compiled.metadata.totalNodes} عنصر مضمَّن`,
      );
    } catch {
      setRenderStatus('تعذّر الوصول إلى بوابة الدخول السيادية للصهر.');
    } finally {
      setIsRendering(false);
    }
  };

  // --- Summoning Pull Action: injects a REAL Vault asset into the console ---
  const handleInjectAsset = (asset: VaultAsset) => {
    const prompt = typeof asset.metadata.generationPrompt === 'string' ? asset.metadata.generationPrompt : null;
    const newAsset: QueueItem = {
      id: asset.assetId,
      title: prompt ? prompt.slice(0, 60) : 'أصل من الخزانة السيادية',
      type: typeLabelForCapability(asset.capabilityTarget),
      source: 'الخزانة السيادية',
      duration: '--:--',
      status: 'أصل حقيقي — تم استدعاؤه من الخزانة السيادية',
      isRealAsset: true,
      secureStorageUri: asset.secureStorageUri,
      assetFamily: asset.assetFamily,
      capabilityOrigin: asset.capabilityTarget,
    };

    setQueue(prevQueue => [newAsset, ...prevQueue.filter((a) => a.id !== newAsset.id)]);
    setActiveAsset(newAsset);
    setIsSummonOpen(false);

    // Trigger neon golden flash animation sequence
    setInjectionFlash(true);
    setTimeout(() => setInjectionFlash(false), 800);
  };

  // --- Forward to Makman: carries a real handoff payload only for a
  // real, Vault-sourced active asset — the demo seed items forward with
  // no payload, exactly as before this Package. THE CORRIDOR PACKAGE:
  // also carries the real compiled graph, but ONLY when it was compiled
  // from the asset currently being forwarded — a stale compile from a
  // since-replaced active asset must never ride along as if it matched.
  const handleForwardToMakman = () => {
    if (activeAsset?.isRealAsset && activeAsset.secureStorageUri) {
      try {
        sessionStorage.setItem('azma.transfer.rasAmrProduction', JSON.stringify({
          id: activeAsset.id,
          title: activeAsset.title,
          secureStorageUri: activeAsset.secureStorageUri,
        }));
        sessionStorage.setItem('azma.transfer.origin', 'ras-amr');

        if (compiledGraph && compiledForAssetId === activeAsset.id) {
          sessionStorage.setItem('azma.transfer.rasAmrCompiledGraph', JSON.stringify(compiledGraph));
        } else {
          sessionStorage.removeItem('azma.transfer.rasAmrCompiledGraph');
        }
      } catch { /* ignore — navigation still proceeds */ }
    }
    router.push('/makman-al-ghayah');
  };

  return (
    <RasAmrExperience>
    <main className={`ras-amr-viewport ${injectionFlash ? 'neon-flash-active' : ''}`}>
      {/* Universal Sovereign Back Button */}
      <button className="sovereign-exit-btn" onClick={() => router.back()}>
        ⮜ نحو حجره مكمن الغايه 
      </button>

      {/* Cyber Golden Neon Grid Atmosphere */}
      <div className="neon-layer">
        <div className="cyber-grid" />
        <div className="neon-pulse-glow np-left" />
        <div className="neon-pulse-glow np-right" />
      </div>

      <div className="chamber-grid-layout">
        
        {/* ========================================= */}
        {/* 1. LEFT SIDEBAR: SMART QUEUE              */}
        {/* ========================================= */}
        <aside className="control-panel queue-sidebar neon-border">
          <header className="panel-header">
            <div className="neon-tag">AUTOMATED FLOW</div>
            <h2>قائمة الانتظار الذكية</h2>
            <p>تدفق الأصول الواردة من الحجرات</p>

            {/* CRITICAL: Sovereign Summoning Bridge Trigger */}
            <button 
              className="summon-bridge-trigger-btn"
              onClick={() => setIsSummonOpen(true)}
            >
              <span className="summon-pulse-icon">🎙️</span>
              استدعاء من الخزائن الملكية
            </button>
          </header>

          <div className="queue-container custom-scroll">
            {queue.map(asset => (
              <div 
                key={asset.id} 
                className={`queue-item-card ${activeAsset?.id === asset.id ? 'active-neon-card' : ''}`}
                onClick={() => setActiveAsset(asset)}
              >
                <div className="item-meta">
                  <span className="item-type-badge">{asset.type}</span>
                  <span className="item-source">{asset.source}</span>
                </div>
                <h3 className="item-title">{asset.title}</h3>
                <div className="item-footer">
                  <span className="item-duration">⏱ {asset.duration}</span>
                  <span className="item-status-text">{asset.status}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ========================================= */}
        {/* 2. CENTRAL WING: MASTER PREVIEW & CONSOLE */}
        {/* ========================================= */}
        <section className="main-director-core">
          
          {/* Hollywood Monitor Viewport */}
          <div className="cinema-monitor-frame neon-border-heavy">
            <div className="monitor-glass-overlay" />
            <div className="monitor-safe-area-lines" />
            
            <div className="monitor-meta-top">
              <span className="rec-indicator">● LIVE MASTER DIRECT</span>
              <span>RESOL: 8K SOVEREIGN ULTRA</span>
              <span>FPS: 23.976fps CRYPTO</span>
            </div>

            <div className="monitor-center-content">
              {activeAsset ? (
                <div className="active-rendering-visualization">
                  <div className="hologram-asset-icon">✦</div>
                  <h2 className="visualized-title">{activeAsset.title}</h2>
                  <p className="visualized-subtitle">توجيه البكسل الجاري عبر: {hollywoodTools.find(t => t.id === activeTool)?.label}</p>
                </div>
              ) : (
                <div className="idle-monitor-text">يرجى استدعاء أصل من قائمة الانتظار للبدء</div>
              )}
            </div>

            <div className="monitor-meta-bottom">
              <span>TC: 01:22:14:09</span>
              <div className="waveform-sim">
                <span className="wave-bar" style={{height: '40%'}} />
                <span className="wave-bar" style={{height: '70%'}} />
                <span className="wave-bar" style={{height: '90%'}} />
                <span className="wave-bar" style={{height: '50%'}} />
                <span className="wave-bar" style={{height: '80%'}} />
              </div>
              <span>PIXEL COMPLIANT: OK</span>
            </div>
          </div>

          {/* Precision Cinematic Timeline */}
          <div className="sovereign-timeline-panel neon-border">
            <div className="timeline-ruler">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="ruler-tick">00:0{i}:00</span>
              ))}
            </div>
            <div className="timeline-track">
              <div 
                className="timeline-playhead" 
                style={{ right: `${timelineProgress}%` }}
              />
              <div className="timeline-block-filled">
                {activeAsset ? activeAsset.title : 'لا يوجد أصل نشط'}
              </div>
            </div>
          </div>

          {/* Console Live Status bar */}
          <div className="console-status-strip">
            <div className="status-node">
              <span className="pulse-dot gold" />
              <span>الحالة التشغيلية: {renderStatus}</span>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* 3. RIGHT SIDEBAR: HOLLYWOOD STUDIO TOOLS  */}
        {/* ========================================= */}
        <aside className="control-panel tools-sidebar neon-border">
          <header className="panel-header">
            <div className="neon-tag">HOLLYWOOD MATRIX</div>
            <h2>لوحة الإخراج الشاملة</h2>
            <p>أدوات التوجيه الدقيق وتحكم البكسل</p>
          </header>

          <div className="mode-switcher-rack">
            <button 
              className={`mode-btn ${directingMode === 'smart' ? 'active-smart' : ''}`}
              onClick={() => setDirectingMode('smart')}
            >
              🤖 إخراج ذكي آلي
            </button>
            <button 
              className={`mode-btn ${directingMode === 'manual' ? 'active-manual' : ''}`}
              onClick={() => setDirectingMode('manual')}
            >
              ✂️ إخراج يدوي محكم
            </button>
          </div>

          <div className="tools-rack-grid">
            {hollywoodTools.map(tool => (
              <button
                key={tool.id}
                className={`tool-console-button ${activeTool === tool.id ? 'tool-selected-neon' : ''} ${tool.category !== directingMode ? 'dimmed-tool' : ''}`}
                onClick={() => setActiveTool(tool.id)}
              >
                <span className="tool-btn-icon">{tool.icon}</span>
                <span className="tool-btn-label">{tool.label}</span>
                <div className="tool-btn-light-corner" />
              </button>
            ))}
          </div>

          {sessionCanvas && (
            <div className="spatial-adjust-panel">
              <header className="panel-header">
                <div className="neon-tag">REAL — SPATIAL</div>
                <h2>تعديل مكاني حقيقي</h2>
                <p>يُطبَّق فعلياً على القماش السيادي ويصل إلى الصهر النهائي</p>
              </header>
              <div className="spatial-input-grid">
                <label>
                  X
                  <input
                    type="number"
                    value={spatialForm.positionX}
                    onChange={(e) => setSpatialForm((prev) => ({ ...prev, positionX: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Y
                  <input
                    type="number"
                    value={spatialForm.positionY}
                    onChange={(e) => setSpatialForm((prev) => ({ ...prev, positionY: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Scale X
                  <input
                    type="number"
                    step="0.1"
                    value={spatialForm.scaleX}
                    onChange={(e) => setSpatialForm((prev) => ({ ...prev, scaleX: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Scale Y
                  <input
                    type="number"
                    step="0.1"
                    value={spatialForm.scaleY}
                    onChange={(e) => setSpatialForm((prev) => ({ ...prev, scaleY: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Rotation°
                  <input
                    type="number"
                    value={spatialForm.rotationDegrees}
                    onChange={(e) => setSpatialForm((prev) => ({ ...prev, rotationDegrees: Number(e.target.value) }))}
                  />
                </label>
              </div>
              <button className="action-trigger-btn spatial-apply-btn" onClick={handleApplySpatialAdjustment}>
                ⇲ تطبيق التعديل المكاني الحقيقي
              </button>
              {activeSpatialDirective && (
                <p className="spatial-current-state">
                  الحالي: X={activeSpatialDirective.positionX}, Y={activeSpatialDirective.positionY}, Scale=({activeSpatialDirective.scaleX}, {activeSpatialDirective.scaleY}), Rotation={activeSpatialDirective.rotationDegrees}°
                </p>
              )}
            </div>
          )}

          {sessionCanvas && (
            <div className="spatial-adjust-panel">
              <header className="panel-header">
                <div className="neon-tag">REAL — VISUAL</div>
                <h2>تعديل بصري حقيقي</h2>
                <p>يدعم: معالج البكسل + صهر اللون — خانة بصرية حقيقية واحدة يشتركان فيها</p>
              </header>
              <div className="spatial-input-grid">
                <label>
                  Opacity
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={visualForm.opacity}
                    onChange={(e) => setVisualForm((prev) => ({ ...prev, opacity: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Blend Mode
                  <select
                    value={visualForm.blendMode}
                    onChange={(e) => setVisualForm((prev) => ({ ...prev, blendMode: e.target.value as VisualFilterDirective['blendMode'] }))}
                  >
                    {BLEND_MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button className="action-trigger-btn spatial-apply-btn" onClick={handleApplyVisualAdjustment}>
                🎨 تطبيق التعديل البصري الحقيقي
              </button>
              {activeVisualDirective && (
                <p className="spatial-current-state">
                  الحالي: Opacity={activeVisualDirective.opacity}, Blend={activeVisualDirective.blendMode}
                </p>
              )}
            </div>
          )}

          {sessionCanvas && (
            <div className="spatial-adjust-panel">
              <header className="panel-header">
                <div className="neon-tag">REAL — TEMPORAL</div>
                <h2>تعديل زمني حقيقي</h2>
                <p>يدعم: المزامنة العصبية للصوت — توقيت حقيقي على الخط الزمني الرئيسي</p>
              </header>
              <div className="spatial-input-grid">
                <label>
                  بداية (ث)
                  <input
                    type="number"
                    min="0"
                    value={temporalForm.globalStartTimeSeconds}
                    onChange={(e) => setTemporalForm((prev) => ({ ...prev, globalStartTimeSeconds: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  مدة (ث)
                  <input
                    type="number"
                    min="0"
                    value={temporalForm.playDurationSeconds}
                    onChange={(e) => setTemporalForm((prev) => ({ ...prev, playDurationSeconds: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  قص-من (ث)
                  <input
                    type="number"
                    min="0"
                    value={temporalForm.trimStartSeconds ?? ''}
                    onChange={(e) => setTemporalForm((prev) => ({ ...prev, trimStartSeconds: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </label>
                <label>
                  قص-إلى (ث)
                  <input
                    type="number"
                    min="0"
                    value={temporalForm.trimEndSeconds ?? ''}
                    onChange={(e) => setTemporalForm((prev) => ({ ...prev, trimEndSeconds: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </label>
              </div>
              <button className="action-trigger-btn spatial-apply-btn" onClick={handleApplyTemporalAdjustment}>
                🎙 تطبيق التعديل الزمني الحقيقي
              </button>
              {activeTemporalDirective && (
                <p className="spatial-current-state">
                  الحالي: بداية={activeTemporalDirective.globalStartTimeSeconds}ث، مدة={activeTemporalDirective.playDurationSeconds}ث
                  {activeTemporalDirective.trimStartSeconds !== undefined ? `، قص-من=${activeTemporalDirective.trimStartSeconds}ث` : ''}
                  {activeTemporalDirective.trimEndSeconds !== undefined ? `، قص-إلى=${activeTemporalDirective.trimEndSeconds}ث` : ''}
                </p>
              )}
            </div>
          )}

          <div className="executive-actions-panel">
            <button
              className={`action-trigger-btn render-btn ${isRendering ? 'rendering' : ''}`}
              onClick={triggerMasterRender}
              disabled={isRendering || !canCompile}
              title={!canCompile ? 'استدعِ أصلاً حقيقياً من الخزانة السيادية أولاً — لا يوجد صهر تجريبي بعد الآن' : undefined}
            >
              🎬 صهر الإخراج النهائي (Master Render)
            </button>
            
            <button
              className="action-trigger-btn forward-btn"
              onClick={handleForwardToMakman}
              title={
                compiledGraph && compiledForAssetId === activeAsset?.id
                  ? 'سيصل تجميع حقيقي مختوم إلى مكمن الغاية — جاهز للتوزيع السيادي الحقيقي'
                  : 'لا يوجد تجميع حقيقي مصهور بعد لهذا الأصل — سيصل عرض أولي فقط'
              }
            >
              👑 ترحيل العمل المكتمل لـ &quot;مكمن الغاية&quot;
            </button>
          </div>
        </aside>

      </div>

      {/* ======================================================= */}
      {/* 4. SOVEREIGN SUMMONING BRIDGE: HOLOGRAPHIC HUD DRAWER   */}
      {/* ======================================================= */}
      {isSummonOpen && (
        <div className="summon-hud-overlay">
          <div className="hud-window-container metallic-surface neon-border-heavy fade-in">
            <header className="hud-header">
              <div className="hud-title-block">
                <span className="hud-badge">HUD SYSTEM INTERCONNECT</span>
                <h2>بوابة الاستدعاء الهولوغرامية للأصول</h2>
                <p>سحب وحقن الأصول حياً من الخزائن الملكية إلى غرفة المونتاج مباشرة</p>
              </div>
              <button className="hud-close-btn" onClick={() => setIsSummonOpen(false)}>✖ إلغاء الاستدعاء</button>
            </header>

            {vaultAssetsLoaded && realVaultCategories.length === 0 ? (
              <div className="hud-empty-state">
                <p>لا توجد أصول محفوظة بعد في الخزانة السيادية.</p>
                <p>أنشئ عملاً في حجرة القيامة أولاً، ثم عد لاستدعائه هنا.</p>
              </div>
            ) : (
              <div className="hud-body-layout">
                {/* Mini Vault Tabs Side — real categories, derived from the Creator's real assets */}
                <aside className="hud-vaults-picker custom-scroll">
                  {realVaultCategories.map(v => (
                    <button
                      key={v.id}
                      className={`hud-vault-tab ${activeVaultCategory?.id === v.id ? 'active-hud-tab' : ''}`}
                      onClick={() => setSelectedVault(v.id)}
                    >
                      <span className="hud-tab-icon">{v.icon}</span>
                      <span className="hud-tab-name">{v.name}</span>
                    </button>
                  ))}
                </aside>

                {/* Vault Internal Content View — real assets */}
                <main className="hud-items-viewer custom-scroll">
                  <h3 className="viewer-title-context">
                    محتويات {activeVaultCategory?.name} المتاحة للاستدعاء الفوري:
                  </h3>
                  <div className="hud-items-grid">
                    {activeVaultCategory?.assets.map((asset) => {
                      const prompt = typeof asset.metadata.generationPrompt === 'string' ? asset.metadata.generationPrompt : null;
                      return (
                        <div key={asset.assetId} className="hud-asset-item-chip glassmorphism">
                          <div className="hud-item-graphic">✧</div>
                          <span className="hud-item-name">{prompt ? prompt.slice(0, 60) : asset.assetId}</span>
                          <button
                            className="hud-inject-btn"
                            onClick={() => handleInjectAsset(asset)}
                          >
                            ⚡ حقن في العمليات الجارية
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </main>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
    </RasAmrExperience>
  );
}
