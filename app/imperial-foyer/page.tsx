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
import './imperial-foyer.css';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { prepareInteractionSession } from '@/src/sovereign-interaction-kernel';
import type { InteractionSession } from '@/src/sovereign-interaction-kernel';
import type { ManifestChamberContext, ManifestInteractionMode } from '@/src/sovereign-chamber-manifest';
import { useInstallInvitation } from '@/src/install-experience';
import { getArrivalRecord, useVisitorPresence } from '@/src/visitor-presence';
import { applyVariation } from '@/src/design-system';
import { getVisionDocument } from '@/src/chamber-vision';
import type { ChamberId } from '@/src/chamber-identity';

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
  id:       ManifestChamberContext;
  nameAr:   string;
  roleAr:   string;
  actionAr: string;
  glyph:    string;
  route:    string;
}

const CONSTITUTIONAL_CHAMBERS: ChamberCard[] = [
  { id: 'hujjah-al-damighah', nameAr: 'حجة الدامغة', roleAr: 'تستدلّ', actionAr: 'اطرح سؤالاً — ابدأ التحقيق',  glyph: '⚖', route: '/hujjah-al-damighah' },
  { id: 'qiyamah-chamber',    nameAr: 'القيامة',      roleAr: 'تخلق',   actionAr: 'صِف مشهداً — أنشئ صورة',      glyph: '◈', route: '/qiyamah-chamber'    },
  { id: 'ras-amr',            nameAr: 'رأس الأمر',    roleAr: 'تحكم',   actionAr: 'وجّه ما خُلق نحو الغاية',     glyph: '◎', route: '/ras-amr'            },
  { id: 'makman-al-ghayah',   nameAr: 'مكمن الغاية',  roleAr: 'تُحقق',  actionAr: 'أعلن غايتك — سجّل هدفك',     glyph: '⬟', route: '/makman-al-ghayah'  },
];

const COMPANION_MESSAGES: Record<AzmaTongue, string> = {
  conversation: 'مرحباً بك في قلب الإمبراطورية. إلى أين تتجه؟',
  writing:      'الإمبراطورية تستقبلك. اختر حجرتك وابدأ.',
  silent:       '.',
};

// ── First-Visit Revelation — Package H ───────────────────────────────────
// Cycles once when a brand-new Creator enters the Foyer with no
// constitutional state (no creations, canvases, productions, or goals).
// Not a tutorial. Not a walkthrough. The Empire declares its own nature.
// A sessionStorage guard ensures it fires at most once per browser session.

const FIRST_VISIT_REVELATION = [
  'الإمبراطورية تراك.',
  'خمس حجرات. رحلة واحدة.',
  'القيامة تخلق. رأس الأمر يحكم. الغاية تُحقق.',
] as const;

const REVELATION_INTERVAL = 2800; // ms per declaration

// ── Chamber Revelation on Hover — Package H (chamber-vision wired) ──────────
// When the Creator rests on a chamber card, the Empire speaks the chamber's
// philosophical worldview — derived from src/chamber-vision/ (philosophyAr),
// not a hardcoded object. What the chamber BELIEVES, not merely what it does.

function getChamberPhilosophyAr(chamberId: string): string | null {
  try {
    return getVisionDocument(chamberId as ChamberId)?.philosophyAr ?? null;
  } catch {
    return null;
  }
}

// ── Creator Identity — Package G ─────────────────────────────────────────
// The Empire's certified knowledge of who the Creator is.
// Source: GET /api/auth/me — only fields the route already exposes.
// Nothing predicted, nothing inferred, nothing artificial.

interface CreatorIdentity {
  displayName: string | null;
  role: 'founder' | 'creator';
}

// ── Sovereign Presence State ──────────────────────────────────────────────
// The shape returned by GET /api/sovereign/presence. Reflects only what is
// already durably recorded in the Empire — never invented, never inferred.

interface SovereignPresence {
  qiyamah: {
    creationCount:    number;
    mostRecentPrompt: string | null;
    mostRecentAt:     number | null;
  };
  rasAlAmr: {
    savedCanvasCount: number;
    mostRecentTitle:  string | null;
    mostRecentSavedAt: number | null;
  };
  makman: {
    productionCount:          number;
    mostRecentTitle:          string | null;
    mostRecentRenderStatus:   string | null;
    hasProcessingProduction:  boolean;
  };
  hujjah: {
    goalCount:            number;
    hasActiveGoal:        boolean;
    mostRecentGoalTitle:  string | null;
  };
}

// Returns the most constitutionally significant presence state as a companion
// message — now identity-aware (Package G). Named goals/canvases and the
// Creator's sovereign purpose are referenced when they exist, making the
// message personal rather than generic. Never invented, never predicted.
function derivePresenceMessage(
  p: SovereignPresence,
  identity?: { displayName: string | null; purpose: string | null },
): string | null {
  if (p.makman.hasProcessingProduction) {
    return identity?.displayName
      ? `${identity.displayName} — الإمبراطورية تُنتج الآن نحو غايتك`
      : 'الإمبراطورية تُنتج الآن — مكمن الغاية يسير نحو غايته';
  }
  if (p.hujjah.hasActiveGoal) {
    const goalTitle = p.hujjah.mostRecentGoalTitle;
    return goalTitle
      ? `هدف "${goalTitle}" نشط — حجة الدامغة تنتظر توجيهك`
      : 'غاية نشطة في التحقيق — حجة الدامغة تنتظر توجيهك';
  }
  if (p.rasAlAmr.savedCanvasCount > 0 && p.makman.productionCount === 0) {
    const canvasTitle = p.rasAlAmr.mostRecentTitle;
    return canvasTitle
      ? `تشكيلة "${canvasTitle}" محفوظة — مكمن الغاية جاهز لاستقبالها`
      : 'تشكيلة سردية محفوظة في رأس الأمر — هل أنت مستعدّ لصهرها؟';
  }
  if (p.qiyamah.creationCount > 0 && p.rasAlAmr.savedCanvasCount === 0) {
    return identity?.purpose
      ? 'إبداعك في الخزانة السيادية — رأس الأمر يستعد لتوجيهه نحو غايتك'
      : 'إبداعك موجود في الخزانة — رأس الأمر يستقبل توجيهك';
  }
  if (identity?.purpose && p.qiyamah.creationCount === 0) {
    return 'غايتك السيادية أُعلنت — حجرة القيامة تنتظر أول إبداع';
  }
  return null;
}

// Derives which chamber the Empire naturally awaits the Creator in,
// based purely on certified constitutional state. Returns a chamberId
// or null when no single chamber is more urgent than another.
// This drives the subtle visual invitation on one chamber card only.
function deriveNaturalNextChamber(
  presence: SovereignPresence | null,
  hasPurpose: boolean,
): string | null {
  if (!presence) return null;
  // Production live → Creator should monitor Makman
  if (presence.makman.hasProcessingProduction) return 'makman-al-ghayah';
  // Active goal → Al Hujjah awaits investigation
  if (presence.hujjah.hasActiveGoal) return 'hujjah-al-damighah';
  // Canvas saved but no production → Makman can receive it
  if (presence.rasAlAmr.savedCanvasCount > 0 && presence.makman.productionCount === 0) return 'makman-al-ghayah';
  // Creation exists but no canvas → Ras Al Amr awaits direction
  if (presence.qiyamah.creationCount > 0 && presence.rasAlAmr.savedCanvasCount === 0) return 'ras-amr';
  // Purpose declared but no goals registered → Makman awaits
  if (hasPurpose && presence.hujjah.goalCount === 0) return 'makman-al-ghayah';
  // Nothing yet → Qiyamah holds the first invitation
  if (presence.qiyamah.creationCount === 0) return 'qiyamah-chamber';
  return null;
}

// Returns a short presence phrase for a specific chamber card.
// Null means the chamber has no recorded state worth showing.
function getChamberPresence(chamberId: string, p: SovereignPresence | null): string | null {
  if (!p) return null;
  switch (chamberId) {
    case 'hujjah-al-damighah':
      if (p.hujjah.hasActiveGoal)   return '● غاية نشطة';
      if (p.hujjah.goalCount > 0)   return '◎ تحقيق مكتمل';
      return null;
    case 'qiyamah-chamber':
      if (p.qiyamah.creationCount > 0) return '● إبداع في الخزانة';
      return null;
    case 'ras-amr':
      if (p.rasAlAmr.savedCanvasCount > 0) return '● تشكيلة محفوظة';
      return null;
    case 'makman-al-ghayah':
      if (p.makman.hasProcessingProduction) return '◉ إنتاج جارٍ';
      if (p.makman.productionCount > 0)     return '◎ توزيع مكتمل';
      return null;
    default:
      return null;
  }
}

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
  const { openManually, platform: installPlatform } = useInstallInvitation();
  // Defer to after mount — platform detection reads window.navigator which
  // is unavailable during SSR; starting as false matches the server render
  // and prevents a React hydration mismatch.
  const [foyerMounted, setFoyerMounted] = useState(false);
  useEffect(() => { setFoyerMounted(true); }, []);
  const showInstallBtn = foyerMounted && installPlatform !== 'already-installed' && installPlatform !== 'unsupported';

  // Start with 'conversation' on server and client to avoid hydration mismatch,
  // then read the real localStorage value after mount.
  const [tongue,          setTongue]          = useState<AzmaTongue>('conversation');
  const [vaultCount,      setVaultCount]      = useState<number | null>(null);
  const [presence,        setPresence]        = useState<SovereignPresence | null>(null);
  const [departing,       setDeparting]       = useState(false);
  const [kernelSession,   setKernelSession]   = useState<InteractionSession | null>(null);
  const [preparingId,     setPreparingId]     = useState<string | null>(null);
  const [preparingNameAr, setPreparingNameAr] = useState<string | null>(null);
  // CREATOR IDENTITY PRESENCE — Package G:
  // The Empire's certified knowledge of who the Creator is and what they
  // have declared as their sovereign purpose. Two additional fetches on
  // mount; both are enhancement-only — failures are silenced, never
  // blocking the Foyer's core functionality.
  const [creatorIdentity,  setCreatorIdentity]  = useState<CreatorIdentity | null>(null);
  const [sovereignPurpose, setSovereignPurpose] = useState<string | null>(null);
  const [loggingOut,       setLoggingOut]       = useState(false);
  const [entered,          setEntered]          = useState(false);
  // IMPERIAL JOURNEY CONTINUITY — Package D:
  // Holds the constitutional return message for one beat after the Creator
  // returns from a chamber. Cleared when they choose an interaction mode
  // (at which point their attention has turned forward, not backward).
  const [returnMsg,       setReturnMsg]       = useState<string | null>(null);
  // IMPERIAL REVELATION — Package H:
  // revealMsg: the cycling first-visit companion narrative (fires once per session).
  // hoveredChamber: the chamber card the Creator is currently resting on —
  // drives hover revelation messages from src/chamber-vision/ (philosophyAr).
  const [revealMsg,       setRevealMsg]       = useState<string | null>(null);
  const [hoveredChamber,  setHoveredChamber]  = useState<string | null>(null);

  const foyerRootRef = useRef<HTMLElement | null>(null);
  // Guard: prevents a second chamber from being launched while one is
  // already in the 600ms preparation window.
  const isPreparingRef = useRef(false);
  // Recovery: if navigation doesn't complete within 4 seconds after departure
  // begins (network failure, mobile gesture timeout, etc.), reset the Foyer so
  // the Creator is never permanently trapped on a black screen.
  const recoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visitorPresence = useVisitorPresence();

  useEffect(() => {
    const entryTimer = setTimeout(() => setEntered(true), 560);
    return () => {
      clearTimeout(entryTimer);
      if (recoveryTimerRef.current !== null) clearTimeout(recoveryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    applyVariation(foyerRootRef.current, getArrivalRecord()?.arrivalCount ?? 0);
    setTongue(readTongue());

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

    // IMPERIAL PRESENCE LAYER — Package E:
    // Reveal the Empire's current constitutional state without the Creator
    // opening a single chamber. Only what is already durably recorded.
    fetch('/api/sovereign/presence')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.status === 'succeeded' && data.presence) {
          setPresence(data.presence as SovereignPresence);
        }
      })
      .catch(() => { /* presence is enhancement — silence failures */ });

    // CREATOR IDENTITY PRESENCE — Package G:
    // The Empire knows who this Creator is. Reveal constitutional truth
    // about their identity and declared sovereign purpose.
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { authenticated?: boolean; displayName?: string | null; role?: string } | null) => {
        if (data?.authenticated) {
          setCreatorIdentity({
            displayName: data.displayName ?? null,
            role: (data.role === 'founder' || data.role === 'creator') ? data.role : 'creator',
          });
        }
      })
      .catch(() => { /* identity is enhancement — silence failures */ });

    fetch('/api/sovereign/entry/purpose')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { purpose?: string | null } | null) => {
        if (data?.purpose) setSovereignPurpose(data.purpose);
      })
      .catch(() => { /* purpose is enhancement — silence failures */ });
  }, []);

  // FIRST-VISIT REVELATION — Package H:
  // Fires once when presence loads and reveals a brand-new Creator (all
  // constitutional counts zero, no declared sovereign purpose). Cycles through
  // three declarations that reveal the Empire's nature and constitutional
  // architecture, then settles on the default companion message.
  useEffect(() => {
    if (!presence) return;
    if (returnMsg) return;

    if (getArrivalRecord()?.isReturning) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    FIRST_VISIT_REVELATION.forEach((msg, i) => {
      timers.push(setTimeout(() => setRevealMsg(msg), REVELATION_INTERVAL * i));
    });
    timers.push(
      setTimeout(() => setRevealMsg(null), REVELATION_INTERVAL * FIRST_VISIT_REVELATION.length),
    );

    return () => timers.forEach(clearTimeout);
  }, [presence, sovereignPurpose, returnMsg]);

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
  //   5. window.location.assign to the chamber (hard navigation — avoids RSC/Cloudflare failure)

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
      try {
        sessionStorage.setItem('azma.kernel.session', JSON.stringify(session));
      } catch { /* private/restricted context — skip, chamber receives null session */ }
      setPreparingId(null);
      setPreparingNameAr(null);
      setDeparting(true);

      // Recovery: if navigation doesn't complete within 4 s, un-black the
      // screen so the Creator can retry. Covers mobile gesture-timeout blocks
      // and any other silent navigation failures.
      if (recoveryTimerRef.current !== null) clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = setTimeout(() => {
        setDeparting(false);
        isPreparingRef.current = false;
        recoveryTimerRef.current = null;
      }, 4000);

      setTimeout(() => window.location.assign(route), 420);
    }, 600);
  }, []);

  const isPreparing = preparingId !== null;

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* redirect regardless of network outcome */ }
    window.location.assign('/');
  }, [loggingOut]);

  // Priority order (highest → lowest):
  // 1. Kernel ready message — the Foyer is actively preparing departure
  // 2. Constitutional return message — the Creator just returned from a chamber
  // 3. Presence message — notable constitutional state already in the Empire
  //    (now identity-aware: uses displayName + purpose + named goal/canvas titles)
  // 4. Default tongue message — no journey context active
  const identityCtx = {
    displayName: creatorIdentity?.displayName ?? null,
    purpose:     sovereignPurpose,
  };
  const presenceMsg = presence ? derivePresenceMessage(presence, identityCtx) : null;
  const naturalNextChamber = deriveNaturalNextChamber(presence, sovereignPurpose !== null);
  // Hover revelation: what the Empire declares about a chamber when the Creator rests on it.
  // Lower priority than presenceMsg — the Empire's specific knowledge of the Creator's
  // current journey always outranks a generic chamber identity declaration.
  const hoveredCompanion = hoveredChamber ? getChamberPhilosophyAr(hoveredChamber) : null;
  const companionMsg =
    kernelSession && isPreparing && preparingNameAr
      ? kernelReadyMessage(kernelSession, preparingNameAr)
      : returnMsg ?? presenceMsg ?? hoveredCompanion ?? revealMsg ?? COMPANION_MESSAGES[tongue];

  return (
    <main
      className={`foyer-viewport ${entered ? 'foyer-entered' : ''} ${departing ? 'foyer-departing' : ''}`}
      dir="rtl"
      data-presence={visitorPresence}
      ref={foyerRootRef}
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

      {/* CREATOR IDENTITY PRESENCE — Package G
          The Empire's constitutional mirror of the Creator.
          Surfaces only certified truth: displayName (from /api/auth/me)
          and sovereignPurpose (from /api/sovereign/entry/purpose).
          Never a dashboard. Never analytics. Only who the Creator is
          and what they have declared as their sovereign direction. */}
      {creatorIdentity && (
        <div className="foyer-creator-identity">
          <span className="creator-greeting">
            {creatorIdentity.displayName
              ? `مرحباً، ${creatorIdentity.displayName}`
              : 'مرحباً بالخالق السيادي'
            }
          </span>
          {sovereignPurpose && (
            <span className="creator-purpose">&quot;{sovereignPurpose}&quot;</span>
          )}
          <button
            className="foyer-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut || isPreparing}
            aria-label="تسجيل الخروج من الإمبراطورية"
          >
            {loggingOut ? '…' : 'خروج'}
          </button>
        </div>
      )}

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
        {showInstallBtn && (
          <button
            className="foyer-install-btn"
            onClick={openManually}
            aria-label="تثبيت الإمبراطورية كتطبيق"
            title="تثبيت الإمبراطورية"
          >
            <span className="mode-glyph" aria-hidden="true">⊕</span>
            <span className="mode-name">تثبيت</span>
          </button>
        )}
      </div>

      {/* Sovereign Vault Palace — center of the Empire */}
      <div className="foyer-center">
        <button
          className={`foyer-vault-card ${preparingId === 'sovereign-vault-palace' ? 'vault-preparing' : ''}`}
          onClick={() => launchChamber('sovereign-vault-palace', '/sovereign-vault-palace', 'القصر السيادي')}
          onMouseEnter={() => { if (!isPreparing) setHoveredChamber('sovereign-vault-palace'); }}
          onMouseLeave={() => setHoveredChamber(null)}
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
              <span className="vault-state-empty">تنتظر إبداعاتك</span>
            )}
            {vaultCount !== null && vaultCount > 0 && (
              <span className="vault-state-count">{vaultCount} كنز</span>
            )}
          </div>
        </button>
      </div>

      {/* Constitutional Chamber Cards */}
      <div className="foyer-chambers">
        {CONSTITUTIONAL_CHAMBERS.map((ch) => {
          const chamberPresence = getChamberPresence(ch.id, presence);
          return (
            <button
              key={ch.id}
              className={`foyer-chamber-card foyer-chamber-${ch.id} ${preparingId === ch.id ? 'chamber-preparing' : ''} ${chamberPresence ? 'chamber-has-presence' : ''} ${naturalNextChamber === ch.id ? 'chamber-natural-next' : ''}`}
              onClick={() => launchChamber(ch.id, ch.route, ch.nameAr)}
              onMouseEnter={() => { if (!isPreparing) setHoveredChamber(ch.id); }}
              onMouseLeave={() => setHoveredChamber(null)}
              aria-label={`الدخول إلى ${ch.nameAr}`}
              disabled={isPreparing}
            >
              <span className="chamber-glyph" aria-hidden="true">{ch.glyph}</span>
              <div className="chamber-identity">
                <span className="chamber-name">{ch.nameAr}</span>
                <span className="chamber-role">{ch.roleAr}</span>
                <span className="chamber-action">
                  {ch.id === 'ras-amr'
                    ? (presence?.qiyamah.creationCount ?? 0) > 0
                      ? ch.actionAr
                      : 'اكتشف مساحة التوجيه السيادي'
                    : ch.actionAr}
                </span>
                {chamberPresence && (
                  <span
                    className={`chamber-presence-state ${ch.id === 'makman-al-ghayah' && presence?.makman.hasProcessingProduction ? 'presence-processing' : 'presence-active'}`}
                    aria-live="polite"
                  >
                    {chamberPresence}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
