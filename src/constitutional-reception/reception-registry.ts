/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * The Constitutional Reception Registry
 * Construction Campaign
 *
 * A pure, declarative vocabulary: the 4 questions this phase's own
 * Mission names ("Who may receive. When reception occurs. What deserves
 * attention. What remains silent."), each mapped to the real mechanism
 * that answers it.
 */

export const CONSTITUTIONAL_RECEPTION_QUESTIONS = [
  { question: 'Who may receive.', answeredBy: 'recipient-registry.ts — the declared, authorized RecipientId values.' },
  { question: 'When reception occurs.', answeredBy: 'reception-queue.ts — a live subscription reacting to the same Nervous System Bus every other organ already observes.' },
  { question: 'What deserves attention.', answeredBy: 'attention-layer.ts — a mechanical, non-judgmental corroboration threshold.' },
  { question: 'What remains silent.', answeredBy: 'attention-layer.ts — everything below that same threshold, queued but never flagged.' },
] as const;
