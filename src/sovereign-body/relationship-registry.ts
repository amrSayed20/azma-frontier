/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Relationship Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * Authority: "The Constitutional Anatomy of the Living Empire," Chapter V
 * ("The Constitutional Relationships").
 *
 * Every relationship below is drawn from real, already-confirmed
 * repository evidence — not invented to fill out the registry. Where no
 * evidenced relationship exists between two organs, none is recorded
 * (Ch. V, Article IV: "no unnecessary constitutional relationship shall
 * be created").
 */

import type { ConstitutionalRelationship } from './types';

export const CONSTITUTIONAL_RELATIONSHIPS: readonly ConstitutionalRelationship[] = [
  {
    fromOrganId: 'sovereign-identity-layer',
    toOrganId: 'sovereign-tongue',
    kind: 'consumes',
    evidenceNote:
      'getSovereignIdentity() merges the Sovereign Tongue\'s per-chamber tone (getToneProfile) into its own bundle — confirmed since SIO-001.',
  },
  {
    fromOrganId: 'makman-al-ghayah',
    toOrganId: 'ras-al-amr',
    kind: 'depends-on',
    evidenceNote:
      'Makman\'s "submit a creative work for distribution" capability requires a pre-compiled CompiledAssemblyGraph — the output of Ras Al-Amr\'s compile capability. Stated directly in the creator-goal API route\'s own code comments (not inferred). Registered in the Sovereign Capability Diwan (SCD-002/003).',
  },
  {
    fromOrganId: 'al-wateen',
    toOrganId: 'sovereign-vault-palace',
    kind: 'protects',
    evidenceNote:
      'Constitutionally intended: Al-Wateen\'s FleetDispatcher is the only real caller of SovereignVaultManager.depositAsset() — the mechanism by which a generated asset would enter the Vault. Currently unreachable on both ends (registered as Architectural Debt), so this relationship exists constitutionally but not yet operationally.',
  },
  {
    fromOrganId: 'sovereign-capability-diwan',
    toOrganId: 'hujjah-al-damighah',
    kind: 'consumes',
    evidenceNote:
      '12 of the Diwan\'s 30 registered capabilities — its single largest group — represent Hujjah Al-Damighah\'s real, evidenced abilities; the Diwan\'s inventory is only as complete as that chamber\'s own excavated reality.',
  },
] as const;
