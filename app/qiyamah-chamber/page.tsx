/**
 * AZMA OS – Qiyamah Chamber (The Generative Genesis Forge)
 * Native Name: حجرة القيامة
 * Status: Final Sovereign Generative Architecture (Canvas + Neon Vortex)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './qiyamah-chamber.css';

// Types for our Generative Nodes
type AssetType = 'text' | 'image' | 'video' | 'audio' | null;

export default function QiyamahChamber() {
  const router = useRouter();

  // Core State
  const [activeAsset, setActiveAsset] = useState<AssetType>(null);
  const [assetContent, setAssetContent] = useState<string | null>(null);
  
  // Generative Controls State
  const [duration, setDuration] = useState(15); // Seconds
  const [style, setStyle] = useState('cinematic');
  const [voiceType, setVoiceType] = useState('sovereign_male');
  
  // Accounting State (Live HUD & Execution Bill)
  const [liveCost, setLiveCost] = useState(0);
  const [showBill, setShowBill] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Final Master State
  const [masterReady, setMasterReady] = useState(false);

  // --- 1. The Generative Accounting Engine (Live HUD) ---
  useEffect(() => {
    let cost = 0;
    if (activeAsset) {
      // Base calculation
      cost += duration * 2; // 2 AZMA Credits per second
      if (style === 'cinematic' || style === 'hyper_real') cost += 50; // High tier styles cost more
      if (style === 'documentary') cost += 20;
      if (voiceType === 'clone') cost += 100; // Voice cloning is expensive
    }
    setLiveCost(cost);
  }, [duration, style, voiceType, activeAsset]);

  // --- 2. The Interactive Canvas (Drop Handlers) ---
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0) {
      const file = dt.files[0];
      if (file.type.startsWith('image/')) setActiveAsset('image');
      else if (file.type.startsWith('video/')) setActiveAsset('video');
      else if (file.type.startsWith('audio/')) setActiveAsset('audio');
      setAssetContent(`[ملف محلي]: ${file.name}`);
    } else {
      const text = dt.getData('text');
      if (text) {
        setActiveAsset('text');
        setAssetContent(`[سكربت سيادي]: "${text.substring(0, 50)}..."`);
      }
    }
  };

  const simulateHujjahImport = () => {
    setActiveAsset('text');
    setAssetContent('[سكربت سيادي مستورد]: "الخطاف: هل تعلم سر الخلود الحقيقي..."');
  };

  // --- 3. The Execution Bill & Genesis Process ---
  const handleTriggerGenesis = () => setShowBill(true);

  const confirmAndGenerate = () => {
    setShowBill(false);
    setIsGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setMasterReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 200); // Simulate processing time
  };

  // --- 4. The Neon Vortex Routing ---
  const routeMaster = (destination: string) => {
    // In a real app, we would pass the generated asset ID in the URL or State
    router.push(destination);
  };

  return (
    <main className="qiyamah-viewport">
      {/* Background Ambience */}
      <div className="forge-background">
        <div className="crimson-nebula"></div>
        <div className="cyber-grid-red"></div>
      </div>

      {/* Top Nav & Navigation */}
      <button className="sovereign-exit-btn" onClick={() => router.push('/al-obour-al-siyadi')}>
        ⮜ العودة للعبور السيادي
      </button>

      {/* The Live Accounting HUD */}
      <div className="accounting-hud neon-border-red">
        <div className="hud-label">طاقة التوليد المطلوبة (AZMA Credits)</div>
        <div className="hud-value pulse-text">{liveCost} ⚡</div>
      </div>

      <div className="qiyamah-layout">
        
        {/* The Central Interactive Canvas */}
        <div 
          className={`genesis-canvas ${activeAsset ? 'active-canvas' : 'empty-canvas'} ${isGenerating ? 'generating-state' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!activeAsset && !isGenerating && !masterReady && (
            <div className="empty-prompt">
              <div className="pulse-core"></div>
              <h2>بؤرة الإسقاط</h2>
              <p>اسحب وأفلت النص، الصورة، أو الفيديو هنا لإيقاظ المفاعل.</p>
              <button className="import-btn neon-border-gold" onClick={simulateHujjahImport}>
                استيراد آخر حجة من مفاعل المعرفة ⮞
              </button>
            </div>
          )}

          {activeAsset && !isGenerating && !masterReady && (
            <div className="asset-node neon-border-gold">
              <div className="node-type-badge">{activeAsset.toUpperCase()} NODE</div>
              <div className="node-content">{assetContent}</div>
            </div>
          )}

          {isGenerating && (
            <div className="genesis-progress">
              <div className="progress-circle">
                <div className="progress-value">{generationProgress}%</div>
              </div>
              <p className="generating-text pulse-text">تتم الآن عملية النفخ والبعث الرقمي...</p>
            </div>
          )}

          {masterReady && (
            <div className="final-master-node neon-border-gold">
              <div className="master-badge">✨ الماستر السيادي المكتمل ✨</div>
              <div className="master-preview"></div> {/* Placeholder for generated video/image */}
              
              {/* The Neon Vortex Routing System */}
              <div className="vortex-routing">
                <p>تم التخليق بنجاح. اختر مدار العبور:</p>
                <div className="vortex-orbits">
                  <button className="orbit-btn orbit-ras" onClick={() => routeMaster('/ras-amr')}>
                    <span>🦅 رأس الأمر</span><small>(للمونتاج)</small>
                  </button>
                  <button className="orbit-btn orbit-vault" onClick={() => routeMaster('/sovereign-vault-palace')}>
                    <span>👑 الخزانة</span><small>(للحفظ)</small>
                  </button>
                  <button className="orbit-btn orbit-makman" onClick={() => routeMaster('/makman-al-ghayah')}>
                    <span>🚀 مكمن الغاية</span><small>(للنشر)</small>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* The Floating Glass Panels (Only visible when an asset is active and not finished) */}
        {activeAsset && !isGenerating && !masterReady && (
          <aside className="floating-panels-container">
            
            {/* Acoustic Forge Panel */}
            <div className="glass-panel neon-border-red">
              <div className="panel-tag">ACOUSTIC FORGE</div>
              <h3>مفاعل الحنجرة</h3>
              
              <div className="control-group">
                <label>نوع الصوت السيادي</label>
                <select className="cyber-select" value={voiceType} onChange={(e) => setVoiceType(e.target.value)}>
                  <option value="sovereign_male">صوت المنصة الرخيم (ذكر)</option>
                  <option value="sovereign_female">صوت وثائقي هادئ (أنثى)</option>
                  <option value="clone">استنساخ بصمة صوتية (عالي التكلفة) ⚡</option>
                  <option value="upload">رفع ملف صوتي خارجي</option>
                </select>
              </div>
            </div>

            {/* Visual Genesis Panel */}
            <div className="glass-panel neon-border-red">
              <div className="panel-tag">VISUAL GENESIS</div>
              <h3>التجسد البصري</h3>
              
              <div className="control-group">
                <label>نمط التوليد (Style)</label>
                <select className="cyber-select" value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="cinematic">سينمائي 35mm (ملحمي)</option>
                  <option value="documentary">وثائقي كلاسيكي (أرشيفي)</option>
                  <option value="hyper_real">واقعي فائق 8K</option>
                  <option value="scifi">خيال علمي سريالي</option>
                  <option value="animation">أنيميشن رقمي</option>
                </select>
              </div>

              <div className="control-group">
                <label>زمن القيامة (المدة): {duration} ثانية</label>
                <input 
                  type="range" 
                  min="5" max="120" step="1" 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="cyber-slider"
                />
              </div>
            </div>

            <button className="trigger-genesis-btn" onClick={handleTriggerGenesis}>
              بدء التوليد (القيامة) ⭍
            </button>
          </aside>
        )}

      </div>

      {/* The Execution Bill Modal (Transparency Protocol) */}
      {showBill && (
        <div className="bill-modal-overlay">
          <div className="execution-bill neon-border-red">
            <h2 className="bill-title">وثيقة المحاسبة الإنشائية</h2>
            <div className="bill-details">
              <div className="bill-row">
                <span>زمن التوليد ({duration} ثانية):</span>
                <span>{duration * 2} ⚡</span>
              </div>
              <div className="bill-row">
                <span>نمط التجسد البصري ({style}):</span>
                <span>{style === 'cinematic' || style === 'hyper_real' ? 50 : 20} ⚡</span>
              </div>
              <div className="bill-row">
                <span>مفاعل الحنجرة ({voiceType}):</span>
                <span>{voiceType === 'clone' ? 100 : 0} ⚡</span>
              </div>
              <hr className="bill-divider" />
              <div className="bill-row total-row">
                <span>الإجمالي المطلوب خصمه:</span>
                <span className="total-cost">{liveCost} ⚡</span>
              </div>
              <div className="bill-row balance-row">
                <span>الرصيد السيادي المتاح:</span>
                <span>9,500 ⚡</span>
              </div>
            </div>
            
            <div className="bill-actions">
              <button className="cancel-btn" onClick={() => setShowBill(false)}>إلغاء وتعديل</button>
              <button className="confirm-btn neon-border-gold" onClick={confirmAndGenerate}>اعتماد سيادي وبدء النفخ</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}