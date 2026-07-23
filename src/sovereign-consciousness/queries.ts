/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * Read-only Query Layer
 * Construction Phase VII
 *
 * A single, whole-Body view over all 6 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyContinuousConditionRecognition,
  verifyAwarenessRemainsReadOnly,
  verifyObservesEveryParticipatingOrgan,
  verifyHarmonyCanBeRecognized,
  verifyImbalanceCanBeRecognized,
  verifyNoAuthorityExercised,
} from './certification';
import type { ConstitutionalAwarenessCertification } from './types';

export function getConstitutionalAwarenessCertificationReport(): readonly ConstitutionalAwarenessCertification[] {
  return [
    verifyContinuousConditionRecognition(),
    verifyAwarenessRemainsReadOnly(),
    verifyObservesEveryParticipatingOrgan(),
    verifyHarmonyCanBeRecognized(),
    verifyImbalanceCanBeRecognized(),
    verifyNoAuthorityExercised(),
  ];
}
