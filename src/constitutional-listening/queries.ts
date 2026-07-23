/**
 * AZMA OS — FAITHFUL CONSTITUTIONAL LISTENING
 * Read-only Query Layer
 * Registry Entry IV — The Engine of Faithful Constitutional Listening
 *
 * A single, whole-picture view over this Engine's own certification
 * checks for one Creator Presence — used for Council review, never for
 * decision-making.
 */

import {
  verifyFaithfullyPreservesCreatorPresenceFields,
  verifyNeverModifiesCreatorPresence,
  verifyNeverRequiresContinuityOrPriorTurns,
  verifyPlaceholderIsDocumentedAsTemporaryNotConstitutional,
  verifyProducesOnlyAFaithfulTongueIntent,
  verifyNoAuthorityExercised,
} from './certification';
import type { CreatorPresence } from '../creator-presence';
import type { ConstitutionalListeningCertification } from './types';

export function getConstitutionalListeningCertificationReport(
  presence: CreatorPresence,
): readonly ConstitutionalListeningCertification[] {
  return [
    verifyFaithfullyPreservesCreatorPresenceFields(presence),
    verifyNeverModifiesCreatorPresence(presence),
    verifyNeverRequiresContinuityOrPriorTurns(presence),
    verifyPlaceholderIsDocumentedAsTemporaryNotConstitutional(presence),
    verifyProducesOnlyAFaithfulTongueIntent(presence),
    verifyNoAuthorityExercised(presence),
  ];
}
