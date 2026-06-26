/**
 * AZMA OS - Sovereign High Council UI
 * Main Page Layout
 *
 * Imperial futuristic design with cinematic depth, 
 * living light, and intelligent motion.
 */

'use client';

import React, { useState, useEffect } from 'react';

interface CommandHallCard {
  readonly hallId: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
}

interface HallRuntimeInsight {
  readonly headline: string;
  readonly details: readonly string[];
}

interface RuntimeView {
  readonly generatedAt: string;
  readonly founderId: string;
  readonly systemStatus: 'healthy' | 'degraded' | 'critical';
  readonly founderBriefings: {
    readonly founder: {
      readonly summary: string;
      readonly keySignals: readonly string[];
    };
    readonly executive: {
      readonly summary: string;
      readonly keySignals: readonly string[];
    };
    readonly strategic: {
      readonly summary: string;
      readonly keySignals: readonly string[];
    };
  };
  readonly constitutionalIntelligenceSummary: string;
  readonly strategicRecommendations: readonly string[];
  readonly doctrine: {
    readonly selectedPathId: string;
    readonly confidence: string;
    readonly confidenceReason: string;
    readonly rankings: readonly {
      readonly pathId: string;
      readonly score: number;
      readonly why: string;
      readonly whyNot: string;
    }[];
  };
  readonly simulation: {
    readonly summary: string;
    readonly recommendedPathId?: string;
    readonly topFutures: readonly {
      readonly pathId: string;
      readonly rank: number;
      readonly score: number;
      readonly riskLevel: string;
      readonly probability: number;
    }[];
  };
  readonly personality: {
    readonly greeting: string;
    readonly assessment: string;
    readonly recommendation: string;
    readonly constitutionalAnchor: string;
  };
  readonly runtimeSnapshots: {
    readonly constitutionLoaded: boolean;
    readonly executivePackages: number;
    readonly strategicPackages: number;
    readonly simulationPackages: number;
    readonly busMessagesRouted: number;
    readonly perceptionPackages: number;
    readonly alWateenPackages: number;
    readonly doctrinePackages: number;
    readonly councilSynchronizations: number;
  };
  readonly hallInsights: Readonly<Record<string, HallRuntimeInsight>>;
}

export default function SovereignHighCouncilPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<CommandHallCard | null>(null);
  const [founderId, setFounderId] = useState('founder-imperial');
  const [runtimeView, setRuntimeView] = useState<RuntimeView | null>(null);
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

          const runtimeData = (await runtimeResponse.json()) as RuntimeView;
          setRuntimeView(runtimeData);
          setRuntimeError(null);
        }
      } catch (error) {
        setIsAuthorized(false);
        setRuntimeView(null);
        setRuntimeError(error instanceof Error ? error.message : 'Unknown runtime integration error');
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
      name: 'Sovereign Assistant',
      description: 'Central supervisory intelligence',
      icon: '👁️',
      color: 'from-amber-500 to-yellow-400',
    },
    {
      hallId: 'ch-empire-pulse',
      name: 'Empire Pulse',
      description: 'Real-time platform health',
      icon: '💓',
      color: 'from-red-500 to-rose-400',
    },
    {
      hallId: 'ch-architectural-health',
      name: 'Architectural Health',
      description: 'Boundary & layer integrity',
      icon: '🏗️',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      hallId: 'ch-infrastructure-health',
      name: 'Infrastructure Health',
      description: 'Systems & resources',
      icon: '⚙️',
      color: 'from-green-500 to-emerald-400',
    },
    {
      hallId: 'ch-resource-intelligence',
      name: 'Resource Intelligence',
      description: 'CPU, memory, storage analytics',
      icon: '📊',
      color: 'from-purple-500 to-pink-400',
    },
    {
      hallId: 'ch-financial-intelligence',
      name: 'Financial Intelligence',
      description: 'Revenue & cost analysis',
      icon: '💰',
      color: 'from-yellow-500 to-orange-400',
    },
    {
      hallId: 'ch-evolution-intelligence',
      name: 'Evolution Intelligence',
      description: 'AI discovery & evolution',
      icon: '🧬',
      color: 'from-indigo-500 to-blue-400',
    },
    {
      hallId: 'ch-security-intelligence',
      name: 'Security Intelligence',
      description: 'Access & threat detection',
      icon: '🛡️',
      color: 'from-slate-600 to-gray-400',
    },
    {
      hallId: 'ch-founder-command',
      name: 'Founder Command',
      description: 'Platform governance',
      icon: '👑',
      color: 'from-gold to-amber-300',
    },
    {
      hallId: 'ch-emergency-command',
      name: 'Emergency Command',
      description: 'Critical response',
      icon: '🚨',
      color: 'from-red-600 to-red-400',
    },
    {
      hallId: 'ch-development-observatory',
      name: 'Development Observatory',
      description: 'Engineering metrics',
      icon: '🔬',
      color: 'from-teal-500 to-cyan-400',
    },
    {
      hallId: 'ch-broadcast-center',
      name: 'Broadcast Center',
      description: 'Platform communications',
      icon: '📢',
      color: 'from-violet-500 to-purple-400',
    },
    {
      hallId: 'ch-gift-distribution',
      name: 'Gift Distribution',
      description: 'Rewards & subscriptions',
      icon: '🎁',
      color: 'from-pink-500 to-red-400',
    },
    {
      hallId: 'ch-future-laboratory',
      name: 'Future Laboratory',
      description: 'Experimental features',
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
              <p className="text-amber-300/70 text-sm mt-1">The Sovereign High Council</p>
            </div>
            <div className={`status-indicator status-${systemStatus}`}>
              <div className={`w-3 h-3 rounded-full ${systemStatus === 'healthy' ? 'bg-green-400' : systemStatus === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-300 ml-2">{systemStatus}</span>
            </div>
          </div>
          <p className="text-gray-400">
            Exclusive supervisory interface for platform ownership and governance
          </p>
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
                <p className="text-xs uppercase tracking-wide text-amber-300/80 mb-1">Founder Session</p>
                <p className="text-gray-300 text-sm">{founderId}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Runtime synchronized at {runtimeView?.generatedAt ? new Date(runtimeView.generatedAt).toLocaleString() : 'N/A'}
                </p>
                {runtimeError ? (
                  <p className="text-red-400 text-xs mt-2">Runtime warning: {runtimeError}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">Founder Briefing</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.founderBriefings.founder.summary ?? 'Awaiting briefing...'}</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-400">
                    {(runtimeView?.founderBriefings.founder.keySignals ?? []).slice(0, 3).map((signal) => (
                      <li key={signal}>- {signal}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">Constitutional Intelligence</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.constitutionalIntelligenceSummary ?? 'Awaiting constitutional synthesis...'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">Strategic Recommendations</h3>
                  <ul className="space-y-1 text-xs text-gray-400">
                    {(runtimeView?.strategicRecommendations ?? []).slice(0, 3).map((recommendation) => (
                      <li key={recommendation}>- {recommendation}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">Doctrine WHY / WHY NOT</h3>
                  <p className="text-xs text-gray-300 mb-2">
                    Selected Path: {runtimeView?.doctrine.selectedPathId ?? 'N/A'}
                  </p>
                  {runtimeView?.doctrine.rankings.slice(0, 1).map((ranking) => (
                    <div key={ranking.pathId} className="space-y-1">
                      <p className="text-xs text-amber-300">WHY: {ranking.why}</p>
                      <p className="text-xs text-gray-400">WHY NOT: {ranking.whyNot}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-gold/10 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-gold mb-2">Simulation Summary</h3>
                  <p className="text-sm text-gray-300">{runtimeView?.simulation.summary ?? 'Awaiting simulation package...'}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended Path: {runtimeView?.simulation.recommendedPathId ?? 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <RuntimeMetric label="Exec" value={runtimeView?.runtimeSnapshots.executivePackages} />
                <RuntimeMetric label="Strategic" value={runtimeView?.runtimeSnapshots.strategicPackages} />
                <RuntimeMetric label="Simulation" value={runtimeView?.runtimeSnapshots.simulationPackages} />
                <RuntimeMetric label="Bus Routed" value={runtimeView?.runtimeSnapshots.busMessagesRouted} />
                <RuntimeMetric label="Council Sync" value={runtimeView?.runtimeSnapshots.councilSynchronizations} />
              </div>
            </section>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gold mb-2">14 Command Halls</h2>
              <p className="text-gray-400 text-sm">
                Access specialized chambers for platform supervision and governance
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
          font-family: 'Cairo', sans-serif;
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
          font-family: 'Inter', system-ui, sans-serif;
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
  readonly runtimeView: RuntimeView | null;
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
        ← Back to Halls
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
            <p className="text-gray-300">{insight?.headline ?? 'Runtime insight not yet available.'}</p>

            {insight?.details?.length ? (
              <ul className="space-y-1 text-sm text-gray-400">
                {insight.details.map((detail) => (
                  <li key={detail}>- {detail}</li>
                ))}
              </ul>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-gold/10 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold text-gold mb-2">Founder Briefing</h3>
                <p className="text-sm text-gray-300">{runtimeView?.founderBriefings.founder.summary ?? 'N/A'}</p>
              </div>
              <div className="rounded-lg border border-gold/10 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold text-gold mb-2">Doctrine Justification</h3>
                <p className="text-xs text-gray-300">Confidence: {runtimeView?.doctrine.confidence ?? 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-1">{runtimeView?.doctrine.confidenceReason ?? 'N/A'}</p>
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
