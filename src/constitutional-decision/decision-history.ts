/**
 * AZMA OS — THE CONSTITUTIONAL DECISION HISTORY
 * Construction Campaign
 *
 * A dedicated, discoverable entry point onto the Decision Queue's own
 * append-only record — the History is simply that record, read in full
 * or filtered by verdict, never a second store. Decisions are never
 * modified once recorded (Constitutional Limits: "No modification of
 * Constitutional Intentions" — and by the same discipline, no
 * modification of Decisions either, since none of these functions ever
 * writes to the underlying array).
 */

import { getDecisionQueue } from './decision-queue';
import type { ConstitutionalDecision, ConstitutionalDecisionVerdict } from './types';

export function getFullDecisionHistory(): readonly ConstitutionalDecision[] {
  return getDecisionQueue();
}

export function getDecisionHistoryByVerdict(verdict: ConstitutionalDecisionVerdict): readonly ConstitutionalDecision[] {
  return getDecisionQueue().filter((decision) => decision.verdict === verdict);
}

export function getDecisionHistoryForOrgan(organId: string): readonly ConstitutionalDecision[] {
  return getDecisionQueue().filter((decision) => decision.organId === organId);
}
