/**
 * AZMA OS – Qiyamah Chamber (The Generative Genesis Forge)
 * Native Name: حجرة القيامة
 * Status: Imperial First Creator Implementation
 *
 * IMPERIAL FIRST CREATOR IMPLEMENTATION: this Chamber previously ran a
 * fictional "AZMA Credits" ledger and Execution Bill (a hardcoded 9,500
 * balance with no relationship to the Creator's real subscription), and
 * offered drag-drop controls for video/audio/image and a voice-clone
 * selector that only ever fed a simulated, non-real generation path.
 * Both are removed per Article IX (Imperial Quality Mandates) of the
 * First Launch Constitution: no invented ledger may be shown to a
 * Creator, and no control may imply a capability that isn't actually
 * available. Only the prompt and style — the two parameters the real
 * Launch Provider (src/qiyamah-generation) actually accepts — remain.
 *
 * THE GATE IS PART OF THE EMPIRE, NOT AN EXCEPTION TO IT: the four
 * conditional action buttons here (sign in / subscribe / retry /
 * generate another) are now resolved by the same Button Engine the Gate
 * and /subscribe use, replacing this file's own previously ad hoc
 * conditionals. Ceremonial copy (headings, ritual language) remains
 * Arabic-only this mission, per Council direction — only the Button
 * Engine's own action labels are dictionary-driven, so an
 * English-choosing Creator sees English action labels inside an
 * otherwise-Arabic Chamber until that copy is translated in a future
 * mission. Disclosed, not papered over.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './qiyamah-chamber.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { resolveAvailableActions } from '@/src/button-engine';
import type { ChamberState } from '@/src/button-engine';
import { useInstallInvitation } from '@/src/install-experience';

const EXAMPLE_PROMPT = 'A sovereign citadel at dawn, gold light over obsidian towers';

interface GenerationRecord {
  readonly recordId: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly assetUrl: string;
  readonly generatedAt: number;
}

export function QiyamahChamberClient({ dict }: { readonly dict: Dictionary }) {
  const router = useRouter();
  const { triggerInvitation } = useInstallInvitation();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [generations, setGenerations] = useState<readonly GenerationRecord[]>([]);

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');

  const [showConfirm, setShowConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [masterReady, setMasterReady] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  // Creator Access Experience: lets the error state offer a real path forward (sign in / subscribe) instead of a dead end.
  const [generationErrorReason, setGenerationErrorReason] = useState<string | null>(null);

  const fetchGenerations = () => {
    fetch('/api/qiyamah/generations')
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 'succeeded') setGenerations(result.generations);
      })
      .catch(() => {
        // Silent: this is an enhancement to the journey, not a gate on it.
      });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data) => setDisplayName(data?.displayName ?? null))
      .catch(() => setDisplayName(null));
    fetchGenerations();
  }, []);

  const fillExamplePrompt = () => setPrompt(EXAMPLE_PROMPT);

  const handleTriggerGenesis = () => {
    if (prompt.trim()) setShowConfirm(true);
  };

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
        // THE IMPERIAL INSTALL EXPERIENCE: invited at the moment of earned
        // trust — a Creator has just received something real — not at Arrival.
        triggerInvitation();
      } else {
        setGenerationError(result.message ?? 'Generation failed.');
        setGenerationErrorReason(result.reason ?? null);
      }
    } catch {
      setGenerationError('Could not reach the generation service. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // FIRST LAUNCH ASSEMBLY: resets the chamber to generate again. Routing
  // onward to RAS AL AMR / the Vault Palace / Makman Al-Ghayah was
  // removed here — all three are excluded First Launch Constitutional
  // members (Book II/III).
  const generateAnother = () => {
    setPrompt('');
    setGeneratedImageUrl(null);
    setGenerationError(null);
    setGenerationErrorReason(null);
    setMasterReady(false);
  };

  // THE BUTTON ENGINE: replaces this file's own previously hand-written
  // conditionals for which action is offered in each state.
  const errorChamberState: ChamberState =
    generationErrorReason === 'unauthorized' ? 'unauthorized'
      : generationErrorReason === 'payment-required' ? 'payment-required'
      : 'error';
  const [errorAction] = generationError ? resolveAvailableActions({ threshold: 'chamber', chamberState: errorChamberState }) : [];
  const [completeAction] = masterReady ? resolveAvailableActions({ threshold: 'chamber', chamberState: 'complete' }) : [];

  return (
    <main className="qiyamah-viewport">
      {/* Background Ambience */}
      <div className="forge-background">
        <div className="crimson-nebula"></div>
        <div className="cyber-grid-red"></div>
      </div>

      {/* Top Nav & Navigation — returns to the real Arrival gate ('/') */}
      <button className="sovereign-exit-btn" onClick={() => router.push('/')}>
        ⮜ العودة للعبور السيادي
      </button>

      {/* Greeting Badge — replaces the fictional AZMA Credits HUD */}
      <div className="greeting-badge neon-border-red">
        <div className="greeting-label">حجرة القيامة</div>
        <div className="greeting-value">{displayName ? `أهلاً، ${displayName}` : 'أهلاً بك'}</div>
      </div>

      <div className="qiyamah-layout">

        {/* The Central Interactive Canvas */}
        <div className={`genesis-canvas ${prompt ? 'active-canvas' : 'empty-canvas'} ${isGenerating ? 'generating-state' : ''}`}>
          {!isGenerating && !masterReady && !generationError && (
            <div className="empty-prompt">
              <div className="pulse-core"></div>
              <h2>بؤرة الإسقاط</h2>
              <p>صف ما تريد أن تبعثه، والقيامة تتولى الباقي.</p>
              <textarea
                className="prompt-textarea"
                placeholder="اكتب وصف المشهد هنا..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="prompt-style-row control-group">
                <label>نمط التوليد (Style)</label>
                <select className="cyber-select" value={style} onChange={(e) => setStyle(e.target.value)}>
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
              <button className="trigger-genesis-btn" onClick={handleTriggerGenesis} disabled={!prompt.trim()}>
                بدء التوليد (القيامة) ⭍
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="genesis-progress">
              <div className="progress-circle">
                <span className="ritual-glyph">✦</span>
              </div>
              <p className="generating-text pulse-text">تتم الآن عملية النفخ والبعث الرقمي...</p>
            </div>
          )}

          {generationError && !isGenerating && errorAction && (
            <div className="asset-node neon-border-gold">
              <p>{generationError}</p>
              {errorAction.kind === 'navigate' ? (
                <p><a href={errorAction.href}>{t(dict, errorAction.labelKey)}</a></p>
              ) : (
                <button className="trigger-genesis-btn" onClick={() => setGenerationError(null)}>{t(dict, errorAction.labelKey)}</button>
              )}
            </div>
          )}

          {masterReady && (
            <div className="final-master-node neon-border-gold">
              <div className="master-badge">✨ الماستر السيادي المكتمل ✨</div>
              {generatedImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="master-preview" src={generatedImageUrl} alt="Generated master" />
              )}

              {/* Closing beat (Article IX, Mandate 7): the ritual gets an
                  authored ending, and acknowledges the Creator by name. */}
              <p className="closing-beat">
                {displayName ? <>أحسنت يا <strong>{displayName}</strong>، هذا الآن جزء من إرثك السيادي.</> : <>تم التخليق. هذا الآن جزء من إرثك السيادي.</>}
              </p>

              <div className="vortex-routing">
                {completeAction && (
                  <button className="trigger-genesis-btn" onClick={generateAnother}>{t(dict, completeAction.labelKey)}</button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Storage → Completion (Article III/IX, B6 minimum form): an
          honest record of what this Creator has made, not a fabricated
          treasury — visible across every state of the Chamber. */}
      {generations.length > 0 && (
        <div className="your-generations">
          <h3>خزانتك السيادية — Your Generations</h3>
          <div className="generations-grid">
            {generations.map((g) => (
              <div className="generation-card" key={g.recordId}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="generation-thumb" src={g.assetUrl} alt={g.prompt} />
                <div className="generation-meta">
                  <p className="generation-prompt">{g.prompt}</p>
                  <span className="generation-date">{new Date(g.generatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation (Article IX, Mandate 4): no cost or balance shown —
          only what will actually be generated. */}
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
                <span>{style}</span>
              </div>
            </div>

            <div className="bill-actions">
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>إلغاء وتعديل</button>
              <button className="confirm-btn neon-border-gold" onClick={confirmAndGenerate}>اعتماد سيادي وبدء النفخ</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
