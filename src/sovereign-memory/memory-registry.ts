/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Constitutional Memory Registry
 * Construction Phase VIII
 *
 * A pure, declarative vocabulary: the 4-tier Data/Information/Knowledge/
 * Wisdom hierarchy (Certification Requirement 2), each tier mapped to
 * its real, already-certified evidence source. No tier invents a new
 * type — see types.ts's own DIKW disclosure for the full reasoning.
 */

import type { MemoryTierDescriptor } from './types';

export const CONSTITUTIONAL_MEMORY_TIERS: readonly MemoryTierDescriptor[] = [
  {
    tier: 'Data',
    typeName: 'ConstitutionalSignal',
    evidenceSource: 'src/sovereign-nervous-system/ (Construction Phase II) — the raw, unprocessed signal as emitted, before any organizing or reasoning.',
  },
  {
    tier: 'Information',
    typeName: 'OrganCondition',
    evidenceSource: 'src/sovereign-consciousness/ (Construction Phase VII) — data organized into one organ\'s combined state + presence, not yet reasoned about.',
  },
  {
    tier: 'Knowledge',
    typeName: 'ConstitutionalAdvisory',
    evidenceSource: 'src/sovereign-core/ (Construction Phase V) — reasoned, typed understanding: fact/inference/uncertainty/recommendation claims plus a plan.',
  },
  {
    tier: 'Wisdom',
    typeName: "ConstitutionalClaim (kind: 'recommendation'), archived across time",
    evidenceSource: 'src/sovereign-memory/wisdom-archive.ts (this phase) — the Core\'s own most-refined output, preserved as it accumulates rather than overwritten as the Core\'s own live cache does.',
  },
] as const;
