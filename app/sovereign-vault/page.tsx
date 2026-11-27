/**
 * AZMA OS – Sovereign Vault (The Sovereign Transit / Grand Nexus)
 * Status: Final Sovereign Core Architecture - Frozen State
 */

'use client';

import React, { useState, useEffect } from 'react';
import './sovereign-vault.css';
import '@/src/imperial-experience-engine/dihliz/dihliz-member-surface.css';

// The 5 Sovereign Gates of AZMA OS
const sovereignGates = [
  { 
    id: 'hujjah', 
    name: 'البحث والمصادر', 
    path: '/hujjah-al-damighah', 
    icon: 'justice', 
    description: 'مفاعل المعرفة، حيث تُستخرج الأفكار وتُوثق البراهين التي لا تقبل الشك.',
    color: '#D4AF37'
  },
  { 
    id: 'qiyamah', 
    name: 'إنشاء الصور والمشاهد', 
    path: '/qiyamah-chamber', 
    icon: 'eye', 
    description: 'محركات التوليد العظمى والذكاء الاصطناعي.. هنا تُنفخ الروح في الأفكار.',
    color: '#FF4444' 
  },
  { 
    id: 'vault', 
    name: 'خزانة أصولك', 
    path: '/sovereign-vault-palace', 
    icon: 'crown', 
    description: 'أرشيف الأصول والممتلكات.. حصنك المنيع لحفظ النسخ الأصلية (الماستر).',
    color: '#8B6508'
  },
  { 
    id: 'ras-amr', 
    name: 'المونتاج والإنتاج', 
    path: '/ras-amr', 
    icon: 'eagle', 
    description: 'مركز القيادة وتوزيع المهام.. العقل المدبر لخطوط الإنتاج.',
    color: '#FFD700'
  },
  { 
    id: 'makman', 
    name: 'النشر والتسليم', 
    path: '/makman-al-ghayah', 
    icon: 'rocket', 
    description: 'منصة الاعتماد والتغليف.. محطة الإطلاق العالمية نحو النور.',
    color: '#E8D595'
  }
];

/**
 * The gate marks, drawn.
 *
 *   They used to be emoji. Emoji are a font the server may not have: on the
 *   live build two of the five gates rendered as empty boxes, and a gate with
 *   no mark is a door a Creator cannot tell apart from a wall. These are
 *   strokes on a 24-unit grid, drawn in the surface's own gold, and they look
 *   the same in every browser and on every host.
 */
function GateGlyph({ name }: { readonly name: string }) {
  const common = {
    width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'justice':
      return (<svg {...common} aria-hidden="true"><path d="M12 3v18M6 21h12M12 6 4 9M12 6l8 3M4 9l-2 5h6zM20 9l-2 5h6z" /></svg>);
    case 'eye':
      return (<svg {...common} aria-hidden="true"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></svg>);
    case 'crown':
      return (<svg {...common} aria-hidden="true"><path d="M4 18h16M4 18 2.5 9l5 4L12 5l4.5 8 5-4L20 18" /></svg>);
    case 'eagle':
      return (<svg {...common} aria-hidden="true"><path d="M3 15c4.5 0 7-2.5 9-6 2 3.5 4.5 6 9 6-2 2-5.2 3-9 3s-7-1-9-3Z" /><path d="M12 9V5" /><circle cx="12" cy="4" r="1.1" /></svg>);
    case 'rocket':
      return (<svg {...common} aria-hidden="true"><path d="M12 3c3 3 4.2 6 4.2 9L12 15.4 7.8 12C7.8 9 9 6 12 3Z" /><path d="M8.4 14.6 6 20l4.2-1.8M15.6 14.6 18 20l-4.2-1.8" /><circle cx="12" cy="9" r="1.4" /></svg>);
    default:
      return (<svg {...common} aria-hidden="true"><circle cx="12" cy="12" r="7" /></svg>);
  }
}

export default function SovereignVault() {
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
    <main className="obour-viewport" data-dihliz="vault">
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
              <div className="telemetry-message pulse-text">
                <span className="telemetry-icon"><GateGlyph name={activeGateInfo.icon} /></span>
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
                role="button"
                tabIndex={0}
                aria-label={`الدخول إلى ${gate.name}`}
                onMouseEnter={() => setHoveredGate(gate.id)}
                onMouseLeave={() => setHoveredGate(null)}
                onClick={() => window.location.assign(gate.path)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.assign(gate.path); } }}
              >
                <div className="gate-icon"><GateGlyph name={gate.icon} /></div>
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
                role="button"
                tabIndex={0}
                aria-label={`الدخول إلى ${gate.name}`}
                onMouseEnter={() => setHoveredGate(gate.id)}
                onMouseLeave={() => setHoveredGate(null)}
                onClick={() => window.location.assign(gate.path)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.assign(gate.path); } }}
              >
                <div className="gate-icon"><GateGlyph name={gate.icon} /></div>
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