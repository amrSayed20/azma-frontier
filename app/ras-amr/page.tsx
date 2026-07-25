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
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RasAmrExperience } from '@/src/imperial-experience-engine';
import type { VaultAsset } from '@/src/vault/sovereign-vault-types';
import './ras-amr.css';

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

const initialSmartQueue = [
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
  const [queue, setQueue] = useState(initialSmartQueue);
  const [activeAsset, setActiveAsset] = useState<typeof initialSmartQueue[0] | null>(initialSmartQueue[0]);
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

  const triggerMasterRender = () => {
    setIsRendering(true);
    setRenderStatus('جاري صهر الإخراج السينمائي النهائي الفائق دقة البكسل...');
    setTimeout(() => {
      setIsRendering(false);
      setRenderStatus('تم اكتمال الصهر النهائي بنجاح – جاهز للإحالة إلى مكمن الغاية');
    }, 3000);
  };

  // --- Summoning Pull Action: injects a REAL Vault asset into the console ---
  const handleInjectAsset = (asset: VaultAsset) => {
    const prompt = typeof asset.metadata.generationPrompt === 'string' ? asset.metadata.generationPrompt : null;
    const newAsset = {
      id: asset.assetId,
      title: prompt ? prompt.slice(0, 60) : 'أصل من الخزانة السيادية',
      type: typeLabelForCapability(asset.capabilityTarget),
      source: 'الخزانة السيادية',
      duration: '--:--',
      status: 'أصل حقيقي — تم استدعاؤه من الخزانة السيادية',
    };

    setQueue(prevQueue => [newAsset, ...prevQueue.filter((a) => a.id !== newAsset.id)]);
    setActiveAsset(newAsset);
    setIsSummonOpen(false);

    // Trigger neon golden flash animation sequence
    setInjectionFlash(true);
    setTimeout(() => setInjectionFlash(false), 800);
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

          <div className="executive-actions-panel">
            <button 
              className={`action-trigger-btn render-btn ${isRendering ? 'rendering' : ''}`}
              onClick={triggerMasterRender}
              disabled={isRendering}
            >
              🎬 صهر الإخراج النهائي (Master Render)
            </button>
            
            <button 
              className="action-trigger-btn forward-btn"
              onClick={() => router.push('/makman-al-ghayah')}
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
