/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Authority Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * The positive scope each organ may legitimately act within — the
 * complement of boundary-registry.ts's prohibitions. Each entry is drawn
 * from the same constitutional articles already declared for that organ.
 */

import type { ConstitutionalAuthority } from './types';

export const CONSTITUTIONAL_AUTHORITIES: readonly ConstitutionalAuthority[] = [
  {
    organId: 'al-wateen',
    authorityScope:
      'Preserving the continuity of Life throughout the Sovereign Body — perceiving reality via the Nervous System and sustaining constitutional rhythm across every organ, equally.',
    sourceArticle: 'Construction Phase IV, Articles I, III, IV.',
  },
  {
    organId: 'sovereign-memory',
    authorityScope:
      'Preserving constitutional history, identity, relationships, Creator journeys, and knowledge across time, organized as a 4-tier Data/Information/Knowledge/Wisdom hierarchy; consumed by the Sovereign Core, never owned by it.',
    sourceArticle: 'Construction Phase VIII ("The Constitutional Memory"), Constitutional Responsibilities.',
  },
  {
    organId: 'sovereign-core',
    authorityScope:
      'Gathering, interpreting, reasoning about, and planning from constitutional reality; organizing constitutional memory into wisdom; advising the Creator.',
    sourceArticle: 'Construction Phase V, Articles I, X.',
  },
  {
    organId: 'global-ui-runtime',
    authorityScope:
      'Carrying constitutional perception — signals describing state, health, need, purpose, readiness, and identity — between every organ, faithfully and without interpretation.',
    sourceArticle: 'Construction Phase II, Articles I, III.',
  },
  {
    organId: 'sovereign-identity-layer',
    authorityScope:
      'The single constitutional source for visual language, motion, cinematic direction, interaction, typography, and color across every chamber.',
    sourceArticle: '"The Sovereign Identity Layer — Constitutional Dossier," Chapter I, Article V.',
  },
  {
    organId: 'sovereign-tongue',
    authorityScope:
      'The single constitutional source for the Empire\'s faithful expression — communication style, tone, and conversational companionship, per chamber; and, per post-Certification Council correction, Citizen Memory (Permanent Responsibilities: voice.ts, constitution.ts\'s identity vocabulary, memory.ts). Its remaining, pre-existing files (Conscience, continuity, intention, guardian, creator) continue to operate exactly as before as Transitional Responsibilities, preserved in place pending their own rightful Constitutional Homes — see src/core/tongue/constitutional-classification.ts.',
    sourceArticle: 'src/core/tongue/ (Tongue Constitution V2.0); Constitutional Package I, "The Imperial Tongue Constitutional Refoundation," Constitutional Responsibilities and its post-Certification correction.',
  },
  {
    organId: 'sovereign-capability-diwan',
    authorityScope:
      'The single constitutional registry of every Creator-visible capability — its declaration, lifecycle, certification, and taxonomy.',
    sourceArticle: '"The Sovereign Capability Diwan — Constitutional Dossier," Chapter I, Articles I-II.',
  },
  {
    organId: 'ras-al-amr',
    authorityScope: 'Direction and orchestration of production — compiling a draft production into a locked, ready-to-publish assembly.',
    sourceArticle: 'CONTEXT_ROLES (src/core/tongue/constitution.ts); Sovereign Capability Diwan entry ras-amr-compile-production-into-assembly.',
  },
  {
    organId: 'makman-al-ghayah',
    authorityScope: 'Strategy, commercial distribution, and audience access to published work.',
    sourceArticle: 'CONTEXT_ROLES; Sovereign Capability Diwan entries makman-submit-creative-work-for-distribution, makman-request-access-to-published-work.',
  },
  {
    organId: 'qiyamah-chamber',
    authorityScope: 'Generative creation — cost commitment, asset staging, generation control, and real generation execution (corrected 2026-07-23, Qiyamah Chamber Package I: a real OpenAI-backed generation path now exists, see src/qiyamah-generation/).',
    sourceArticle: 'CONTEXT_ROLES; Sovereign Capability Diwan generation-commitment category.',
  },
  {
    organId: 'hujjah-al-damighah',
    authorityScope: 'Investigation, evidence review, and verdict revision.',
    sourceArticle: 'CONTEXT_ROLES; Sovereign Capability Diwan investigation and verdict-revision categories.',
  },
  {
    organId: 'sovereign-vault-palace',
    authorityScope: 'Treasury safekeeping — vault access, record review, and record lifecycle management.',
    sourceArticle: 'CONTEXT_ROLES; Sovereign Capability Diwan vault-record-management and treasure-transfer categories.',
  },
] as const;
