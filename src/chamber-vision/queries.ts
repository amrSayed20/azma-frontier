/**
 * AZMA OS — CHAMBER VISION
 * Query Helpers
 */

import type { ChamberId } from '@/src/chamber-identity';
import type { ImperialVisionDocument } from './types';
import { IMPERIAL_VISION_DOCUMENTS } from './vision-registry';

export function getVisionDocument(chamberId: ChamberId): ImperialVisionDocument {
  return IMPERIAL_VISION_DOCUMENTS[chamberId];
}

export function listVisionDocuments(): readonly ImperialVisionDocument[] {
  return Object.values(IMPERIAL_VISION_DOCUMENTS);
}
