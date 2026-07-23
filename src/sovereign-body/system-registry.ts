/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional System Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * Authority: "The Constitutional Anatomy of the Living Empire," Chapter III,
 * Article III ("The Systems of the Sovereign Body") and Articles IV-IX
 * (one per system). Six systems, verbatim, in the order given. Each
 * system occupies the region of the same conceptual name (Ch. III,
 * Article II: "A Constitutional System is a living assembly of sovereign
 * organs").
 */

import type { ConstitutionalSystem } from './types';

export const CONSTITUTIONAL_SYSTEMS: readonly ConstitutionalSystem[] = [
  {
    id: 'system-of-life',
    name: 'The System of Life',
    purpose:
      'Preserves constitutional continuity. Its responsibility is not execution — its responsibility is sustaining Life. Its first constitutional organ shall eventually become Al-Wateen (Anatomy Ch. III, Article IV).',
    regionId: 'region-of-life',
    principalOrganIds: ['al-wateen'],
  },
  {
    id: 'system-of-consciousness',
    name: 'The System of Consciousness',
    purpose:
      'Allows the Empire to recognize itself — observation, awareness, presence, constitutional perception. This system awakens before judgment (Anatomy Ch. III, Article V).',
    regionId: 'region-of-consciousness',
    principalOrganIds: ['global-ui-runtime'],
  },
  {
    id: 'system-of-identity',
    name: 'The System of Identity',
    purpose:
      "Expresses the Empire — its Face, Voice, Tongue, Motion, Light, Typography, Cinematic Presence, Sound. Everything experienced by the Creator belongs here (Anatomy Ch. III, Article VI).",
    regionId: 'region-of-identity',
    principalOrganIds: ['sovereign-identity-layer', 'sovereign-tongue'],
  },
  {
    id: 'system-of-intelligence',
    name: 'The System of Intelligence',
    purpose:
      'Understands, reasons, plans, remembers, interprets, and protects constitutional wisdom. The Sovereign Core shall eventually become the principal organ of this system (Anatomy Ch. III, Article VII).',
    regionId: 'region-of-intelligence',
    principalOrganIds: ['sovereign-core', 'sovereign-memory'],
  },
  {
    id: 'system-of-creation',
    name: 'The System of Creation',
    purpose:
      'Transforms intention into reality. Every sovereign chamber belongs here — ideas become projects, projects become production, production becomes value (Anatomy Ch. III, Article VIII).',
    regionId: 'region-of-creation',
    principalOrganIds: ['ras-al-amr', 'makman-al-ghayah', 'qiyamah-chamber', 'hujjah-al-damighah', 'sovereign-vault-palace'],
  },
  {
    id: 'system-of-governance',
    name: 'The System of Governance',
    purpose:
      'Preserves constitutional order — authority, capability, mission, policy, boundaries, relationships, constitutional law. Without Governance, Life loses order (Anatomy Ch. III, Article IX).',
    regionId: 'region-of-governance',
    principalOrganIds: ['sovereign-capability-diwan'],
  },
] as const;
