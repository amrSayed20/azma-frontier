/**
 * AZMA OS — Ras Al-Amr: The Direction Workspace Constitution
 *
 * Per the Chief Architect's Constitutional Ruling (2026-07-28), "RAS AL
 * AMR IS THE SOVEREIGN STATE OF DIRECTION," and Package XVIII's own
 * authorization to construct "the constitutional foundation upon which
 * every future Direction capability will operate" — this file is that
 * foundation. It declares, as real typed data (not prose alone), what the
 * Direction Workspace already IS and where future capabilities will
 * constitutionally attach.
 *
 * WHY NO NEW WORKSPACE TYPE, STORE, OR RUNTIME WAS CREATED: SovereignCanvas
 * (assembly-contracts.ts) is already the one sovereign state, and
 * RasAlAmrStateManager.applyMutation() (ras-al-amr-state-manager.ts) is
 * already the single mutation boundary both the Creator's manual edits
 * (the Spatial/Visual/Temporal panels, app/ras-amr/page.tsx) and the
 * Automatic Director's applied decisions (handleApplyDirectorDecision,
 * same file) go through today. This file NAMES that already-real fact —
 * it does not rebuild it. Declaring a second "workspace" object around
 * the existing canvas/state-manager pair would be exactly the duplicate
 * Direction infrastructure this ruling prohibits.
 */

// ── The Two Operators — Article II: one state, never two systems ────────
// app/ras-amr/page.tsx's own pre-existing `directingMode` state ('smart' |
// 'manual') is this same distinction under its original UI name — left
// unrenamed here to avoid an unnecessary mechanical diff across every
// comparison/dimming site that already reads it; `DirectionOperator` is
// the constitutional vocabulary for any NEW code that needs to reason
// about which operator is acting ('smart' == 'automatic-director',
// 'manual' == 'manual-director').

export type DirectionOperator = 'manual-director' | 'automatic-director';

export const DIRECTION_WORKSPACE_OPERATORS: readonly DirectionOperator[] = [
  'manual-director',
  'automatic-director',
] as const;

export const DIRECTION_WORKSPACE_PURPOSE =
  'The Direction Workspace is the one sovereign environment in which the Creator (Manual Director) and the ' +
  'Empire (Automatic Director) each direct the same real work — never two systems, never two states, and never ' +
  'a separate editing or montage chamber.';

// ── Future Capability Locations — Article IV/VI ──────────────────────────
// Named now so every future Direction package (voice, imported media,
// export, etc.) has an obvious, already-decided constitutional location
// to extend, per this package's own success criterion: "future Direction
// capabilities have obvious constitutional locations." An
// `implemented: false` entry names WHERE a capability will attach — it
// does not build it; this package implements none of the `false` rows.

export interface DirectionCapabilityLocation {
  readonly capability: string;
  readonly constitutionalLocation: string;
  readonly implemented: boolean;
}

export const DIRECTION_WORKSPACE_CAPABILITY_MAP: readonly DirectionCapabilityLocation[] = [
  {
    capability: 'Asset placement',
    constitutionalLocation: 'AssemblyNode (assembly-contracts.ts) via RasAlAmrStateManager.ADD_NODE/REMOVE_NODE',
    implemented: true,
  },
  {
    capability: 'Scene arrangement / visual sequencing',
    constitutionalLocation:
      "AssemblyTrack.nodes array order + AssemblyNode.temporal.globalStartTimeSeconds (Packages XIII/XIV)",
    implemented: true,
  },
  {
    capability: 'Timeline / Direction Graph visualization',
    constitutionalLocation:
      "The Narrative Canvas panel's ordered node list (app/ras-amr/page.tsx) — a real sequential view; a " +
      'richer graph widget is future work, not required by this package',
    implemented: true,
  },
  {
    capability: 'Imported media handling',
    constitutionalLocation:
      'AssemblyNode.assetId (a Vault reference) — extending intake to non-Vault imports is future work',
    implemented: false,
  },
  {
    capability: 'Voice generation / cloning / text-to-speech',
    constitutionalLocation:
      'A future extension of AssemblyNode.customDirectives (assembly-contracts.ts) — not yet built; belongs ' +
      'to Ras Al Amr, never Qiyamah, per the Sovereign Direction State ruling',
    implemented: false,
  },
  {
    capability: 'Music / sound placement',
    constitutionalLocation:
      'AssemblyNode.customDirectives.audio (AudioMixingDirective, assembly-directive-payloads.ts) — placement ' +
      'is real; generation or import of the sound itself is future work',
    implemented: false,
  },
  {
    capability: 'Mixing',
    constitutionalLocation:
      'AudioMixingDirective (assembly-directive-payloads.ts) — volumeDb/panCenter/isMuted fields already exist; ' +
      'real mixing logic is future work',
    implemented: false,
  },
  {
    capability: 'Subtitle decisions',
    constitutionalLocation: 'A future extension of AssemblyNode.customDirectives — not yet built',
    implemented: false,
  },
  {
    capability: 'Export / delivery',
    constitutionalLocation:
      'PrePublishingBoundary.compileForPublishing() (pre-publishing-boundary.ts) compiles a real ' +
      'CompiledAssemblyGraph today; final render/delivery export is future work',
    implemented: false,
  },
] as const;
