/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION — The Constitutional Health Flow
 * Construction Phase III
 */

import { observeSignalType } from '../sovereign-nervous-system';
import type { SignalListener } from '../sovereign-nervous-system';

export function observeHealthFlow(listener: SignalListener): () => void {
  return observeSignalType('Health', listener);
}
