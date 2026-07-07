/**
 * AZMA OS — Citizen Memory Engine
 * Constitutional Amendment: The Chamber Remembers Who You Are.
 * Behavioral memory. Not data memory. Relationship memory.
 */

import type { DomainId, OutputFormat } from './evidence-utils';

// ── Memory Schema ─────────────────────────────────────────────────

export interface ThinkingStyle {
  prefersDetail:         number; // 0–1; 0 = brevity, 1 = depth
  challengesAssumptions: number; // 0–1
  prefersComparisons:    number; // 0–1; often requests historical/comparative
  prefersExamples:       number; // 0–1
}

export interface BehaviorPattern {
  usuallyExpandsInvestigations: boolean;
  prefersHistoricalComparisons: boolean;
  vaultSavesFrequently:         boolean;
  challengesFrequently:         number;   // raw count
  focusSignals:                 number;   // citizen typed quickly after companion — prefers quiet
}

export interface ObservedRhythm {
  hesitationEvents: number;   // typed >20 chars then deleted back to <5
  quickSubmitEvents: number;  // submitted within 8s of starting to type
  explorationEvents: number;  // changed domain ≥2 times before submitting
}

export type RhythmProfile = 'hesitant' | 'confident' | 'explorer' | 'balanced';

export interface CitizenMemory {
  schemaVersion:     number;
  totalSessions:     number;
  thinkingStyle:     ThinkingStyle;
  behavior:          BehaviorPattern;
  observedRhythm:    ObservedRhythm;
  domainUsage:       Partial<Record<DomainId, number>>;
  outputFormatScore: Partial<Record<OutputFormat, number>>;
  lastSession: {
    query:     string;
    domain:    DomainId;
    timestamp: number;
  } | null;
}

// ── Storage ───────────────────────────────────────────────────────

const STORAGE_KEY    = 'azma.citizen.memory';
const SCHEMA_VERSION = 1;

const DEFAULT_MEMORY: CitizenMemory = {
  schemaVersion:     SCHEMA_VERSION,
  totalSessions:     0,
  thinkingStyle: {
    prefersDetail:         0.5,
    challengesAssumptions: 0,
    prefersComparisons:    0,
    prefersExamples:       0,
  },
  behavior: {
    usuallyExpandsInvestigations: false,
    prefersHistoricalComparisons: false,
    vaultSavesFrequently:         false,
    challengesFrequently:         0,
    focusSignals:                 0,
  },
  observedRhythm: {
    hesitationEvents:  0,
    quickSubmitEvents: 0,
    explorationEvents: 0,
  },
  domainUsage:       {},
  outputFormatScore: {},
  lastSession:       null,
};

export function readMemory(): CitizenMemory {
  if (typeof window === 'undefined') return { ...DEFAULT_MEMORY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MEMORY };
    const parsed = JSON.parse(raw) as Partial<CitizenMemory>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return { ...DEFAULT_MEMORY };
    return {
      ...DEFAULT_MEMORY,
      ...parsed,
      thinkingStyle:   { ...DEFAULT_MEMORY.thinkingStyle,   ...(parsed.thinkingStyle   ?? {}) },
      behavior:        { ...DEFAULT_MEMORY.behavior,        ...(parsed.behavior        ?? {}) },
      observedRhythm:  { ...DEFAULT_MEMORY.observedRhythm,  ...(parsed.observedRhythm  ?? {}) },
    };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

function persistMemory(memory: CitizenMemory): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch { /* ignore */ }
}

// ── Session Commit ────────────────────────────────────────────────

export interface SessionUpdate {
  query:        string;
  domain:       DomainId;
  format:       OutputFormat;
  didExpand:    boolean;
  didSaveVault: boolean;
}

export function commitSession(update: SessionUpdate): CitizenMemory {
  const memory = readMemory();

  const domainUsage       = { ...memory.domainUsage };
  const outputFormatScore = { ...memory.outputFormatScore };
  domainUsage[update.domain]      = (domainUsage[update.domain]      ?? 0) + 1;
  outputFormatScore[update.format] = (outputFormatScore[update.format] ?? 0) + 1;

  const q = update.query;
  const historicalKw = ['تاريخ', 'تاريخية', 'قديم', 'حديث', 'مقارنة', 'سابق', 'عبر التاريخ'];
  const challengeKw  = ['لماذا', 'هل يمكن', 'هل صحيح', 'هل حقاً', 'أثبت', 'دحض'];
  const exampleKw    = ['مثال', 'أمثلة', 'كيف', 'حالة'];

  const isHistorical  = historicalKw.some((k) => q.includes(k));
  const isChallenging = challengeKw.some((k)  => q.includes(k));
  const isExamples    = exampleKw.some((k)    => q.includes(k));

  const detail = update.format === 'long'
    ? Math.min(1, memory.thinkingStyle.prefersDetail + 0.08)
    : update.format === 'short'
    ? Math.max(0, memory.thinkingStyle.prefersDetail - 0.05)
    : memory.thinkingStyle.prefersDetail;

  const next: CitizenMemory = {
    ...memory,
    totalSessions: memory.totalSessions + 1,
    domainUsage,
    outputFormatScore,
    thinkingStyle: {
      ...memory.thinkingStyle,
      prefersDetail: detail,
      prefersComparisons: isHistorical
        ? Math.min(1, memory.thinkingStyle.prefersComparisons + 0.12)
        : memory.thinkingStyle.prefersComparisons,
      challengesAssumptions: isChallenging
        ? Math.min(1, memory.thinkingStyle.challengesAssumptions + 0.10)
        : memory.thinkingStyle.challengesAssumptions,
      prefersExamples: isExamples
        ? Math.min(1, memory.thinkingStyle.prefersExamples + 0.10)
        : memory.thinkingStyle.prefersExamples,
    },
    behavior: {
      ...memory.behavior,
      usuallyExpandsInvestigations:
        update.didExpand || memory.behavior.usuallyExpandsInvestigations,
      vaultSavesFrequently:
        update.didSaveVault || memory.behavior.vaultSavesFrequently,
      prefersHistoricalComparisons:
        isHistorical || memory.behavior.prefersHistoricalComparisons,
      challengesFrequently: isChallenging
        ? memory.behavior.challengesFrequently + 1
        : memory.behavior.challengesFrequently,
    },
    lastSession: {
      query:     q,
      domain:    update.domain,
      timestamp: Date.now(),
    },
  };

  persistMemory(next);
  return next;
}

export function signalFocusMode(memory: CitizenMemory): CitizenMemory {
  const next: CitizenMemory = {
    ...memory,
    behavior: {
      ...memory.behavior,
      focusSignals: memory.behavior.focusSignals + 1,
    },
  };
  persistMemory(next);
  return next;
}

// ── Derived Preferences ────────────────────────────────────────────

export function getPreferredFormat(memory: CitizenMemory): OutputFormat | null {
  const entries = (Object.entries(memory.outputFormatScore) as [OutputFormat, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
}

export function getPreferredDomain(memory: CitizenMemory): DomainId | null {
  const entries = (Object.entries(memory.domainUsage) as [DomainId, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
}

export function isQuietMode(memory: CitizenMemory): boolean {
  return (
    memory.totalSessions >= 5 &&
    memory.behavior.focusSignals >= 3 &&
    memory.thinkingStyle.prefersDetail < 0.35
  );
}

// ── Return Greeting ────────────────────────────────────────────────

export function getReturnGreeting(memory: CitizenMemory, fallbacks: string[]): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;
  const last = memory.lastSession;

  if (!last || memory.totalSessions < 2) return pick(fallbacks);

  const hours   = (Date.now() - last.timestamp) / 3_600_000;
  const preview = last.query.slice(0, 38);

  if (hours < 2 && last.query) {
    return `تفكيرنا لم يتوقف — هل نكمل في "${preview}…"؟`;
  }

  if (hours < 12 && last.query) {
    return 'الحجرة كانت تفكر في غيابك.';
  }

  if (memory.behavior.challengesFrequently >= 3) {
    return 'ما الافتراض الذي تريد اختباره اليوم؟';
  }

  if (memory.behavior.usuallyExpandsInvestigations) {
    return 'أين توقف التفكير؟';
  }

  if (memory.thinkingStyle.prefersDetail >= 0.7) {
    return 'الحجرة جاهزة للعمق. ما القضية؟';
  }

  return pick(fallbacks);
}

// ── Adaptive Probing ───────────────────────────────────────────────

export function getAdaptiveProbing(memory: CitizenMemory, defaultPool: string[]): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;

  if (memory.behavior.challengesFrequently >= 2) {
    return pick([
      'هذا مألوف لأسلوبك — هل تريد تحدي هذه النتائج مباشرة؟',
      'كما تعودت — هل ثمة افتراض في هذه الأدلة تريد دحضه؟',
    ]);
  }

  if (memory.behavior.prefersHistoricalComparisons) {
    return 'هل تريد مقارنة هذه النتائج بسياق تاريخي مختلف؟';
  }

  if (memory.behavior.usuallyExpandsInvestigations) {
    return 'كما اعتدت — هل نوسّع هذا التحقيق؟';
  }

  if (memory.thinkingStyle.prefersExamples >= 0.3) {
    return 'هل تريد أمثلة تطبيقية على ما وجدناه؟';
  }

  return pick(defaultPool);
}

// ── Dynamic Timing ────────────────────────────────────────────────
// Scales delays with how deep the citizen thinks. 0.65x (brevity) to 1.35x (depth).
export function getDynamicDelay(memory: CitizenMemory, baseMs: number): number {
  const factor = 0.65 + memory.thinkingStyle.prefersDetail * 0.70;
  return Math.round(baseMs * factor);
}

// ── Relationship Callback ──────────────────────────────────────────
// Returns a meaningful companion observation about this citizen's pattern.
// Only fires once every 3 sessions after the 3rd session.
export function getRelationshipCallback(memory: CitizenMemory): string | null {
  if (memory.totalSessions < 3 || memory.totalSessions % 3 !== 0) return null;

  const picks: string[] = [];
  if (memory.behavior.challengesFrequently >= 2) {
    picks.push('لاحظت أنك دائماً تتحدى النتائج — هذا ما يجعل تحقيقاتك أعمق.');
  }
  if (memory.behavior.usuallyExpandsInvestigations) {
    picks.push('أنت نادراً ما تتوقف عند الإجابة الأولى.');
  }
  if (memory.thinkingStyle.prefersDetail >= 0.65) {
    picks.push('عقلك يميل للعمق. الحجرة تعرف ذلك.');
  }
  if (memory.behavior.prefersHistoricalComparisons) {
    picks.push('المقارنة التاريخية جزء من أسلوبك في التفكير.');
  }
  if (memory.behavior.vaultSavesFrequently) {
    picks.push('تحتفظ بالأدلة التي تهمك. الحجرة تلاحظ.');
  }
  if (picks.length === 0) return null;

  return picks[Math.floor(Math.random() * picks.length)] ?? null;
}

// ── Chamber Curiosity ──────────────────────────────────────────────
// Determines whether the chamber should ask a broadening question this session.
export function shouldExpressCuriosity(memory: CitizenMemory, confidenceScore: number): boolean {
  if (memory.totalSessions < 2) return false;
  const uncertaintyZone = confidenceScore >= 0.35 && confidenceScore <= 0.68;
  const challengeHabit  = memory.behavior.challengesFrequently >= 2;
  const periodicTrigger = memory.totalSessions > 4 && Math.random() < 0.30;
  return uncertaintyZone || challengeHabit || periodicTrigger;
}

// ── Rhythm Observation ────────────────────────────────────────────
// The chamber watches how the citizen interacts — never announcing, only adapting.

export function recordHesitation(memory: CitizenMemory): CitizenMemory {
  const next = {
    ...memory,
    observedRhythm: { ...memory.observedRhythm, hesitationEvents: memory.observedRhythm.hesitationEvents + 1 },
  };
  persistMemory(next);
  return next;
}

export function recordQuickSubmit(memory: CitizenMemory): CitizenMemory {
  const next = {
    ...memory,
    observedRhythm: { ...memory.observedRhythm, quickSubmitEvents: memory.observedRhythm.quickSubmitEvents + 1 },
  };
  persistMemory(next);
  return next;
}

export function recordExploration(memory: CitizenMemory): CitizenMemory {
  const next = {
    ...memory,
    observedRhythm: { ...memory.observedRhythm, explorationEvents: memory.observedRhythm.explorationEvents + 1 },
  };
  persistMemory(next);
  return next;
}

export function getRhythmProfile(memory: CitizenMemory): RhythmProfile {
  const r = memory.observedRhythm;
  const total = r.hesitationEvents + r.quickSubmitEvents + r.explorationEvents;
  if (total < 3) return 'balanced';
  const h = r.hesitationEvents  / total;
  const q = r.quickSubmitEvents / total;
  const e = r.explorationEvents / total;
  if (h >= 0.45) return 'hesitant';
  if (q >= 0.45) return 'confident';
  if (e >= 0.35) return 'explorer';
  return 'balanced';
}

export function getIdleDelay(memory: CitizenMemory): number {
  switch (getRhythmProfile(memory)) {
    case 'hesitant':  return 45_000; // patient; citizen needs thinking time
    case 'confident': return 22_000; // respects autonomy
    case 'explorer':  return 35_000; // space to explore
    default:          return 30_000;
  }
}

// ── Continuation Context ───────────────────────────────────────────

export function getContinuationContext(memory: CitizenMemory): {
  show:   boolean;
  query:  string;
  domain: DomainId | null;
} {
  const last = memory.lastSession;
  if (!last?.query || memory.totalSessions < 2) {
    return { show: false, query: '', domain: null };
  }
  const hours = (Date.now() - last.timestamp) / 3_600_000;
  return {
    show:   hours < 6,
    query:  last.query,
    domain: last.domain,
  };
}
