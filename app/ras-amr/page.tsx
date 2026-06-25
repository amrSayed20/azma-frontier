/**
 * AZMA OS – Ras Al-Amr Chamber (Hollywood Master Director Console)
 * File: app/ras-amr/page.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './ras-amr.css';

// --- Vault Repositories available for Summoning ---
const vaultRepositories = [
  { id: 'v-projects', name: 'خزنة المشاريع', icon: '📁', items: ['مشروع فيلم وثائقي', 'حملة العبور الإمبراطورية', 'سيناريو الإطلاق السيادي'] },
  { id: 'v-characters', name: 'خزنة الشخصيات', icon: '👤', items: ['شخصية الراوي الحكيم', 'صوت القائد المهيب', 'الممثل الافتراضي ألفا'] },
  { id: 'v-brands', name: 'خزنة العلامات التجارية', icon: '🛡️', items: ['الختم الذهبي لعظمة', 'شعار المنصة المتحرك', 'هوية نيون البصرية'] },
  { id: 'v-voices', name: 'خزنة الأصوات', icon: '🎙', items: ['بصمة لسان سيادي رئيسي', 'التعليق الصوتي الملحمي', 'نبرة الإقناع الهادئة'] },
  { id: 'v-images', name: 'خزنة الصور', icon: '🖼️', items: ['خلفية استوديو هوليوود', 'لوحة قصر العظمة الهولوغرامية', 'تأثير ليزر سينمائي'] },
  { id: 'v-videos', name: 'خزنة الفيديوهات', icon: '🎬', items: ['لقطة تفكيك البكسل الحية', 'وميض النيون الذهبي', 'دوران رادار الإمبراطورية'] },
];

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
  const [directingMode, setDirectingMode] = useState<'smart' | 'manual'>('smart');
  const [activeTool, setActiveTool] = useState<string>('ai-director');
  const [timelineProgress, setTimelineProgress] = useState<number>(45);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderStatus, setRenderStatus] = useState<string>('في وضع الاستعداد الإخراجي');
  
  // --- Summoning Bridge States ---
  const [isSummonOpen, setIsSummonOpen] = useState<boolean>(false);
  const [selectedVault, setSelectedVault] = useState<string>(vaultRepositories[0].id);
  const [injectionFlash, setInjectionFlash] = useState<boolean>(false);

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

  // --- Summoning Pull Action (Injecting asset from Vault directly into active console) ---
  const handleInjectAsset = (itemName: string, vaultName: string) => {
    const newAssetId = `summoned-${Date.now()}`;
    const newAsset = {
      id: newAssetId,
      title: itemName,
      type: vaultName.includes('الأصوات') ? 'صوت' : vaultName.includes('الفيديوهات') ? 'فيديو' : 'أصل',
      source: vaultName,
      duration: '00:30',
      status: 'تم استدعاؤه وحقنه حياً'
    };

    setQueue(prevQueue => [newAsset, ...prevQueue]);
    setActiveAsset(newAsset);
    setIsSummonOpen(false);
    
    // Trigger neon golden flash animation sequence
    setInjectionFlash(true);
    setTimeout(() => setInjectionFlash(false), 800);
  };

  return (
    <main className={`ras-amr-chamber-viewport ${injectionFlash ? 'neon-flash-active' : ''}`}>
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
              👑 ترحيل العمل المكتمل لـ "مكمن الغاية"
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

            <div className="hud-body-layout">
              {/* Mini Vault Tabs Side */}
              <aside className="hud-vaults-picker custom-scroll">
                {vaultRepositories.map(v => (
                  <button 
                    key={v.id}
                    className={`hud-vault-tab ${selectedVault === v.id ? 'active-hud-tab' : ''}`}
                    onClick={() => setSelectedVault(v.id)}
                  >
                    <span className="hud-tab-icon">{v.icon}</span>
                    <span className="hud-tab-name">{v.name}</span>
                  </button>
                ))}
              </aside>

              {/* Vault Internal Content View */}
              <main className="hud-items-viewer custom-scroll">
                <h3 className="viewer-title-context">
                  محتويات {vaultRepositories.find(v => v.id === selectedVault)?.name} المتاحة للاستدعاء الفوري:
                </h3>
                <div className="hud-items-grid">
                  {vaultRepositories.find(v => v.id === selectedVault)?.items.map((item, index) => (
                    <div key={index} className="hud-asset-item-chip glassmorphism">
                      <div className="hud-item-graphic">✧</div>
                      <span className="hud-item-name">{item}</span>
                      <button 
                        className="hud-inject-btn"
                        onClick={() => handleInjectAsset(item, vaultRepositories.find(v => v.id === selectedVault)?.name || '')}
                      >
                        ⚡ حقن في العمليات الجارية
                      </button>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}