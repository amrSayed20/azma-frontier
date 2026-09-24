/**
 * AZMA OS — what the platform actually is, measured once.
 *
 * ─── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 *   MEASURED on production 2026-09-24, both readings taken in the same minute:
 *
 *     The Council was told   leading opportunity «Constitutional Alignment
 *                            Acceleration», leading threat «Growing event
 *                            complexity can outpace strategy adaptation».
 *     The platform actually  operational tier CRITICAL · heap at 91% ·
 *                            every Stripe key MISSING, so no Creator could
 *                            subscribe or pay at all.
 *
 *   The Council is where decisions are made. A decision taken on that report
 *   would have been taken blind to a closed revenue path and a heap at the
 *   edge, because nothing in the strategic layer had ever looked at either.
 *
 *   Its «health» figures were arithmetic on document counts:
 *
 *     constitutionalHealth    = 80 + min(policyCount, 20)
 *     architecturalHealth     = 70 + min(articleCount, 20)
 *     infrastructureHealth    = 68 + min(eventCount, 20)
 *     platformEvolutionHealth = 65 + min(signalCount, 25)
 *
 *   «Infrastructure health» never touched infrastructure — no disk, no memory,
 *   no provider, no database. «Platform evolution» counted the signals it had
 *   just generated about itself. And because constitutionalHealth reaches 100
 *   the moment twenty policy files are loaded, the 85 threshold that emits
 *   «Constitutional Alignment Acceleration» was passed unconditionally: the
 *   opportunity the Founder read was not an observation, it was a consequence
 *   of files existing.
 *
 * ─── WHY IT IS HERE AND NOT IN THE HEALTH ROUTE ──────────────────────────────
 *
 *   /api/health already measured these things, inside itself. Reading them
 *   from the strategic layer by copying that code would have created a second
 *   source of truth about one platform, and two sources disagree eventually.
 *   The measurement lives here; the health endpoint and the Council's
 *   intelligence are both its readers.
 *
 *   It reports only what it can actually observe. A figure it cannot take is
 *   `null`, never a default that would read as health.
 */

import { statfsSync } from 'fs';

export type OperationalTier = 'NORMAL' | 'WARNING' | 'CRITICAL';

/** Certification V thresholds — the Empire's own, in one place. */
export const OPERATIONAL_THRESHOLDS = {
  memory: { warningPct: 70, criticalPct: 85 },
  disk:   { warningPct: 75, criticalPct: 90 },
} as const;

export function evaluateTier(value: number, warningPct: number, criticalPct: number): OperationalTier {
  if (value >= criticalPct) return 'CRITICAL';
  if (value >= warningPct) return 'WARNING';
  return 'NORMAL';
}

/**
 * A capability the Empire cannot perform because it was never configured.
 *
 * `revenueCritical` marks the ones whose absence stops money: without them a
 * Creator cannot subscribe, and the Empire earns nothing no matter how healthy
 * its documents are.
 */
export interface ProviderReadiness {
  readonly key: string;
  readonly nameAr: string;
  readonly configured: boolean;
  readonly revenueCritical: boolean;
}

export interface OperationalState {
  /** Heap utilisation percent, or null when it could not be taken. */
  readonly heapUtilizationPct: number | null;
  readonly memoryTier: OperationalTier;
  /** Disk used percent, or null when the filesystem could not be read. */
  readonly diskUsedPct: number | null;
  readonly diskTier: OperationalTier;
  readonly providers: readonly ProviderReadiness[];
  /** The providers that are missing and stop revenue. */
  readonly missingRevenueProviders: readonly ProviderReadiness[];
  /** The worst of what was actually measured. */
  readonly overallTier: OperationalTier;
  readonly measuredAtMs: number;
}

const PROVIDER_MANIFEST: readonly Omit<ProviderReadiness, 'configured'>[] = [
  { key: 'STRIPE_SECRET_KEY',                    nameAr: 'مفتاح الدفع',            revenueCritical: true },
  { key: 'STRIPE_WEBHOOK_SECRET',                nameAr: 'إشعار الدفع',            revenueCritical: true },
  { key: 'STRIPE_PRICE_ID_CREATOR_MONTHLY',      nameAr: 'سعر الاشتراك',           revenueCritical: true },
  { key: 'GEMINI_API_KEY',                       nameAr: 'جسر التركيب المعرفيّ',   revenueCritical: false },
  { key: 'OPENAI_API_KEY',                       nameAr: 'مزوّد الصور',            revenueCritical: false },
  { key: 'VOICE_CLONING_API_KEY',                nameAr: 'استنساخ الصوت',          revenueCritical: false },
];

export function measureOperationalState(now: number = Date.now()): OperationalState {
  const mem = process.memoryUsage();
  const heapUtilizationPct = mem.heapTotal > 0
    ? Math.round((mem.heapUsed / mem.heapTotal) * 100)
    : null;

  let diskUsedPct: number | null = null;
  try {
    const fs = statfsSync(process.cwd());
    const total = fs.blocks * fs.bsize;
    const free = fs.bfree * fs.bsize;
    if (total > 0) diskUsedPct = Math.round(((total - free) / total) * 100);
  } catch { /* statfsSync is unavailable on some builds; null says so */ }

  const memoryTier = heapUtilizationPct === null
    ? 'NORMAL'
    : evaluateTier(heapUtilizationPct, OPERATIONAL_THRESHOLDS.memory.warningPct, OPERATIONAL_THRESHOLDS.memory.criticalPct);
  const diskTier = diskUsedPct === null
    ? 'NORMAL'
    : evaluateTier(diskUsedPct, OPERATIONAL_THRESHOLDS.disk.warningPct, OPERATIONAL_THRESHOLDS.disk.criticalPct);

  // Presence only. A key's value never leaves the process that holds it.
  const providers: ProviderReadiness[] = PROVIDER_MANIFEST.map((p) => ({
    ...p,
    configured: Boolean(process.env[p.key]),
  }));
  const missingRevenueProviders = providers.filter((p) => p.revenueCritical && !p.configured);

  const overallTier: OperationalTier =
    memoryTier === 'CRITICAL' || diskTier === 'CRITICAL' || missingRevenueProviders.length > 0 ? 'CRITICAL'
    : memoryTier === 'WARNING' || diskTier === 'WARNING' ? 'WARNING'
    : 'NORMAL';

  return {
    heapUtilizationPct,
    memoryTier,
    diskUsedPct,
    diskTier,
    providers,
    missingRevenueProviders,
    overallTier,
    measuredAtMs: now,
  };
}
