'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './imperial-foyer.css';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';

// ── Interaction Mode — Empire-level (promotes azma.tongue.style) ──────────
// The three modes are canonical across the Empire; the key is shared
// with Al Hujjah so a Creator's chosen mode persists between chambers.

type AzmaTongue = 'conversation' | 'writing' | 'silent';

const TONGUE_DEFS: { id: AzmaTongue; glyph: string; nameAr: string }[] = [
  { id: 'conversation', glyph: '◎', nameAr: 'محادثة' },
  { id: 'writing',      glyph: '⬡', nameAr: 'كتابة'  },
  { id: 'silent',       glyph: '◇', nameAr: 'سكوت'   },
];

function readTongue(): AzmaTongue {
  if (typeof window === 'undefined') return 'conversation';
  const s = localStorage.getItem('azma.tongue.style');
  if (s === 'conversation' || s === 'writing' || s === 'silent') return s;
  return 'conversation';
}

function writeTongue(t: AzmaTongue): void {
  if (typeof window !== 'undefined') localStorage.setItem('azma.tongue.style', t);
}

// ── Constitutional Chamber Registry ──────────────────────────────────────

interface ChamberCard {
  id:     string;
  nameAr: string;
  roleAr: string;
  glyph:  string;
  route:  string;
}

const CONSTITUTIONAL_CHAMBERS: ChamberCard[] = [
  { id: 'hujjah-al-damighah', nameAr: 'حجة الدامغة', roleAr: 'تحقيق معرفي',  glyph: '⚖', route: '/hujjah-al-damighah' },
  { id: 'qiyamah-chamber',    nameAr: 'القيامة',      roleAr: 'إنتاج إبداعي', glyph: '◈', route: '/qiyamah-chamber'    },
  { id: 'ras-amr',            nameAr: 'رأس الأمر',    roleAr: 'توجيه سيادي',  glyph: '◎', route: '/ras-amr'            },
  { id: 'makman-al-ghayah',   nameAr: 'مكمن الغاية',  roleAr: 'استراتيجية',   glyph: '⬟', route: '/makman-al-ghayah'  },
];

const COMPANION_MESSAGES: Record<AzmaTongue, string> = {
  conversation: 'مرحباً بك في قلب الإمبراطورية. إلى أين تتجه؟',
  writing:      'الإمبراطورية تستقبلك. اختر حجرتك وابدأ.',
  silent:       '.',
};

// ── Main Component ────────────────────────────────────────────────────────

export default function ImperialFoyer() {
  const router = useRouter();

  const [tongue,     setTongue]     = useState<AzmaTongue>(() => readTongue());
  const [vaultCount, setVaultCount] = useState<number | null>(null);
  const [entered,    setEntered]    = useState(false);
  const [departing,  setDeparting]  = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));

    fetch('/api/vault/assets')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.status === 'succeeded' && Array.isArray(data.assets)) {
          setVaultCount(data.assets.length as number);
        } else {
          setVaultCount(0);
        }
      })
      .catch(() => setVaultCount(0));

    return () => cancelAnimationFrame(raf);
  }, []);

  function selectTongue(t: AzmaTongue) {
    writeTongue(t);
    setTongue(t);
  }

  const navigate = useCallback((route: string) => {
    setDeparting(true);
    setTimeout(() => router.push(route), 420);
  }, [router]);

  const companionMsg = COMPANION_MESSAGES[tongue];

  return (
    <main
      className={`foyer-viewport ${entered ? 'foyer-entered' : ''} ${departing ? 'foyer-departing' : ''}`}
      dir="rtl"
    >
      {/* Atmospheric background */}
      <div className="foyer-ambient" aria-hidden="true">
        <div className="foyer-grid" />
        <div className="foyer-glow-primary" />
        <div className="foyer-glow-secondary" />
      </div>

      {/* Imperial Voice */}
      <div className="foyer-companion">
        <LivingCompanion
          message={companionMsg}
          visible={true}
          textToSpeak={tongue !== 'silent' ? companionMsg : ''}
          context="universal"
        />
      </div>

      {/* Empire Interaction Modes — promoted from chamber-level */}
      <div className="foyer-modes" role="group" aria-label="أسلوب التفاعل مع الإمبراطورية">
        {TONGUE_DEFS.map((def) => (
          <button
            key={def.id}
            className={`foyer-mode-btn ${tongue === def.id ? 'mode-active' : ''}`}
            onClick={() => selectTongue(def.id)}
          >
            <span className="mode-glyph" aria-hidden="true">{def.glyph}</span>
            <span className="mode-name">{def.nameAr}</span>
          </button>
        ))}
      </div>

      {/* Sovereign Vault Palace — center of the Empire */}
      <div className="foyer-center">
        <button
          className="foyer-vault-card"
          onClick={() => navigate('/sovereign-vault-palace')}
          aria-label="الدخول إلى القصر السيادي"
        >
          <span className="vault-card-seal" aria-hidden="true">⬡</span>
          <div className="vault-card-body">
            <h1 className="vault-card-name">القصر السيادي</h1>
            <p className="vault-card-role">مركز الإمبراطورية — كل ما يستحق المحافظة عليه</p>
          </div>
          <div className="vault-card-state" aria-live="polite">
            {vaultCount === null && (
              <span className="vault-state-loading" aria-label="جارٍ التحميل">●</span>
            )}
            {vaultCount === 0 && (
              <span className="vault-state-empty">أودع أول كنز</span>
            )}
            {vaultCount !== null && vaultCount > 0 && (
              <span className="vault-state-count">{vaultCount} كنز</span>
            )}
          </div>
        </button>
      </div>

      {/* Constitutional Chamber Cards */}
      <div className="foyer-chambers">
        {CONSTITUTIONAL_CHAMBERS.map((ch) => (
          <button
            key={ch.id}
            className={`foyer-chamber-card foyer-chamber-${ch.id}`}
            onClick={() => navigate(ch.route)}
            aria-label={`الدخول إلى ${ch.nameAr}`}
          >
            <span className="chamber-glyph" aria-hidden="true">{ch.glyph}</span>
            <div className="chamber-identity">
              <span className="chamber-name">{ch.nameAr}</span>
              <span className="chamber-role">{ch.roleAr}</span>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
