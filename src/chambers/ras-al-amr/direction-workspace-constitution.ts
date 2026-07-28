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
 *
 * PACKAGE XIX — MEDIA INGESTION LAYER (2026-07-28): investigated all four
 * approved input sources named by the ruling before writing any code.
 * Two were already real: Qiyamah-generated assets already deposit into
 * the Sovereign Vault (src/qiyamah-generation/generation-service.ts,
 * Integration Package I), and Sovereign Vault assets are already fetched
 * and injectable in this Chamber's UI (GET /api/vault/assets, the
 * Summoning Bridge HUD). Two were real gaps: Creator file upload did not
 * exist anywhere in the platform (no upload input, no multipart route,
 * no cloud-storage dependency), and SovereignCanvas itself has zero
 * durable storage (pure client React state, lost on every page refresh).
 *
 * This package closes the upload gap the same way
 * src/qiyamah-generation/asset-storage.ts already proved out for
 * Qiyamah's own generated images (write real bytes to public/, serve via
 * Next's own static handling, zero new dependency) — see
 * src/vault/vault-asset-upload-storage.ts and
 * POST /api/vault/assets/upload. It deliberately does NOT build full
 * canvas-state persistence (a real, separate, much larger
 * responsibility) — see `MEDIA_INGESTION_SOURCES` below for exactly how
 * "previously saved project assets" is honestly satisfied without it.
 *
 * PACKAGE XX — DIRECTION ASSEMBLY LAYER (2026-07-28): the first real
 * Manual Direction capability — organizing assets already inside the
 * Workspace, not editing video. Investigated before writing code: Asset
 * placement and removal were already fully real (ADD_NODE/REMOVE_NODE);
 * ordering was append-only (no way to move an existing node); grouping
 * did not exist at all beyond the type-level allowance of multiple
 * AssemblyTracks, which nothing ever used beyond the single default
 * track. Closed both real gaps with three new mutations
 * (ras-al-amr-state-manager.ts): REORDER_NODE (non-destructive up/down
 * reorder within a group), ADD_TRACK (creates a new group — reusing
 * AssemblyTrack, not inventing a parallel "groupId" concept), and
 * MOVE_NODE_TO_TRACK (moves an existing node between groups). Enabling
 * real grouping meant a node's track could change at runtime, so
 * REMOVE_NODE/UPDATE_TEMPORAL/UPDATE_SPATIAL/UPDATE_ADVANCED_DIRECTIVE
 * were also corrected to locate a node by its own globally-unique id
 * across every track, rather than trusting a caller-supplied
 * `targetTrackId` that could go stale the instant a node moves group —
 * a necessary correctness fix, not scope creep. The Automatic Director's
 * own composition reasoning (`decideMultiNodeCinematicDirection`,
 * automatic-director.ts) deliberately still only reasons over the first
 * group's nodes — extending it across groups is real "Automatic Director
 * decisions," explicitly out of this package's scope; a disclosed
 * limitation for a future package, not a silent omission.
 *
 * PACKAGE XXI — DIRECTION NODE LAYER (2026-07-28): "Ras Al Amr must begin
 * thinking in terms of Direction rather than files." No new node type, no
 * new runtime: `AssemblyNode` (assembly-contracts.ts) already IS the
 * Direction Node the ruling describes — this package gives it real
 * cinematic identity rather than inventing a parallel structure.
 * `nodeId` (already real, globally unique since the Narrative Canvas
 * Foundation package) is its Direction Node identity. `temporal`/
 * `spatial`/`customDirectives` (already real) are its Direction Node
 * metadata — reframed, not duplicated. The one genuinely new field,
 * `directionRole` (`DirectionNodeRole`), is its cinematic classification
 * — the Chief Architect's own seven examples (Opening Shot/Dialogue
 * Scene/Narration/Music Layer/Ambient Layer/Transition/Closing Shot),
 * never an invented vocabulary, genuinely optional (an unclassified node
 * is an honest state, never defaulted or inferred from its technical
 * assetFamily/capabilityOrigin). "Mapping assets into Direction Nodes" is
 * `CanvasActionType.ADD_NODE` — already real since the Narrative Canvas
 * Foundation package; every placed asset already became this exact
 * structure. `UPDATE_NODE_CLASSIFICATION` (new) lets the Creator assign
 * or change a node's role after placement, reusing `locateNode()`
 * (Package XX) for lookup — zero new lookup logic.
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
      'AssemblyTrack.nodes array order + AssemblyNode.temporal.globalStartTimeSeconds (Packages XIII/XIV, read ' +
      'side) + CanvasActionType.REORDER_NODE (RasAlAmrStateManager, Package XX, write side — a real, ' +
      'non-destructive Creator-triggered reorder, not just a derived value)',
    implemented: true,
  },
  {
    capability: 'Asset grouping',
    constitutionalLocation:
      'AssemblyTrack (assembly-contracts.ts) — already described by its own doc comment as "a logical ' +
      'grouping of Assembly Nodes" since Phase 5, but never used beyond the one default track until Package ' +
      'XX: CanvasActionType.ADD_TRACK creates a new group; CanvasActionType.MOVE_NODE_TO_TRACK moves an ' +
      'existing node between groups, non-destructively',
    implemented: true,
  },
  {
    capability: 'Direction Node identity / metadata / classification',
    constitutionalLocation:
      'AssemblyNode (assembly-contracts.ts) IS the Direction Node — no new type. nodeId is its identity ' +
      '(already real); temporal/spatial/customDirectives are its metadata (already real); DirectionNodeRole ' +
      '(Package XXI, new) — Opening Shot/Dialogue Scene/Narration/Music Layer/Ambient Layer/Transition/Closing ' +
      'Shot — is its cinematic classification, assignable via CanvasActionType.UPDATE_NODE_CLASSIFICATION',
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
      'AssemblyNode.assetId (a Vault reference) — a Creator-uploaded file becomes a real VaultAsset via ' +
      'POST /api/vault/assets/upload (Package XIX), reusing the exact same SovereignVaultManager.depositAsset() ' +
      'boundary Qiyamah generation already deposits through',
    implemented: true,
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

// ── Media Ingestion Sources — Package XIX ────────────────────────────────
// The ruling's own four approved input sources, recorded as real, tested
// data rather than prose alone — matching every prior honest-status
// constant in this codebase (FORMAL_GOAL_CONTRACT_READ_PATH,
// RHYTHM_TRANSITION_TIMING_BASIS, AUDIO_BEAT_ANALYSIS_BASIS). Every
// `available: true` entry names the exact real, already-existing code
// path — never asserted without one.

export interface MediaIngestionSource {
  readonly source: string;
  readonly available: boolean;
  readonly reason: string;
}

export const MEDIA_INGESTION_SOURCES: readonly MediaIngestionSource[] = [
  {
    source: 'Qiyamah-generated assets',
    available: true,
    reason:
      'src/qiyamah-generation/generation-service.ts deposits every successful generation into the Sovereign ' +
      'Vault via SovereignVaultManager.depositAsset() (Integration Package I) — no separate Qiyamah-only asset ' +
      'store exists.',
  },
  {
    source: 'Sovereign Vault assets',
    available: true,
    reason:
      'GET /api/vault/assets already fetches every real, durable VaultAsset for the signed-in Creator; the ' +
      'Summoning Bridge HUD (app/ras-amr/page.tsx) already injects/adds any of them to the canvas, unrestricted ' +
      'by asset family or capability target.',
  },
  {
    source: 'Creator-uploaded files',
    available: true,
    reason:
      'POST /api/vault/assets/upload (Package XIX, new) accepts a real uploaded file, writes its real bytes to ' +
      'public/uploads/ (the same disk-write pattern already proven by Qiyamah\'s own asset-storage.ts), and ' +
      'deposits it as a real VaultAsset through the identical depositAsset() boundary — no parallel pipeline.',
  },
  {
    source: 'Previously saved project assets',
    available: true,
    reason:
      'Honestly interpreted as: assets (not the full canvas arrangement) genuinely persisted from any earlier ' +
      'session and still available now. VaultAsset rows are already durable (SQLite) and GET /api/vault/assets ' +
      'already returns a Creator\'s complete historical asset list on every load, so an asset saved in a prior ' +
      'session is already retrievable and addable to a NEW canvas today. This is explicitly NOT the same claim ' +
      'as "the Creator\'s prior canvas/timeline arrangement resumes automatically" — SovereignCanvas itself has ' +
      'zero durable storage (pure client React state, confirmed by direct investigation), so a full canvas-resume ' +
      'capability does not exist and is not built by this package. If the ruling is later clarified to require ' +
      'that stronger meaning, this entry must be revisited honestly, not silently reinterpreted.',
  },
] as const;
