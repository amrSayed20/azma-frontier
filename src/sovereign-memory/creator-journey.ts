/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Constitutional Creator Journey
 * Construction Phase VIII
 *
 * DISCLOSURE: unlike every other file in this module, Creator journeys
 * are not organ/signal-scoped — the only existing repository artifact
 * that already preserves a Creator's journey is the Sovereign Tongue's
 * own session-scoped Conversation Thread (src/core/tongue/continuity.ts,
 * Article XVII, sessionStorage-backed). This file is a read-only,
 * Memory-vocabulary-consistent lens over that existing data — it builds
 * no new store, no new interface (Out of Scope: "No Creator-facing
 * interface"), and does not alter continuity.ts's own behavior in any
 * way.
 */

import { getThread } from '../core/tongue';
import type { CreatorJourneySnapshot } from './types';

export function getCreatorJourney(): CreatorJourneySnapshot {
  return {
    thread: getThread(),
    source: 'src/core/tongue/continuity.ts (Article XVII) — session-scoped, sessionStorage-backed, unmodified by this phase.',
  };
}
