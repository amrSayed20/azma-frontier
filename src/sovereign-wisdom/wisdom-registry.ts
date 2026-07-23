/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * The Constitutional Wisdom Registry
 * Construction Phase IX
 *
 * A pure, declarative vocabulary: the 5 inputs this phase's own Mission
 * names ("Wisdom shall transform: Knowledge, Memory, Awareness,
 * Understanding, Purpose"), each mapped to its real, already-certified
 * evidence source. No input invents a new type — see types.ts's own
 * disclosure for the full reasoning, especially "Purpose"'s two
 * pre-existing meanings.
 */

import type { WisdomInputDescriptor } from './types';

export const CONSTITUTIONAL_WISDOM_INPUTS: readonly WisdomInputDescriptor[] = [
  {
    input: 'Knowledge',
    evidenceSource: 'src/sovereign-core/ (Phase V) — ConstitutionalAdvisory / ConstitutionalClaim, the Core\'s own reasoned conclusions.',
  },
  {
    input: 'Memory',
    evidenceSource: 'src/sovereign-memory/ (Phase VIII) — the Knowledge Repository\'s accumulated ArchivedAdvisory history, never overwritten.',
  },
  {
    input: 'Awareness',
    evidenceSource: 'src/sovereign-consciousness/ (Phase VII) — OrganCondition and observeConstitutionalHarmony(), cross-organ structural observation.',
  },
  {
    input: 'Understanding',
    evidenceSource: 'src/sovereign-core/ (Phase V) — ConstitutionalUnderstanding, the Core\'s organized combination of knowledge, memory, and continuity.',
  },
  {
    input: 'Purpose',
    evidenceSource:
      "src/sovereign-body/ (Phase I) — ConstitutionalOrgan.constitutionalPurpose, a fixed declarative string per organ; ALSO src/sovereign-nervous-system/ (Phase II) — the ConstitutionalSignalType 'Purpose', a category of live signal. Both are read; neither is invented for this phase.",
  },
] as const;
