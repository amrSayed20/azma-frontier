/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION — The Constitutional Context Flow
 * Construction Phase III
 *
 * Carries signals related to the Creator's journey context — which
 * chamber or organ context is presently active. Filters on relatedEvent
 * being one of the inherited journey-context Constitutional Events
 * (src/sovereign-identity, SIO-009) — introduces no new event vocabulary.
 */

import { observeAll } from '../sovereign-nervous-system';
import type { SignalListener, ConstitutionalEvent } from '../sovereign-nervous-system';

const JOURNEY_CONTEXT_EVENTS: readonly ConstitutionalEvent[] = [
  'Creator Arrived',
  'Creator Entered Chamber',
  'Creator Leaving',
];

export function observeContextFlow(listener: SignalListener): () => void {
  return observeAll((signal) => {
    if (signal.relatedEvent && JOURNEY_CONTEXT_EVENTS.includes(signal.relatedEvent)) {
      listener(signal);
    }
  });
}
