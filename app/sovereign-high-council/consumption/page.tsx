'use client';

/**
 * AZMA OS — Founder Consumption Monitor
 *
 * Surfaces the already-existing /api/sovereign/high-council/consumption
 * endpoint inside the Sovereign High Council Founder experience.
 * Read-only. No provider calls. No generation. No credit consumption.
 * Authorization enforced by layout (verifyFounderSession) + API (role:founder).
 */

import { useState, useEffect } from 'react';

interface CreatorUsage {
  readonly creatorId: string;
  readonly imageGenerations: number;
  readonly ttsCharacters: number;
  readonly voiceClones: number;
  readonly totalCostUsdEstimate: number;
}

interface BetaCap {
  readonly imageGenerations: number;
  readonly ttsCharacters: number;
  readonly voiceClones: number;
}

interface ConsumptionView {
  readonly monthKey: string;
  readonly betaCap: BetaCap;
  readonly creators: readonly CreatorUsage[];
  readonly platformTotals: {
    readonly imageGenerations: number;
    readonly ttsCharacters: number;
    readonly voiceClones: number;
    readonly totalCostUsdEstimate: number;
  };
  readonly creatorCount: number;
}

// ─── UI primitives — match health page visual language ────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
      <span style={{ color: '#e2e8f0', fontSize: '13px', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px' }}>
      <div style={{ color: '#64748b', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function CapBar({ used, cap, label }: { used: number; cap: number; label: string }) {
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const barColor = pct >= 90 ? '#f87171' : pct >= 70 ? '#facc15' : '#4ade80';
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</span>
        <span style={{ color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace' }}>
          {used.toLocaleString()} / {cap.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px' }}>
        <div style={{ height: '4px', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FounderConsumptionPage() {
  const [data, setData] = useState<ConsumptionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState('');

  async function loadData(monthKey: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sovereign/high-council/consumption?month=${encodeURIComponent(monthKey)}`);
      if (res.status === 403) {
        setError('Founder access required.');
        return;
      }
      if (!res.ok) {
        setError(`Endpoint returned ${res.status}.`);
        return;
      }
      const json = (await res.json()) as ConsumptionView;
      setData(json);
    } catch {
      setError('Consumption endpoint unreachable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(current);
    loadData(current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const m = e.target.value;
    setMonth(m);
    if (/^\d{4}-(?:0[1-9]|1[0-2])$/.test(m)) {
      loadData(m);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', fontFamily: 'monospace', padding: '40px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            AZMA OS — المجلس السيادي الأعلى
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>
            استهلاك المنصة
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', margin: '0' }}>
            Platform Consumption Monitor — Founder only
          </p>
        </div>

        {/* Month selector */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ color: '#64748b', fontSize: '12px', letterSpacing: '0.06em' }}>MONTH</label>
          <input
            type="month"
            value={month}
            onChange={handleMonthChange}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#e2e8f0',
              fontSize: '13px',
              padding: '6px 10px',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          />
          {loading && <span style={{ color: '#475569', fontSize: '12px' }}>جارٍ التحميل…</span>}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Data */}
        {data && !loading && (
          <>
            {/* Beta Caps */}
            <Section title={`حدود بيتا — ${data.monthKey}`}>
              <CapBar used={data.platformTotals.imageGenerations} cap={data.betaCap.imageGenerations} label="Image Generations (platform)" />
              <CapBar used={data.platformTotals.ttsCharacters}    cap={data.betaCap.ttsCharacters}    label="TTS Characters (platform)" />
              <CapBar used={data.platformTotals.voiceClones}      cap={data.betaCap.voiceClones}      label="Voice Clones (platform)" />
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #1e293b', color: '#64748b', fontSize: '11px' }}>
                Cap limits apply per Creator per month. Founders are exempt.
              </div>
            </Section>

            {/* Platform Totals */}
            <Section title="إجمالي المنصة">
              <Row label="Creators with activity" value={data.creatorCount} />
              <Row label="Total image generations" value={data.platformTotals.imageGenerations.toLocaleString()} />
              <Row label="Total TTS characters"    value={data.platformTotals.ttsCharacters.toLocaleString()} />
              <Row label="Total voice clones"      value={data.platformTotals.voiceClones.toLocaleString()} />
              <Row
                label="Estimated cost (USD)"
                value={
                  <span style={{ color: data.platformTotals.totalCostUsdEstimate > 5 ? '#f87171' : '#4ade80' }}>
                    ${data.platformTotals.totalCostUsdEstimate.toFixed(3)}
                  </span>
                }
              />
            </Section>

            {/* Per-Creator Breakdown */}
            <Section title={`تفصيل المبدعين — ${data.creatorCount} ${data.creatorCount === 1 ? 'creator' : 'creators'}`}>
              {data.creators.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '13px', padding: '8px 0' }}>
                  No consumption recorded for {data.monthKey}.
                </div>
              ) : (
                <>
                  {/* Column headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 60px 80px', gap: '8px', padding: '6px 0', borderBottom: '1px solid #334155', marginBottom: '4px' }}>
                    {['Creator', 'Images', 'TTS chars', 'Clones', 'Est. USD'].map((h) => (
                      <span key={h} style={{ color: '#475569', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
                    ))}
                  </div>
                  {data.creators.map((c) => (
                    <div
                      key={c.creatorId}
                      style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 60px 80px', gap: '8px', padding: '7px 0', borderBottom: '1px solid #1e293b', alignItems: 'center' }}
                    >
                      <span style={{ color: '#94a3b8', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.creatorId}>
                        {c.creatorId.length > 20 ? `${c.creatorId.slice(0, 8)}…${c.creatorId.slice(-6)}` : c.creatorId}
                      </span>
                      <span style={{ color: '#e2e8f0', fontSize: '12px', textAlign: 'right' }}>
                        {c.imageGenerations}
                      </span>
                      <span style={{ color: '#e2e8f0', fontSize: '12px', textAlign: 'right' }}>
                        {c.ttsCharacters.toLocaleString()}
                      </span>
                      <span style={{ color: '#e2e8f0', fontSize: '12px', textAlign: 'right' }}>
                        {c.voiceClones}
                      </span>
                      <span style={{ color: '#fbbf24', fontSize: '12px', textAlign: 'right' }}>
                        ${c.totalCostUsdEstimate.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </Section>

            {/* Disclosure */}
            <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px' }}>
              <div style={{ color: '#475569', fontSize: '11px', lineHeight: '1.6' }}>
                Cost figures are USD estimates based on published provider pricing at time of operation.
                Trial-path image generations are not recorded here.
                Actual provider invoices are authoritative.
              </div>
            </div>
          </>
        )}

        {/* Back link */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a href="/sovereign-high-council" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>
            ⮜ المجلس السيادي
          </a>
        </div>

      </div>
    </div>
  );
}
