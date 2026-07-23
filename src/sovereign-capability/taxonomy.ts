/**
 * AZMA OS — THE SOVEREIGN CAPABILITY DIWAN
 * The Constitutional Capability Taxonomy (Construction ID SCD-003)
 * Campaign C — Constitutional Taxonomy, Certification & Governance
 *
 * Authority: Diwan Dossier Chapter III Article II ("a constitutional
 * category"), and the Constitutional Council's ruling on SCD-001:
 * "No constitutional Capability Taxonomy shall be invented before
 * repository evidence exists. Capability categories shall emerge from
 * constitutional discovery. They shall never be designed in advance."
 *
 * Every category below was derived FROM the 30 capabilities SCD-002
 * discovered by repository evidence — none were designed first and
 * fitted to the evidence afterward. Where a chamber's discovered
 * capabilities didn't cleanly share a shape with another chamber's, they
 * were left as their own category rather than folded together for
 * tidiness (e.g. "production-assembly" and "engagement-mode" each have
 * only one and one member respectively — real, not padded).
 *
 * This file is purely declarative documentation of the taxonomy's
 * derivation. The CapabilityCategory type itself lives in types.ts.
 */

import type { CapabilityCategory } from './types';

export interface TaxonomyCategoryDefinition {
  readonly category: CapabilityCategory;
  readonly description: string;
  readonly derivedFrom: string;
  readonly memberCount: number;
}

export const CAPABILITY_TAXONOMY: readonly TaxonomyCategoryDefinition[] = [
  {
    category: 'investigation',
    description: 'Posing a question within a field of knowledge and gathering, reviewing, saving, sorting, or resuming the evidence it produces.',
    derivedFrom: 'hujjah-al-damighah: investigate-a-question, review-evidence-in-depth, start-investigation-from-evidence, save-for-later, sort-evidence-into-judgment, resume-a-previous-investigation.',
    memberCount: 6,
  },
  {
    category: 'verdict-revision',
    description: 'Stating a stance on, or revising the detail level, evidence base, angle, or standing of, an already-rendered conclusion.',
    derivedFrom: 'hujjah-al-damighah: weigh-in-before-a-verdict, choose-verdict-detail-level, deepen-a-verdict, challenge-a-verdict, appeal-a-verdict.',
    memberCount: 5,
  },
  {
    category: 'engagement-mode',
    description: "Choosing how a Creator engages with a chamber's own interaction surface.",
    derivedFrom: 'hujjah-al-damighah: choose-how-to-interact. A single-member category — kept distinct rather than folded into investigation, since it is a mode preference, not an evidentiary action.',
    memberCount: 1,
  },
  {
    category: 'generation-commitment',
    description: 'Previewing and confirming the cost of a generative act, and staging or configuring what will be generated, before generation is committed to.',
    derivedFrom: 'qiyamah-chamber: preview-generation-cost, review-and-confirm-cost, stage-asset-for-generation, adjust-generation-controls.',
    memberCount: 4,
  },
  {
    category: 'production-assembly',
    description: 'Sealing a draft production and its referenced assets into a locked, ready-to-publish assembly.',
    derivedFrom: 'ras-amr: compile-production-into-assembly. A single-member category — the only real, externally-reachable ras-amr capability found across two excavation passes.',
    memberCount: 1,
  },
  {
    category: 'distribution-and-access',
    description: "Submitting a completed work for distribution, or requesting access to a work another Creator has published.",
    derivedFrom: 'makman-al-ghayah: submit-creative-work-for-distribution, request-access-to-published-work.',
    memberCount: 2,
  },
  {
    category: 'vault-record-management',
    description: 'Entering the vault, browsing or reviewing its held records, and sealing, archiving, disposing of, downloading, or duplicating a specific record.',
    derivedFrom: 'sovereign-vault-palace: unlock-the-palace, browse-vault-categories, review-treasury-records, view-treasure-journey, seal-a-treasure, archive-a-treasure, dispose-of-a-treasure, download-a-treasure-record, duplicate-a-treasure.',
    memberCount: 9,
  },
  {
    category: 'treasure-transfer',
    description: 'Moving a record into the vault from elsewhere, or out of the vault toward another chamber.',
    derivedFrom: 'sovereign-vault-palace: receive-incoming-treasure, send-treasure-to-another-chamber. Kept distinct from vault-record-management: these move a record across a boundary rather than acting on one already resident.',
    memberCount: 2,
  },
] as const;
