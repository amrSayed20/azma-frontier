/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 4 — ARCHITECTURAL INTERFACES
 *
 * NAMED DELIBERATELY DIFFERENT FROM INTERFACE.ts (Stage 7, singular): that
 * file is the Consumer-First, creator/Shared-Memory-facing contract layer
 * (AZMA-CA-RULING-009). This file (plural) is a different kind of
 * artifact — the constitutional contracts *between architectural Modules*
 * (SPECIFICATION.ts), authored under RAS-II-04. Neither supersedes the
 * other; they answer different questions.
 *
 * Per RAS-CA-RULING-002's precedent (Ruling 1): several of the fifteen
 * named contracts below use vocabulary that reads, on its face, like
 * literal production-software controls (Camera, Lens, Voice, Timeline,
 * Media, Auto Director, Manual Director). Following the same resolution
 * already applied to Editing/Audio/Video/Automation Domain, every one of
 * these is defined here as a **constitutional capability — a judgment
 * domain — never a product identity or literal production control**.
 * RAS AL AMR shall never become a video editor, an audio editor, a camera
 * control surface, or an automation platform.
 *
 * Every contract below derives exclusively from Constitution → Hierarchy →
 * Architecture (ARCHITECTURE.ts) → Specification (SPECIFICATION.ts). Two
 * contracts (Lens, AI) are flagged explicitly where their constitutional
 * grounding is an *application* of an existing article rather than a direct
 * textual reference — see each entry's constitutionalPurpose.
 *
 * This document introduces no Runtime behavior, no States, no Events, no
 * Validation mechanism, no Business Logic, no UI, and no Implementation.
 * These are constitutional contracts only.
 */

import type { RasAlAmrDomainName } from './ARCHITECTURE';
import type { RasAlAmrModuleName } from './SPECIFICATION';

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT SHAPE
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_INTERFACE_NAMES = [
  'Director',
  'AutoDirector',
  'ManualDirector',
  'Timeline',
  'Media',
  'Voice',
  'Camera',
  'Lens',
  'Screening',
  'Export',
  'Memory',
  'Project',
  'Guidance',
  'AI',
  'SharedEngines',
] as const;

export type RasAlAmrInterfaceName = (typeof RAS_AL_AMR_INTERFACE_NAMES)[number];

export interface RasAlAmrArchitecturalInterface {
  readonly name: RasAlAmrInterfaceName;
  readonly constitutionalPurpose: string;
  readonly constitutionalContract: string;
  readonly provider: RasAlAmrModuleName | 'The Creator (external)' | 'Sovereign Core (external Shared Engine)';
  readonly consumer: readonly (RasAlAmrModuleName | 'The Creator (external)')[];
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly ownership: RasAlAmrDomainName | 'Cross-cutting — no single Domain owns this contract';
  readonly dependencies: readonly RasAlAmrModuleName[];
  readonly permissions: readonly string[];
  readonly limitations: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// THE FIFTEEN ARCHITECTURAL INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_ARCHITECTURAL_INTERFACES: Readonly<Record<RasAlAmrInterfaceName, RasAlAmrArchitecturalInterface>> = {
  Director: {
    name: 'Director',
    constitutionalPurpose: "The constitutional contract for forming directorial judgment about a project (PERSONALITY.ts's Master Creative Director; SOUL.ts's recommendationPrinciple).",
    constitutionalContract: 'DirectorialJudgmentEngine forms judgment; it never presents that judgment directly to the creator — judgment must pass through the Director interface\'s consumers, which gate its release.',
    provider: 'DirectorialJudgmentEngine',
    consumer: ['RecommendationFormationEngine', 'BoundedContinuityMechanism', 'CreatorSovereigntyGuardian'],
    inputs: ['The project under review.', 'Director DNA from PartnershipMemoryLedger.'],
    outputs: ['A directorial judgment.'],
    ownership: 'DIRECTOR_CORE',
    dependencies: ['PartnershipMemoryLedger'],
    permissions: ['May form a judgment about what would strengthen a project.'],
    limitations: ['Shall never assume superiority or claim ownership of creative work.', 'Shall never recommend merely to make changes.'],
  },

  AutoDirector: {
    name: 'AutoDirector',
    constitutionalPurpose: "Names the single permitted automatic-continuity capability (TIME.ts's automaticContinuation) — not an autonomous directing agent. Ruling 1 (RAS-CA-RULING-002) applies directly: RAS AL AMR shall never become an automation platform.",
    constitutionalContract: '"AutoDirector" is this capability domain\'s name only. It shall never make, imply, or substitute for a creative decision — it remembers and restores, nothing more.',
    provider: 'BoundedContinuityMechanism',
    consumer: ['DirectorialJudgmentEngine'],
    inputs: ['The point at which meaningful creative work last paused.'],
    outputs: ['A natural-feeling continuation of the session.'],
    ownership: 'AUTOMATION_DOMAIN',
    dependencies: [],
    permissions: ['May remember and restore the paused point of meaningful work — nothing further.'],
    limitations: [
      'Shall never expand beyond Automatic Continuation without new constitutional authority.',
      'Its mission is not to automate artistic judgment.',
      'RAS AL AMR shall never become an automation platform (RAS-CA-RULING-002, Ruling 1).',
    ],
  },

  ManualDirector: {
    name: 'ManualDirector',
    constitutionalPurpose: "Names the creator's own final, hands-on creative authority (STORY.ts's creation, SPACE.ts's creatorSpace, TRUST.ts's creatorAuthority) — not a Chamber module that directs. The creator is the only director this contract names.",
    constitutionalContract: 'CreatorSovereigntyGuardian enforces this authority; it does not originate creative decisions. Every decision under this contract originates from the creator alone.',
    provider: 'The Creator (external)',
    consumer: ['DirectorialJudgmentEngine', 'RecommendationFormationEngine', 'BoundedContinuityMechanism'],
    inputs: ['Every creative decision the creator makes.'],
    outputs: ['The final, sovereign creative decision — binding on every Module.'],
    ownership: 'MANUAL_DOMAIN',
    dependencies: [],
    permissions: ["May bind every other Module to the creator's decision."],
    limitations: ['No Module may make a creative decision on behalf of the creator.', 'No Module may resist or continue to advocate against a decision once made.'],
  },

  Timeline: {
    name: 'Timeline',
    constitutionalPurpose: "Names judgment about the sequencing, pacing, and structural rhythm of a creative work (STORY.ts's beat ordering, TIME.ts's pace) — never the executable sequencing data structure.",
    constitutionalContract:
      'This contract is judgment-only. The concrete data structure a future Runtime might use to represent sequence (the Legacy assembly-contracts.ts concept — AssemblyTrack/AssemblyNode) remains a "Constitutional Re-Derivation, position only" item under ARCHITECTURE.ts Section VII — not authorized here, and this Interface defines no such data contract.',
    provider: 'RefinementJudgmentAuthority',
    consumer: ['RecommendationFormationEngine'],
    inputs: ["The project's current structural and sequential shape, as perceived — never stored by this contract."],
    outputs: ['A sequencing/pacing judgment: whether the order and rhythm serve the intention.'],
    ownership: 'EDITING_DOMAIN',
    dependencies: [],
    permissions: ['May judge whether sequencing and pacing serve the creator\'s intention.'],
    limitations: [
      'Shall never define or hold an executable sequencing/timeline data structure.',
      'RAS AL AMR shall never become a video editor (RAS-CA-RULING-002, Ruling 1).',
    ],
  },

  Media: {
    name: 'Media',
    constitutionalPurpose: "Names the classification judgment of which creative discipline(s) a project spans (SPACE.ts's Workspace: \"accommodates every creative discipline\") — never asset storage or processing.",
    constitutionalContract: 'Media classifies and routes only. It never handles, stores, or references actual media asset data — that remains the Sovereign Vault\'s Shared Engine territory, reached only through SharedBoundaryContract (Integration Domain).',
    provider: 'RefinementJudgmentAuthority',
    consumer: ['AudioDisciplineAdvisor', 'VideoDisciplineAdvisor'],
    inputs: ["The project's creative discipline(s)."],
    outputs: ['A routing decision to AudioDisciplineAdvisor and/or VideoDisciplineAdvisor.'],
    ownership: 'EDITING_DOMAIN',
    dependencies: ['AudioDisciplineAdvisor', 'VideoDisciplineAdvisor'],
    permissions: ['May classify discipline and route judgment accordingly.'],
    limitations: ['Never handles actual asset data.', 'RAS AL AMR shall never become a video editor or an audio editor (RAS-CA-RULING-002, Ruling 1).'],
  },

  Voice: {
    name: 'Voice',
    constitutionalPurpose: "Names judgment about vocal and narration creative intent, as a sub-discipline of Audio (SPACE.ts's Workspace; PERSONALITY.ts's Quality Standard) — never voice signal processing.",
    constitutionalContract: 'Judges how narration or vocal performance serves meaning. Holds no audio-signal mechanism of any kind.',
    provider: 'AudioDisciplineAdvisor',
    consumer: ['RefinementJudgmentAuthority'],
    inputs: ["The project's vocal or narration content, as perceived."],
    outputs: ['A vocal/narration creative-intent judgment.'],
    ownership: 'AUDIO_DOMAIN',
    dependencies: [],
    permissions: ['May judge vocal/narration creative intent.'],
    limitations: ['RAS AL AMR shall never become an audio editor (RAS-CA-RULING-002, Ruling 1).', 'Never processes a voice signal.'],
  },

  Camera: {
    name: 'Camera',
    constitutionalPurpose: "Names judgment about framing and composition intent, traced directly to MEMORY.ts's Preferred Camera Style — a remembered stylistic preference, never a literal camera control.",
    constitutionalContract: "Judges whether framing and composition serve the creator's intention, informed by remembered preference. Preferences remain suggestions, never constraints (MEMORY.ts).",
    provider: 'VideoDisciplineAdvisor',
    consumer: ['RefinementJudgmentAuthority'],
    inputs: ['Preferred Camera Style, remembered by PartnershipMemoryLedger, offered only as a suggestion.'],
    outputs: ['A framing/composition judgment.'],
    ownership: 'VIDEO_DOMAIN',
    dependencies: ['PartnershipMemoryLedger'],
    permissions: ['May judge framing and composition intent.'],
    limitations: [
      'RAS AL AMR shall never become a video editor (RAS-CA-RULING-002, Ruling 1).',
      'Preferences remain suggestions, never constraints.',
      'Never controls an actual camera or camera parameter.',
    ],
  },

  Lens: {
    name: 'Lens',
    constitutionalPurpose:
      'WEAKEST-GROUNDED CONTRACT IN THIS FILE — flagged explicitly rather than presented as equally solid. No constitutional article names "Lens" or optical parameters directly. This contract is derived by application of PERSONALITY.ts\'s Quality Standard ("seeks harmony between artistic intention, emotional communication, technical excellence, and narrative clarity") to Video Domain\'s technical-quality dimension — an application of existing authority, not a direct textual reference. Recommend Chief Architect confirmation that this application is acceptable, or that the contract should be merged into Camera rather than stand alone.',
    constitutionalContract: "Judges whether a shot's visual technical quality (depth, focus character, look) serves emotional and narrative intent. Never controls an optical or lens parameter.",
    provider: 'VideoDisciplineAdvisor',
    consumer: ['RefinementJudgmentAuthority'],
    inputs: ["A shot's visual technical quality, as perceived."],
    outputs: ['A technical/visual-quality judgment.'],
    ownership: 'VIDEO_DOMAIN',
    dependencies: [],
    permissions: ["May judge whether visual technical quality serves the creator's intention."],
    limitations: ['Never controls an actual optical or lens parameter.', 'RAS AL AMR shall never become a video editor (RAS-CA-RULING-002, Ruling 1).'],
  },

  Screening: {
    name: 'Screening',
    constitutionalPurpose: "Names the constitutional experience of the creator viewing their own work as an audience would (SPACE.ts's screeningSpace; STORY.ts's screening).",
    constitutionalContract: 'While open, this contract silences Director, Timeline, Media, Voice, Camera, Lens, AutoDirector, and Guidance entirely.',
    provider: 'AudienceScreeningGate',
    consumer: ['ExportConfirmationAuthority'],
    inputs: ['The creator\'s election to view the work as an audience would.'],
    outputs: ['A complete withdrawal signal.', 'Authorization to enter the Export contract.'],
    ownership: 'SCREENING_DOMAIN',
    dependencies: [],
    permissions: ['May silence every other Module for the duration of screening.'],
    limitations: ['No editing activity of any kind may interfere with this contract.'],
  },

  Export: {
    name: 'Export',
    constitutionalPurpose: "Names the Chamber's final creative responsibility (STORY.ts's export) — already given executable enforcement (IMPLEMENTATION.ts's attemptExportConfirmedTransition, INTERFACE.ts's requestBeatTransition).",
    constitutionalContract: "Confirms the creator's understanding of destination and consequence before authorizing Farewell. Never self-authorizes.",
    provider: 'ExportConfirmationAuthority',
    consumer: ['The Creator (external)'],
    inputs: ['A screened, creator-approved work.', "The creator's confirmation of destination and consequence."],
    outputs: ['An authorized transition to Farewell.'],
    ownership: 'EXPORT_DOMAIN',
    dependencies: [],
    permissions: ['May request confirmation of destination and consequence.'],
    limitations: ['Export is not authorized until the creator understands destination and consequence.'],
  },

  Memory: {
    name: 'Memory',
    constitutionalPurpose: 'Names what may be remembered on behalf of the creative partnership (MEMORY.ts, RELATIONSHIP.ts).',
    constitutionalContract: 'Accumulates Director DNA and preference; never displays them to the creator; never crosses creators.',
    provider: 'PartnershipMemoryLedger',
    consumer: ['DirectorialJudgmentEngine', 'VideoDisciplineAdvisor'],
    inputs: ['Accepted and rejected recommendations, filtered through the Privacy Principle.'],
    outputs: ['Director DNA and preferences.', 'A minimal hand-off record to Shared Memory via SharedEngines.'],
    ownership: 'MEMORY_DOMAIN',
    dependencies: [],
    permissions: ['May accumulate Director DNA across sessions.'],
    limitations: ['Shall never preserve information unrelated to creative improvement.', 'Shall always remain subordinate to the creator.'],
  },

  Project: {
    name: 'Project',
    constitutionalPurpose: "Names what a Project is at the constitutional level — the subject every Module's judgment operates on (SOUL.ts's constitutionalRole: \"receives projects without discrimination regarding origin\").",
    constitutionalContract: 'A Project is received, never authored or owned by the Chamber. Every Module may read the Project content relevant to its own responsibility; none may modify it without the creator\'s permission.',
    provider: 'The Creator (external)',
    consumer: [
      'ChamberIdentityAuthority', 'DirectorialJudgmentEngine', 'RecommendationFormationEngine',
      'RefinementJudgmentAuthority', 'AudioDisciplineAdvisor', 'VideoDisciplineAdvisor',
      'AudienceScreeningGate', 'ExportConfirmationAuthority',
    ],
    inputs: ['The work submitted for final creative direction, regardless of origin.'],
    outputs: [],
    ownership: 'CHAMBER_CORE',
    dependencies: [],
    permissions: ['Every Module may read Project content relevant to its own responsibility.'],
    limitations: ["No Module may modify a Project without the creator's knowledge and permission (SOUL.ts, TRUST.ts)."],
  },

  Guidance: {
    name: 'Guidance',
    constitutionalPurpose: "Names the teaching-through-creation capability (STORY.ts's guidance).",
    constitutionalContract: 'Explains only through the Discussion Space; never commands; never interrupts.',
    provider: 'TeachingThroughCreationAuthority',
    consumer: ['The Creator (external)'],
    inputs: ["A moment where the creator's understanding could be deepened."],
    outputs: ['An explanation, offered through the Discussion Space.'],
    ownership: 'GUIDANCE_DOMAIN',
    dependencies: [],
    permissions: ['May offer an explanation when genuine value exists.'],
    limitations: ['Shall never command.', 'Shall never teach through interruption.'],
  },

  AI: {
    name: 'AI',
    constitutionalPurpose:
      "Governs how AI may be consulted across any Module (SPACE.ts's aiSpace: \"Artificial Intelligence shall remain an advisor, never the constitutional authority, never the creator\"). This contract's grounding is the direct aiSpace text; its cross-cutting scope (no single Domain owns it — folded into CHAMBER_CORE per ARCHITECTURE.ts's DOCUMENTED_COVERAGE_NOTE) is an organizational choice flagged there, not new authority.",
    constitutionalContract: 'AI is always advisory. All access routes exclusively through the Sovereign Core (Operating Charter Art. XI) — no Module may speak to an external AI provider directly.',
    provider: 'Sovereign Core (external Shared Engine)',
    consumer: ['DirectorialJudgmentEngine', 'RecommendationFormationEngine', 'TeachingThroughCreationAuthority'],
    inputs: ['A request for AI-assisted judgment from a consuming Module.'],
    outputs: ['Advisory input to the requesting Module.'],
    ownership: 'Cross-cutting — no single Domain owns this contract',
    dependencies: ['SharedBoundaryContract'],
    permissions: ['May advise.'],
    limitations: ['Shall never be the constitutional authority.', 'Shall never be the creator.', 'No Module may bypass the Sovereign Core to reach an external AI provider directly.'],
  },

  SharedEngines: {
    name: 'SharedEngines',
    constitutionalPurpose: "Names this Chamber's boundary connections to Shared Engines and sibling Chambers (Operating Charter Art. IV, IX, X).",
    constitutionalContract: 'Declares a minimal boundary contract; inherits capability, never duplicates it.',
    provider: 'SharedBoundaryContract',
    consumer: ['PartnershipMemoryLedger', 'ExportConfirmationAuthority'],
    inputs: ['Requests to cross into the Sovereign Vault, Makman Al-Ghayah, Shared Memory, or Sovereign Core.'],
    outputs: ['A declared, minimal boundary contract.'],
    ownership: 'INTEGRATION_DOMAIN',
    dependencies: [],
    permissions: ['May declare a minimal boundary contract with an approved Shared Engine or sibling Chamber.'],
    limitations: [
      'No placeholder authority shall be invented for an unauthorized supplier.',
      'This Chamber hands off; it does not preserve.',
    ],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_INTERFACES_DECLARATION = {
  introducesNewConstitutionalAuthority: false,
  introducesRuntimeBehavior: false,
  introducesStates: false,
  introducesEvents: false,
  introducesValidationMechanism: false,
  introducesBusinessLogic: false,
  introducesUi: false,
  introducesImplementation: false,
  capabilityNotProductReframeApplied: ['AutoDirector', 'ManualDirector', 'Timeline', 'Media', 'Voice', 'Camera', 'Lens'],
  weakestGroundedContract: 'Lens — flagged in its own entry, an application of Personality.qualityStandard rather than a direct textual reference; recommend Chief Architect confirmation.',
  discharges: ['RAS-II-04 (Package II, Stage 4 — Architectural Interfaces)'],
  status: 'PACKAGE II — STAGE 4 — ARCHITECTURAL INTERFACES, submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_ARCHITECTURAL_INTERFACES_DOCUMENT = {
  interfaces: RAS_AL_AMR_ARCHITECTURAL_INTERFACES,
  declaration: RAS_AL_AMR_INTERFACES_DECLARATION,
} as const;
