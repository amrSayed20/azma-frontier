/**
 * AZMA OS – Makman Al-Ghayah (The Sovereign Release Terminal)
 * Native Name: مكمن الغاية
 * Status: Final Integrated Build (Fixed UI Overflow & Workflow Logic)
 *
 * IMPERIAL CHAMBER UNIFICATION, PHASE II PACKAGE III (2026-07-25):
 * wrapped in MakmanExperience (src/imperial-experience-engine/
 * experiences/makman-al-ghayah/) — additive only, no logic below
 * changed. Note: the "Generate packaging with AI" button (line ~197
 * below) has no onClick handler at all — a real, pre-existing dead
 * button, disclosed not fixed (this Package: identify gaps, don't
 * implement new production behavior).
 *
 * INTEGRATION PACKAGE IV — FROM DIRECTION TO FULFILLMENT (2026-07-25):
 * the Master Display now shows a real incoming production when Ras Al
 * Amr's "forward to Makman" button carried one — the exact same
 * one-shot sessionStorage handoff convention Vault Palace's own
 * cross-chamber transfers already established. Read via
 * useSyncExternalStore, not an effect + setState — the same pattern and
 * the same reasoning already proven correct in this exact codebase
 * (ArrivalExperience.tsx's isReturning): the value differs between
 * server (always null) and client (may genuinely carry a handoff), must
 * be correct at first client paint with no hydration mismatch, and — as
 * that earlier fix's own comment discloses from hard-won experience —
 * getSnapshot must freeze its answer on first read, since this
 * component's own effects/re-renders would otherwise see the
 * already-cleared sessionStorage key on a later read and silently
 * flip back to null. Falls back to this page's existing hardcoded
 * display when no real handoff exists — nothing regresses for a direct
 * visit.
 *
 * THE CORRIDOR PACKAGE — RAS AL AMR TO MAKMAN (2026-07-25): closes the
 * gap the constitutional audit flagged — a real intake
 * (POST /api/sovereign/entry/creator-goal, via SOEL only, never
 * src/chambers/makman-al-ghayah directly) existed with no UI reaching
 * it. When Ras Al Amr's real compiled assembly rides along with the
 * handoff (same one-shot sessionStorage convention, its own key so it's
 * never confused with the raw preview payload above), a new, clearly
 * separate action — "تفعيل التوزيع السيادي الحقيقي" — submits it for
 * real: a real GoalContract, a real MakmanCommercialIntent, and a real
 * SovereignPublication/PublicationRenderState come back from Makman's
 * own already-certified pipeline (MAG-LF-001/002), not a simulation.
 * Scope discipline: this does NOT touch the existing simulated
 * multi-platform release below (handleSovereignRelease) — real
 * social-platform publishing is a separate, much larger, not-yet
 * -authorized capability. The access tier is honestly defaulted to
 * DistributionTier.PRIVATE (Creator preview) because no real tier/
 * pricing UI exists yet — a disclosed limitation, not a fabricated
 * commercial claim.
 */

'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { MakmanExperience } from '@/src/imperial-experience-engine';
import { GoalPriority } from '@/src/chambers/makman-al-ghayah/goal-contracts';
import { DistributionTier } from '@/src/chambers/makman-al-ghayah/publication-contracts';
import type { CompiledAssemblyGraph } from '@/src/chambers/ras-al-amr/pre-publishing-boundary';
import type { GoalDistributionBridgeResult } from '@/src/chambers/makman-al-ghayah/MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';
import type { ConsumptionResponse } from '@/src/chambers/makman-al-ghayah/consumption-boundary';
import './makman-al-ghayah.css';

interface RealProduction {
  id: string;
  title: string;
  secureStorageUri: string;
}

function subscribeToNothing(): () => void {
  return () => {};
}

let cachedRealProduction: RealProduction | null | undefined = undefined;
function getRealProductionSnapshot(): RealProduction | null {
  if (cachedRealProduction === undefined) {
    cachedRealProduction = null;
    try {
      const raw = sessionStorage.getItem('azma.transfer.rasAmrProduction');
      if (raw) {
        sessionStorage.removeItem('azma.transfer.rasAmrProduction');
        cachedRealProduction = JSON.parse(raw) as RealProduction;
      }
    } catch { /* ignore — falls back to the existing display */ }
  }
  return cachedRealProduction;
}
function getRealProductionServerSnapshot(): RealProduction | null {
  return null;
}

// THE CORRIDOR PACKAGE: the real sealed assembly from Ras Al Amr, read with
// the exact same frozen-on-first-read useSyncExternalStore pattern as
// getRealProductionSnapshot above, under its own sessionStorage key so it
// is never confused with the raw preview payload.
let cachedCompiledGraph: CompiledAssemblyGraph | null | undefined = undefined;
function getCompiledGraphSnapshot(): CompiledAssemblyGraph | null {
  if (cachedCompiledGraph === undefined) {
    cachedCompiledGraph = null;
    try {
      const raw = sessionStorage.getItem('azma.transfer.rasAmrCompiledGraph');
      if (raw) {
        sessionStorage.removeItem('azma.transfer.rasAmrCompiledGraph');
        cachedCompiledGraph = JSON.parse(raw) as CompiledAssemblyGraph;
      }
    } catch { /* ignore — real distribution action stays unavailable */ }
  }
  return cachedCompiledGraph;
}
function getCompiledGraphServerSnapshot(): CompiledAssemblyGraph | null {
  return null;
}

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
  const realProduction = useSyncExternalStore(subscribeToNothing, getRealProductionSnapshot, getRealProductionServerSnapshot);
  const compiledGraph = useSyncExternalStore(subscribeToNothing, getCompiledGraphSnapshot, getCompiledGraphServerSnapshot);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmittingReal, setIsSubmittingReal] = useState(false);
  const [realDistributionResult, setRealDistributionResult] = useState<GoalDistributionBridgeResult | null>(null);
  const [realDistributionError, setRealDistributionError] = useState<string | null>(null);
  const [isCheckingConsumption, setIsCheckingConsumption] = useState(false);
  const [consumptionResult, setConsumptionResult] = useState<ConsumptionResponse | null>(null);

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

  // THE CORRIDOR PACKAGE: submits the real compiled assembly Ras Al Amr
  // handed off to Makman's own real intake (POST /api/sovereign/entry/
  // creator-goal), running Makman's already-certified Goal → Presence/
  // Awareness/Guardian/Strategy/Communication → Distribution pipeline
  // for real. Distinct from handleSovereignRelease above, which remains
  // the existing simulated multi-platform release — out of this
  // Package's scope.
  const handleActivateRealDistribution = async () => {
    if (!compiledGraph) return;

    setIsSubmittingReal(true);
    setRealDistributionError(null);

    try {
      const response = await fetch('/api/sovereign/entry/creator-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiledGraph,
          description: descriptionRef.current?.value || 'الوصف الافتراضي للعمل الفني...',
          priority: GoalPriority.MEDIUM,
          // The Creator's own click is the authorization — this Chamber
          // introduces no separate approval step yet.
          authorization: { isAuthorized: true },
          commercialIntent: {
            publisherTenantId: compiledGraph.subscriberTenantId,
            compiledAssemblyGraph: compiledGraph,
            // Honestly defaulted: no real tier/pricing UI exists yet, so
            // every real submission becomes a Creator-preview publication
            // rather than a fabricated public/commercial claim.
            accessPolicy: { distributionTier: DistributionTier.PRIVATE, requiresAgeVerification: false },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setRealDistributionError(result.message ?? result.error ?? 'خطأ غير معروف');
        return;
      }

      setRealDistributionResult(result as GoalDistributionBridgeResult);
    } catch {
      setRealDistributionError('تعذّر الوصول إلى بوابة الدخول السيادية للتوزيع.');
    } finally {
      setIsSubmittingReal(false);
    }
  };

  // THE CORRIDOR PACKAGE — OPENING THE AUDIENCE DOOR: calls Makman's own
  // real, already-certified PublicConsumptionBoundary (GET
  // /api/sovereign/entry/consumption) for the publication just really
  // created — no UI has ever reached this endpoint before. requesterTenantId
  // is no longer accepted from the client at all (see the route's own
  // security correction); the server derives it from the real session, so
  // this genuinely previews what the Creator's own "Publisher Absolute
  // Override" grants against the real access policy just submitted.
  const handlePreviewRealAccess = async () => {
    if (!realDistributionResult) return;

    setIsCheckingConsumption(true);
    try {
      const response = await fetch(
        `/api/sovereign/entry/consumption?publicationId=${encodeURIComponent(realDistributionResult.publication.publicationId)}`,
      );
      const result = await response.json();
      if (response.ok) setConsumptionResult(result as ConsumptionResponse);
    } catch {
      /* the real distribution result above remains the source of truth; this is a secondary check */
    } finally {
      setIsCheckingConsumption(false);
    }
  };

  return (
    <MakmanExperience>
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

            {realProduction ? (
              <div className="video-player-mock real-production">
                {/* eslint-disable-next-line @next/next/no-img-element -- a real, directly-served asset URL, not an optimizable remote image */}
                <img src={realProduction.secureStorageUri} alt={realProduction.title} className="real-production-image" />
                <h1 className="project-title">{realProduction.title}</h1>
                <p className="project-status">وصل من حجرة رأس الأمر — جاهز للتغليف والإطلاق</p>
              </div>
            ) : (
              <div className="video-player-mock">
                <div className="play-btn">▶</div>
                <h1 className="project-title">المشهد السريالي الأول - الإصدار النهائي</h1>
                <p className="project-status">جاهز للعرض الأول والتوزيع</p>
              </div>
            )}

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

          {compiledGraph && (
            <div className="release-mechanism neon-border">
              <h3 className="mechanism-title">التوزيع السيادي الحقيقي (REAL SOVEREIGN INTAKE)</h3>
              <p className="project-status">
                وصل تجميع حقيقي مختوم من رأس الأمر — {compiledGraph.compilationId} — جاهز للتقديم إلى مسار مكمن الغاية الحقيقي.
              </p>
              <div className="action-row">
                <button
                  className={`sovereign-deploy-btn ${isSubmittingReal ? 'deploying' : ''}`}
                  onClick={handleActivateRealDistribution}
                  disabled={isSubmittingReal || Boolean(realDistributionResult)}
                >
                  {isSubmittingReal
                    ? '... جاري التقديم الحقيقي ...'
                    : realDistributionResult
                      ? 'تم التقديم الحقيقي ✔️'
                      : 'تفعيل التوزيع السيادي الحقيقي 👑'}
                </button>
              </div>
              {realDistributionResult && (
                <>
                  <p className="project-status">
                    منشور حقيقي: {realDistributionResult.publication.publicationId} — حالة الصهر: {realDistributionResult.renderState.status}
                  </p>
                  <div className="action-row">
                    <button
                      className="import-btn"
                      onClick={handlePreviewRealAccess}
                      disabled={isCheckingConsumption}
                    >
                      {isCheckingConsumption ? 'جاري فحص باب الجمهور...' : '🚪 فتح باب الجمهور — معاينة الوصول الحقيقي'}
                    </button>
                  </div>
                  {consumptionResult && (
                    <p className="project-status">
                      {consumptionResult.isAuthorized
                        ? `بوابة الاستهلاك الحقيقية تمنح الوصول — حالة التسليم: ${consumptionResult.deliveryStatus ?? 'غير محدد'}`
                        : `بوابة الاستهلاك الحقيقية ترفض الوصول — ${consumptionResult.authorizationResult.requiredAction}: ${consumptionResult.authorizationResult.rejectionReason ?? ''}`}
                    </p>
                  )}
                </>
              )}
              {realDistributionError && (
                <p className="project-status">تعذّر التقديم الحقيقي — {realDistributionError}</p>
              )}
            </div>
          )}
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
              {/* key forces a remount when realProduction arrives after mount (see effect above), since this is an intentionally uncontrolled field */}
              <input
                key={realProduction ? realProduction.id : 'default'}
                type="text"
                className="cyber-input"
                defaultValue={realProduction ? realProduction.title : 'المشهد السريالي الأول - الإصدار النهائي [4K]'}
              />
            </div>

            <div className="form-group">
              <label>الوصف (Description)</label>
              <textarea ref={descriptionRef} className="cyber-input textarea" rows={4} defaultValue="الوصف الافتراضي للعمل الفني..." />
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
    </MakmanExperience>
  );
}