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

export default function SovereignHighCouncilPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<CommandHallCard | null>(null);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'degraded' | 'critical'>('healthy');

  useEffect(() => {
    // Verify founder authorization
    const checkAuthorization = async () => {
      try {
        const response = await fetch('/api/sovereign/auth');
        const data = await response.json();
        setIsAuthorized(data.authorized);
      } catch (error) {
        setIsAuthorized(false);
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
          <CommandHallDetail hall={selectedHall} onBack={() => setSelectedHall(null)} />
        ) : (
          <>
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
  readonly onClick: () => void;
}

function CommandHallCard({ hall, onClick }: CommandHallCardProps) {
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
      </div>

      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
    </button>
  );
}

interface CommandHallDetailProps {
  readonly hall: CommandHallCard;
  readonly onBack: () => void;
}

function CommandHallDetail({ hall, onBack }: CommandHallDetailProps) {
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
          <p className="text-gray-300">
            Command Hall Details - Coming Soon
          </p>
        </div>
      </div>
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
