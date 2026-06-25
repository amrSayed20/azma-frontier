/**
 * AZMA OS – Makman Al-Ghayah (The Sovereign Release Terminal)
 * Native Name: مكمن الغاية
 * Status: Final Integrated Build (Fixed UI Overflow & Workflow Logic)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './makman-al-ghayah.css';

const socialPlatforms = [
  { id: 'youtube', name: 'YouTube (4K)', icon: '▶️' },
  { id: 'facebook', name: 'Facebook (Page)', icon: '📘' },
  { id: 'instagram', name: 'Instagram (Reels)', icon: '📸' },
  { id: 'tiktok', name: 'TikTok (Vertical)', icon: '📱' },
  { id: 'x', name: 'X / Twitter', icon: '𝕏' },
  { id: 'linkedin', name: 'LinkedIn (Pro)', icon: '💼' },
];

const cloudPlatforms = [
  { id: 'vault', name: 'الخزانة السيادية', icon: '👑' },
  { id: 'drive', name: 'Google Drive', icon: '☁️' },
  { id: 'aws', name: 'AWS S3 Glacier', icon: '🗄️' },
  { id: 'local', name: 'تحميل محلي (Local)', icon: '💻' },
];

export default function MakmanAlGhayah() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'social' | 'cloud'>('social');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube', 'vault', 'local']);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('ar-EG', { 
        hour12: true, hour: '2-digit', minute: '2-digit',
        year: 'numeric', month: '2-digit', day: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSovereignRelease = () => {
    setIsDeploying(true);
    setTimeout(() => {
      alert(`[AZMA OS] تم إطلاق العمل بنجاح على ${selectedPlatforms.length} مسارات! (بما فيها التحميل المحلي إن وُجد)`);
      setIsDeploying(false);
    }, 3000);
  };

  const handleImportFromVault = () => {
    setIsImporting(true);
    setTimeout(() => {
      router.push('/sovereign-vault-palace');
    }, 800);
  };

  return (
    <main className="makman-viewport">
      <button className="sovereign-exit-btn" onClick={() => router.push('/ras-amr')}>
        ⮜ التراجع لحجرة رأس الأمر
      </button>

      <div className="neon-layer">
        <div className="cyber-grid" />
      </div>

      <div className="chamber-grid-layout">
        
        {/* Left Wing: Deployment Matrix */}
        <aside className="control-panel deployment-desk neon-border">
          <header className="panel-header">
            <div className="neon-tag">DEPLOYMENT MATRIX</div>
            <h2>شبكة التوزيع والأرشفة</h2>
          </header>
          
          <div className="system-clock">{currentTime} م</div>

          <div className="dest-tabs">
            <button 
              className={`dest-tab ${activeTab === 'social' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              المنصات العامة
            </button>
            <button 
              className={`dest-tab ${activeTab === 'cloud' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('cloud')}
            >
              التخزين السحابي والمحلي
            </button>
          </div>

          <div className="platforms-container custom-scroll">
            <div className="grid-2col">
              {(activeTab === 'social' ? socialPlatforms : cloudPlatforms).map(platform => (
                <div 
                  key={platform.id}
                  className={`platform-card ${activeTab === 'cloud' ? 'archive-card' : ''} ${selectedPlatforms.includes(platform.id) ? 'active' : ''}`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <span className="platform-icon">{platform.icon}</span>
                  <span className="platform-name">{platform.name}</span>
                  {selectedPlatforms.includes(platform.id) && <div className="active-indicator">✔️</div>}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: The Sovereign Display */}
        <section className="center-stage">
          <div className="import-vault-bar neon-border">
            <span className="import-text">لم يتم تحديد ملف؟</span>
            <button 
              className={`import-btn ${isImporting ? 'importing' : ''}`}
              onClick={handleImportFromVault}
              disabled={isImporting}
            >
              {isImporting ? 'فتح بوابة الخزانة...' : '📥 استيراد أصل من قصر الخزانة'}
            </button>
          </div>

          <div className="master-display neon-border-gold">
            <div className="display-badges">
              <span className="badge">60 FPS</span>
              <span className="badge master-badge">8K UHD (7680x4320)</span>
              <span className="badge">MASTER RENDER</span>
            </div>
            
            <div className="video-player-mock">
              <div className="play-btn">▶</div>
              <h1 className="project-title">المشهد السريالي الأول - الإصدار النهائي</h1>
              <p className="project-status">جاهز للعرض الأول والتوزيع</p>
            </div>

            <div className="file-telemetry">
              <span>HASH: 0x9A4F...B2C1</span>
              <span>FILE SIZE: 4.2 GB</span>
            </div>
          </div>

          <div className="release-mechanism neon-border">
            <h3 className="mechanism-title">لوحة توقيع الإطلاق (EXECUTIVE RELEASE COMMAND)</h3>
            <div className="action-row">
              <button 
                className={`sovereign-deploy-btn ${isDeploying ? 'deploying' : ''}`}
                onClick={handleSovereignRelease}
                disabled={selectedPlatforms.length === 0 || isDeploying}
              >
                {isDeploying ? '... جاري التنفيذ ...' : 'اعتماد سيادي وإطلاق 🖋️'}
              </button>
              <div className="deploy-stats">
                سيتم التوجيه إلى: <strong>{selectedPlatforms.length} مسارات</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Right Wing: Smart Packaging */}
        <aside className="control-panel packaging-desk neon-border">
          <header className="panel-header">
            <div className="neon-tag">SMART PACKAGING</div>
            <h2>تغليف العمل السيادي</h2>
          </header>

          {/* Scrolling Container for Forms */}
          <div className="packaging-forms-container custom-scroll">
            <div className="form-group">
              <label>العنوان السيادي (Title)</label>
              <input type="text" className="cyber-input" defaultValue="المشهد السريالي الأول - الإصدار النهائي [4K]" />
            </div>

            <div className="form-group">
              <label>الوصف (Description)</label>
              <textarea className="cyber-input textarea" rows={4} defaultValue="الوصف الافتراضي للعمل الفني..." />
            </div>

            <div className="form-group">
              <label>رموز العبور (Tags)</label>
              <input type="text" className="cyber-input" defaultValue="سريالي, تصميم, سيادة, 2026" />
            </div>
          </div>
          
          {/* Fixed Button at Bottom */}
          <button className="ai-generate-btn">
            ✨ توليد التغليف بالذكاء الاصطناعي (AI)
          </button>
        </aside>

      </div>
    </main>
  );
}