/**
 * AZMA OS – Sovereign Vault (The Sovereign Transit / Grand Nexus)
 * Status: Final Sovereign Core Architecture - Frozen State
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './sovereign-vault.css';

// The 5 Sovereign Gates of AZMA OS
const sovereignGates = [
  { 
    id: 'hujjah', 
    name: 'الحجة الدامغة', 
    path: '/hujjah-al-damighah', 
    icon: '⚖️', 
    description: 'مفاعل المعرفة، حيث تُستخرج الأفكار وتُوثق البراهين التي لا تقبل الشك.',
    color: '#D4AF37'
  },
  { 
    id: 'qiyamah', 
    name: 'حجرة القيامة', 
    path: '/qiyamah-chamber', 
    icon: '👁️', 
    description: 'محركات التوليد العظمى والذكاء الاصطناعي.. هنا تُنفخ الروح في الأفكار.',
    color: '#FF4444' 
  },
  { 
    id: 'vault', 
    name: 'قصر الخزانة السيادية', 
    path: '/sovereign-vault-palace', 
    icon: '👑', 
    description: 'أرشيف الأصول والممتلكات.. حصنك المنيع لحفظ النسخ الأصلية (الماستر).',
    color: '#8B6508'
  },
  { 
    id: 'ras-amr', 
    name: 'حجرة رأس الأمر', 
    path: '/ras-amr', 
    icon: '🦅', 
    description: 'مركز القيادة وتوزيع المهام.. العقل المدبر لخطوط الإنتاج.',
    color: '#FFD700'
  },
  { 
    id: 'makman', 
    name: 'مكمن الغاية', 
    path: '/makman-al-ghayah', 
    icon: '🚀', 
    description: 'منصة الاعتماد والتغليف.. محطة الإطلاق العالمية نحو النور.',
    color: '#E8D595'
  }
];

export default function SovereignVault() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const [hoveredGate, setHoveredGate] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('ar-EG', { 
        hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
        year: 'numeric', month: 'long', day: 'numeric'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Find active description based on hover
  const activeGateInfo = sovereignGates.find(g => g.id === hoveredGate);

  return (
    <main className="obour-viewport">
      {/* Deep Cyber-Gold Background Effects */}
      <div className="neon-layer">
        <div className="cyber-grid" />
        <div className="ambient-glow" />
      </div>

      <div className="obour-container">
        
        {/* The Sovereign Core (Header & Telemetry) */}
        <header className="sovereign-core">
          <div className="core-badge">AZMA OS NEXUS</div>
          <h1 className="core-title">العبـور السـيـادي</h1>
          <div className="core-clock">{currentTime}</div>
          
          {/* Dynamic Telemetry Display */}
          <div className="core-telemetry">
            {activeGateInfo ? (
              <div className="telemetry-message pulse-text" style={{ color: activeGateInfo.color }}>
                <span className="telemetry-icon">{activeGateInfo.icon}</span>
                <p>بوابة <strong>{activeGateInfo.name}</strong> متصلة: <br/> {activeGateInfo.description}</p>
              </div>
            ) : (
              <div className="telemetry-message default-message">
                الأنظمة مستقرة. بوابات الإمبراطورية الخمس جاهزة لعبور القائد.
              </div>
            )}
          </div>
        </header>

        {/* The Gates Layout (3 Top, 2 Bottom for majestic balance) */}
        <div className="gates-matrix">
          {/* Top Row (3 Gates) */}
          <div className="gates-row top-row">
            {sovereignGates.slice(0, 3).map(gate => (
              <div 
                key={gate.id} 
                className="gate-card neon-border"
                onMouseEnter={() => setHoveredGate(gate.id)}
                onMouseLeave={() => setHoveredGate(null)}
                onClick={() => router.push(gate.path)}
              >
                <div className="gate-icon">{gate.icon}</div>
                <h2 className="gate-name">{gate.name}</h2>
                <div className="gate-portal-effect"></div>
              </div>
            ))}
          </div>

          {/* Bottom Row (2 Gates centered) */}
          <div className="gates-row bottom-row">
            {sovereignGates.slice(3, 5).map(gate => (
              <div 
                key={gate.id} 
                className="gate-card neon-border"
                onMouseEnter={() => setHoveredGate(gate.id)}
                onMouseLeave={() => setHoveredGate(null)}
                onClick={() => router.push(gate.path)}
              >
                <div className="gate-icon">{gate.icon}</div>
                <h2 className="gate-name">{gate.name}</h2>
                <div className="gate-portal-effect"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Engraving */}
        <footer className="obour-footer">
          شُيدت بهندسة الإحلال الجذري – منصة عظمة السيادية © 2026
        </footer>
      </div>
    </main>
  );
}