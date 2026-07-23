/**
 * AZMA OS — THE IMPERIAL MANIFESTATION ENGINE (IME)
 * Presentation Family Registry
 *
 * Maps each Presentation Family to its own Presenter. Adding a future
 * family (Field, Panel, Card, Section, Navigation, Timeline, ...) means
 * adding one entry here and one new presenter module — never a change to
 * an existing Presenter or to the Imperial Awareness Engine.
 */

import type { ManifestationPlan } from '@/src/manifestation-plan';
import type { PresentationFamily, PresentationSpec } from './types';
import { presentButtons } from './presenters/button-presenter';

export const PRESENTER_REGISTRY: Readonly<Record<PresentationFamily, (plan: ManifestationPlan) => readonly PresentationSpec[]>> = {
  button: presentButtons,
};
