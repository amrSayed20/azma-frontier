/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION — The Constitutional Authority Flow
 * Construction Phase III
 */

import { observeSignalType } from '../sovereign-nervous-system';
import type { SignalListener } from '../sovereign-nervous-system';

export function observeAuthorityFlow(listener: SignalListener): () => void {
  return observeSignalType('Authority', listener);
}
