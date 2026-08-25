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
import { useConstitutionalNavigation } from '@/src/constitutional-navigation';
import './qiyamah-chamber.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { resolveAvailableActions } from '@/src/button-engine';
import type { ChamberState } from '@/src/button-engine';
import { useInstallInvitation } from '@/src/install-experience';
import type { ImperialVisionDocument } from '@/src/chamber-vision';

const EXAMPLE_IDEA = 'سيارة فاخرة تسير في القاهرة ليلًا';

// All 13 styles — operational, none locked
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
}

export function QiyamahChamberClient({
  dict,
  chamberVision,
  generationAvailable = true,
}: QiyamahChamberClientProps) {
  const { goTo } = useConstitutionalNavigation();
  const { triggerInvitation } = useInstallInvitation();

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
  const [externalPrompt,     setExternalPrompt]     = useState('');
  const [qiyamahReading,     setQiyamahReading]     = useState('');
  const [style,              setStyle]              = useState('cinematic');
  const [constructedPrompt,  setConstructedPrompt]  = useState('');
  const [constructionError,  setConstructionError]  = useState<string | null>(null);
  const [generatedImageUrl,  setGeneratedImageUrl]  = useState<string | null>(null);
  const [generationError,    setGenerationError]    = useState<string | null>(null);
  const [generationErrorReason, setGenerationErrorReason] = useState<string | null>(null);

  // ── Delete confirmation ─────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; displayName?: string | null }) => {
        if (!data.authenticated) { goTo('/creator-access'); return; }
        setDisplayName(data.displayName ?? null);
        fetchGenerations();
        fetchUploadedItems();
      })
      .catch(() => goTo('/creator-access'));
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
        } else {
          setQiyamahReading(data.qiyamahReading);
          setConstructedPrompt(data.qiyamahReading);
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
  const handleEmbodyScene = async () => {
    if (!constructedPrompt.trim()) return;
    setStage('generating');
    setGenerationError(null);
    setGenerationErrorReason(null);
    try {
      const ideaForRecord = inputMode === 'idea' ? idea.trim() : externalPrompt.trim();
      const response = await fetch('/api/qiyamah/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: constructedPrompt.trim(), style, idea: ideaForRecord }),
      });
      const result = await response.json();
      if (result.status === 'succeeded') {
        setGeneratedImageUrl(result.asset.assetUrl);
        setStage('result');
        fetchGenerations();
        triggerInvitation();
      } else {
        setGenerationError(result.message ?? 'التوليد لم ينجح.');
        setGenerationErrorReason(result.reason ?? null);
        setStage('error');
      }
    } catch {
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
    setConstructionError(null);
    setGeneratedImageUrl(null);
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
    ? resolveAvailableActions({ threshold: 'chamber', chamberState: errorChamberState })
    : [];
  const [completeAction] = (stage === 'result')
    ? resolveAvailableActions({ threshold: 'chamber', chamberState: 'complete' })
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

  return (
    <main className="qiyamah-viewport">

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
          <span className="chamber-vision-en">
            Enter with an idea — leave with a real, saved image
          </span>
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
          {inputMode === 'idea' ? 'الفكرة' : 'المحث'}
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
                      فكرتك
                    </label>
                    <textarea
                      id="qiyamah-idea"
                      className="idea-textarea"
                      placeholder="أي فكرة بسيطة — في جملة أو جملتين…"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      rows={3}
                      disabled={stage === 'constructing'}
                    />
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

              {constructionError && (
                <p className="construction-error" role="alert">{constructionError}</p>
              )}

              {inputMode === 'idea' && (
                <button
                  className="import-btn neon-border-gold"
                  onClick={() => setIdea(EXAMPLE_IDEA)}
                  disabled={stage === 'constructing'}
                >
                  جرّب مثالاً ⮞
                </button>
              )}

              {stage === 'constructing' ? (
                <div className="construction-progress">
                  <div className="construction-spinner" aria-hidden="true" />
                  <p className="construction-text pulse-text">
                    {inputMode === 'idea' ? 'القيامة تبني المشهد السيادي…' : 'القيامة تقرأ محثك…'}
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
              <div className="scene-ready-card">
                <div className="scene-ready-glyph" aria-hidden="true">✦</div>
                <p className="scene-ready-title">المشهد جاهز للتجسيد</p>
                <p className="scene-ready-idea">{idea}</p>
                <p className="scene-ready-style">
                  {ALL_STYLES.find((s) => s.id === style)?.nameAr ?? style}
                </p>
              </div>

              <button className="trigger-genesis-btn" onClick={handleEmbodyScene}>
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
                <div className="comparison-divider" aria-hidden="true">⟺</div>
                <div className="comparison-panel comparison-panel--reading">
                  <p className="comparison-label">قراءة القيامة</p>
                  <p className="comparison-text">{qiyamahReading}</p>
                </div>
              </div>

              <div className="external-prompt-choice">
                <p className="external-choice-label">المحث النهائي للتجسيد</p>
                <textarea
                  className="idea-textarea"
                  value={constructedPrompt}
                  onChange={(e) => setConstructedPrompt(e.target.value)}
                  rows={4}
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
                    onClick={() => setConstructedPrompt(qiyamahReading)}
                  >
                    استعِد قراءة القيامة
                  </button>
                </div>
              </div>

              <button
                className="trigger-genesis-btn"
                onClick={handleEmbodyScene}
                disabled={!constructedPrompt.trim()}
              >
                جسّد ⭍
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
                تتم الآن عملية النفخ والبعث الرقمي...
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
              <div className="master-badge">✨ الماستر السيادي المكتمل ✨</div>
              {generatedImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="master-preview"
                  src={generatedImageUrl}
                  alt="الماستر السيادي المُولَّد"
                />
              )}
              <p className="closing-beat">
                {displayName
                  ? <><strong>{displayName}</strong>، هذا الآن جزء من إرثك السيادي.</>
                  : <>تم التخليق. هذا الآن جزء من إرثك السيادي.</>}
              </p>
              <div className="result-actions">
                {generatedImageUrl && (
                  <a
                    className="download-btn"
                    href={generatedImageUrl}
                    download
                  >
                    تحميل الصورة ↓
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="generation-thumb" src={g.assetUrl} alt={g.prompt} />
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
                        aria-label="تحميل هذه الصورة"
                      >
                        ↓
                      </a>
                      <button
                        className="delete-btn"
                        aria-label="حذف هذا التوليد"
                        onClick={() => setDeleteConfirmId(g.recordId)}
                      >
                        ✕
                      </button>
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
                      <button
                        className="delete-btn"
                        aria-label="حذف هذا الأصل"
                        onClick={() => setDeleteConfirmId(u.assetId)}
                      >
                        ✕
                      </button>
                    </div>
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
