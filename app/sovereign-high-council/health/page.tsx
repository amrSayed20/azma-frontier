'use client';

/**
 * AZMA OS — Imperial Health Dashboard
 *
 * Founder-only. Displays the complete operational truth of the Empire
 * in one view. Refreshes on demand. No auto-polling — the Founder
 * chooses when to observe.
 */

import { useState } from 'react';
import '../council.css';

type HealthTier = 'NORMAL' | 'WARNING' | 'CRITICAL';

interface HealthReport {
  status: 'succeeded';
  empire: {
    status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
    operationalTier: HealthTier;
    uptime: string;
    uptimeSeconds: number;
    nodeVersion: string;
    environment: string;
    checkedAt: string;
  };
  database: {
    status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
    creators: number;
    activeSessions: number;
    generationRecords: number;
    vaultAssets: number;
    goals: number;
    investigations: number;
    productions: number;
    dbFileSize: string;
  };
  vault: {
    generatedAssets: string;
    uploads: string;
    total: string;
  };
  disk: {
    free: string;
    total: string;
    usedPct: string;
  };
  memory: {
    heapUsed: string;
    heapTotal: string;
    rss: string;
    heapUtilizationPct: string;
  };
  providers: Record<string, string>;
  thresholds: {
    overall: HealthTier;
    memory: { tier: HealthTier; heapUtilizationPct: number; warningAt: string; criticalAt: string };
    disk:   { tier: HealthTier; usedPct: number | null;     warningAt: string; criticalAt: string };
    referenceOnly: Record<string, string>;
  };
}

const STATUS_COLORS: Record<string, string> = {
  OPERATIONAL:     '#4ade80',
  CONFIGURED:      '#4ade80',
  NORMAL:          '#4ade80',
  DEGRADED:        '#facc15',
  NOT_CONFIGURED:  '#facc15',
  WARNING:         '#facc15',
  DOWN:            '#f87171',
  MISSING:         '#f87171',
  CRITICAL:        '#f87171',
};

function StatusPill({ value }: { value: string }) {
  const color = STATUS_COLORS[value] ?? '#94a3b8';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
      fontFamily: 'monospace',
    }}>
      {value}
    </span>
  );
}

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

export default function ImperialHealthPage() {
  const [report, setReport]     = useState<HealthReport | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  async function check() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      if (res.status === 401) { setError('Founder session required.'); return; }
      const data = await res.json();
      if (data.status === 'succeeded') setReport(data as HealthReport);
      else setError('Unexpected response from health endpoint.');
    } catch {
      setError('Health endpoint unreachable.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', fontFamily: 'monospace', padding: '40px 24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            AZMA OS
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>
            Imperial Health Dashboard
          </h1>
          {report && (
            <div style={{ fontSize: '12px', color: '#475569' }}>
              آخر فحص: {new Date(report.empire.checkedAt).toLocaleString('ar-SA')}
            </div>
          )}
        </div>

        <button
          onClick={check}
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            marginBottom: '24px',
            background: loading ? '#1e293b' : '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: loading ? '#475569' : '#94a3b8',
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          {loading ? 'جارٍ الفحص...' : '⟳  فحص الإمبراطورية الآن'}
        </button>

        {error && (
          <div style={{ background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {report && (
          <>
            <Section title="الإمبراطورية">
              <Row label="الحالة" value={<StatusPill value={report.empire.status} />} />
              <Row label="الطبقة التشغيلية" value={<StatusPill value={report.empire.operationalTier} />} />
              <Row label="وقت التشغيل" value={report.empire.uptime} />
              <Row label="البيئة" value={report.empire.environment} />
              <Row label="Node.js" value={report.empire.nodeVersion} />
            </Section>

            <Section title="قاعدة البيانات">
              <Row label="الحالة" value={<StatusPill value={report.database.status} />} />
              <Row label="المبدعون" value={report.database.creators.toLocaleString()} />
              <Row label="الجلسات النشطة" value={report.database.activeSessions.toLocaleString()} />
              <Row label="سجلات التوليد" value={report.database.generationRecords.toLocaleString()} />
              <Row label="أصول الخزانة" value={report.database.vaultAssets.toLocaleString()} />
              <Row label="الأهداف" value={report.database.goals.toLocaleString()} />
              <Row label="التحقيقات" value={report.database.investigations.toLocaleString()} />
              <Row label="الإنتاجات" value={report.database.productions.toLocaleString()} />
              <Row label="حجم الملف" value={report.database.dbFileSize} />
            </Section>

            <Section title="الخزانة السيادية">
              <Row label="الأصول المُولَّدة (Qiyamah)" value={report.vault.generatedAssets} />
              <Row label="الملفات المرفوعة" value={report.vault.uploads} />
              <Row label="الإجمالي" value={report.vault.total} />
            </Section>

            <Section title="القرص">
              <Row label="المتاح" value={report.disk.free} />
              <Row label="الكلي" value={report.disk.total} />
              <Row label="المستخدم" value={report.disk.usedPct} />
            </Section>

            <Section title="الذاكرة">
              <Row label="Heap مستخدم" value={report.memory.heapUsed} />
              <Row label="Heap الكلي" value={report.memory.heapTotal} />
              <Row label="RSS" value={report.memory.rss} />
              <Row label="استخدام Heap" value={report.memory.heapUtilizationPct} />
            </Section>

            <Section title="مزوّدو الخدمات">
              {Object.entries(report.providers).map(([key, val]) => (
                <Row key={key} label={key} value={<StatusPill value={val} />} />
              ))}
            </Section>

            <Section title="العتبات التشغيلية (شهادة V)">
              <Row label="الحالة الكلية" value={<StatusPill value={report.thresholds.overall} />} />
              <Row
                label="الذاكرة"
                value={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusPill value={report.thresholds.memory.tier} />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      {report.thresholds.memory.heapUtilizationPct}%
                      {' '}(تحذير: {report.thresholds.memory.warningAt} / حرج: {report.thresholds.memory.criticalAt})
                    </span>
                  </span>
                }
              />
              <Row
                label="القرص"
                value={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusPill value={report.thresholds.disk.tier} />
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      {report.thresholds.disk.usedPct !== null ? `${report.thresholds.disk.usedPct}%` : 'غير متاح'}
                      {' '}(تحذير: {report.thresholds.disk.warningAt} / حرج: {report.thresholds.disk.criticalAt})
                    </span>
                  </span>
                }
              />
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                <div style={{ color: '#475569', fontSize: '11px', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  مرجع (تُقاس بعد النشر)
                </div>
                {Object.entries(report.thresholds.referenceOnly).map(([key, val]) => (
                  <Row key={key} label={key} value={<span style={{ fontSize: '11px', color: '#64748b' }}>{val}</span>} />
                ))}
              </div>
            </Section>
          </>
        )}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a href="/sovereign-high-council" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>
            ⮜ المجلس السيادي
          </a>
        </div>

      </div>
    </div>
  );
}
