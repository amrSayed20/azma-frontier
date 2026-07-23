/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Organ Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * Authority: "The Constitutional Anatomy of the Living Empire," Chapter II
 * ("The Constitutional Organ").
 *
 * Every organ's implementationStatus and existingArtifactPath are drawn
 * from this repository's own excavation history this session (the
 * Sovereign Identity Layer's Restoration Campaign, the Sovereign
 * Capability Diwan's Discovery campaigns, and SIO-010's Global UI Runtime
 * finding) — not asserted from the vision's aspiration. An organ that is
 * constitutionally named but not yet built is recorded honestly as such;
 * this Skeleton does not pretend otherwise ("No placeholders. No mock
 * implementations" governs the STRUCTURE here, not a false claim that
 * unbuilt organs are built).
 */

import type { ConstitutionalOrgan } from './types';

export const CONSTITUTIONAL_ORGANS: readonly ConstitutionalOrgan[] = [
  {
    id: 'al-wateen',
    name: 'Al-Wateen',
    regionId: 'region-of-life',
    systemId: 'system-of-life',
    constitutionalPurpose:
      'To preserve the continuity of Life throughout the Sovereign Body (Phase IV, Article I). Never governs, never interprets, never judges.',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'src/sovereign-heart/',
    evidenceNote:
      'Built fresh in Construction Phase IV as the Constitutional Heart — a real, tested heartbeat/continuity-tracking mechanism (9 passing Jest tests), faithful to this organ\'s "continuity only, never orchestration" definition. NAMING COLLISION FLAGGED then RESOLVED BY RENAME: the separate, pre-existing module that used to be src/orchestrator/al-watin/ (real business/orchestration code — fleet dispatch, ledger management, provider-webhook resolution, NOT a valid implementation of this constitutional definition) was never reused, wrapped, or repurposed as this organ; per Constitutional Directive it has since been renamed to src/orchestrator/fleet-materialization/ (class AlWatinRuntime -> FleetMaterializationRuntime) so the constitutional name "Al-Wateen" is no longer shared. That module remains registered separately as Architectural Debt (src/sovereign-construction/ARCHITECTURAL_DEBT.ts).',
  },
  {
    id: 'sovereign-memory',
    name: 'The Constitutional Memory',
    regionId: 'region-of-intelligence',
    systemId: 'system-of-intelligence',
    constitutionalPurpose:
      'To preserve constitutional history, identity, relationships, Creator journeys, and knowledge across time — remembers, protects, organizes, connects. Never interprets, never executes (Phase VIII, Article I).',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'src/sovereign-memory/',
    evidenceNote:
      'Built in Construction Phase VIII as a 4-tier DIKW hierarchy (Data/Information/Knowledge/Wisdom, each mapped to an already-certified type from an earlier phase) — a History Archive, a Knowledge Repository (accumulates every Advisory the Sovereign Core produces, never overwriting), a Wisdom Archive (correctly filters to recommendation-kind claims; disclosed as currently unpopulated since the Core\'s only recommendation rule cannot fire reactively), an Experience Timeline, a Creator Journey lens, and a Relationship Memory — 12 passing Jest tests. REGISTERED AS ITS OWN FIRST-CLASS ORGAN by Constitutional Decision following Phase VIII\'s certification: "shall not be merged into the Sovereign Core... The Sovereign Core shall consume Constitutional Memory. It shall never own it." Not auto-started anywhere.',
  },
  {
    id: 'sovereign-core',
    name: 'The Sovereign Core',
    regionId: 'region-of-intelligence',
    systemId: 'system-of-intelligence',
    constitutionalPurpose:
      'To transform constitutional reality into constitutional understanding — gathers, interprets, reasons, plans, advises (Phase V, Article I).',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'src/sovereign-core/',
    evidenceNote:
      'Built in Construction Phase V as a Knowledge Registry (reads the Skeleton\'s own Organ Registry directly), a Memory Integration Layer (reads the Nervous System\'s existing Signal Log as the platform\'s Constitutional Memory — no separate memory module exists anywhere, disclosed rather than invented), an Understanding Engine, a Reasoning Layer (produces typed fact/inference/uncertainty/recommendation claims, deterministic, no AI-provider call), a Planning Layer, and an Advisory Layer — 11 passing Jest tests confirm reasoning stays evidence-grounded and every layer remains a pure read with zero execution side effects. ACTIVATED (Integration Package "The First Constitutional Thought," following Construction Phase VI\'s certification): CoreThought.tsx is live-mounted in app/layout.tsx, subscribing the Core read-only to the Nervous System\'s Bus so it automatically re-derives Understanding/Claims/Plan/Advisory per organ as real signals arrive. Status remains "implemented-but-unconsumed," the same convention already applied to Al-Wateen after its own heartbeat activation: the mechanism runs live, but nothing downstream reads or consumes the Core\'s cached output yet — running is not the same as consumed, per this Integration Package\'s own Out of Scope ("No Creator-facing AI assistant").',
  },
  {
    id: 'global-ui-runtime',
    name: 'The Constitutional Nervous System (Global UI Runtime)',
    regionId: 'region-of-consciousness',
    systemId: 'system-of-consciousness',
    constitutionalPurpose:
      'To carry constitutional perception between organs — faithfully delivering constitutional reality without governing, deciding, or judging (Phase II, Article I).',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'src/sovereign-nervous-system/, src/sovereign-consciousness/',
    evidenceNote:
      'STALE-STATUS DRIFT FOUND AND CORRECTED (Construction Phase VII, "The Constitutional Consciousness"): this entry previously read \'not-yet-implemented\', citing a repository search (SIO-010, 2026-07-11) performed BEFORE Construction Phase II existed. Phase II (src/sovereign-nervous-system/) already fulfilled this organ\'s TRANSPORT half back when it was built, but this Organ Registry entry was never updated afterward — a real drift, found and disclosed rather than left standing. Region-of-consciousness\'s own purpose text ("Recognizes the condition of the Empire... observes, understands, awakens constitutional perception") and system-of-consciousness\'s own purpose text ("Allows the Empire to recognize itself... This system awakens before judgment") describe a second, AWARENESS half, which Construction Phase VII now fulfills (src/sovereign-consciousness/ — Awareness Registry, Observation Layer, Condition Monitor, Presence Layer, Harmony Observer, Self-Recognition Layer; 12 passing Jest tests). Transport (Phase II) and Awareness (Phase VII) are two layers of this ONE organ, not two competing organs. Neither layer is auto-started in the live application yet.',
  },
  {
    id: 'sovereign-identity-layer',
    name: 'The Sovereign Identity Layer',
    regionId: 'region-of-identity',
    systemId: 'system-of-identity',
    constitutionalPurpose:
      'Expresses the constitutional face of the Empire — color, typography, lighting, motion, interaction, cinematic direction, and scene transitions.',
    implementationStatus: 'implemented-and-live',
    existingArtifactPath: 'src/sovereign-identity/',
    evidenceNote:
      'Built across SIO-001 through SIO-009 this session. Its Director Stage is live-mounted in app/layout.tsx (SIO-005B); its Restoration Campaign reconnected 9 chambers\' color/typography/focus-accessibility to the certified design-system tokens (SIO-006/007/008). CERTIFIED UNIFIED (Construction Phase VI, "The Constitutional Identity"): rather than build a colliding second "Identity" organ, Phase VI built src/imperial-presence/ as a certification layer proving — by 10 passing Jest tests — that this organ already fulfills every one of that phase\'s 9 Primary Objectives (Face/Voice/Tongue/Motion/Lighting/Typography/Color Authority/Cinematic Director/Presence Layer) as one unforked identity, referentially identical across every chamber context.',
  },
  {
    id: 'sovereign-tongue',
    name: 'The Imperial Tongue',
    regionId: 'region-of-identity',
    systemId: 'system-of-identity',
    constitutionalPurpose:
      'To faithfully express Constitutional Truth. The Tongue never creates, modifies, judges, prioritizes, reinterprets, exaggerates, conceals, or invents Constitutional Truth — its responsibility begins only after Constitutional Truth has already been established elsewhere.',
    implementationStatus: 'implemented-and-live',
    existingArtifactPath: 'src/core/tongue/',
    evidenceNote:
      'REFOUNDATION (Constitutional Package I, "The Imperial Tongue Constitutional Refoundation") — CERTIFIED, with one post-Certification correction applied: this organ evolved from "The Sovereign Tongue" into "The Imperial Tongue" through a completed Constitutional Deliberation (Engineering Review + Constitutional Clarification Report, both certified) — an evolution of identity, not a replacement, and not a second organ. Its own constitutional-classification.ts (new, purely additive) now records, per file, whether each of its 9 pre-existing files (constitution/memory/continuity/intention/guardian/momentum/creator/conscience/voice) is a PERMANENT Imperial Tongue responsibility (voice.ts; constitution.ts\'s ChamberContext/CONTEXT_ROLES/IMPERIAL_CONSCIOUSNESS; and, per post-Certification Council correction, memory.ts\'s Citizen Memory — found to never have represented the Charter\'s own Constitutional Memory) or a TRANSITIONAL one preserved exactly in place pending its own rightful Constitutional Home (conscience.ts/guardian.ts — Constitutional Conscience; continuity.ts/momentum.ts — Ch. V Article VIII; intention.ts — Citizen Intention, distinct from constitutional-will\'s own Constitutional Intention; creator.ts — Creator Service, weakest-cited classification, disclosed as such). Nothing was removed, relocated, renamed, or rewritten. The organ\'s registered id remains \'sovereign-tongue\' — no Constitutional Decision has yet certified renaming it, and DirectorStage.tsx\'s own circulation calls still report under that exact origin id. Original activation evidence preserved: live-activated on 2 chamber pages via LivingCompanion (SIO-002, outside the scope of this Refoundation per Constitutional Decision); CERTIFIED UNIFIED (Construction Phase VI): src/imperial-presence/ confirms, by test, that voice.ts\'s TONE_PROFILES defines exactly one ToneProfile per chamber context with none missing.',
  },
  {
    id: 'sovereign-capability-diwan',
    name: 'The Sovereign Capability Diwan',
    regionId: 'region-of-governance',
    systemId: 'system-of-governance',
    constitutionalPurpose:
      'The constitutional registry of every Creator-visible capability AZMA OS possesses — registers, governs, and publishes constitutional truth about capability; never executes it.',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'src/sovereign-capability/',
    evidenceNote:
      'Built across SCD-001 through SCD-003 this session: 30 real, evidence-based capabilities, a ratified taxonomy, 18 relationships, and 3 registered Architectural Debt items. SCD-004 confirmed zero real consumers exist anywhere in the platform to connect it to.',
  },
  {
    id: 'ras-al-amr',
    name: 'Ras Al-Amr',
    regionId: 'region-of-creation',
    systemId: 'system-of-creation',
    constitutionalPurpose:
      'It governs — the sovereign chamber of direction and orchestration (per the Sovereign Tongue\'s own CONTEXT_ROLES: "It governs. The Ras Al-Amr consciousness speaks with sovereign authority").',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'app/ras-amr/, src/chambers/ras-al-amr/',
    evidenceNote:
      'Exactly one real, externally-reachable capability exists (compiling a production into a final assembly, via /api/sovereign/entry/ras-al-amr/compile) — confirmed via two independent excavation passes this session. The live page itself is disconnected local-state theater.',
  },
  {
    id: 'makman-al-ghayah',
    name: 'Makman Al-Ghayah',
    regionId: 'region-of-creation',
    systemId: 'system-of-creation',
    constitutionalPurpose:
      'It strategizes — the sovereign chamber of commercial distribution and audience access.',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'app/makman-al-ghayah/, src/chambers/makman-al-ghayah/',
    evidenceNote:
      '2 real capabilities confirmed reachable via SOEL API routes (submit-for-distribution, request-access-to-published-work); the live page itself is disconnected from all of them.',
  },
  {
    id: 'qiyamah-chamber',
    name: 'Qiyamah Chamber',
    regionId: 'region-of-creation',
    systemId: 'system-of-creation',
    constitutionalPurpose:
      'It creates — the sovereign chamber of generative creation (per CONTEXT_ROLES: "It creates. The Qiyamah consciousness gives form to what the citizen imagines").',
    implementationStatus: 'implemented-and-live',
    existingArtifactPath: 'app/qiyamah-chamber/, src/qiyamah-generation/',
    evidenceNote:
      'CORRECTED 2026-07-23 (Qiyamah Chamber Package I): this entry was stale, still describing a pre-rebuild ' +
      'state. The headline promise now genuinely works end to end: a real OpenAI-backed generation path ' +
      '(src/qiyamah-generation/, gpt-image-1), real auth+billing gating at the API (401/402), real persistence ' +
      'and a real gallery (app/api/qiyamah/generations). The old 102-file src/chambers/qiyamah/ orchestrator this ' +
      'note used to point to is confirmed fully orphaned (zero callers under app/) and was never the real path — ' +
      'left in place as disclosed debt, not deleted, not reused.',
  },
  {
    id: 'hujjah-al-damighah',
    name: 'Hujjah Al-Damighah',
    regionId: 'region-of-creation',
    systemId: 'system-of-creation',
    constitutionalPurpose:
      'It reasons — the sovereign chamber of investigation and argument (per CONTEXT_ROLES: "It reasons. The Hujjah consciousness builds the argument methodically").',
    implementationStatus: 'implemented-and-live',
    existingArtifactPath: 'app/hujjah-al-damighah/, src/chambers/hujjah-al-damighah/',
    evidenceNote:
      'The richest real implementation found across the platform: 12 distinct, genuinely working capabilities, backed by a real Server Action (runInvestigation) wired to a real IntelligenceEngine.',
  },
  {
    id: 'sovereign-vault-palace',
    name: 'The Sovereign Vault Palace',
    regionId: 'region-of-creation',
    systemId: 'system-of-creation',
    constitutionalPurpose:
      'It protects — the sovereign chamber of treasury and safekeeping (per CONTEXT_ROLES: "It protects. The Palace consciousness guards what endures").',
    implementationStatus: 'implemented-but-unconsumed',
    existingArtifactPath: 'app/sovereign-vault-palace/, src/vault/',
    evidenceNote:
      '11 real capabilities exist, but backed only by browser localStorage/sessionStorage — confirmed disconnected from the real backend SovereignVaultManager (src/vault/), whose only write path (depositAsset) itself has zero reachable callers anywhere in the repository.',
  },
] as const;
