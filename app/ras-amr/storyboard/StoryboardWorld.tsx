'use client';

/**
 * AZMA OS — Ras Al-Amr: Storyboard World (the chamber's second path).
 *
 * Builds a story scene by scene on a real NARRATIVE canvas
 * (src/chambers/ras-al-amr/storyboard.ts), saves it through the same canvas
 * route as montage, previews the sequence with the shared timing contract
 * (cinematic-timing.ts), and renders the MP4 through the chamber's own render
 * route. It never writes the montage session; "open in montage" hands the
 * laid-out timeline to the parent, which snapshots montage first.
 *
 * Scene frames come from the Sovereign Vault (uploads and earlier creations).
 * Automatic frame generation by the external storyboard runner is not wired:
 * the runner's source and endpoint are not reachable from this build, so the
 * path says so instead of offering a button that cannot work.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VaultAsset } from '@/src/vault/sovereign-vault-types';
import { AssetFamily } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';
import type { AssemblyNode, SovereignCanvas } from '@/src/chambers/ras-al-amr/assembly-contracts';
import { computeVisualWindow, mapNextVisualSiblings, visualOpacityAt } from '@/src/chambers/ras-al-amr/cinematic-timing';
import {
  addScene,
  assessStoryboardReadiness,
  attachAsset,
  createStoryboardProject,
  detachAsset,
  isSoundNode,
  isStoryboardCanvasId,
  isVisualNode,
  moveScene,
  readScenes,
  removeScene,
  storyboardToProductionCanvas,
  updateScene,
  MAX_SCENE_SECONDS,
  MIN_SCENE_SECONDS,
  type SceneTransition,
} from '@/src/chambers/ras-al-amr/storyboard';
import './storyboard.css';

const LAST_PROJECT_KEY = 'azma.rasAmr.storyboard.last';
const RENDER_SIGNATURES_KEY = 'azma.rasAmr.renderSignatures';

interface ProjectSummary { canvasId: string; title: string; savedAt: number }

type SaveState = 'saved' | 'pending' | 'saving' | 'error';

interface RenderJob {
  operationId: string;
  status: 'processing' | 'succeeded' | 'failed';
  startedAt: number;
  fileUrl?: string;
  downloadUrl?: string;
  message?: string;
  signature?: string;
}

export interface StoryboardWorldProps {
  /** Back to the chamber's entry (both paths). */
  onBack: () => void;
  /** Hands the laid-out CINEMATIC timeline to the montage path. */
  onOpenInMontage: (production: SovereignCanvas) => void;
  /** How many nodes the montage session holds right now (for the confirm). */
  montageNodeCount: number;
}

/** Wall clock for edit timestamps (event handlers only). */
function clock(): number {
  return Date.now();
}

function readLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeLocal(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* a convenience only */ }
}

/** Short stable fingerprint of what the MP4 would contain. */
function productionSignature(canvas: SovereignCanvas): string {
  const text = JSON.stringify(storyboardToProductionCanvas(canvas).tracks);
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash * 33) ^ text.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

function rememberSignature(operationId: string, signature: string): void {
  try {
    const map = JSON.parse(readLocal(RENDER_SIGNATURES_KEY) ?? '{}') as Record<string, string>;
    const entries = Object.entries({ ...map, [operationId]: signature }).slice(-10);
    writeLocal(RENDER_SIGNATURES_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch { /* a convenience only */ }
}
function recallSignature(operationId: string): string | undefined {
  try {
    return (JSON.parse(readLocal(RENDER_SIGNATURES_KEY) ?? '{}') as Record<string, string>)[operationId];
  } catch { return undefined; }
}

function kindLabel(capability: CapabilityTarget): string {
  return capability === CapabilityTarget.MOTION ? 'فيديو' : capability === CapabilityTarget.AUDIO ? 'صوت' : 'صورة';
}

function formatSeconds(total: number): string {
  const s = Math.max(0, Math.round(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const TIME_LABEL = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** What the Creator recognises an asset by: its prompt, its voice name, or its kind and when it arrived. */
function assetLabel(asset: VaultAsset | undefined, fallbackCapability: CapabilityTarget): string {
  const prompt = asset?.metadata.generationPrompt;
  if (typeof prompt === 'string' && prompt.trim()) return prompt.trim().slice(0, 40);
  const voiceName = asset?.metadata.voiceDisplayName;
  if (typeof voiceName === 'string' && voiceName.trim()) return voiceName.trim();
  const kind = kindLabel(asset?.capabilityTarget ?? fallbackCapability);
  return asset?.createdAt ? `${kind} · ${TIME_LABEL.format(asset.createdAt)}` : kind;
}

function AssetThumb({ asset, capability }: { asset: VaultAsset | undefined; capability: CapabilityTarget }) {
  if (!asset) return <span className="sb-thumb sb-thumb-missing" title="لم يعد في الخزانة">؟</span>;
  if (capability === CapabilityTarget.AUDIO) return <span className="sb-thumb sb-thumb-audio" aria-hidden="true">♪</span>;
  if (capability === CapabilityTarget.MOTION) {
    return <video className="sb-thumb" src={asset.secureStorageUri} muted preload="metadata" aria-hidden="true" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="sb-thumb" src={asset.secureStorageUri} alt="" />;
}

export default function StoryboardWorld({ onBack, onOpenInMontage, montageNodeCount }: StoryboardWorldProps) {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [project, setProject] = useState<SovereignCanvas | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [vault, setVault] = useState<VaultAsset[]>([]);
  const [vaultLoaded, setVaultLoaded] = useState(false);
  const [pickerSceneId, setPickerSceneId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmRemoveSceneId, setConfirmRemoveSceneId] = useState<string | null>(null);
  const [confirmMontage, setConfirmMontage] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
  const [isStartingRender, setIsStartingRender] = useState(false);
  const [renderStartError, setRenderStartError] = useState<string | null>(null);
  const [renderClock, setRenderClock] = useState(0);

  const saveTimerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<SovereignCanvas | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRefs = useRef(new Map<string, HTMLMediaElement>());
  // The project as of the latest edit, for async handlers (uploads) that
  // must not attach to a stale copy.
  const latestProjectRef = useRef<SovereignCanvas | null>(null);
  const applyProject = (next: SovereignCanvas | null) => {
    latestProjectRef.current = next;
    setProject(next);
  };

  // ── Persistence ─────────────────────────────────────────────────────────
  const persist = useCallback(async (canvas: SovereignCanvas): Promise<boolean> => {
    setSaveState('saving');
    try {
      const response = await fetch('/api/ras-amr/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvas }),
      });
      const ok = response.ok;
      if (pendingSaveRef.current === canvas || pendingSaveRef.current === null) setSaveState(ok ? 'saved' : 'error');
      return ok;
    } catch {
      setSaveState('error');
      return false;
    }
  }, []);

  const flushSave = useCallback(async (): Promise<boolean> => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const pending = pendingSaveRef.current;
    if (!pending) return true;
    const ok = await persist(pending);
    if (ok && pendingSaveRef.current === pending) pendingSaveRef.current = null;
    return ok;
  }, [persist]);

  /** Every edit goes through here: state now, a debounced save shortly after. */
  const commit = (next: SovereignCanvas) => {
    applyProject(next);
    pendingSaveRef.current = next;
    setSaveState('pending');
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => { void flushSave(); }, 700);
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/ras-amr/canvas');
      const data = await response.json() as { status: string; canvases?: ProjectSummary[]; message?: string };
      if (data.status !== 'succeeded') {
        setListError(response.status === 401 ? 'سجّل الدخول لتحفظ مشاريعك.' : 'تعذّر تحميل مشاريعك.');
        setProjects([]);
        return;
      }
      setListError(null);
      setProjects((data.canvases ?? []).filter((c) => isStoryboardCanvasId(c.canvasId)));
    } catch {
      setListError('بوابة الحفظ لا تستجيب.');
      setProjects([]);
    }
  }, []);

  const restoreLatestRender = useCallback(async (canvasId: string) => {
    try {
      const list = await (await fetch(`/api/ras-amr/render?projectId=${encodeURIComponent(canvasId)}`)).json();
      const latest = list?.renders?.[0];
      if (!latest?.operationId) { setRenderJob(null); return; }
      const status = await (await fetch(`/api/ras-amr/render/${encodeURIComponent(latest.operationId)}`)).json();
      if (!status?.operationId) return;
      setRenderJob({
        operationId: status.operationId,
        status: status.status === 'succeeded' ? 'succeeded' : status.status === 'failed' ? 'failed' : 'processing',
        startedAt: typeof status.startedAt === 'number' ? status.startedAt : 0,
        fileUrl: status.fileUrl,
        downloadUrl: status.downloadUrl,
        message: status.message,
        signature: recallSignature(status.operationId),
      });
    } catch { /* nothing to restore */ }
  }, []);

  const openProject = useCallback(async (canvasId: string) => {
    try {
      const response = await fetch(`/api/ras-amr/canvas/${encodeURIComponent(canvasId)}`);
      const data = await response.json() as { status: string; canvas?: SovereignCanvas };
      setOpenError(null);
      if (data.status !== 'succeeded' || !data.canvas) {
        setOpenError('تعذّر فتح هذا المشروع.');
        writeLocal(LAST_PROJECT_KEY, null);
        return;
      }
      latestProjectRef.current = data.canvas;
      setProject(data.canvas);
      setSaveState('saved');
      setPlayhead(0);
      setIsPlaying(false);
      setRenderJob(null);
      writeLocal(LAST_PROJECT_KEY, data.canvas.canvasId);
      void restoreLatestRender(data.canvas.canvasId);
    } catch {
      setOpenError('بوابة الحفظ لا تستجيب.');
    }
  }, [restoreLatestRender]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/vault/assets')
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.status === 'succeeded') setVault(data.assets as VaultAsset[]); })
      .catch(() => { /* an unreachable Vault shows as empty, never as a crash */ })
      .finally(() => { if (!cancelled) setVaultLoaded(true); });
    // Returning to the path reopens the project the Creator last worked on.
    const last = readLocal(LAST_PROJECT_KEY);
    void Promise.resolve().then(() => {
      if (cancelled) return;
      void loadProjects();
      if (last && isStoryboardCanvasId(last)) void openProject(last);
    });
    return () => { cancelled = true; };
  }, [loadProjects, openProject]);

  // ── Derived ─────────────────────────────────────────────────────────────
  const vaultById = useMemo(() => new Map(vault.map((a) => [a.assetId, a])), [vault]);
  const vaultIds = useMemo(() => new Set(vault.map((a) => a.assetId)), [vault]);
  const scenes = useMemo(() => (project ? readScenes(project) : []), [project]);
  const readiness = useMemo(
    () => (project && vaultLoaded ? assessStoryboardReadiness(project, vaultIds) : null),
    [project, vaultIds, vaultLoaded],
  );
  const production = useMemo(() => (project ? storyboardToProductionCanvas(project) : null), [project]);
  const signature = useMemo(() => (project ? productionSignature(project) : ''), [project]);
  const totalDuration = readiness?.totalDurationSeconds ?? scenes.reduce((s, sc) => s + sc.durationSeconds, 0);
  const pickableAssets = useMemo(
    () => vault.filter((a) => a.assetFamily === AssetFamily.MEDIA).sort((a, b) => b.createdAt - a.createdAt),
    [vault],
  );

  // ── Preview playback (same timing contract as the MP4) ──────────────────
  const previewLayers = useMemo(() => {
    if (!production) return [];
    const next = mapNextVisualSiblings(production.tracks, isVisualNode);
    return production.tracks[0].nodes.filter(isVisualNode).map((node) => ({
      node,
      window: computeVisualWindow(node.temporal, next.get(node.nodeId)?.temporal),
    }));
  }, [production]);
  const previewSounds = useMemo(() => production?.tracks[0].nodes.filter(isSoundNode) ?? [], [production]);

  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    const startWall = performance.now();
    const startAt = playhead >= totalDuration ? 0 : playhead;
    const tick = () => {
      const t = startAt + (performance.now() - startWall) / 1000;
      if (t >= totalDuration) {
        setPlayhead(totalDuration);
        setIsPlaying(false);
        return;
      }
      setPlayhead(t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  // Restarting the clock only when play is pressed, not on every frame.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Keep video layers and sound in step with the preview clock.
  useEffect(() => {
    const sync = (el: HTMLMediaElement | undefined, start: number, duration: number) => {
      if (!el) return;
      const local = playhead - start;
      const inside = isPlaying && local >= 0 && local < duration;
      if (!inside) { if (!el.paused) el.pause(); return; }
      if (Math.abs(el.currentTime - local) > 0.35) el.currentTime = local;
      if (el.paused) void el.play().catch(() => { /* autoplay refused — preview stays silent */ });
    };
    for (const { node, window } of previewLayers) {
      if (node.capabilityOrigin === CapabilityTarget.MOTION) {
        sync(mediaRefs.current.get(node.nodeId), window.startSeconds, window.playDurationSeconds);
      }
    }
    for (const node of previewSounds) {
      sync(mediaRefs.current.get(node.nodeId), node.temporal?.globalStartTimeSeconds ?? 0, node.temporal?.playDurationSeconds ?? 0);
    }
  }, [playhead, isPlaying, previewLayers, previewSounds]);

  let currentScene: { scene: (typeof scenes)[number]; index: number } | null = null;
  {
    let start = 0;
    for (let index = 0; index < scenes.length; index++) {
      currentScene = { scene: scenes[index], index };
      if (playhead < start + scenes[index].durationSeconds) break;
      start += scenes[index].durationSeconds;
    }
  }

  const seekToScene = (sceneId: string) => {
    let start = 0;
    for (const scene of scenes) {
      if (scene.sceneId === sceneId) break;
      start += scene.durationSeconds;
    }
    setIsPlaying(false);
    setPlayhead(start);
  };

  // ── Render (the chamber's own MP4 path) ─────────────────────────────────
  const pollingOperationId = renderJob?.status === 'processing' ? renderJob.operationId : null;
  useEffect(() => {
    if (!pollingOperationId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await (await fetch(`/api/ras-amr/render/${encodeURIComponent(pollingOperationId)}`)).json();
        if (cancelled || data.status === 'processing') return;
        setRenderJob((prev) => prev && prev.operationId === pollingOperationId ? {
          ...prev,
          status: data.status === 'succeeded' ? 'succeeded' : 'failed',
          fileUrl: data.fileUrl,
          downloadUrl: data.downloadUrl,
          message: data.message,
        } : prev);
      } catch { /* next tick retries */ }
    };
    void poll();
    const pollTimer = window.setInterval(() => { void poll(); }, 2500);
    const clockTimer = window.setInterval(() => setRenderClock(clock()), 1000);
    return () => { cancelled = true; window.clearInterval(pollTimer); window.clearInterval(clockTimer); };
  }, [pollingOperationId]);

  const handleStartRender = async () => {
    if (!project || !production || !readiness?.ready) return;
    setIsStartingRender(true);
    setRenderStartError(null);
    setIsPlaying(false);
    await flushSave();
    try {
      const response = await fetch('/api/ras-amr/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvas: production }),
      });
      const data = await response.json();
      if (response.status !== 202 || data.status !== 'accepted') {
        setRenderStartError(data.message ?? 'تعذّر بدء الإخراج. مشروعك محفوظ؛ حاول مرة أخرى.');
        return;
      }
      rememberSignature(data.operationId, signature);
      const now = clock();
      setRenderClock(now);
      setRenderJob({ operationId: data.operationId, status: 'processing', startedAt: now, signature });
    } catch {
      setRenderStartError('بوابة الإخراج لا تستجيب. مشروعك محفوظ؛ حاول مرة أخرى.');
    } finally {
      setIsStartingRender(false);
    }
  };

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleCreateProject = async () => {
    const created = createStoryboardProject(newTitle, clock());
    const first = addScene(created, { title: 'المشهد 1' }, clock()).canvas;
    applyProject(first);
    setRenderJob(null);
    setPlayhead(0);
    setNewTitle('');
    writeLocal(LAST_PROJECT_KEY, first.canvasId);
    pendingSaveRef.current = first;
    const ok = await flushSave();
    if (ok) void loadProjects();
  };

  const handleCloseProject = async () => {
    setIsPlaying(false);
    await flushSave();
    applyProject(null);
    setRenderJob(null);
    writeLocal(LAST_PROJECT_KEY, null);
    void loadProjects();
  };

  const handleBack = async () => {
    setIsPlaying(false);
    await flushSave();
    onBack();
  };

  const handleAttach = (sceneId: string, asset: VaultAsset) => {
    if (!project) return;
    commit(attachAsset(project, sceneId, asset, clock()).canvas);
    setPickerSceneId(null);
  };

  const handleUpload = async (file: File) => {
    if (!pickerSceneId) return;
    const sceneId = pickerSceneId;
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/vault/assets/upload', { method: 'POST', body });
      const data = await response.json();
      if (data.status !== 'succeeded' || !data.asset) {
        setUploadError(data.message ?? 'لم يُرفع الملف.');
        return;
      }
      const asset = data.asset as VaultAsset;
      setVault((prev) => [asset, ...prev.filter((a) => a.assetId !== asset.assetId)]);
      const base = latestProjectRef.current;
      if (base) {
        commit(attachAsset(base, sceneId, asset, clock()).canvas);
        void flushSave();
      }
      setPickerSceneId(null);
    } catch {
      setUploadError('بوابة الرفع لا تستجيب.');
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const handleOpenInMontage = async () => {
    if (!production) return;
    setConfirmMontage(false);
    await flushSave();
    onOpenInMontage(production);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  const saveLabel = saveState === 'saved' ? '✓ محفوظ' : saveState === 'saving' ? 'يُحفظ…' : saveState === 'pending' ? 'تغييرات لم تُحفظ بعد' : '⚠ لم يُحفظ — حاول مجددًا';
  const isRenderCurrent = Boolean(renderJob?.signature && renderJob.signature === signature);

  return (
    <div className="sb-world" dir="rtl">
      <div className="sb-inner">
        <header className="sb-header">
          <button className="sb-btn sb-btn-ghost" onClick={() => void handleBack()}>← رأس الأمر</button>
          <div className="sb-header-title">
            <span className="sb-kicker">المسار الثاني</span>
            <h1>عالم الاستوري بورد</h1>
          </div>
          {project ? (
            <span className={`sb-save sb-save-${saveState}`} role="status" aria-live="polite">{saveLabel}</span>
          ) : <span />}
        </header>

        <p className="sb-runner-note" role="note">
          ابنِ قصتك مشهدًا بعد مشهد من أصول خزانتك. التوليد التلقائي لإطارات المشاهد عبر مشغّل الاستوري بورد الخارجي غير موصول في هذا الإصدار.
        </p>

        {!project && (
          <section className="sb-projects" aria-label="مشاريع الاستوري بورد">
            <div className="sb-new">
              <input
                className="sb-input"
                placeholder="اسم المشروع الجديد"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                aria-label="اسم المشروع الجديد"
              />
              <button className="sb-btn sb-btn-primary" onClick={() => void handleCreateProject()}>＋ مشروع استوري بورد جديد</button>
            </div>
            {openError && <p className="sb-error" role="alert">{openError}</p>}
            {listError && <p className="sb-error" role="alert">{listError}</p>}
            {projects === null && <p className="sb-muted">مشاريعك تُحمَّل…</p>}
            {projects !== null && projects.length === 0 && !listError && <p className="sb-muted">لا توجد مشاريع استوري بورد بعد.</p>}
            {projects && projects.length > 0 && (
              <ul className="sb-project-list">
                {projects.map((p) => (
                  <li key={p.canvasId}>
                    <button className="sb-project" onClick={() => void openProject(p.canvasId)}>
                      <b>{p.title}</b>
                      <span>{new Date(p.savedAt).toLocaleString('ar')}</span>
                      <span className="sb-project-go">افتح ←</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {project && (
          <>
            <div className="sb-project-bar">
              <input
                className="sb-input sb-title-input"
                value={project.title}
                onChange={(e) => commit({ ...project, title: e.target.value, updatedAt: clock() })}
                aria-label="اسم المشروع"
              />
              <span className="sb-muted">{`${scenes.length} مشهد · ${formatSeconds(totalDuration)}`}</span>
              <button className="sb-btn sb-btn-ghost" onClick={() => void handleCloseProject()}>كل المشاريع</button>
            </div>

            {/* The sequence at a glance */}
            <ol className="sb-strip" aria-label="تسلسل المشاهد">
              {scenes.map((scene, index) => {
                const visual = scene.nodes.find(isVisualNode);
                const asset = visual ? vaultById.get(visual.assetId) : undefined;
                const isCurrent = currentScene?.scene.sceneId === scene.sceneId;
                return (
                  <li key={scene.sceneId} className={`sb-strip-item${isCurrent ? ' is-current' : ''}`}>
                    <button onClick={() => seekToScene(scene.sceneId)} aria-label={`انتقل إلى ${scene.title}`}>
                      <span className="sb-strip-frame">
                        {visual ? <AssetThumb asset={asset} capability={visual.capabilityOrigin} /> : <span className="sb-thumb sb-thumb-empty">بلا إطار</span>}
                      </span>
                      <span className="sb-strip-meta"><b>{index + 1}</b> {scene.title}</span>
                      <span className="sb-strip-time">{`${scene.durationSeconds} ث${index > 0 ? (scene.transitionIn === 'crossfade' ? ' · تلاشٍ' : ' · قطع') : ''}`}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="sb-layout">
              {/* Preview */}
              <section className="sb-preview" aria-label="معاينة التسلسل">
                <div className="sb-stage">
                  {previewLayers.map(({ node, window }) => {
                    const asset = vaultById.get(node.assetId);
                    const opacity = visualOpacityAt(window, playhead);
                    if (!asset) return null;
                    return node.capabilityOrigin === CapabilityTarget.MOTION ? (
                      <video
                        key={node.nodeId}
                        ref={(el) => { if (el) mediaRefs.current.set(node.nodeId, el); else mediaRefs.current.delete(node.nodeId); }}
                        className="sb-stage-layer"
                        src={asset.secureStorageUri}
                        muted
                        playsInline
                        preload="auto"
                        style={{ opacity }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={node.nodeId} className="sb-stage-layer" src={asset.secureStorageUri} alt="" style={{ opacity }} />
                    );
                  })}
                  {previewSounds.map((node) => {
                    const asset = vaultById.get(node.assetId);
                    return asset ? (
                      <audio
                        key={node.nodeId}
                        ref={(el) => { if (el) mediaRefs.current.set(node.nodeId, el); else mediaRefs.current.delete(node.nodeId); }}
                        src={asset.secureStorageUri}
                        preload="auto"
                      />
                    ) : null;
                  })}
                  {previewLayers.length === 0 && <p className="sb-stage-empty">أضف صورة أو مقطعًا إلى مشهد لترى المعاينة.</p>}
                  {currentScene && (
                    <div className="sb-stage-caption" aria-live="polite">
                      <b>{`${currentScene.index + 1} · ${currentScene.scene.title}`}</b>
                      {currentScene.scene.description && <span>{currentScene.scene.description}</span>}
                    </div>
                  )}
                </div>
                <div className="sb-preview-controls">
                  <button
                    className="sb-btn sb-btn-primary"
                    onClick={() => setIsPlaying((p) => !p)}
                    disabled={previewLayers.length === 0}
                  >
                    {isPlaying ? '❚❚ إيقاف' : '▶ معاينة التسلسل'}
                  </button>
                  <input
                    type="range"
                    className="sb-scrub"
                    min={0}
                    max={Math.max(0.1, totalDuration)}
                    step={0.1}
                    value={Math.min(playhead, totalDuration)}
                    onChange={(e) => { setIsPlaying(false); setPlayhead(Number(e.target.value)); }}
                    aria-label="موضع المعاينة"
                  />
                  <span className="sb-time" dir="ltr">{`${formatSeconds(playhead)} / ${formatSeconds(totalDuration)}`}</span>
                </div>
                <p className="sb-muted sb-small">الوصف يظهر في المعاينة فقط ولا يُطبع على الفيديو.</p>

                {/* Production */}
                <div className="sb-production" aria-label="الإخراج">
                  <h2>الإخراج إلى MP4</h2>
                  {readiness && (
                    <ul className="sb-readiness">
                      {readiness.ready
                        ? <li className="ok">✓ كل مشهد له إطار من الخزانة — جاهز للإخراج</li>
                        : readiness.blocking.map((issue, i) => <li key={`b${i}`} className="block">✕ {issue.message}</li>)}
                      {readiness.warnings.map((issue, i) => <li key={`w${i}`} className="warn">• {issue.message}</li>)}
                      <li className="meta">{`المدة ${formatSeconds(readiness.totalDurationSeconds)} · 1920×1080 · H.264/AAC · الإخراج لا يستهلك وحدات AZMA`}</li>
                    </ul>
                  )}
                  {!vaultLoaded && <p className="sb-muted">الخزانة تُحمَّل…</p>}
                  <div className="sb-production-actions">
                    <button
                      className="sb-btn sb-btn-primary"
                      disabled={!readiness?.ready || isStartingRender || renderJob?.status === 'processing'}
                      onClick={() => void handleStartRender()}
                    >
                      {renderJob?.status === 'processing' ? '⏳ يُخرَج…' : renderJob ? 'أعد إخراج MP4' : '🎬 أخرج MP4'}
                    </button>
                    <button
                      className="sb-btn"
                      disabled={!readiness?.ready}
                      onClick={() => (montageNodeCount > 0 ? setConfirmMontage(true) : void handleOpenInMontage())}
                    >
                      افتح في المونتاج للتحرير الدقيق
                    </button>
                  </div>
                  {confirmMontage && (
                    <div className="sb-confirm" role="alertdialog" aria-label="تأكيد الفتح في المونتاج">
                      <p>{`سيحلّ هذا التسلسل محلّ ترتيب المونتاج الحالي (${montageNodeCount} عنصر). نحفظ نسخة من المونتاج أولًا في «استعادة مشهد محفوظ»، وأصول الخزانة لا تُمس.`}</p>
                      <div>
                        <button className="sb-btn sb-btn-primary" onClick={() => void handleOpenInMontage()}>نعم، افتح في المونتاج</button>
                        <button className="sb-btn sb-btn-ghost" onClick={() => setConfirmMontage(false)}>إلغاء</button>
                      </div>
                    </div>
                  )}
                  {renderStartError && <p className="sb-error" role="alert">{renderStartError}</p>}
                  {renderJob?.status === 'processing' && (
                    <p className="sb-render-progress" role="status">
                      <span className="sb-spinner" aria-hidden="true" />
                      {`يُخرَج الفيديو على الخادم… ${formatSeconds(Math.max(0, (renderClock - renderJob.startedAt) / 1000))} — يمكنك مغادرة الحجرة والعودة.`}
                    </p>
                  )}
                  {renderJob?.status === 'failed' && (
                    <p className="sb-error" role="alert">{renderJob.message ?? 'فشل الإخراج. مشروعك محفوظ؛ أعد المحاولة.'}</p>
                  )}
                  {renderJob?.status === 'succeeded' && renderJob.fileUrl && (
                    <div className="sb-result">
                      {!isRenderCurrent && <p className="sb-warn">هذا الفيديو من نسخة سابقة من المشاهد — أعد الإخراج ليطابق التعديلات الأخيرة.</p>}
                      <video className="sb-result-video" src={renderJob.fileUrl} controls preload="metadata" />
                      <div className="sb-result-actions">
                        <a className="sb-btn sb-btn-primary" href={renderJob.downloadUrl ?? `${renderJob.fileUrl}?download=1`}>تحميل MP4 ↓</a>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Scenes */}
              <section className="sb-scenes" aria-label="المشاهد">
                {scenes.map((scene, index) => (
                  <article key={scene.sceneId} className={`sb-scene${currentScene?.scene.sceneId === scene.sceneId ? ' is-current' : ''}`} data-scene-id={scene.sceneId}>
                    <div className="sb-scene-head">
                      <span className="sb-scene-number">{index + 1}</span>
                      <input
                        className="sb-input sb-scene-title"
                        value={scene.title}
                        onChange={(e) => commit(updateScene(project, scene.sceneId, { title: e.target.value }, clock()))}
                        aria-label={`عنوان المشهد ${index + 1}`}
                      />
                      <button className="sb-icon-btn" disabled={index === 0} onClick={() => commit(moveScene(project, scene.sceneId, 'up', clock()))} aria-label={`حرّك المشهد ${index + 1} للأعلى`}>▲</button>
                      <button className="sb-icon-btn" disabled={index === scenes.length - 1} onClick={() => commit(moveScene(project, scene.sceneId, 'down', clock()))} aria-label={`حرّك المشهد ${index + 1} للأسفل`}>▼</button>
                      <button className="sb-icon-btn sb-danger" onClick={() => setConfirmRemoveSceneId(scene.sceneId)} aria-label={`احذف المشهد ${index + 1}`}>✕</button>
                    </div>
                    {confirmRemoveSceneId === scene.sceneId && (
                      <div className="sb-confirm" role="alertdialog" aria-label="تأكيد حذف المشهد">
                        <p>يُحذف المشهد من المشروع فقط. أصوله تبقى في الخزانة السيادية.</p>
                        <div>
                          <button className="sb-btn sb-danger-btn" onClick={() => { commit(removeScene(project, scene.sceneId, clock())); setConfirmRemoveSceneId(null); }}>احذف المشهد</button>
                          <button className="sb-btn sb-btn-ghost" onClick={() => setConfirmRemoveSceneId(null)}>إلغاء</button>
                        </div>
                      </div>
                    )}
                    <textarea
                      className="sb-input sb-description"
                      placeholder="صف ما يحدث في هذا المشهد: المكان، الحركة، الإحساس."
                      value={scene.description}
                      onChange={(e) => commit(updateScene(project, scene.sceneId, { description: e.target.value }, clock()))}
                      aria-label={`وصف المشهد ${index + 1}`}
                      rows={3}
                    />
                    <div className="sb-scene-settings">
                      <label>
                        المدة (ث)
                        <input
                          type="number"
                          className="sb-input sb-duration"
                          min={MIN_SCENE_SECONDS}
                          max={MAX_SCENE_SECONDS}
                          step={0.5}
                          value={scene.durationSeconds}
                          onChange={(e) => commit(updateScene(project, scene.sceneId, { durationSeconds: Number(e.target.value) }, clock()))}
                          aria-label={`مدة المشهد ${index + 1} بالثواني`}
                        />
                      </label>
                      <label>
                        الدخول
                        <select
                          className="sb-input"
                          value={index === 0 ? 'cut' : scene.transitionIn}
                          disabled={index === 0}
                          onChange={(e) => commit(updateScene(project, scene.sceneId, { transitionIn: e.target.value as SceneTransition }, clock()))}
                          aria-label={`انتقال الدخول إلى المشهد ${index + 1}`}
                        >
                          <option value="cut">قطع</option>
                          <option value="crossfade">تلاشٍ</option>
                        </select>
                      </label>
                    </div>
                    <ul className="sb-scene-assets" aria-label={`أصول المشهد ${index + 1}`}>
                      {scene.nodes.map((node: AssemblyNode) => {
                        const asset = vaultById.get(node.assetId);
                        return (
                          <li key={node.nodeId} className={asset ? '' : 'is-missing'}>
                            <AssetThumb asset={asset} capability={node.capabilityOrigin} />
                            <span className="sb-asset-label">{asset ? assetLabel(asset, node.capabilityOrigin) : 'لم يعد في الخزانة'}</span>
                            <button className="sb-icon-btn" onClick={() => commit(detachAsset(project, scene.sceneId, node.nodeId, clock()))} aria-label="أزل من المشهد">✕</button>
                          </li>
                        );
                      })}
                    </ul>
                    <button className="sb-btn" onClick={() => { setUploadError(null); setPickerSceneId(scene.sceneId); }}>＋ أصل من الخزانة أو رفع ملف</button>
                  </article>
                ))}
                <button
                  className="sb-btn sb-add-scene"
                  onClick={() => commit(addScene(project, {}, clock()).canvas)}
                >
                  ＋ مشهد جديد
                </button>
              </section>
            </div>
          </>
        )}
      </div>

      {pickerSceneId && project && (
        <div className="sb-picker-backdrop" onClick={() => setPickerSceneId(null)}>
          <div className="sb-picker" role="dialog" aria-label="اختر أصلًا للمشهد" onClick={(e) => e.stopPropagation()}>
            <div className="sb-picker-head">
              <h2>{`أصل للمشهد ${scenes.findIndex((s) => s.sceneId === pickerSceneId) + 1}`}</h2>
              <button className="sb-icon-btn" onClick={() => setPickerSceneId(null)} aria-label="إغلاق">✕</button>
            </div>
            <div className="sb-upload">
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                aria-label="ارفع ملفًا إلى الخزانة"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f); }}
                disabled={uploading}
              />
              {uploading && <span className="sb-muted">يُرفع إلى الخزانة…</span>}
              {uploadError && <span className="sb-error" role="alert">{uploadError}</span>}
            </div>
            {!vaultLoaded && <p className="sb-muted">الخزانة تُحمَّل…</p>}
            {vaultLoaded && pickableAssets.length === 0 && <p className="sb-muted">خزانتك فارغة — ارفع صورة أو مقطعًا.</p>}
            <ul className="sb-picker-grid">
              {pickableAssets.map((asset) => (
                <li key={asset.assetId}>
                  <button className="sb-picker-item" onClick={() => handleAttach(pickerSceneId, asset)} data-asset-id={asset.assetId}>
                    <AssetThumb asset={asset} capability={asset.capabilityTarget} />
                    <span>{assetLabel(asset, asset.capabilityTarget)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
