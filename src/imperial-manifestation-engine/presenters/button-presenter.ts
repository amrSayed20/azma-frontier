/**
 * AZMA OS — THE IMPERIAL MANIFESTATION ENGINE (IME)
 * Button Presenter
 *
 * Shapes a Manifestation Plan for the 'button' Presentation Family. Adds
 * no label, no style, no href — that rendering detail belongs to the
 * Presentation Consumer (Button Engine), never to IME itself. Today,
 * every constitutional capability in the Plan happens to be presented as
 * a button; this presenter does not assume that remains true once a
 * second Presentation Family (Field, Panel, ...) exists.
 */

import type { ManifestationPlan } from '@/src/manifestation-plan';
import type { PresentationSpec } from '../types';

export function presentButtons(plan: ManifestationPlan): readonly PresentationSpec[] {
  return plan.availableCapabilities.map((capability) => ({ id: capability.id }));
}
