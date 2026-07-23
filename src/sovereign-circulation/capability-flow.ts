/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION — The Constitutional Capability Flow
 * Construction Phase III
 *
 * Ready infrastructure for the Sovereign Capability Diwan, which SCD-004
 * confirmed has zero real consumers today — this flow does not fabricate
 * activity that does not exist. It filters for signals originating from
 * the Diwan organ or carrying "Purpose" (the closest existing Signal
 * Type to "capability"), so that whenever the Diwan is later connected to
 * a real consumer, its signals are already routable without a schema
 * change here.
 */

import { observeAll } from '../sovereign-nervous-system';
import type { SignalListener } from '../sovereign-nervous-system';

export function observeCapabilityFlow(listener: SignalListener): () => void {
  return observeAll((signal) => {
    if (signal.origin === 'sovereign-capability-diwan' || signal.signalType === 'Purpose') {
      listener(signal);
    }
  });
}
