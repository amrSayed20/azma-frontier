/**
 * AZMA OS — THE CREATOR PRESENCE
 * The Welcome Composer
 * Registry Entry III — The Creator Welcome Engine
 *
 * Faithfully receives the Creator exactly as they arrive. Every field of
 * a CreatorPresence traces directly to what was actually supplied —
 * `raw`, `method`, and `context` are carried forward unmodified; only
 * `enteredAt` is generated here, stamping the real moment of reception,
 * never a Creator-supplied value. Nothing is interpreted, transformed,
 * judged, or classified (Ruling II/IV).
 */

import type { ChamberContext, InputMethod } from '../core/tongue';
import type { CreatorPresence } from './types';

let presenceSequence = 0;

export function receiveCreatorPresence(raw: string, method: InputMethod, context: ChamberContext): CreatorPresence {
  presenceSequence += 1;
  return {
    presenceId: `creator-presence-${context}-${presenceSequence}`,
    raw,
    method,
    context,
    enteredAt: Date.now(),
  };
}
