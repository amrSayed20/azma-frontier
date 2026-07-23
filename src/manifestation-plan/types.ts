/**
 * AZMA OS — THE MANIFESTATION PLAN
 * Neutral Runtime Contract
 *
 * Belongs to neither the Imperial Awareness Engine nor the Imperial
 * Manifestation Engine — it is the constitutional handoff between them.
 * Contains WHAT should exist. Never contains HOW it is rendered: no
 * label, no style, no component shape. Those belong to Presentation
 * Consumers (Button Engine and its future siblings), consumed only
 * through the Imperial Manifestation Engine.
 */

export type ConstitutionalCapabilityId =
  | 'enter-as-member'
  | 'enter-as-explorer'
  | 'enter-chamber'
  | 'sign-in-to-subscribe'
  | 'subscribe'
  | 'founder-no-subscription-needed'
  | 'sign-in-to-generate'
  | 'subscribe-to-generate'
  | 'retry-generation'
  | 'generate-another';

export interface AvailableCapability {
  readonly id: ConstitutionalCapabilityId;
}

export interface ManifestationPlan {
  readonly availableCapabilities: readonly AvailableCapability[];
}
