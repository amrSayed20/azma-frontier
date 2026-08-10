/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION (THE IMPERIAL LISTENER)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Campaign. See ENGINEERING_REVIEW.ts for what this module
 * built and deliberately did not build (most notably: no UI, no
 * rendering, no notifications — data only; not auto-started anywhere).
 */

export type {
  RecipientId,
  RecipientDescriptor,
  ReceivedExpression,
  DeliveryResult,
  ConstitutionalReceptionCertification,
} from './types';

export { CONSTITUTIONAL_RECEPTION_QUESTIONS } from './reception-registry';
export { CONSTITUTIONAL_RECIPIENTS, isAuthorizedRecipient } from './recipient-registry';

export {
  beginConstitutionalReception,
  endConstitutionalReception,
  isReceiving,
  getReceptionQueue,
  getReceptionQueueForOrgan,
  resetReceptionQueue,
} from './reception-queue';

export { ATTENTION_THRESHOLD, organDeservesAttention } from './attention-layer';
export { prioritizeReceivedExpressions } from './priority-receiver';
export { deliverToRecipient } from './delivery';

export {
  verifyEveryReceptionOriginatesFromExpressionLayer,
  verifyNoOrganCommunicatesDirectlyWithRecipient,
  verifyReceptionPreservesDignity,
  verifyConstitutionalPriorityRespected,
  verifyUnauthorizedReceptionNeverOccurs,
} from './certification';

export { getConstitutionalReceptionCertificationReport } from './queries';

export { ReceptionAwakening } from './ReceptionAwakening';
