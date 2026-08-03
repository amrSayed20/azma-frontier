'use client';

/**
 * AZMA OS — Imperial Foyer
 *
 * CONSTITUTIONAL INTEGRATION (2026-08-03):
 * Every interaction leaving this Foyer now first passes through the
 * Sovereign Interaction Kernel (src/sovereign-interaction-kernel/).
 * The preparation window (600ms) lets the Creator observe what the Kernel
 * resolved — chamber identity and interaction mode — before the Foyer
 * departs. The prepared InteractionSession is written to sessionStorage
 * under 'azma.kernel.session' so entering chambers can read the Kernel's
 * intent on mount.
 *
 * No new capabilities. No new engines. Only constitutional visibility.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './imperial-foyer.css';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { prepareInteractionSession } from '@/src/sovereign-interaction-kernel';
import type { InteractionSession } from '@/src/sovereign-interaction-kernel';
import type { ManifestChamberContext, ManifestInteractionMode } from '@/src/sovereign-chamber-manifest';

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
// id is typed as ManifestChamberContext — these are constitutional chamber
// identifiers that must match the sovereign-chamber-manifest exactly.

interface ChamberCard {
  id:     ManifestChamberContext;
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

// ── Constitutional Return Map ─────────────────────────────────────────────
// Each constitutional act maps to a return message that names what just
// ended AND names the natural next step — so the Creator immediately
// perceives "I have returned to the Empire" rather than "I navigated back."
// Values answer: what responsibility just completed? what comes naturally next?

const CONSTITUTIONAL_RETURN_MESSAGES: Record<string, string> = {
  investigation: 'المعرفة اكتملت — هل تريد تحويلها إلى إبداع أو توجيه؟',
  creation:      'الإبداع وُلد — هل تريد توجيهه أو توزيعه على العالم؟',
  direction:     'التوجيه اكتمل — هل تريد الانتقال إلى مكمن الغاية؟',
  distribution:  'الغاية بلغت — الإمبراطورية تستقبلك لرحلة جديدة.',
  treasury:      'القصر السيادي أغلق أبوابه — ما الذي تريد بناؤه الآن؟',
};

// ── Kernel Companion Message ──────────────────────────────────────────────
// Replaces the default greeting for the 600ms preparation window.
// Shows the Creator: which chamber the Kernel resolved, and which
// interaction mode it prepared — before the Foyer departs.

const MODE_AR: Record<ManifestInteractionMode, string> = {
  write:  'كتابة',
  listen: 'استماع',
  browse: 'تصفّح',
};

function kernelReadyMessage(session: InteractionSession, chamberNameAr: string): string {
  if (session.status === 'RESOLVED' && session.activeInteractionMode) {
    return `الإمبراطورية تستعدّ — ${chamberNameAr} — ${MODE_AR[session.activeInteractionMode]}`;
  }
  return `الإمبراطورية تستعدّ — ${chamberNameAr}`;
}

// ── Main Component ────────────────────────────────────────────────────────

export default function ImperialFoyer() {
  const router = useRouter();

  const [tongue,          setTongue]          = useState<AzmaTongue>(() => readTongue());
  const [vaultCount,      setVaultCount]      = useState<number | null>(null);
  const [entered,         setEntered]         = useState(false);
  const [departing,       setDeparting]       = useState(false);
  const [kernelSession,   setKernelSession]   = useState<InteractionSession | null>(null);
  const [preparingId,     setPreparingId]     = useState<string | null>(null);
  const [preparingNameAr, setPreparingNameAr] = useState<string | null>(null);
  // IMPERIAL JOURNEY CONTINUITY — Package D:
  // Holds the constitutional return message for one beat after the Creator
  // returns from a chamber. Cleared when they choose an interaction mode
  // (at which point their attention has turned forward, not backward).
  const [returnMsg,       setReturnMsg]       = useState<string | null>(null);

  // Guard: prevents a second chamber from being launched while one is
  // already in the 600ms preparation window.
  const isPreparingRef = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));

    // IMPERIAL JOURNEY CONTINUITY — Package D:
    // Consume the constitutional return context a chamber wrote before
    // departing to this Foyer. Map the constitutional act to a message that
    // names what just ended and what naturally comes next. The Creator
    // immediately perceives "I have returned to the Empire" — not "I
    // navigated back to a page." Only the constitutional act drives the
    // message; raw origin/storage keys are never exposed.
    const returnRaw = typeof window !== 'undefined'
      ? sessionStorage.getItem('azma.return.session') : null;
    if (returnRaw) {
      sessionStorage.removeItem('azma.return.session');
      try {
        const s = JSON.parse(returnRaw) as { constitutionalAct?: string };
        const msg = s?.constitutionalAct
          ? CONSTITUTIONAL_RETURN_MESSAGES[s.constitutionalAct]
          : null;
        if (msg) setReturnMsg(msg);
      } catch { /* ignore malformed payload */ }
    }

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
    setReturnMsg(null); // Creator has turned attention forward — return acknowledgment served its purpose
  }

  // ── Kernel-mediated chamber launch ────────────────────────────────────
  // Replaces the old hardcoded navigate(route) calls.
  //
  // Flow:
  //   1. Kernel prepares an InteractionSession synchronously (< 1ms)
  //   2. Preparation window (600ms): Creator sees the Kernel's resolution
  //      via the LivingCompanion message and the preparing card glow
  //   3. Session is written to sessionStorage for the entering chamber
  //   4. Foyer departs (420ms fade-out)
  //   5. router.push to the chamber

  const launchChamber = useCallback((
    chamberId: ManifestChamberContext,
    route:     string,
    nameAr:    string,
  ) => {
    if (isPreparingRef.current) return;
    isPreparingRef.current = true;

    const session = prepareInteractionSession({
      intent: { kind: 'navigate', targetChamber: chamberId },
    });

    setKernelSession(session);
    setPreparingId(chamberId);
    setPreparingNameAr(nameAr);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('azma.kernel.session', JSON.stringify(session));
      }
      setPreparingId(null);
      setPreparingNameAr(null);
      setDeparting(true);
      setTimeout(() => router.push(route), 420);
    }, 600);
  }, [router]);

  const isPreparing = preparingId !== null;

  // Priority order (highest → lowest):
  // 1. Kernel ready message — the Foyer is actively preparing departure
  // 2. Constitutional return message — the Creator just returned from a chamber
  // 3. Default tongue message — no journey context active
  const companionMsg =
    kernelSession && isPreparing && preparingNameAr
      ? kernelReadyMessage(kernelSession, preparingNameAr)
      : returnMsg ?? COMPANION_MESSAGES[tongue];

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
            disabled={isPreparing}
          >
            <span className="mode-glyph" aria-hidden="true">{def.glyph}</span>
            <span className="mode-name">{def.nameAr}</span>
          </button>
        ))}
      </div>

      {/* Sovereign Vault Palace — center of the Empire */}
      <div className="foyer-center">
        <button
          className={`foyer-vault-card ${preparingId === 'sovereign-vault-palace' ? 'vault-preparing' : ''}`}
          onClick={() => launchChamber('sovereign-vault-palace', '/sovereign-vault-palace', 'القصر السيادي')}
          aria-label="الدخول إلى القصر السيادي"
          disabled={isPreparing}
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
            className={`foyer-chamber-card foyer-chamber-${ch.id} ${preparingId === ch.id ? 'chamber-preparing' : ''}`}
            onClick={() => launchChamber(ch.id, ch.route, ch.nameAr)}
            aria-label={`الدخول إلى ${ch.nameAr}`}
            disabled={isPreparing}
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
