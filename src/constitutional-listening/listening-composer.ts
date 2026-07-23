/**
 * AZMA OS — FAITHFUL CONSTITUTIONAL LISTENING
 * The Listening Composer
 * Registry Entry IV — The Engine of Faithful Constitutional Listening
 *
 * Faithfully prepares TongueIntent from THE CREATOR PRESENCE. raw,
 * method, and context are carried forward unmodified; timestamp is
 * carried forward from presence.enteredAt, never regenerated.
 *
 * priorTurns REMAINS CONSTITUTIONALLY UNKNOWN TO THIS ENGINE — this
 * module never reads Conversation Continuity and never computes a
 * turn count ("The Law of Pure Constitutional Listening"). Its true
 * constitutional meaning ("Unknown is a Constitutional State, not a
 * programming value," per "The Law of Constitutional Unknown") cannot
 * yet be represented directly: TongueIntent's own shared Constitutional
 * Contract (src/core/tongue/constitution.ts) types priorTurns as
 * `number`, and "The Law of Constitutional Stability" ruled that
 * evolving that shared contract is its own future Constitutional
 * Evolution — requiring its own Discovery, Review, and Certification —
 * not something this Package may do as an Integrity Correction.
 *
 * THE VALUE BELOW IS THEREFORE A TEMPORARY COMPATIBILITY MEASURE, NOT
 * A CONSTITUTIONAL CLAIM: `0` is stored only because TongueIntent's
 * existing type requires some `number`; it does not mean "the Creator
 * arrived with zero prior turns," and it must never be read as
 * knowledge this Engine does not have. It is authorized for the First
 * Constitutional Launch on that explicit understanding. Enrichment into
 * a real, known priorTurns value — and any true constitutional
 * representation of Unknown — belongs to a separate, future
 * Constitutional Evolution (e.g. of Conversation Continuity, which
 * already faithfully knows a real turn count today).
 */

import type { CreatorPresence } from '../creator-presence';
import type { TongueIntent } from '../core/tongue';

/**
 * A temporary compatibility measure only — not a Constitutional meaning
 * of Unknown. Required solely because TongueIntent's own shared
 * Constitutional Contract types priorTurns as `number`. Never to be
 * read as "zero prior turns were observed."
 */
const PRIOR_TURNS_TEMPORARY_COMPATIBILITY_PLACEHOLDER = 0;

export function prepareTongueIntent(presence: CreatorPresence): TongueIntent {
  return {
    raw: presence.raw,
    method: presence.method,
    context: presence.context,
    timestamp: presence.enteredAt,
    priorTurns: PRIOR_TURNS_TEMPORARY_COMPATIBILITY_PLACEHOLDER,
  };
}
