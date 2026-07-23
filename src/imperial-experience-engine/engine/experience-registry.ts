/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Experience Registry
 *
 * The single source of truth for which Experience Pipelines exist.
 *
 * REGISTRATION GATEWAY, PACKAGE I (2026-07-23): the second real entry —
 * added, per the Engine's own Extension Rules, exactly as the first
 * one's registration route promised: "a new Experience is added here,
 * not invented as a special case elsewhere." Crossing from '/' to
 * '/signup' is one continuous ceremonial passage, not two independent
 * pages that happen to share a palette — Signup gets its own Pipeline
 * on the same shared Lifecycle rather than a bespoke local timer.
 */

import type { ExperienceDefinition } from './types';

export const EXPERIENCE_REGISTRY: readonly ExperienceDefinition[] = [
  {
    id: 'arrival',
    name: 'The Arrival Experience',
    mountedAt: ['/'],
    description:
      'The ceremonial threshold into the AZMA Empire — the Palace, the Gates, the first emotional impression. ' +
      'Exclusive to the first-entry route; must never appear as a chamber background.',
  },
  {
    id: 'signup',
    name: 'The Registration Gateway',
    mountedAt: ['/signup'],
    description:
      'The second half of the one mandatory step (Welcome + Registration) — the same Empire the Creator ' +
      'just met at Arrival, continued rather than restarted. Exclusive to the registration route; must never ' +
      'appear as a chamber background.',
  },
  {
    id: 'login',
    name: 'The Recognition Gateway',
    mountedAt: ['/login'],
    description:
      'For a Creator the Empire already knows — a constitutionally distinct objective from Signup: ' +
      'recognition instead of birth, continuity instead of introduction, belonging instead of arrival. ' +
      'Exclusive to the login route; must never appear as a chamber background.',
  },
  {
    id: 'qiyamah-chamber',
    name: 'The Qiyamah Chamber Experience',
    mountedAt: ['/qiyamah-chamber'],
    description:
      'The first Chamber, not Gate, to join IXE — a real generation backend already exists here ' +
      '(src/qiyamah-generation/); this Pipeline adds only the invisible runtime the Chamber lacked ' +
      '(lifecycle reveal, Presence Engine, Imperial Voice) without touching its ratified crimson identity ' +
      'or its actual generation UI. Exclusive to the Qiyamah route.',
  },
  {
    id: 'ras-amr',
    name: 'The Ras Al Amr Experience',
    mountedAt: ['/ras-amr'],
    description:
      'The second Chamber to join IXE, built the same additive way as Qiyamah — the Chamber\'s own local-state ' +
      '"director console" UI and its separate, already-certified Living Runtime Core (src/chambers/ras-al-amr/) ' +
      'are untouched; this Pipeline adds only lifecycle reveal, Presence Engine, and Imperial Voice. Real ' +
      'production capability is deferred to a later, separate package per Council directive. Exclusive to the ' +
      'Ras Al Amr route.',
  },
];
