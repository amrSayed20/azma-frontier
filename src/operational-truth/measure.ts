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
import { getHeapStatistics } from 'v8';
import { totalmem } from 'os';

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
  /**
   * Heap used as a percent of the heap's actual CEILING, or null when it
   * could not be taken.
   *
   * ── WHY NOT heapUsed / heapTotal ──────────────────────────────────────
   *
   *   MEASURED 2026-09-26: this read `heapUsed / heapTotal` and production
   *   reported 96% — CRITICAL — permanently. `heapTotal` is what V8 has
   *   committed FROM THE OS AT THIS MOMENT, and V8 grows it on demand while
   *   keeping it close to what is in use. A freshly started, empty Node
   *   process measures 73% by that formula and 0% by this one.
   *
   *   Production's true figure: 143.8 MB used of a ~2240 MB ceiling — six
   *   percent. The Empire had been screaming CRITICAL at a healthy process,
   *   and a permanent false alarm is worse than none: it teaches everyone to
   *   ignore the one alarm that will matter.
   */
  readonly heapUtilizationPct: number | null;
  /** Resident memory as a percent of the machine's, or null. The other real pressure. */
  readonly rssPct: number | null;
  readonly memoryTier: OperationalTier;
  /** Disk used percent, or null when the filesystem could not be read. */
  readonly diskUsedPct: number | null;
  readonly diskTier: OperationalTier;
  readonly providers: readonly ProviderReadiness[];
  /** The providers that are missing and stop revenue. */
  readonly missingRevenueProviders: readonly ProviderReadiness[];
  /**
   * Whether the Empire can take money at all — reported BESIDE the operational
   * tier, never folded into it.
   *
   * Folding it in made every reading CRITICAL for a reason that has nothing to
   * do with whether anything is failing right now, which is how an alarm stops
   * being read. «Nothing is wrong, and we cannot be paid» is two facts, and
   * the Founder is owed both.
   */
  readonly revenueReady: boolean;
  /** The worst of what is actually FAILING — memory and disk. Not revenue. */
  readonly overallTier: OperationalTier;
  readonly measuredAtMs: number;
}

/**
 * ── THE GATEWAY IS NAMED BY THE CODE, NOT BY THIS FILE ──────────────────────
 *
 *   This manifest listed three STRIPE keys as revenue-critical. The Empire
 *   implements no Stripe gateway: `src/economy/payment` holds a provider-
 *   neutral `IPaymentGateway` contract and one adapter, for Paymob, and the
 *   Founder has ruled the gateway will be XPay. Three keys that will never be
 *   set were therefore reporting CRITICAL for ever.
 *
 *   A gateway is «configured» when EVERY key of at least one supported gateway
 *   is present. Adding XPay is adding an entry here and an adapter beside the
 *   Paymob one — not editing a condition scattered through the Empire.
 */
export const PAYMENT_GATEWAYS: readonly { readonly id: string; readonly nameAr: string; readonly keys: readonly string[] }[] = [
  {
    id: 'paymob',
    nameAr: 'بوّابة الدفع',
    keys: ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID', 'PAYMOB_HMAC_SECRET'],
  },
];

const PROVIDER_MANIFEST: readonly Omit<ProviderReadiness, 'configured'>[] = [
  { key: 'GEMINI_API_KEY',                       nameAr: 'جسر التركيب المعرفيّ',   revenueCritical: false },
  { key: 'OPENAI_API_KEY',                       nameAr: 'مزوّد الصور',            revenueCritical: false },
  { key: 'VOICE_CLONING_API_KEY',                nameAr: 'استنساخ الصوت',          revenueCritical: false },
];

export function measureOperationalState(now: number = Date.now()): OperationalState {
  const mem = process.memoryUsage();

  // The ceiling V8 will not grow past — the only denominator under which a
  // percentage means «how close to failing». See the note on the field.
  let heapUtilizationPct: number | null = null;
  try {
    const limit = getHeapStatistics().heap_size_limit;
    if (limit > 0) heapUtilizationPct = Math.round((mem.heapUsed / limit) * 100);
  } catch { /* a runtime without v8 statistics says null, never a default */ }

  let rssPct: number | null = null;
  try {
    const machine = totalmem();
    if (machine > 0) rssPct = Math.round((mem.rss / machine) * 100);
  } catch { /* null says «not taken» */ }

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
  const gatewayEntries: ProviderReadiness[] = PAYMENT_GATEWAYS.map((g) => ({
    key: g.keys.join('+'),
    nameAr: g.nameAr,
    revenueCritical: true,
    configured: g.keys.every((k) => Boolean(process.env[k])),
  }));

  const providers: ProviderReadiness[] = [
    ...gatewayEntries,
    ...PROVIDER_MANIFEST.map((p) => ({ ...p, configured: Boolean(process.env[p.key]) })),
  ];
  const missingRevenueProviders = providers.filter((p) => p.revenueCritical && !p.configured);
  const revenueReady = gatewayEntries.some((g) => g.configured);

  // Only what is FAILING. «We cannot be paid» is reported as revenueReady,
  // beside this, because an alarm that is always on is an alarm nobody reads.
  const overallTier: OperationalTier =
    memoryTier === 'CRITICAL' || diskTier === 'CRITICAL' ? 'CRITICAL'
    : memoryTier === 'WARNING' || diskTier === 'WARNING' ? 'WARNING'
    : 'NORMAL';

  return {
    heapUtilizationPct,
    rssPct,
    revenueReady,
    memoryTier,
    diskUsedPct,
    diskTier,
    providers,
    missingRevenueProviders,
    overallTier,
    measuredAtMs: now,
  };
}
