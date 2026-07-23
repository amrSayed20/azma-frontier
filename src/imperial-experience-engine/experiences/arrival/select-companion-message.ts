import type { ExperiencePhase } from '../../engine';
import type { PresenceState } from '@/src/visitor-presence';

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Arrival Experience — Companion Message Selection
 *
 * PACKAGE V — IMPERIAL COMPANIONSHIP LAYER (2026-07-21). A pure
 * function, not a system: it reads three signals that already exist
 * (IXE's own ExperiencePhase, Package I's PresenceState, Package IV's
 * isReturning) and returns which dictionary key the companion should
 * speak — nothing here computes, tracks, or persists anything of its
 * own. Kept separate from ArrivalExperience.tsx's JSX specifically so
 * the selection policy reads as one deliberate, testable decision
 * rather than several ad hoc ternaries scattered through render — the
 * standing rule is that raw signals must not become presentation logic
 * directly; this is the one place they are translated into a decision,
 * and callers only ever see the result.
 *
 * Priority, most to least dominant: the visitor having just chosen to
 * cross outranks everything else (a mid-departure "welcome back" would
 * read as not paying attention); idle presence outranks the returning/
 * first-time distinction (reassuring someone who has paused matters
 * more right now than which greeting they'd otherwise get); returning/
 * first-time is the quiet baseline otherwise.
 */
export type CompanionMessageKey =
  | 'gate.companionMessage'
  | 'gate.companionMessageReturning'
  | 'gate.companionMessageIdle'
  | 'gate.companionMessageExiting';

export interface SelectCompanionMessageInput {
  readonly phase: ExperiencePhase;
  readonly presence: PresenceState;
  readonly isReturning: boolean;
}

export function selectCompanionMessageKey({ phase, presence, isReturning }: SelectCompanionMessageInput): CompanionMessageKey {
  if (phase === 'exiting') return 'gate.companionMessageExiting';
  if (presence === 'idle') return 'gate.companionMessageIdle';
  return isReturning ? 'gate.companionMessageReturning' : 'gate.companionMessage';
}
