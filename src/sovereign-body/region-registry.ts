/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Region Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * Authority: "The Constitutional Anatomy of the Living Empire," Chapter I,
 * Article III ("The Constitutional Regions") and Articles IV-IX (one per
 * region). Six regions, verbatim, in the order given.
 *
 * NAMING NOTE, disclosed rather than silently resolved: an earlier vision
 * document ("Part II — The Constitutional Structure of the Body") named
 * FOUR "Constitutional Domains" (Structural, Cognitive, Operational,
 * Experiential) using different names and a different count than these
 * six Regions. Anatomy Ch. I is the more specific, more recent document
 * that defines the exact term this Construction Package asks for
 * ("Constitutional Region Registry"), so it is used as authoritative
 * here — but the Domains/Regions discrepancy between the two vision
 * documents was not silently merged or discarded. See
 * SOVEREIGN_BODY_PHASE_I_ENGINEERING_REVIEW.ts.
 */

import type { ConstitutionalRegion } from './types';

export const CONSTITUTIONAL_REGIONS: readonly ConstitutionalRegion[] = [
  {
    id: 'region-of-consciousness',
    name: 'The Region of Consciousness',
    purpose:
      'Contains the constitutional organs responsible for awareness. Recognizes the condition of the Empire. Never executes, never governs — observes, understands, awakens constitutional perception.',
    correspondingSystemId: 'system-of-consciousness',
  },
  {
    id: 'region-of-life',
    name: 'The Region of Life',
    purpose:
      'Contains the constitutional organs responsible for sustaining constitutional continuity. Its purpose is not intelligence — its purpose is life. Al-Wateen resides here.',
    correspondingSystemId: 'system-of-life',
  },
  {
    id: 'region-of-identity',
    name: 'The Region of Identity',
    purpose:
      'Governs expression — the constitutional face of the Empire: its voice, visual language, cinematic presence, movement, light, sound, and transitions. Everything the Creator experiences belongs here.',
    correspondingSystemId: 'system-of-identity',
  },
  {
    id: 'region-of-intelligence',
    name: 'The Region of Intelligence',
    purpose:
      'Governs understanding — reasoning, decision, planning, memory, knowledge, constitutional interpretation. The Sovereign Core resides here.',
    correspondingSystemId: 'system-of-intelligence',
  },
  {
    id: 'region-of-creation',
    name: 'The Region of Creation',
    purpose:
      'Contains the sovereign chambers. Every chamber exists here. Ideas become work; work becomes creation; creation becomes value. The Creator lives primarily inside this region.',
    correspondingSystemId: 'system-of-creation',
  },
  {
    id: 'region-of-governance',
    name: 'The Region of Governance',
    purpose:
      'Preserves constitutional order — authority, relationships, boundaries, capability, policy, mission, direction. Without Governance, the organism loses order.',
    correspondingSystemId: 'system-of-governance',
  },
] as const;
