/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION — The Constitutional State Flow
 * Construction Phase III
 *
 * A thin, filtered lens over the Nervous System's own Perception Bus —
 * not a second transport. observeSignalType() already exists (Phase II);
 * this simply names the "State"-filtered view as its own discoverable
 * export, per this phase's explicit deliverable list.
 */

import { observeSignalType } from '../sovereign-nervous-system';
import type { SignalListener } from '../sovereign-nervous-system';

export function observeStateFlow(listener: SignalListener): () => void {
  return observeSignalType('State', listener);
}
