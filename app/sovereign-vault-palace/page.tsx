/**
 * AZMA OS – Sovereign Vault Palace
 * The Imperial Residence of Every Citizen.
 * Constitutional Architecture V1.0 — 21 Laws.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './sovereign-vault.css';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';

// ── Constitutional Vault Catalogue ────────────────────────────────────────

interface SovereignVaultDef {
  id:          string;
  nameAr:      string;
  descAr:      string;
  icon:        string;
  personality: string;
  accentRgb:   string;
}

const SOVEREIGN_VAULTS: SovereignVaultDef[] = [
  { id: 'investigations', nameAr: 'خزنة التحقيقات',    descAr: 'أدلة ونتائج المحاكم المعرفية',         icon: '⚖',  personality: 'crimson', accentRgb: '180,40,40'  },
  { id: 'creative',       nameAr: 'خزنة الإبداع',       descAr: 'المنتجات الإبداعية والأعمال الفنية',    icon: '✦',  personality: 'violet',  accentRgb: '120,40,200' },
  { id: 'characters',     nameAr: 'خزنة الشخصيات',     descAr: 'هويات الذكاء الاصطناعي والشخصيات',     icon: '◈',  personality: 'indigo',  accentRgb: '40,80,220'  },
  { id: 'audiovisual',    nameAr: 'خزنة الصوت والصورة', descAr: 'اللقطات والأصوات السيادية المنجزة',   icon: '◎',  personality: 'teal',    accentRgb: '20,140,140' },
  { id: 'documents',      nameAr: 'خزنة الوثائق',       descAr: 'السجلات والوثائق المكتوبة',            icon: '⬡',  personality: 'forest',  accentRgb: '30,100,50'  },
  { id: 'brands',         nameAr: 'خزنة العلامات',      descAr: 'الأختام والهويات التجارية',            icon: '◆',  personality: 'amber',   accentRgb: '180,130,20' },
  { id: 'prompts',        nameAr: 'خزنة البرومبتات',    descAr: 'أكواد النوايا والطلبات المحكمة',        icon: '⌘',  personality: 'pulse',   accentRgb: '100,20,180' },
  { id: 'memories',       nameAr: 'خزنة الذكريات',      descAr: 'اللحظات والمعالم الإمبراطورية',         icon: '◇',  personality: 'memory',  accentRgb: '200,160,50' },
  { id: 'projects',       nameAr: 'خزنة المشاريع',      descAr: 'المبادرات النشطة والمواد الجارية',      icon: '⬟',  personality: 'slate',   accentRgb: '40,60,140'  },
  { id: 'archive',        nameAr: 'الأرشيف الملكي',     descAr: 'الأعمال المكتملة والسجلات المحكمة',    icon: '⊛',  personality: 'stone',   accentRgb: '80,70,60'   },
];

// ── Treasure Model ────────────────────────────────────────────────────────

interface JourneyStep { actionAr: string; chamberAr: string; at: number }

interface SovereignTreasure {
  id:      string;
  titleAr: string;
  vaultId: string;
  origin:  string;
  preview: string;
  status:  'living' | 'sealed' | 'archived';
  addedAt: number;
  journey: JourneyStep[];
}

// ── Palace Storage ────────────────────────────────────────────────────────

function readPalace(): Record<string, SovereignTreasure[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('azma.palace.treasures');
    return raw ? (JSON.parse(raw) as Record<string, SovereignTreasure[]>) : {};
  } catch { return {}; }
}

function writePalace(data: Record<string, SovereignTreasure[]>) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('azma.palace.treasures', JSON.stringify(data)); } catch { /* ignore */ }
}

function depositToVault(treasure: SovereignTreasure) {
  const data = readPalace();
  const existing = data[treasure.vaultId] ?? [];
  data[treasure.vaultId] = [treasure, ...existing.filter((t) => t.id !== treasure.id)];
  writePalace(data);
}

// ── Incoming Transfer Check ───────────────────────────────────────────────

function popIncomingTransfer(): SovereignTreasure | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('azma.transfer.investigation');
    if (!raw) return null;
    sessionStorage.removeItem('azma.transfer.investigation');
    const d = JSON.parse(raw) as { query?: string; evidenceCount?: number; averageScore?: number; timestamp?: number };
    if (!d.query) return null;
    return {
      id:      `inv-${Date.now()}`,
      titleAr: d.query.slice(0, 80),
      vaultId: 'investigations',
      origin:  'المحكمة الإمبراطورية للمعرفة',
      preview: `${d.evidenceCount ?? 0} أدلة · ثقة ${Math.round((d.averageScore ?? 0) * 100)}%`,
      status:  'living',
      addedAt: Date.now(),
      journey: [
        { actionAr: 'تحقيق في المحكمة المعرفية', chamberAr: 'حجة الدامغة', at: d.timestamp ?? Date.now() },
        { actionAr: 'إيداع في القصر السيادي',    chamberAr: 'القصر السيادي', at: Date.now() },
      ],
    };
  } catch { return null; }
}

// ── Companion Messages ────────────────────────────────────────────────────

const PALACE_COMPANION = {
  gate:      'قصرك ينتظرك. أثبت ملكيتك للدخول.',
  opening:   'البوابة تفتح. أهلاً بعودتك.',
  atrium:    'هذا مكانك. كل ما يقيم هنا هو ملكك.',
  vaultOpen: (name: string) => `${name} مفتوحة — كنوزك في انتظارك.`,
  treasure:  'هذا الكنز أكمل رحلته إلى هنا.',
  ceremony:  'كنز جديد يصل إلى قصرك.',
  departure: 'رحلتك تستمر. القصر يبقى في انتظارك.',
  empty:     'الخزنة هادئة. أرسل إليها أول كنز.',
} as const;

// ── Phase + Auth ──────────────────────────────────────────────────────────

type PalacePhase = 'gate' | 'opening' | 'palace' | 'ceremony' | 'sealing';
type AuthMethod  = 'pin' | 'face' | 'bio';

// ── Main Component ────────────────────────────────────────────────────────

export default function SovereignVaultPalace() {
  const router = useRouter();

  // Auth
  const [phase, setPhase]                       = useState<PalacePhase>('gate');
  const [authMethod, setAuthMethod]             = useState<AuthMethod>('pin');
  const [pin, setPin]                           = useState('');
  const [pinShake, setPinShake]                 = useState(false);

  // Palace state
  const [treasures, setTreasures]               = useState<Record<string, SovereignTreasure[]>>({});
  const [activeVault, setActiveVault]           = useState<string | null>(null);
  const [selectedTreasure, setSelectedTreasure] = useState<SovereignTreasure | null>(null);
  const [incomingTreasure, setIncomingTreasure] = useState<SovereignTreasure | null>(null);

  // Companion — lazy initializer avoids setState-in-effect
  const [companionMsg, setCompanionMsg]    = useState<string>(() => PALACE_COMPANION.gate);
  const [companionVisible]                 = useState(true);

  // Camera ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Camera for Face Auth ─────────────────────────────────────────────────

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (authMethod !== 'face' || phase !== 'gate') return;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => { /* camera denied — graceful no-op */ });

    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [authMethod, phase]);

  // ── Auth ─────────────────────────────────────────────────────────────────

  const enterPalace = useCallback(() => {
    setPhase('opening');
    setCompanionMsg(PALACE_COMPANION.opening);

    setTimeout(() => {
      // Load treasures from palace storage
      const stored  = readPalace();
      const incoming = popIncomingTransfer();

      setTreasures(stored);
      setPhase('palace');
      setCompanionMsg(PALACE_COMPANION.atrium);

      if (incoming) {
        setIncomingTreasure(incoming);
        setTimeout(() => {
          setPhase('ceremony');
          setCompanionMsg(PALACE_COMPANION.ceremony);
        }, 600);
      }
    }, 900);
  }, []);

  function handlePinDigit(digit: string) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => enterPalace(), 180);
    }
  }

  function handlePinClear() { setPin(''); setPinShake(false); }

  async function handleBiometric() {
    try {
      await new Promise<void>((res) => setTimeout(res, 1_200));
      enterPalace();
    } catch { /* denied */ }
  }

  // ── Deposit Ceremony ──────────────────────────────────────────────────────

  function completeCeremony() {
    if (!incomingTreasure) { setPhase('palace'); return; }
    depositToVault(incomingTreasure);
    const fresh = readPalace();
    setTreasures(fresh);
    setIncomingTreasure(null);
    setPhase('palace');
    setCompanionMsg(PALACE_COMPANION.atrium);
    setActiveVault(incomingTreasure.vaultId);
  }

  // ── Vault Navigation ──────────────────────────────────────────────────────

  function openVault(vaultId: string) {
    const vault = SOVEREIGN_VAULTS.find((v) => v.id === vaultId);
    setActiveVault(vaultId);
    setSelectedTreasure(null);
    if (vault) setCompanionMsg(PALACE_COMPANION.vaultOpen(vault.nameAr));
  }

  function closeVault() {
    setActiveVault(null);
    setSelectedTreasure(null);
    setCompanionMsg(PALACE_COMPANION.atrium);
  }

  function selectTreasure(t: SovereignTreasure) {
    setSelectedTreasure(t);
    setCompanionMsg(PALACE_COMPANION.treasure);
  }

  // ── Transfer (Cinematic Exit) ─────────────────────────────────────────────

  function handleTransfer(destination: string) {
    setCompanionMsg(PALACE_COMPANION.departure);
    setPhase('sealing');
    setTimeout(() => router.push(destination), 720);
  }

  // ── Actions on Treasure ───────────────────────────────────────────────────

  function sealTreasure(id: string) {
    const data = readPalace();
    for (const vaultId of Object.keys(data)) {
      data[vaultId] = (data[vaultId] ?? []).map((t) =>
        t.id === id ? { ...t, status: 'sealed' as const } : t,
      );
    }
    writePalace(data);
    setTreasures(readPalace());
    setSelectedTreasure(null);
  }

  function archiveTreasure(id: string) {
    const data = readPalace();
    for (const vaultId of Object.keys(data)) {
      data[vaultId] = (data[vaultId] ?? []).map((t) =>
        t.id === id ? { ...t, status: 'archived' as const } : t,
      );
    }
    writePalace(data);
    setTreasures(readPalace());
    setSelectedTreasure(null);
  }

  function disposeTreasure(id: string) {
    const data = readPalace();
    for (const vaultId of Object.keys(data)) {
      data[vaultId] = (data[vaultId] ?? []).filter((t) => t.id !== id);
    }
    writePalace(data);
    setTreasures(readPalace());
    setSelectedTreasure(null);
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeVaultDef = SOVEREIGN_VAULTS.find((v) => v.id === activeVault);
  const activeVaultTreasures = activeVault ? (treasures[activeVault] ?? []) : [];
  const totalTreasures = Object.values(treasures).reduce((n, arr) => n + arr.length, 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main
      className={`palace-viewport ${phase === 'sealing' ? 'palace-sealing' : ''}`}
      dir="rtl"
    >
      {/* Atmospheric background */}
      <div className="palace-ambient" aria-hidden="true">
        <div className="palace-grid" />
        <div className="palace-depth-glow" />
        <div className="palace-secondary-glow" />
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* THE GATE — Authentication              */}
      {/* ═══════════════════════════════════════ */}
      {phase === 'gate' && (
        <div className="palace-gate">
          <div className="gate-seal" aria-hidden="true">⬡</div>
          <h1 className="gate-title">القصر السيادي</h1>
          <p className="gate-subtitle">أثبت ملكيتك للدخول إلى مكانك</p>

          {/* Auth method selector */}
          <div className="gate-methods" role="group" aria-label="طريقة الدخول">
            {(['pin', 'face', 'bio'] as AuthMethod[]).map((m) => (
              <button
                key={m}
                className={`gate-method-btn ${authMethod === m ? 'method-active' : ''}`}
                onClick={() => { setAuthMethod(m); setPin(''); }}
              >
                {m === 'pin' ? 'PIN' : m === 'face' ? 'بصمة الوجه' : 'البصمة'}
              </button>
            ))}
          </div>

          {/* PIN Interface */}
          {authMethod === 'pin' && (
            <div className={`gate-pin-zone ${pinShake ? 'pin-shake' : ''}`}>
              <div className="pin-seal-display" aria-label={`${pin.length} أرقام مُدخلة من 4`}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`pin-jewel ${i < pin.length ? 'jewel-filled' : ''}`} />
                ))}
              </div>
              <div className="pin-keypad" role="group" aria-label="لوحة المفاتيح">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button key={n} className="pin-key" onClick={() => handlePinDigit(String(n))}>
                    {n}
                  </button>
                ))}
                <button className="pin-key pin-key-clear" onClick={handlePinClear}>✕</button>
                <button className="pin-key" onClick={() => handlePinDigit('0')}>0</button>
                <button className="pin-key pin-key-enter" onClick={() => pin.length >= 4 && enterPalace()} disabled={pin.length < 4}>↵</button>
              </div>
            </div>
          )}

          {/* Face Interface */}
          {authMethod === 'face' && (
            <div className="gate-biometric-zone">
              <div className="biometric-frame face-frame">
                <video ref={videoRef} autoPlay playsInline muted className="face-feed" />
                <div className="biometric-overlay" />
                <div className="biometric-scan-line" />
              </div>
              <p className="biometric-label">مسح بصمة الوجه السيادية…</p>
              <button className="gate-bypass-btn" onClick={enterPalace}>تخطّ التحقق</button>
            </div>
          )}

          {/* Biometric Interface */}
          {authMethod === 'bio' && (
            <div className="gate-biometric-zone">
              <div
                className="biometric-frame bio-frame"
                role="button"
                tabIndex={0}
                onClick={handleBiometric}
                onKeyDown={(e) => e.key === 'Enter' && handleBiometric()}
                aria-label="انقر لتفعيل مستشعر البصمة"
              >
                <div className="biometric-scan-line" />
                <span className="bio-glyph" aria-hidden="true">◯</span>
              </div>
              <p className="biometric-label">انقر للاتصال بمستشعر البصمة</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* OPENING CEREMONY                        */}
      {/* ═══════════════════════════════════════ */}
      {phase === 'opening' && (
        <div className="palace-opening" aria-live="polite">
          <div className="opening-door door-left"  aria-hidden="true" />
          <div className="opening-door door-right" aria-hidden="true" />
          <div className="opening-center">
            <div className="opening-seal" aria-hidden="true">⬡</div>
            <p className="opening-label">البوابة تفتح…</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* DEPOSIT CEREMONY                        */}
      {/* ═══════════════════════════════════════ */}
      {phase === 'ceremony' && incomingTreasure && (
        <div className="ceremony-overlay" aria-live="assertive">
          <div className="ceremony-interior">
            <div className="ceremony-arrival">
              <span className="ceremony-glyph" aria-hidden="true">⚖</span>
              <h2 className="ceremony-origin">{incomingTreasure.origin}</h2>
              <p className="ceremony-subtitle">كنز جديد يصل إلى القصر</p>
            </div>
            <div className="ceremony-treasure">
              <div className="ceremony-treasure-title">{incomingTreasure.titleAr}</div>
              <div className="ceremony-treasure-preview">{incomingTreasure.preview}</div>
            </div>
            <div className="ceremony-path">
              <span className="ceremony-origin-tag">{incomingTreasure.origin}</span>
              <div className="ceremony-path-line" aria-hidden="true" />
              <span className="ceremony-vault-tag">
                {SOVEREIGN_VAULTS.find((v) => v.id === incomingTreasure.vaultId)?.nameAr}
              </span>
            </div>
            <button className="ceremony-receive-btn" onClick={completeCeremony}>
              استقبال الكنز
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* THE PALACE INTERIOR                     */}
      {/* ═══════════════════════════════════════ */}
      {(phase === 'palace' || phase === 'sealing') && (
        <div className="palace-interior">

          {/* Crown Bar */}
          <div className="palace-crown">
            <LivingCompanion message={companionMsg} visible={companionVisible} />
            <div className="palace-crown-identity">
              <span className="palace-crown-seal" aria-hidden="true">⬡</span>
              <span className="palace-crown-name">القصر السيادي</span>
              {totalTreasures > 0 && (
                <span className="palace-crown-count">{totalTreasures} كنز</span>
              )}
            </div>
            <div className="palace-crown-nav">
              <button className="palace-exit-btn" onClick={() => handleTransfer('/ras-amr')}>
                ⮜ الخروج
              </button>
            </div>
          </div>

          {/* Palace Body */}
          <div className="palace-body">

            {/* Vault Corridor — left colonnade */}
            <aside className="vault-corridor">
              <div className="corridor-header">
                <span className="corridor-label">SOVEREIGN VAULTS</span>
                <span className="corridor-sublabel">الخزائن السيادية</span>
              </div>
              <div className="corridor-portals custom-scroll">
                {SOVEREIGN_VAULTS.map((vault) => {
                  const count = (treasures[vault.id] ?? []).length;
                  const hasLiving = (treasures[vault.id] ?? []).some((t) => t.status === 'living');
                  return (
                    <button
                      key={vault.id}
                      className={`vault-portal vault-${vault.personality} ${activeVault === vault.id ? 'portal-active' : ''}`}
                      style={{ '--vault-rgb': vault.accentRgb } as React.CSSProperties}
                      onClick={() => openVault(vault.id)}
                      aria-pressed={activeVault === vault.id}
                    >
                      <span className="portal-icon" aria-hidden="true">{vault.icon}</span>
                      <div className="portal-labels">
                        <span className="portal-name">{vault.nameAr}</span>
                        <span className="portal-desc">{vault.descAr}</span>
                      </div>
                      <div className="portal-status">
                        {count > 0 && <span className="portal-count">{count}</span>}
                        {hasLiving && <span className="portal-living-dot" aria-label="يحتوي كنوزاً حيّة" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main Palace Space */}
            <section className="palace-main">

              {/* Grand Atrium — when no vault is selected */}
              {!activeVault && (
                <div className="grand-atrium">
                  <div className="atrium-orb" aria-hidden="true">
                    <div className="orb-inner" />
                    <div className="orb-ring" />
                  </div>
                  <div className="atrium-greeting">
                    <h1 className="atrium-title">أهلاً بعودتك</h1>
                    <p className="atrium-subtitle">
                      {totalTreasures > 0
                        ? `قصرك يضمّ ${totalTreasures} كنز سيادي`
                        : 'قصرك ينتظر أول كنز يُودَع فيه'
                      }
                    </p>
                  </div>

                  {/* Recent Arrivals */}
                  {totalTreasures > 0 && (
                    <div className="atrium-recent">
                      <div className="atrium-section-label">آخر الواصلين</div>
                      <div className="atrium-recent-list">
                        {Object.values(treasures)
                          .flat()
                          .sort((a, b) => b.addedAt - a.addedAt)
                          .slice(0, 4)
                          .map((t) => {
                            const vDef = SOVEREIGN_VAULTS.find((v) => v.id === t.vaultId);
                            return (
                              <button
                                key={t.id}
                                className="recent-arrival-item"
                                style={{ '--vault-rgb': vDef?.accentRgb ?? '180,130,20' } as React.CSSProperties}
                                onClick={() => { openVault(t.vaultId); selectTreasure(t); }}
                              >
                                <span className="recent-icon" aria-hidden="true">{vDef?.icon}</span>
                                <div className="recent-meta">
                                  <span className="recent-title">{t.titleAr}</span>
                                  <span className="recent-origin">{t.origin}</span>
                                </div>
                                <span className={`recent-status status-${t.status}`}>
                                  {t.status === 'living' ? 'حيّ' : t.status === 'sealed' ? 'محكم' : 'مؤرشف'}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Transfer destinations */}
                  <div className="atrium-dispatch">
                    <div className="atrium-section-label">المحاكم المتصلة</div>
                    <div className="atrium-dispatch-row">
                      <button className="atrium-route-btn route-hujjah"   onClick={() => handleTransfer('/hujjah-al-damighah')}>حجة الدامغة</button>
                      <button className="atrium-route-btn route-qiyamah"  onClick={() => handleTransfer('/qiyamah-chamber')}>القيامة</button>
                      <button className="atrium-route-btn route-rasamr"   onClick={() => handleTransfer('/ras-amr')}>رأس الأمر</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Vault Interior — when a vault is active */}
              {activeVault && activeVaultDef && (
                <div
                  className={`vault-interior vault-interior-${activeVaultDef.personality}`}
                  style={{ '--vault-rgb': activeVaultDef.accentRgb } as React.CSSProperties}
                >
                  <div className="vault-interior-header">
                    <div className="vault-interior-identity">
                      <span className="vault-interior-icon" aria-hidden="true">{activeVaultDef.icon}</span>
                      <div>
                        <h2 className="vault-interior-name">{activeVaultDef.nameAr}</h2>
                        <span className="vault-interior-desc">{activeVaultDef.descAr}</span>
                      </div>
                    </div>
                    <button className="vault-close-btn" onClick={closeVault}>✕ إغلاق</button>
                  </div>

                  <div className="vault-interior-body">
                    {/* Treasury list */}
                    <div className="treasury-list custom-scroll">
                      {activeVaultTreasures.length === 0 ? (
                        <div className="treasury-empty">
                          <span className="treasury-empty-icon" aria-hidden="true">{activeVaultDef.icon}</span>
                          <p className="treasury-empty-label">{PALACE_COMPANION.empty}</p>
                          <p className="treasury-empty-sub">{activeVaultDef.descAr}</p>
                        </div>
                      ) : (
                        activeVaultTreasures.map((t, idx) => (
                          <button
                            key={t.id}
                            className={`treasury-record ${selectedTreasure?.id === t.id ? 'record-selected' : ''}`}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            onClick={() => selectTreasure(t)}
                          >
                            <div className="record-main">
                              <span className="record-title">{t.titleAr}</span>
                              <span className="record-preview">{t.preview}</span>
                            </div>
                            <div className="record-meta">
                              <span className="record-origin">{t.origin}</span>
                              <span className={`record-status status-${t.status}`}>
                                {t.status === 'living' ? '● حيّ' : t.status === 'sealed' ? '◉ محكم' : '○ مؤرشف'}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Treasure Detail Panel */}
                    {selectedTreasure && (
                      <div className="treasure-detail">
                        <div className="detail-header">
                          <span className="detail-label">الكنز السيادي</span>
                          <button className="detail-close" onClick={() => setSelectedTreasure(null)}>✕</button>
                        </div>

                        <div className="detail-title">{selectedTreasure.titleAr}</div>
                        {selectedTreasure.preview && (
                          <div className="detail-preview">{selectedTreasure.preview}</div>
                        )}

                        {/* Journey Timeline */}
                        <div className="detail-section-label">رحلة الكنز</div>
                        <div className="detail-journey">
                          {selectedTreasure.journey.map((step, i) => (
                            <div key={i} className="journey-step">
                              <span className="journey-dot" aria-hidden="true" />
                              <div className="journey-step-body">
                                <span className="journey-action">{step.actionAr}</span>
                                <span className="journey-chamber">{step.chamberAr}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="detail-section-label">إجراءات الكنز</div>
                        <div className="detail-actions">
                          <button className="detail-action action-continue"
                            onClick={() => handleTransfer('/hujjah-al-damighah')}>
                            متابعة التحقيق
                          </button>
                          <button className="detail-action action-creative"
                            onClick={() => handleTransfer('/qiyamah-chamber')}>
                            إرسال إلى القيامة
                          </button>
                          <button className="detail-action action-seal"
                            onClick={() => sealTreasure(selectedTreasure.id)}>
                            إحكام الكنز
                          </button>
                          <button className="detail-action action-archive"
                            onClick={() => archiveTreasure(selectedTreasure.id)}>
                            أرشفة ملكية
                          </button>
                          <button className="detail-action action-dispose"
                            onClick={() => disposeTreasure(selectedTreasure.id)}>
                            إتلاف دائم
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
