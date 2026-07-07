/**
 * AZMA OS — Tongue Constitution (ATC) V1.1
 * Article XVII — Continuous Consciousness
 *
 * Changing Chambers must never feel like changing conversations.
 * The Citizen must always feel: "The Empire remembers exactly where we were."
 *
 * Context flows naturally between all chambers.
 * No artificial restarts. No repeated greetings. No repeated onboarding.
 * Only one continuous conversation.
 *
 * Uses sessionStorage — the thread lives for the duration of the session.
 * The profile (memory.ts) persists across sessions. The thread does not.
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import type { ChamberContext } from './constitution';

const SESSION_THREAD_KEY = 'azma-tongue-thread';

// ── MomentumPoint — defined here because ConversationThread owns them ──────
// Article XX — The Tongue Never Ends the Journey.
// Every conversation either opens a better direction,
// reveals a stronger possibility, or prepares the next meaningful step.

export type MomentumType =
  | 'better-direction'      // a direction not yet considered
  | 'stronger-possibility'  // a path that improves the current trajectory
  | 'next-step';            // the concrete next meaningful action

export interface MomentumPoint {
  readonly id:          string;
  readonly type:        MomentumType;
  readonly description: string;          // internal constitutional description — never verbatim to citizen
  readonly chamberId:   ChamberContext;  // where this momentum lives
  readonly createdAt:   number;
  readonly expiresAt:   number | null;   // null = permanent until explicitly consumed
  consumed:             boolean;         // has this momentum been acted upon?
}

// ── Chamber Visit Record ──────────────────────────────────────────────────

export interface ChamberVisit {
  context:    ChamberContext;
  enteredAt:  number;
  exitedAt:   number | null;
  turnCount:  number;            // how many exchanges happened in this chamber
}

// ── Conversation Thread ───────────────────────────────────────────────────
// The living record of the continuous conversation.
// One thread per session. Chamber transitions do not break it.

export interface ConversationThread {
  sessionId:       string;
  startedAt:       number;
  lastActiveAt:    number;
  lastContext:     ChamberContext;
  momentumPoints:  MomentumPoint[];   // open directions from all prior exchanges
  chamberHistory:  ChamberVisit[];    // which chambers have been visited
  turnCount:       number;            // total turns across all chambers
  activeTopics:    string[];          // constitutional topic labels (not content)
}

// ── Default Thread ────────────────────────────────────────────────────────

function generateSessionId(): string {
  return `azma-session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function defaultThread(context: ChamberContext = 'universal'): ConversationThread {
  return {
    sessionId:      generateSessionId(),
    startedAt:      Date.now(),
    lastActiveAt:   Date.now(),
    lastContext:    context,
    momentumPoints: [],
    chamberHistory: [{
      context,
      enteredAt:  Date.now(),
      exitedAt:   null,
      turnCount:  0,
    }],
    turnCount:    0,
    activeTopics: [],
  };
}

// ── Thread Storage ────────────────────────────────────────────────────────

export function getThread(): ConversationThread {
  if (typeof window === 'undefined') return defaultThread();
  try {
    const raw = sessionStorage.getItem(SESSION_THREAD_KEY);
    if (!raw) return defaultThread();
    const parsed = JSON.parse(raw) as ConversationThread;
    // Guard against stale threads (>4 hours old = new session)
    const sessionMaxMs = 4 * 60 * 60 * 1000;
    if (Date.now() - parsed.startedAt > sessionMaxMs) return defaultThread();
    return parsed;
  } catch {
    return defaultThread();
  }
}

export function updateThread(patch: Partial<ConversationThread>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getThread();
    sessionStorage.setItem(SESSION_THREAD_KEY, JSON.stringify({
      ...current,
      ...patch,
      lastActiveAt: Date.now(),
    }));
  } catch {
    /* sessionStorage unavailable — continuity continues without persistence */
  }
}

export function clearThread(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_THREAD_KEY);
  } catch {
    /* unavailable */
  }
}

// ── Article XVII — Chamber Transitions ───────────────────────────────────
// When the citizen changes chambers, the thread continues.
// The new chamber receives context about what was happening.

export function recordChamberTransition(
  from: ChamberContext,
  to:   ChamberContext,
): void {
  const thread = getThread();
  const now    = Date.now();

  // Close the current chamber visit
  const updatedHistory: ChamberVisit[] = thread.chamberHistory.map(visit =>
    visit.context === from && visit.exitedAt === null
      ? { ...visit, exitedAt: now }
      : visit,
  );

  // Open a new chamber visit
  updatedHistory.push({
    context:   to,
    enteredAt: now,
    exitedAt:  null,
    turnCount: 0,
  });

  updateThread({
    lastContext:    to,
    chamberHistory: updatedHistory,
  });
}

/**
 * Returns a constitutional continuity signal for the new chamber.
 * This signals the Core that this is not a new conversation —
 * it is a continuation. The Core reads this to avoid resetting context.
 *
 * Returns null if this is the first chamber in the session.
 */
export function getContinuityContext(to: ChamberContext): {
  isNew:        boolean;
  priorChamber: ChamberContext | null;
  priorTurns:   number;
  hasOpenMomentum: boolean;
} {
  const thread = getThread();

  if (thread.chamberHistory.length <= 1) {
    return { isNew: true, priorChamber: null, priorTurns: 0, hasOpenMomentum: false };
  }

  const priorVisits  = thread.chamberHistory.filter(v => v.context !== to && v.exitedAt !== null);
  const lastPrior    = priorVisits[priorVisits.length - 1] ?? null;
  const openMomentum = thread.momentumPoints.some(m => !m.consumed && m.chamberId === to);

  return {
    isNew:           false,
    priorChamber:    lastPrior?.context ?? null,
    priorTurns:      thread.turnCount,
    hasOpenMomentum: openMomentum,
  };
}

// ── Turn Recording ────────────────────────────────────────────────────────

export function recordTurn(context: ChamberContext, topic?: string): void {
  const thread = getThread();

  // Increment the active chamber's turn count
  const updatedHistory = thread.chamberHistory.map(visit =>
    visit.context === context && visit.exitedAt === null
      ? { ...visit, turnCount: visit.turnCount + 1 }
      : visit,
  );

  const updatedTopics = topic
    ? [...new Set([...thread.activeTopics, topic])].slice(-10)  // keep last 10 topics
    : thread.activeTopics;

  updateThread({
    chamberHistory: updatedHistory,
    turnCount:      thread.turnCount + 1,
    activeTopics:   updatedTopics,
  });
}

// ── Momentum Integration ──────────────────────────────────────────────────

export function addMomentumToThread(point: MomentumPoint): void {
  const thread = getThread();
  // Expire old momentum before adding new
  const now     = Date.now();
  const alive   = thread.momentumPoints.filter(m =>
    !m.consumed && (m.expiresAt === null || m.expiresAt > now),
  );
  updateThread({ momentumPoints: [...alive, point] });
}

export function consumeMomentum(id: string): void {
  const thread  = getThread();
  const updated = thread.momentumPoints.map(m =>
    m.id === id ? { ...m, consumed: true } : m,
  );
  updateThread({ momentumPoints: updated });
}

export function getActiveMomentumForContext(context: ChamberContext): MomentumPoint[] {
  const thread = getThread();
  const now    = Date.now();
  return thread.momentumPoints.filter(
    m => !m.consumed && m.chamberId === context && (m.expiresAt === null || m.expiresAt > now),
  );
}
