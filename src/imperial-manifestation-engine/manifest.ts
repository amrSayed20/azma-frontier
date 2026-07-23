/**
 * AZMA OS — THE IMPERIAL MANIFESTATION ENGINE (IME)
 * The Coordinator
 *
 * The sole constitutional presentation coordinator. Takes a
 * Manifestation Plan (WHAT should exist) and a Presentation Family, and
 * returns that family's own shape (a step toward HOW it appears — the
 * final label/style is still each Presentation Consumer's own
 * responsibility, not IME's).
 */

import type { ManifestationPlan } from '@/src/manifestation-plan';
import type { PresentationFamily, PresentationSpec } from './types';
import { PRESENTER_REGISTRY } from './presenter-registry';

export function manifest(plan: ManifestationPlan, family: PresentationFamily): readonly PresentationSpec[] {
  return PRESENTER_REGISTRY[family](plan);
}
