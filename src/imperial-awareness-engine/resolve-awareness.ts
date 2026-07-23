/**
 * AZMA OS — THE IMPERIAL AWARENESS ENGINE (IAE)
 * The Resolver
 *
 * Decides what should become available, given real-time constitutional
 * context. Produces a Manifestation Plan — never a rendered shape.
 *
 * The only three workflow stages that exist today are handled by a
 * plain, explicit switch, exactly as the Button Engine's own resolver
 * did before this migration — deliberately not a generic rules engine.
 * Migrating this decision here does not invent new complexity; it only
 * relocates the same, unchanged decision under its new constitutional
 * owner.
 */

import type { ManifestationPlan } from '@/src/manifestation-plan';
import type { ConstitutionalCapabilityId } from '@/src/manifestation-plan';
import type { AwarenessContext } from './types';

function resolveCapabilityIds(context: AwarenessContext): readonly ConstitutionalCapabilityId[] {
  switch (context.workflowStage) {
    case 'gate':
      return context.creator.authenticated ? ['enter-chamber'] : ['enter-as-member', 'enter-as-explorer'];

    case 'subscribe':
      if (!context.creator.authenticated) return ['sign-in-to-subscribe'];
      if (context.creator.role === 'founder') return ['founder-no-subscription-needed'];
      return ['subscribe'];

    case 'chamber':
      switch (context.chamberState) {
        case 'unauthorized': return ['sign-in-to-generate'];
        case 'payment-required': return ['subscribe-to-generate'];
        case 'error': return ['retry-generation'];
        case 'complete': return ['generate-another'];
        default: return [];
      }
  }
}

export function resolveAwareness(context: AwarenessContext): ManifestationPlan {
  return {
    availableCapabilities: resolveCapabilityIds(context).map((id) => ({ id })),
  };
}
