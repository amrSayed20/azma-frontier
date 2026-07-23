/**
 * AZMA OS — THE FIRST CONSTITUTIONAL MOTION
 * The Motion Orchestrator
 *
 * Calls each of the four certified Engines exactly once, in their
 * certified dependency order, using only their existing public exports.
 * Performs no interpretation, judgment, composition, filtering, or
 * transformation of any kind — every value produced is exactly what its
 * own certified Engine already returns.
 */

import { receiveCreatorPresence } from '../creator-presence';
import { prepareTongueIntent } from '../constitutional-listening';
import { composeImperialVoice } from '../imperial-voice';
import { composeManifestationForSubject } from '../constitutional-aggregation';
import type { InputMethod, ChamberContext } from '../core/tongue';
import type { FirstConstitutionalMotion } from './types';

export function establishFirstConstitutionalMotion(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
  subjectKey: string = context,
): FirstConstitutionalMotion {
  const presence = receiveCreatorPresence(raw, method, context);           // Registry Entry III
  const intent = prepareTongueIntent(presence);                            // Registry Entry IV
  const voice = composeImperialVoice(context, intent);                    // Registry Entry I
  const manifestation = composeManifestationForSubject(subjectKey);        // Registry Entry II

  return { presence, intent, voice, manifestation };
}
