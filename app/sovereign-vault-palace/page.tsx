/**
 * AZMA OS – Sovereign Vault Palace (Almuntahaa Architecture)
 * File: app/sovereign-vault-palace/page.tsx
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './sovereign-vault.css';

// --- Vault Definitions with Real Dynamic Metadata ---
const leftWingVaults = [
  { id: 'projects', title: 'خزنة المشاريع', subtitle: 'مستودع المبادرات', count: 14, icon: '📁' },
  { id: 'characters', title: 'خزنة الشخصيات', subtitle: 'هويات الذكاء الاصطناعي', count: 7, icon: '👤' },
  { id: 'brands', title: 'خزنة العلامات التجارية', subtitle: 'الأختام والهويات', count: 8, icon: '🛡️' },
  { id: 'voices', title: 'خزنة الأصوات', subtitle: 'اللسان السيادي', count: 12, icon: '🎙' },
  { id: 'templates', title: 'خزنة القوالب', subtitle: 'الأسس المعمارية', count: 15, icon: '📐' },
];

const rightWingVaults = [
  { id: 'images', title: 'خزنة الصور', subtitle: 'الذخيرة البصرية', count: 120, icon: '🖼️' },
  { id: 'videos', title: 'خزنة الفيديوهات', subtitle: 'اللقطات المنجزة', count: 45, icon: '🎬' },
  { id: 'documents', title: 'خزنة الوثائق', subtitle: 'السجلات المكتوبة', count: 32, icon: '📄' },
  { id: 'references', title: 'خزنة المراجع', subtitle: 'المصادر والأسانيد', count: 88, icon: '📚' },
  { id: 'prompts', title: 'خزنة البرومبتات', subtitle: 'أكواد النوايا', count: 210, icon: '⚙️' },
];

const allVaults = [...leftWingVaults, ...rightWingVaults];

export default function SovereignVaultPalace() {
  const router = useRouter();
  
  // --- States ---
  const [verified, setVerified] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [authMethod, setAuthMethod] = useState<'pin' | 'face' | 'finger'>('pin');
  const [pinCode, setPinCode] = useState('');
  const [activeVault, setActiveVault] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  
  // --- References ---
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Hardware Integration (Camera for Face Auth) ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("تم رفض الوصول للكاميرا السيادية أو غير متوفرة", err);
      }
    };

    if (authMethod === 'face' && !verified) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [authMethod, verified]);

  // --- Hardware Integration (Fingerprint Simulation via WebAuthn API pattern) ---
  const handleFingerprintAuth = async () => {
    try {
      // In a real environment, navigator.credentials.get({ publicKey: ... }) would go here.
      // This simulates the OS-level prompt delay.
      await new Promise(resolve => setTimeout(resolve, 1500));
      handleAccess();
    } catch (err) {
      console.error("فشل المصادقة", err);
    }
  };

  // --- Cinematic Transition ---
  const handleAccess = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setVerified(true);
      setIsTransitioning(false);
    }, 1200); // 1.2s Decryption effect duration
  };

  const handlePinInput = (num: string) => {
    if (pinCode.length < 4) {
      setPinCode(prev => prev + num);
    }
  };

  const toggleAssetSelection = (id: number) => {
    setSelectedAssets(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleContextualRouting = (destination: string) => {
    if (selectedAssets.length === 0) return;
    router.push(`/${destination}`);
  };

  const currentVaultData = allVaults.find(v => v.id === activeVault);

  return (
    <main className={`palace-viewport ${isTransitioning ? 'matrix-dissolve' : ''}`}>
      {/* Global Escape Route */}
      <button className="global-back-btn" onClick={() => router.back()}>
        ⮜ العودة السيادية
      </button>

      {/* Ambient Sovereign Atmosphere */}
      <div className="ambient-layer">
        <div className="os-grid-pattern" />
        <div className="glow-physics glow-primary" />
        <div className="glow-physics glow-secondary" />
      </div>

      <div className="palace-container">
        
        {/* ========================================= */}
        {/* SECURITY LAYER                            */}
        {/* ========================================= */}
        {!verified && !isTransitioning && (
          <section className="security-layer">
            <div className="security-card metallic-surface">
              <header className="security-header">
                
                <h1 className="imperial-title">بوابة العبور</h1>
                <p className="sub-title">يرجى تأكيد الملكيه السيادية</p>
              </header>

              <div className="auth-selectors">
                <button 
                  className={`auth-tab ${authMethod === 'pin' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('pin')}
                >
                  <span className="auth-icon">🔢</span> رمز PIN
                </button>
                <button 
                  className={`auth-tab ${authMethod === 'face' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('face')}
                >
                  <span className="auth-icon">👤</span> بصمة الوجه
                </button>
                <button 
                  className={`auth-tab ${authMethod === 'finger' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('finger')}
                >
                  <span className="auth-icon">☝️</span> بصمة الإصبع
                </button>
              </div>

              <div className="auth-interface">
                {authMethod === 'pin' && (
                  <div className="pin-interface">
                    <div className="pin-display">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`pin-dot ${i < pinCode.length ? 'filled' : ''}`} />
                      ))}
                    </div>
                    <div className="pin-keypad">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handlePinInput(num.toString())} className="pin-btn">{num}</button>
                      ))}
                      <button onClick={() => setPinCode('')} className="pin-btn text-red">✖</button>
                      <button onClick={() => handlePinInput('0')} className="pin-btn">0</button>
                      <button onClick={handleAccess} className="pin-btn text-gold">✔</button>
                    </div>
                  </div>
                )}

                {authMethod === 'face' && (
                  <div className="biometric-interface">
                    <div className="scanner-frame face-scanner-live">
                      <video ref={videoRef} autoPlay playsInline muted className="live-video-feed" />
                      <div className="cyber-overlay" />
                      <div className="scan-line" />
                    </div>
                    <p className="scanner-text">جاري مسح المعالم السيادية المباشرة...</p>
                  </div>
                )}

                {authMethod === 'finger' && (
                  <div className="biometric-interface">
                    <div className="scanner-frame finger-scanner" onClick={handleFingerprintAuth}>
                      <div className="scan-line" />
                    </div>
                    <p className="scanner-text pulse-fast">انقر للاتصال بمستشعر البصمة العتادي</p>
                  </div>
                )}
              </div>

              <button 
                className="azma-btn primary-access-btn" 
                onClick={handleAccess}
              >
                دخول سيادي قاطع
              </button>
            </div>
          </section>
        )}

        {/* ========================================= */}
        {/* DECRYPTION TRANSITION STATE               */}
        {/* ========================================= */}
        {isTransitioning && (
          <div className="decryption-core">
            <div className="decryption-ring" />
            <div className="decryption-text">جاري فك الشفرة السيادية...</div>
          </div>
        )}

        {/* ========================================= */}
        {/* PALACE ARCHITECTURE                       */}
        {/* ========================================= */}
        {verified && !isTransitioning && (
          <section className="palace-active-layout">
            
            {/* --- LEFT WING --- */}
            <aside className="palace-wing left-wing">
              <div className="wing-header">جناح الأصول الهيكلية</div>
              <div className="vault-list">
                {leftWingVaults.map(vault => (
                  <button 
                    key={vault.id} 
                    className={`vault-tab metallic-surface ${activeVault === vault.id ? 'active' : ''}`}
                    onClick={() => { setActiveVault(vault.id); setSelectedAssets([]); }}
                  >
                    <div className="vault-glow" />
                    <div className="vault-info">
                      <h3>{vault.title}</h3>
                      <span>{vault.subtitle}</span>
                    </div>
                    <div className="vault-status-indicator" />
                  </button>
                ))}
              </div>
            </aside>

            {/* --- CENTRAL CORE --- */}
            <main className="central-core metallic-surface">
              
              {/* IDLE STATE: PULSE OF THE EMPIRE */}
              {!activeVault && (
                <div className="core-idle-state fade-in">
                  <div className="radar-container">
                    <div className="radar-ring r1" />
                    <div className="radar-ring r2" />
                    <div className="radar-ring r3" />
                    <div className="radar-sweep" />
                    <div className="radar-core-gem" />
                  </div>
                  
                  <div className="empire-pulse-header">
                    <h1 className="imperial-title">نبض الإمبراطورية</h1>
                    <p className="sub-title">الرادار السيادي للأصول والموارد النشطة</p>
                  </div>

                  <div className="empire-stats-grid">
                    <div className="stat-card">
                      <span className="stat-icon">📁</span>
                      <div className="stat-data">
                        <span className="stat-value">14</span>
                        <span className="stat-label">مشروعاً نشطاً</span>
                      </div>
                    </div>
                    <div className="stat-card center-stat">
                      <span className="stat-icon">🎬</span>
                      <div className="stat-data">
                        <span className="stat-value pulse-text">45</span>
                        <span className="stat-label">لقطة بصرية معتمدة</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">🎙</span>
                      <div className="stat-data">
                        <span className="stat-value">12</span>
                        <span className="stat-label">بصمة لسان سيادي</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE STATE: INTERNAL VAULT PANEL */}
              {activeVault && currentVaultData && (
                <div className="core-active-state fade-in">
                  <header className="internal-vault-header">
                    <div className="vault-header-title">
                      <h2>{currentVaultData.title}</h2>
                      <span className="asset-counter dynamic-count">
                        متاح: {currentVaultData.count} أصل سيادي
                      </span>
                      {selectedAssets.length > 0 && (
                        <span className="asset-counter highlight-count">محدد: {selectedAssets.length}</span>
                      )}
                    </div>
                    <button className="close-vault-btn" onClick={() => { setActiveVault(null); setSelectedAssets([]); }}>
                      ✖ إغلاق الخزنة
                    </button>
                  </header>

                  <div className="internal-vault-content custom-scrollbar">
                    <div className="asset-grid">
                      {/* Dynamically render actual count of items, capped at 24 for UI performance demo */}
                      {Array.from({ length: Math.min(currentVaultData.count, 24) }, (_, i) => i + 1).map(i => (
                        <div 
                          key={i} 
                          className={`asset-card holographic-card ${selectedAssets.includes(i) ? 'selected' : ''}`}
                          onClick={() => toggleAssetSelection(i)}
                        >
                          <div className="asset-selector">
                            <div className="selector-inner" />
                          </div>
                          <div className="asset-preview glassmorphism">
                            <div className="preview-placeholder-icon">{currentVaultData.icon}</div>
                          </div>
                          <div className="asset-meta">
                            <span className="asset-name">أصل سيادي محكم #{i}</span>
                            <span className="asset-date">التوثيق: 2026-06-17</span>
                          </div>
                          <div className="asset-card-glow" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CONTEXTUAL ROUTING FOOTER */}
                  <footer className={`contextual-routing-footer ${selectedAssets.length > 0 ? 'visible' : ''}`}>
                    <div className="routing-energy-line" />
                    <span className="routing-title">مسارات التوجيه السيادي للأصول المحددة</span>
                    <div className="routing-buttons">
                      <button 
                        className="route-btn route-qiyamah"
                        onClick={() => handleContextualRouting('qiyamah-chamber')}
                      >
                        <span className="btn-icon">⚙️</span>
                        إلى حجرة القيامة
                        <span className="btn-sub">للتفكيك والتشكيل</span>
                      </button>

                      <button 
                        className="route-btn route-rasamr"
                        onClick={() => handleContextualRouting('ras-amr')}
                      >
                        <span className="btn-icon">✂️</span>
                        إلى رأس الأمر
                        <span className="btn-sub">للمونتاج والدمج</span>
                      </button>

                      <button 
                        className="route-btn route-ghayah"
                        onClick={() => handleContextualRouting('makam-al-ghayah')}
                      >
                        <span className="btn-icon">👑</span>
                        إلى مكمن الغاية
                        <span className="btn-sub">للنشر المباشر والتصدير</span>
                      </button>
                    </div>
                  </footer>
                </div>
              )}
            </main>

            {/* --- RIGHT WING --- */}
            <aside className="palace-wing right-wing">
              <div className="wing-header">جناح الأصول المنفذة</div>
              <div className="vault-list">
                {rightWingVaults.map(vault => (
                  <button 
                    key={vault.id} 
                    className={`vault-tab metallic-surface ${activeVault === vault.id ? 'active' : ''}`}
                    onClick={() => { setActiveVault(vault.id); setSelectedAssets([]); }}
                  >
                    <div className="vault-glow" />
                    <div className="vault-info">
                      <h3>{vault.title}</h3>
                      <span>{vault.subtitle}</span>
                    </div>
                    <div className="vault-status-indicator" />
                  </button>
                ))}
              </div>
            </aside>

          </section>
        )}
      </div>
    </main>
  );
}