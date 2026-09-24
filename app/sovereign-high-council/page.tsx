/**
 * AZMA OS - Sovereign High Council UI
 * Main Page Layout
 *
 * Imperial futuristic design with cinematic depth, 
 * living light, and intelligent motion.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ConstitutionalLink } from '@/src/constitutional-navigation';
import type {
  HallRuntimeInsight,
  RuntimeHealthIndicatorView,
  SovereignHighCouncilRuntimeView,
} from '@/src/system-root/founder-experience/sovereign-high-council-runtime-gateway';

interface CommandHallCard {
  readonly hallId: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
}

/**
 * The Empire's own words for its own condition.
 *
 * MEASURED by walking in as a visitor 2026-09-24: the first screen a Founder
 * saw after signing in read «The Sovereign High Council — degraded —
 * Exclusive supervisory interface for platform ownership and governance»,
 * and thirteen halls named in English beneath it. The Council supervises the
 * Empire; it is not outside it, and «no foreign text to the Creator» does not
 * stop at its door.
 *
 * Identifiers are not prose: a path id, a version string and Al-Wateen's own
 * name stay as they are, because they name things rather than speak to anyone.
 */
/**
 * Machine words the Council printed raw: «escalate», «partial», «low»,
 * «awaiting-founder-approval». They are states, not sentences, and a state
 * shown in the machine's own spelling is not a report to a Founder.
 */
const MACHINE_WORD_AR: Record<string, string> = {
  escalate: 'تصعيد', proceed: 'مضيّ', hold: 'إيقاف', reject: 'رفض',
  compliant: 'ممتثل', 'non-compliant': 'غير ممتثل', partial: 'جزئيّ',
  low: 'منخفض', medium: 'متوسّط', high: 'عالٍ', critical: 'حرج',
  'awaiting-founder-approval': 'بانتظار موافقة المؤسس',
  acceptable: 'مقبول', unacceptable: 'غير مقبول', favourable: 'مُواتٍ',
  'action-evaluated': 'إجراءٌ مُقيَّم', event: 'حدث',
  approved: 'مُعتمَد', pending: 'معلّق', unavailable: 'غير متاح',
  yes: 'نعم', no: 'لا', healthy: 'سليم', degraded: 'مُنهَك',
};

/** A value the Council prints: in the Empire's words when it knows them. */
function spoken(value: unknown): string {
  if (value === null || value === undefined) return '—';
  const text = String(value);
  return MACHINE_WORD_AR[text] ?? text;
}

const SYSTEM_STATUS_AR: Record<string, string> = {
  healthy:  'سليمة',
  degraded: 'مُنهَكة',
  critical: 'حرجة',
};

export default function SovereignHighCouncilPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<CommandHallCard | null>(null);
  const [founderId, setFounderId] = useState('founder-imperial');
  const [runtimeView, setRuntimeView] = useState<SovereignHighCouncilRuntimeView | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    // Verify founder authorization
    const checkAuthorization = async () => {
      try {
        const response = await fetch('/api/sovereign/auth');
        const data = await response.json();
        setIsAuthorized(data.authorized);

        if (data.authorized) {
          const authorizedFounderId = data.founderId ?? 'founder-imperial';
          setFounderId(authorizedFounderId);

          const runtimeResponse = await fetch(
            `/api/sovereign/high-council/runtime?founderId=${encodeURIComponent(authorizedFounderId)}&pathCount=5&trigger=manual`,
            { cache: 'no-store' }
          );

          if (!runtimeResponse.ok) {
            throw new Error(`Runtime integration failed with status ${runtimeResponse.status}`);
          }

          const runtimeData = (await runtimeResponse.json()) as SovereignHighCouncilRuntimeView;
          setRuntimeView(runtimeData);
          setRuntimeError(null);
        }
      } catch (error) {
        setIsAuthorized(false);
        setRuntimeView(null);
        setRuntimeError(error instanceof Error ? error.message : 'تعذّر الوصول إلى حالة التشغيل.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, []);

  if (loading) {
    return (
      <div className="sovereign-loading">
        <div className="loading-spinner" />
        <p>المجلس السيادي الأعلى</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <UnauthorizedView />;
  }

  const systemStatus = runtimeView?.systemStatus ?? 'degraded';

  const hallInsight = (hallId: string) => runtimeView?.hallInsights[hallId];

  const commandHalls: readonly CommandHallCard[] = [
    {
      hallId: 'ch-sovereign-assistant',
      name: 'المعين السيادي',
      description: 'ذكاءُ الإشراف المركزي',
      icon: '👁️',
      color: 'from-amber-500 to-yellow-400',
    },
    {
      hallId: 'ch-empire-pulse',
      name: 'نبض الإمبراطورية',
      description: 'صحّة المنصّة لحظةً بلحظة',
      icon: '💓',
      color: 'from-red-500 to-rose-400',
    },
    {
      hallId: 'ch-architectural-health',
      name: 'صحّة البنيان',
      description: 'سلامة الحدود والطبقات',
      icon: '🏗️',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      hallId: 'ch-infrastructure-health',
      name: 'صحّة البنية التحتيّة',
      description: 'الأنظمة والموارد',
      icon: '⚙️',
      color: 'from-green-500 to-emerald-400',
    },
    {
      hallId: 'ch-resource-intelligence',
      name: 'وعي الموارد',
      description: 'المعالجة والذاكرة والتخزين',
      icon: '📊',
      color: 'from-purple-500 to-pink-400',
    },
    {
      hallId: 'ch-financial-intelligence',
      name: 'وعي المال',
      description: 'الإيراد والكلفة',
      icon: '💰',
      color: 'from-yellow-500 to-orange-400',
    },
    {
      hallId: 'ch-evolution-intelligence',
      name: 'وعي التطوّر',
      description: 'اكتشاف القدرات ونموّها',
      icon: '🧬',
      color: 'from-indigo-500 to-blue-400',
    },
    {
      hallId: 'ch-security-intelligence',
      name: 'وعي الأمن',
      description: 'الوصول ورصد التهديد',
      icon: '🛡️',
      color: 'from-slate-600 to-gray-400',
    },
    {
      hallId: 'ch-founder-command',
      name: 'أمر المؤسس',
      description: 'حوكمة المنصّة',
      icon: '👑',
      color: 'from-gold to-amber-300',
    },
    {
      hallId: 'ch-emergency-command',
      name: 'أمر الطوارئ',
      description: 'الاستجابة الحرجة',
      icon: '🚨',
      color: 'from-red-600 to-red-400',
    },
    {
      hallId: 'ch-development-observatory',
      name: 'مرصد البناء',
      description: 'مقاييس الهندسة',
      icon: '🔬',
      color: 'from-teal-500 to-cyan-400',
    },
    {
      hallId: 'ch-broadcast-center',
      name: 'مركز البثّ',
      description: 'خطاب المنصّة',
      icon: '📢',
      color: 'from-violet-500 to-purple-400',
    },
    {
      hallId: 'ch-gift-distribution',
      name: 'توزيع العطايا',
      description: 'المكافآت والاشتراكات',
      icon: '🎁',
      color: 'from-pink-500 to-red-400',
    },
    {
      hallId: 'ch-future-laboratory',
      name: 'مختبر المستقبل',
      description: 'قدراتٌ تحت الاختبار',
      icon: '🔮',
      color: 'from-cyan-500 to-blue-400',
    },
  ];

  return (
    <div className="sovereign-high-council min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden">
      {/* Cosmic background effect */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gold/20 backdrop-blur-xl bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                المجلس السيادي الأعلى
              </h1>
              <p className="text-amber-300/70 text-sm mt-1">أعلى سلطةِ إشرافٍ في الإمبراطوريّة</p>
            </div>
            <div className={`status-indicator status-${systemStatus}`}>
              <div className={`w-3 h-3 rounded-full ${systemStatus === 'healthy' ? 'bg-green-400' : systemStatus === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-300 ml-2">{SYSTEM_STATUS_AR[systemStatus] ?? systemStatus}</span>
            </div>
          </div>
          <p className="text-gray-400">
            واجهةُ إشرافٍ خاصّة بملكيّة المنصّة وحوكمتها
          </p>
          {/* ── THE ENTRANCE THAT WAS MISSING ──────────────────────────────
              The Council is a supervisory surface, not the platform. Until
              2026-09-22 its only exits were its own two reports, so a Founder
              who signed in arrived here and had no sovereign way into AZMA OS
              — the Empire's own entrance was reachable by every Creator at
              /imperial-foyer and by the Founder from nowhere.

              This is that entrance, and nothing more: the platform, not a
              chamber. From the Foyer the Founder chooses among the five
              through the navigation the Empire already has. ConstitutionalLink
              is that authority's own component — the same session, the same
              identity, no second door. */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <ConstitutionalLink
              to="/imperial-foyer"
              data-testid="council-enter-platform"
              aria-label="ادخل أزما أو إس — قلب الإمبراطورية، حيث تختار الحجرة"
              className="council-platform-entry"
            >
              <span aria-hidden="true">⌂</span>
              ادخل أزما أو إس
            </ConstitutionalLink>
            <a href="/sovereign-high-council/consumption" className="text-xs text-amber-400/60 hover:text-amber-300 transition-colors">
              استهلاك المنصة ↗
            </a>
            <a href="/sovereign-high-council/health" className="text-xs text-amber-400/60 hover:text-amber-300 transition-colors">
              صحّة الإمبراطوريّة ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {selectedHall ? (
          <CommandHallDetail
            hall={selectedHall}
            runtimeView={runtimeView}
            insight={hallInsight(selectedHall.hallId)}
            onBack={() => setSelectedHall(null)}
          />
        ) : (
          <>
            <section className="mb-8 space-y-4">
              <div className="rounded-xl border border-gold/10 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-5">
                <p className="text-xs tracking-wide text-amber-300/80 mb-1">جلسة المؤسس</p>
                <p className="text-gray-300 text-sm">{founderId}</p>
                <p className="text-gray-500 text-xs mt-2">
                  آخر مزامنةٍ للتشغيل: {runtimeView?.generatedAt ? new Date(runtimeView.generatedAt).toLocaleString('ar') : '—'}
                </p>
                {runtimeError ? (
                  <p className="text-red-400 text-xs mt-2">تنبيه تشغيل: {runtimeError}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">إحاطة المؤسس</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.founderBriefings.founder.summary ?? 'الإحاطة لم تصل بعد.'}</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-400">
                    {(runtimeView?.founderBriefings.founder.keySignals ?? []).slice(0, 3).map((signal) => (
                      <li key={signal}>- {signal}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">الحالة الدستوريّة</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.constitutionalIntelligenceSummary ?? 'التركيب الدستوريّ لم يصل بعد.'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <RuntimeFact label="محمَّلة" value={runtimeView?.constitutionalStatus.loaded ? 'نعم' : 'لا'} />
                    <RuntimeFact label="الإصدار" value={spoken(runtimeView?.constitutionalStatus.version)} />
                    <RuntimeFact label="القرار" value={spoken(runtimeView?.constitutionalStatus.decision)} />
                    <RuntimeFact label="الامتثال" value={spoken(runtimeView?.constitutionalStatus.complianceStatus)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">الإحاطة التنفيذيّة</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.executiveBriefing.summary ?? 'الإحاطة التنفيذيّة لم تصل بعد.'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <RuntimeFact label="الخطر" value={spoken(runtimeView?.executiveBriefing.overallRisk)} />
                    <RuntimeFact label="الخطّة" value={spoken(runtimeView?.executiveBriefing.planStatus)} />
                  </div>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">الإحاطة الاستراتيجيّة</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.strategicBriefing.summary ?? 'الإحاطة الاستراتيجيّة لم تصل بعد.'}</p>
                  <p className="text-xs text-amber-300 mt-3">{runtimeView?.strategicBriefing.leadingOpportunity ?? 'لا فرصةٌ مرصودة بعد.'}</p>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">محاكاة المستقبل</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.simulation.summary ?? 'المحاكاة لم تصل بعد.'}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    المسار المُوصى به: {runtimeView?.simulation.recommendedPathId ?? '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">توصية العقيدة</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.founderExperience.doctrineRecommendation ?? 'التوصية لم تصل بعد.'}</p>
                  <p className="text-xs text-gray-500 mt-2">المسار المختار: {runtimeView?.doctrine.selectedPathId ?? '—'}</p>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">لماذا / ولماذا لا</h3>
                  <div className="space-y-2">
                    <p className="text-xs text-amber-300">لماذا: {runtimeView?.founderExperience.why ?? '—'}</p>
                    <p className="text-xs text-gray-400">ولماذا لا: {runtimeView?.founderExperience.whyNot ?? '—'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">مستويات المؤسس</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <RuntimeLevel label="الثقة" value={spoken(runtimeView?.founderExperience.confidenceLevel)} />
                    <RuntimeLevel label="الخطر" value={spoken(runtimeView?.founderExperience.riskLevel)} />
                    <RuntimeLevel label="الفرصة" value={spoken(runtimeView?.founderExperience.opportunityLevel)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">مزامنة التشغيل</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <RuntimeFact label="مُتزامن" value={runtimeView?.synchronizationStatus.synchronized ? 'نعم' : 'لا'} />
                    <RuntimeFact label="الناقل" value={runtimeView?.synchronizationStatus.busHealthy ? 'سليم' : 'حرج'} />
                    <RuntimeFact label="الوتين" value={runtimeView?.synchronizationStatus.alWateenHealthy ? 'سليم' : 'حرج'} />
                    <RuntimeFact label="التماسك" value={runtimeView?.synchronizationStatus.coherenceScore ?? 0} />
                    <RuntimeFact label="الطابور" value={runtimeView?.synchronizationStatus.queueDepth ?? 0} />
                    <RuntimeFact label="المحجوب" value={runtimeView?.synchronizationStatus.invalidMessagesBlocked ?? 0} />
                  </div>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">شخصيّة الوتين</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.personality.greeting ?? 'لا ردّ بعد.'}</p>
                  <p className="text-xs text-gray-400 mt-2">{runtimeView?.personality.assessment ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">توصياتٌ استراتيجيّة</h3>
                  <ul className="space-y-1 text-xs text-gray-400">
                    {(runtimeView?.strategicRecommendations ?? []).slice(0, 3).map((recommendation) => (
                      <li key={recommendation}>- {recommendation}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">توصياتٌ تنفيذيّة</h3>
                  <ul className="space-y-1 text-xs text-gray-400">
                    {(runtimeView?.executiveBriefing.recommendations ?? []).slice(0, 3).map((recommendation) => (
                      <li key={recommendation}>- {recommendation}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">التهديد الاستراتيجيّ</h3>
                  <p className="text-xs text-gray-400">{runtimeView?.strategicBriefing.leadingThreat ?? 'لا تهديدٌ مرصود بعد.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
                <RuntimeMetric label="الدستور" value={runtimeView?.runtimeSnapshots.constitutionLoaded ? 1 : 0} />
                <RuntimeMetric label="تنفيذيّة" value={runtimeView?.runtimeSnapshots.executivePackages} />
                <RuntimeMetric label="استراتيجيّة" value={runtimeView?.runtimeSnapshots.strategicPackages} />
                <RuntimeMetric label="المحاكاة" value={runtimeView?.runtimeSnapshots.simulationPackages} />
                <RuntimeMetric label="ما وجّهه الناقل" value={runtimeView?.runtimeSnapshots.busMessagesRouted} />
                <RuntimeMetric label="الإدراك" value={runtimeView?.runtimeSnapshots.perceptionPackages} />
                <RuntimeMetric label="Al-Wateen" value={runtimeView?.runtimeSnapshots.alWateenPackages} />
                <RuntimeMetric label="العقيدة" value={runtimeView?.runtimeSnapshots.doctrinePackages} />
                <RuntimeMetric label="مزامنة المجلس" value={runtimeView?.runtimeSnapshots.councilSynchronizations} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(runtimeView?.systemHealthIndicators ?? []).map((indicator) => (
                  <RuntimeHealthIndicator key={indicator.system} indicator={indicator} />
                ))}
              </div>
            </section>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gold mb-2">قاعات الأمر الأربع عشرة</h2>
              <p className="text-gray-400 text-sm">
                قاعاتٌ متخصّصة لإشراف المنصّة وحوكمتها
              </p>
            </div>

            {/* Command Halls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {commandHalls.map(hall => (
                <CommandHallCard
                  key={hall.hallId}
                  hall={hall}
                  insight={hallInsight(hall.hallId)}
                  onClick={() => setSelectedHall(hall)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        .sovereign-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(to br, rgb(15, 23, 42), rgb(2, 6, 23));
          font-family: var(--azma-font-family);
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(251, 146, 60, 0.1);
          border-top: 3px solid rgb(251, 146, 60);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .sovereign-loading p {
          color: rgb(251, 146, 60);
          margin-top: 1rem;
          font-size: 1.25rem;
        }

        .sovereign-high-council {
          font-family: var(--azma-font-family);
        }

        .gold {
          --color: rgb(251, 191, 36);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(251, 146, 60, 0.1);
        }

        .status-healthy {
          border-color: rgba(34, 197, 94, 0.2);
        }

        .status-degraded {
          border-color: rgba(234, 179, 8, 0.2);
        }

        .status-critical {
          border-color: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}

interface CommandHallCardProps {
  readonly hall: CommandHallCard;
  readonly insight?: HallRuntimeInsight;
  readonly onClick: () => void;
}

function CommandHallCard({ hall, insight, onClick }: CommandHallCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-gold/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-gold/50"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="text-3xl mb-3">{hall.icon}</div>
        <h3 className="text-lg font-semibold text-gold group-hover:text-amber-300 transition-colors">
          {hall.name}
        </h3>
        <p className="text-sm text-gray-400 mt-2">{hall.description}</p>
        {insight ? (
          <p className="text-xs text-amber-200/80 mt-3 line-clamp-2">{insight.headline}</p>
        ) : null}
      </div>

      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
    </button>
  );
}

interface CommandHallDetailProps {
  readonly hall: CommandHallCard;
  readonly runtimeView: SovereignHighCouncilRuntimeView | null;
  readonly insight?: HallRuntimeInsight;
  readonly onBack: () => void;
}

function CommandHallDetail({ hall, runtimeView, insight, onBack }: CommandHallDetailProps) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-gold hover:text-amber-300 transition-colors mb-6 flex items-center gap-2"
      >
        ← عودةٌ إلى القاعات
      </button>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{hall.icon}</span>
          <div>
            <h2 className="text-3xl font-bold text-gold">{hall.name}</h2>
            <p className="text-gray-400 mt-1">{hall.description}</p>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-6">
          <div className="space-y-4">
            <p className="text-gray-300">{insight?.headline ?? 'لا قراءةَ تشغيلٍ لهذه القاعة بعد.'}</p>

            {insight?.details?.length ? (
              <ul className="space-y-1 text-sm text-gray-400">
                {insight.details.map((detail) => (
                  <li key={detail}>- {detail}</li>
                ))}
              </ul>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-gold/10 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold text-gold mb-2">إحاطة المؤسس</h3>
                <p className="text-sm text-gray-300">{runtimeView?.founderBriefings.founder.summary ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-gold/10 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold text-gold mb-2">Doctrine Justification</h3>
                <p className="text-xs text-gray-300">Confidence: {runtimeView?.doctrine.confidence ?? '—'}</p>
                <p className="text-xs text-gray-400 mt-1">{runtimeView?.doctrine.confidenceReason ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RuntimeMetric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-lg border border-gold/10 bg-slate-900/40 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-amber-300 font-semibold">{value ?? 0}</p>
    </div>
  );
}

function RuntimeFact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gold/10 bg-slate-950/30 px-3 py-2">
      <p className="text-[10px] uppercase text-gray-500">{label}</p>
      <p className="text-xs text-gray-300 truncate">{value}</p>
    </div>
  );
}

function RuntimeLevel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gold/10 bg-slate-950/30 px-3 py-3 text-center">
      <p className="text-[10px] uppercase text-gray-500">{label}</p>
      <p className="text-sm text-amber-300 font-semibold capitalize">{value}</p>
    </div>
  );
}

function RuntimeHealthIndicator({ indicator }: { indicator: RuntimeHealthIndicatorView }) {
  const dotClass =
    indicator.status === 'healthy'
      ? 'bg-green-400'
      : indicator.status === 'degraded'
        ? 'bg-yellow-400'
        : 'bg-red-400';

  return (
    <div className="rounded-lg border border-gold/10 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gold">{indicator.system}</h3>
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      </div>
      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{indicator.summary}</p>
      <p className="text-xs text-amber-300/80 mt-2">{indicator.metric}</p>
    </div>
  );
}

function UnauthorizedView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gold">المجلس السيادي الأعلى</h1>
        <p className="text-2xl font-semibold text-red-400">هذه المنطقة مخصصة للقيادة العليا</p>
        <p className="text-gray-400 text-lg">This area is reserved for platform leadership</p>
        <p className="text-gray-500 text-sm mt-6">Access denied. Founder authentication required.</p>
      </div>
    </div>
  );
}
