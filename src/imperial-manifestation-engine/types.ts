/**
 * AZMA OS — THE IMPERIAL MANIFESTATION ENGINE (IME)
 * Type Definitions
 */

import type { ConstitutionalCapabilityId } from '@/src/manifestation-plan';

/** Open by design — extended one entry at a time as a real Presentation Consumer needs it. */
export type PresentationFamily = 'button';

export interface PresentationSpec {
  readonly id: ConstitutionalCapabilityId;
}
