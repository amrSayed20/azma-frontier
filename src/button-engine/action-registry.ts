/**
 * AZMA OS — THE BUTTON ENGINE
 * Constitutional Action Registry
 *
 * The single, platform-wide catalog of every constitutional action that
 * exists anywhere in the First Creator journey — replacing four
 * independent, slightly-different ad hoc copies of this same knowledge
 * previously hand-written into the Gate, /subscribe, and the Qiyamah
 * Chamber. Adding a new action anywhere in the Empire means adding one
 * entry here, never a new per-page conditional.
 */

import type { ActionDefinition, ConstitutionalActionId } from './types';

export const CONSTITUTIONAL_ACTIONS: Readonly<Record<ConstitutionalActionId, ActionDefinition>> = {
  'enter-as-member': { labelKey: 'gate.memberButton', href: '/login', kind: 'navigate' },
  'enter-as-explorer': { labelKey: 'gate.explorerButton', href: '/signup', kind: 'navigate' },
  'enter-chamber': { labelKey: 'gate.enterChamberButton', href: '/qiyamah-chamber', kind: 'navigate' },

  'sign-in-to-subscribe': { labelKey: 'subscribe.signInLink', href: '/login', kind: 'navigate' },
  subscribe: { labelKey: 'subscribe.submitIdle', kind: 'submit' },
  'founder-no-subscription-needed': { labelKey: 'subscribe.founderNotice', kind: 'informational' },

  'sign-in-to-generate': { labelKey: 'action.signInToGenerate', href: '/login', kind: 'navigate' },
  'subscribe-to-generate': { labelKey: 'action.subscribeToGenerate', href: '/subscribe', kind: 'navigate' },
  'retry-generation': { labelKey: 'action.retryGeneration', kind: 'submit' },
  'generate-another': { labelKey: 'action.generateAnother', kind: 'submit' },
};
