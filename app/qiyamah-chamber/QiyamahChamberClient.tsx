/**
 * AZMA OS – Qiyamah Chamber (The Generative Genesis Forge)
 * Native Name: حجرة القيامة
 * Status: Imperial Reorganization — Ministry of Clarity
 *
 * REDESIGN RATIONALE: The original single-canvas layout placed generation,
 * upload, and state feedback in one undifferentiated column with no visual
 * hierarchy. This reorganization separates concerns into three named zones:
 *   1. Header strip — identity + navigation, always stable
 *   2. Workspace grid — generation section (2/3) + upload section (1/3)
 *   3. Gallery — always visible, honest empty state if nothing yet
 *
 * Error state now always renders an action: falls back to "حاوِل مرة أخرى"
 * if the Button Engine returns nothing, so the Creator is never stranded.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConstitutionalNavigation } from '@/src/constitutional-navigation';
import './qiyamah-chamber.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { resolveAvailableActions } from '@/src/button-engine';
import type { ChamberState } from '@/src/button-engine';
import { useInstallInvitation } from '@/src/install-experience';

const EXAMPLE_PROMPT = 'قلعة سيادية عند الفجر، أنوار ذهبية فوق أبراج من العقيق الأسود';

const STYLE_AR: Record<string, string> = {
  cinematic:   'سينمائي 35mm (ملحمي)',
  documentary: 'وثائقي كلاسيكي (أرشيفي)',
  hyper_real:  'واقعي فائق 8K',
  scifi:       'خيال علمي سريالي',
  animation:   'أنيميشن رقمي',
};

interface GenerationRecord {
  readonly recordId: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly assetUrl: string;
  readonly generatedAt: number;
}

export function QiyamahChamberClient({ dict }: { readonly dict: Dictionary }) {
  const router = useRouter();
  const { goTo } = useConstitutionalNavigation();
  const { triggerInvitation } = useInstallInvitation();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [generations, setGenerations] = useState<readonly GenerationRecord[]>([]);

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');

  const [isDragging,       setIsDragging]       = useState(false);
  const [isUploading,      setIsUploading]      = useState(false);
  const [uploadError,      setUploadError]      = useState<string | null>(null);
  const [uploadedAssetUrl, setUploadedAssetUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showConfirm,          setShowConfirm]          = useState(false);
  const [isGenerating,         setIsGenerating]         = useState(false);
  const [masterReady,          setMasterReady]          = useState(false);
  const [generatedImageUrl,    setGeneratedImageUrl]    = useState<string | null>(null);
  const [generationError,      setGenerationError]      = useState<string | null>(null);
  const [generationErrorReason, setGenerationErrorReason] = useState<string | null>(null);

  const fetchGenerations = () => {
    fetch('/api/qiyamah/generations')
      .then((r) => r.json())
      .then((result) => { if (result.status === 'succeeded') setGenerations(result.generations); })
      .catch(() => { /* silent — gallery is an enhancement, not a gate */ });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setDisplayName(data?.displayName ?? null))
      .catch(() => setDisplayName(null));
    fetchGenerations();
  }, []);

  const uploadFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/vault/assets/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.status === 'succeeded') {
        setUploadedAssetUrl(data.asset?.secureStorageUri ?? null);
        fetchGenerations();
      } else {
        setUploadError(data.message ?? 'فشل الرفع — حاوِل مرة أخرى.');
      }
    } catch {
      setUploadError('البوابة لا تستجيب — حاوِل مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  const fillExamplePrompt = () => setPrompt(EXAMPLE_PROMPT);

  const handleTriggerGenesis = () => { if (prompt.trim()) setShowConfirm(true); };

  const confirmAndGenerate = async () => {
    setShowConfirm(false);
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationErrorReason(null);

    try {
      const response = await fetch('/api/qiyamah/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style }),
      });
      const result = await response.json();

      if (result.status === 'succeeded') {
        setGeneratedImageUrl(result.asset.assetUrl);
        setMasterReady(true);
        fetchGenerations();
        triggerInvitation();
      } else {
        setGenerationError(result.message ?? 'التوليد لم ينجح.');
        setGenerationErrorReason(result.reason ?? null);
      }
    } catch {
      setGenerationError('البوابة لا تستجيب. أعِد المحاولة.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAnother = () => {
    setPrompt('');
    setGeneratedImageUrl(null);
    setGenerationError(null);
    setGenerationErrorReason(null);
    setMasterReady(false);
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

  const errorChamberState: ChamberState =
    generationErrorReason === 'unauthorized'       ? 'unauthorized'
    : generationErrorReason === 'payment-required' ? 'payment-required'
    : 'error';

  const [errorAction]    = generationError ? resolveAvailableActions({ threshold: 'chamber', chamberState: errorChamberState }) : [];
  const [completeAction] = masterReady     ? resolveAvailableActions({ threshold: 'chamber', chamberState: 'complete' })       : [];

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
          <span className="creator-name">
            {displayName ? `أهلاً، ${displayName}` : 'أهلاً بك'}
          </span>
        </div>

        <div className={`generation-status${isGenerating ? ' status-active' : ''}`}>
          <span className="status-dot" />
          <span className="status-text">{isGenerating ? 'قيد التوليد' : 'جاهزة'}</span>
        </div>
      </header>

      {/* ── Main Workspace ─────────────────────────────────────────────── */}
      <div className="qiyamah-workspace">

        {/* Generation Section */}
        <section className="genesis-section">
          <span className="section-label">بؤرة التوليد</span>

          {/* ── Idle: input form ─────────────────────────────────────── */}
          {!isGenerating && !masterReady && !generationError && (
            <div className="genesis-form">
              <div className="pulse-core" />
              <p className="genesis-invitation">
                صف ما تريد أن تبعثه، والقيامة تتولى الباقي.
              </p>
              <textarea
                className="prompt-textarea"
                placeholder="صِف ما تريد أن تبعثه…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <div className="style-group">
                <label className="style-label">نمط التوليد</label>
                <select
                  className="cyber-select"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option value="cinematic">سينمائي 35mm (ملحمي)</option>
                  <option value="documentary">وثائقي كلاسيكي (أرشيفي)</option>
                  <option value="hyper_real">واقعي فائق 8K</option>
                  <option value="scifi">خيال علمي سريالي</option>
                  <option value="animation">أنيميشن رقمي</option>
                </select>
              </div>
              <button className="import-btn neon-border-gold" onClick={fillExamplePrompt}>
                جرّب مثالاً ⮞
              </button>
              <button
                className="trigger-genesis-btn"
                onClick={handleTriggerGenesis}
                disabled={!prompt.trim()}
              >
                بدء التوليد (القيامة) ⭍
              </button>
            </div>
          )}

          {/* ── Generating: spinner ──────────────────────────────────── */}
          {isGenerating && (
            <div className="genesis-progress">
              <div className="progress-circle">
                <span className="ritual-glyph">✦</span>
              </div>
              <p className="generating-text pulse-text">تتم الآن عملية النفخ والبعث الرقمي...</p>
            </div>
          )}

          {/* ── Error state — always offers an action ────────────────── */}
          {generationError && !isGenerating && (
            <div className="error-state">
              <div className="error-icon">⚠</div>
              <p className="error-message">{generationError}</p>
              {errorAction ? (
                errorAction.kind === 'navigate' ? (
                  <a className="trigger-genesis-btn error-action-link" href={errorAction.href}>
                    {t(dict, errorAction.labelKey)}
                  </a>
                ) : (
                  <button className="trigger-genesis-btn" onClick={() => setGenerationError(null)}>
                    {t(dict, errorAction.labelKey)}
                  </button>
                )
              ) : (
                <button className="trigger-genesis-btn" onClick={generateAnother}>
                  حاوِل مرة أخرى
                </button>
              )}
            </div>
          )}

          {/* ── Master ready: image + next actions ───────────────────── */}
          {masterReady && (
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
                {completeAction && (
                  <button className="trigger-genesis-btn" onClick={generateAnother}>
                    {t(dict, completeAction.labelKey)}
                  </button>
                )}
                <button
                  className="vault-path-btn"
                  onClick={() => router.push('/sovereign-vault-palace')}
                >
                  📥 عرض في القصر السيادي
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Upload Section */}
        <section className="upload-section">
          <span className="section-label upload-section-label">رفع أصل سيادي</span>
          <p className="upload-invitation">
            ارفع ملفاً من جهازك وسيُودَع مباشرة في خزانتك السيادية.
          </p>

          {!uploadedAssetUrl ? (
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
              {/\.(jpe?g|png|gif|webp|svg)$/i.test(uploadedAssetUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="uploaded-preview"
                  src={uploadedAssetUrl}
                  alt="الأصل المرفوع"
                />
              )}
              <div className="upload-actions">
                <button
                  className="vault-path-btn"
                  onClick={() => router.push('/sovereign-vault-palace')}
                >
                  📥 عرض في القصر السيادي
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setUploadedAssetUrl(null)}
                >
                  رفع أصل آخر
                </button>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ── Gallery — always visible ───────────────────────────────────── */}
      <section className="your-generations" aria-label="الإرث السيادي">
        <h3>إرثك السيادي</h3>
        {generations.length > 0 ? (
          <div className="generations-grid">
            {generations.map((g) => (
              <div className="generation-card" key={g.recordId}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="generation-thumb" src={g.assetUrl} alt={g.prompt} />
                <div className="generation-meta">
                  <p className="generation-prompt">{g.prompt}</p>
                  <span className="generation-date">
                    {new Date(g.generatedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="gallery-empty">لم يتم التوليد بعد — ابدأ رحلتك من هنا.</p>
        )}
      </section>

      {/* ── Confirmation Modal ─────────────────────────────────────────── */}
      {showConfirm && (
        <div className="bill-modal-overlay">
          <div className="execution-bill neon-border-red">
            <h2 className="bill-title">تأكيد التخليق</h2>
            <div className="bill-details">
              <div className="bill-row">
                <span>الوصف</span>
                <span>{prompt}</span>
              </div>
              <div className="bill-row">
                <span>النمط</span>
                <span>{STYLE_AR[style] ?? style}</span>
              </div>
            </div>
            <div className="bill-actions">
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
                إلغاء وتعديل
              </button>
              <button className="confirm-btn neon-border-gold" onClick={confirmAndGenerate}>
                اعتماد سيادي وبدء النفخ
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
