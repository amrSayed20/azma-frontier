/**
 * AZMA OS — THE CONSTITUTIONAL IDENTITY
 * The Objective-to-Artifact Registry
 * Construction Phase VI
 *
 * Maps each of this phase's 9 named Primary Objectives to the real,
 * already-certified repository artifact that already fulfills it. Every
 * row below was verified by direct file inspection before being
 * recorded — none is asserted from the Directive's aspiration alone.
 * Sibling in spirit to constitutional-cooperation.ts's own
 * CONSTITUTIONAL_ORGAN_STATUS (SIO-009), scoped to this Directive's own
 * 9 objective names rather than that file's 10 Dossier-organ names.
 */

import type { ObjectiveArtifactMapping } from './types';

export const CONSTITUTIONAL_IDENTITY_OBJECTIVES: readonly ObjectiveArtifactMapping[] = [
  {
    objective: 'Face',
    existingArtifact:
      'getSovereignIdentity(context) — the one function bundling every certified identity engine per chamber',
    sourceModule: 'src/sovereign-identity/orchestrator.ts',
    evidenceNote:
      'The Skeleton\'s own organ-registry.ts already frames "Face" as this exact umbrella: "Expresses the constitutional face of the Empire — color, typography, lighting, motion, interaction, cinematic direction, and scene transitions."',
  },
  {
    objective: 'Voice',
    existingArtifact: 'TONE_PROFILES / getToneProfile() / buildStyleDirective()',
    sourceModule: 'src/core/tongue/voice.ts',
    evidenceNote: 'One ToneProfile per ChamberContext, already reachable through getSovereignIdentity()\'s `.tone` field.',
  },
  {
    objective: 'Tongue',
    existingArtifact:
      'The whole Sovereign Tongue module (constitution/memory/continuity/intention/guardian/momentum/creator/conscience/voice)',
    sourceModule: 'src/core/tongue/',
    evidenceNote:
      'Voice (above) is one sub-part of this same module, not a separate organ — the Skeleton\'s own sovereign-tongue organ entry already describes this module as "Gives the Empire its Voice."',
  },
  {
    objective: 'Motion Authority',
    existingArtifact:
      'MOTION (tokens.ts) + ACLE keyframes (elements.ts) + AIIE timing (interaction.ts) — constitutional.motion field',
    sourceModule: 'src/design-system/',
    evidenceNote: 'Already named "Motion" in CONSTITUTIONAL_ORGAN_STATUS (SIO-009), reachableThroughOrchestrator: true.',
  },
  {
    objective: 'Lighting Authority',
    existingArtifact:
      'ILLUMINATION / LIGHT_BEHAVIORS / ATMOSPHERES — constitutional.illumination/lightBehaviors/atmospheres fields',
    sourceModule: 'src/design-system/',
    evidenceNote: 'Already named "Lighting" in CONSTITUTIONAL_ORGAN_STATUS (SIO-009), reachableThroughOrchestrator: true.',
  },
  {
    objective: 'Typography Authority',
    existingArtifact: 'TYPOGRAPHY (tokens.ts) — constitutional.typography field',
    sourceModule: 'src/design-system/',
    evidenceNote:
      'Already named "Typography" in CONSTITUTIONAL_ORGAN_STATUS (SIO-009); font-family reconnected across every chamber in SIO-007.',
  },
  {
    objective: 'Color Authority',
    existingArtifact: 'PALETTE / MATERIALS — constitutional.palette/materials fields',
    sourceModule: 'src/design-system/',
    evidenceNote:
      'Already named "Color" in CONSTITUTIONAL_ORGAN_STATUS (SIO-009); hex-color drift reconnected across 8-9 chambers in SIO-006.',
  },
  {
    objective: 'Cinematic Director',
    existingArtifact: 'ACDE (INVISIBLE_DIRECTOR, SCENE_TRANSITIONS, CINEMATIC_PHASES) + DirectorSession + DirectorStage',
    sourceModule:
      'src/design-system/direction.ts, src/sovereign-identity/director-session.ts, src/sovereign-identity/director-stage/',
    evidenceNote:
      'Already named "Cinematic Direction" in CONSTITUTIONAL_ORGAN_STATUS (SIO-009); DirectorStage is live-mounted in app/layout.tsx (SIO-005B) — not a second Director.',
  },
  {
    objective: 'Presence Layer',
    existingArtifact:
      'DirectorStage\'s continuous mount lifecycle in app/layout.tsx (mounted once, alongside every chamber\'s content, for the life of every Creator session)',
    sourceModule: 'src/sovereign-identity/director-stage/DirectorStage.tsx',
    evidenceNote:
      'The only genuinely new-named objective in this phase — no prior SIO package named a "Presence Layer." Two UNRELATED existing usages of the word "Presence" were found and are explicitly NOT this objective: src/chambers/makman-al-ghayah/GOAL_PRESENCE_BOUNDARIES.ts ("Living Presence Layer," a goal-architecture/business concept) and ACDE\'s own narrow DirectorPresence type (\'present\'|\'withdrawn\' for the Invisible Director specifically). This phase\'s "Presence Layer" is scoped exactly and only to DirectorStage\'s own always-mounted, one-instance, every-route lifecycle — proven, not merely asserted, by presence-registry.ts and certification.ts.',
  },
] as const;
