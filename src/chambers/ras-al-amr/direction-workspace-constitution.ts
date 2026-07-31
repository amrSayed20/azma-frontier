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
 *
 * PACKAGE XXII — MANUAL DIRECTION ENGINE (2026-07-28): the Creator's
 * first real Direction Decisions, distinct from editing. Searched
 * existing architecture first, per this package's own rule: "Promote
 * Node"/"Demote Node" needed NOTHING new — they are
 * `CanvasActionType.REORDER_NODE` (Package XX) under the Manual
 * Direction Engine's own vocabulary. The remaining six decisions
 * (Activate/Disable, Mark as Primary/Supporting, Lock/Unlock) closed
 * with three new mutations, each covering a pair: `SET_NODE_ACTIVE`,
 * `SET_NODE_EMPHASIS`, `SET_NODE_LOCK` — see `MANUAL_DIRECTION_DECISIONS`
 * below for the full, real, tested mapping of all eight named decisions.
 *
 * Locking required one real, deliberate design decision: "Lock
 * Direction" only means something if it genuinely PROTECTS a node's
 * direction from further mutation — so every per-node handler except
 * `SET_NODE_LOCK` itself now checks the node's own lock and no-ops if
 * locked (ras-al-amr-state-manager.ts's own `isNodeLocked()`).
 * `REMOVE_NODE` deliberately stays unguarded: locking protects a node's
 * direction, not the Creator's separate, always-available right to
 * delete it outright.
 *
 * `directionEmphasis` (Mark as Primary/Supporting) is a Creator-DECLARED
 * value, deliberately NOT unified with
 * `MultiNodeCinematicDirectionResult.primaryNodeId`
 * (automatic-director.ts) — that field is a separately-computed,
 * DERIVED judgment from stated Creator Goal data (Package XIII).
 * Reconciling a manual declaration with an automatic inference is real
 * Automatic Director reasoning, explicitly out of this package's scope;
 * a disclosed distinction, not a duplicate concept accidentally left
 * unmerged.
 *
 * PACKAGE XXIII — DIRECTION DECISION MODEL (2026-07-28): Manual Director
 * (Packages XX-XXII) and Automatic Director (automatic-director.ts) never
 * spoke the same decision language — Manual actions went straight from a
 * UI click to a `CanvasMutationPayload`, with no shared representation of
 * "a Direction Decision occurred" at all. `DirectionDecision` below is
 * that shared model — the SMALLEST possible one, per this package's own
 * "no duplicate contracts" rule: it does not re-describe a mutation's own
 * fields in a new shape (that would be a duplicate contract); it simply
 * tags an already-real `CanvasMutationPayload` with WHO issued it
 * (`DirectionOperator`, already real since Package XVIII) and WHEN.
 *
 * WHY THIS IS ALREADY PROVABLY SHARED, NOT JUST "WILL BE LATER": the
 * Automatic Director's own decision-APPLICATION path
 * (`handleApplyDirectorDecision`, app/ras-amr/page.tsx) already dispatches
 * `UPDATE_TEMPORAL`/`UPDATE_ADVANCED_DIRECTIVE` — the exact same
 * `CanvasMutationPayload` variants Manual Director also uses. Because
 * `toDirectionDecision()` is written generically over the whole
 * `CanvasMutationPayload` union, not over Package XX-XXII's own types
 * specifically, it is ALREADY structurally capable of wrapping an
 * Automatic-Director-issued mutation today — proven by this file's own
 * tests, not merely asserted. This package deliberately does NOT wire
 * that call into `handleApplyDirectorDecision` itself (that would touch
 * the Automatic Director's own code path, and "Automatic reasoning" is
 * explicitly out of this package's scope) — only Manual Director's real
 * handlers call it. Future Export/Assembly/Rendering packages, and a
 * future Automatic Director integration, can depend on this exact model
 * without any redesign.
 *
 * PACKAGE XXIV — SOVEREIGN ASSEMBLY RUNTIME (2026-07-28): the first real
 * execution consumer of a `DirectionDecision`. Per the Chief Architect's
 * own ruling — "the Empire does not permit producers without consumers" —
 * construction proceeded in a deliberate order: Assembly Runtime first,
 * Automatic Director integration only afterward. `AssemblyRuntime`
 * (assembly-runtime.ts, new file) consumes a `DirectionDecision` and
 * executes its real mutation via the already-real
 * `RasAlAmrStateManager.applyMutation()` — pure delegation, no new
 * mutation logic, no reasoning of any kind. All nine of Manual Director's
 * real handlers (app/ras-amr/page.tsx) now execute through it rather than
 * calling `RasAlAmrStateManager.applyMutation()` directly. The Automatic
 * Director's own `handleApplyDirectorDecision` remains untouched by this
 * package — it is deliberately NOT yet authorized to emit
 * `DirectionDecision` objects, per the same ruling.
 *
 * PACKAGE XXV — AUTOMATIC DIRECTOR INTEGRATION (2026-07-28): now that the
 * Assembly Runtime exists, `handleApplyDirectorDecision`
 * (app/ras-amr/page.tsx) produces real `DirectionDecision` objects tagged
 * `'automatic-director'` and submits them to the same `AssemblyRuntime`
 * Manual Director already executes through — one constitutional execution
 * path, not two. The Automatic Director still performs zero state
 * mutation or execution itself; its sole responsibility is producing
 * `DirectionDecision` objects from an already-computed judgment
 * (`decideMultiNodeCinematicDirection`, automatic-director.ts — untouched
 * by this package). `handleApplySpatialAdjustment`/
 * `handleApplyVisualAdjustment`/`handleApplyTemporalAdjustment` still call
 * `RasAlAmrStateManager.applyMutation()` directly — deliberately outside
 * this package's authorized scope (Package XXIII's own disclosed
 * boundary: pre-ruling editing controls, not named Direction Decisions),
 * flagged for the Chief Architect rather than silently resolved.
 *
 * PACKAGE XXVI — SOVEREIGN RENDERING ENGINE (2026-07-28): investigated
 * before writing any code, per this package's own "search before
 * extending, extend before creating" rule. Found that
 * `PrePublishingBoundary.compileForPublishing()` (pre-publishing-boundary.ts,
 * pre-existing) ALREADY IS the Rendering Engine this package was
 * authorized to construct, and its `CompiledAssemblyGraph` output ALREADY
 * IS the Render Graph — no new class, no new pipeline, no rename of a
 * working type. Its own doc comment already called the graph "the exact
 * payload handed to the rendering and distribution engines," and Makman's
 * `FlattenedRenderingBridge` (rendering-bridge.ts) already consumes it as
 * "the pure structural assembly graph from Ras Al-Amr." This package adds
 * zero production code — only constitutional naming plus the first-ever
 * test proving the full chain real:
 *
 * - "Consumes the Direction Workspace / Direction Nodes / Assembly Tracks":
 *   `compileForPublishing` takes the live `SovereignCanvas` directly;
 *   `VaultRehydrationBridge.hydrateCanvas()` spreads every real
 *   `AssemblyNode` field (`directionRole`, `isActive`, `directionEmphasis`,
 *   `isLocked` included) onto each `HydratedAssemblyNode` — no field is
 *   dropped, so every Direction Node's full identity participates.
 * - "Consumes Direction Decisions": provably true by construction, not by
 *   assertion — `AssemblyRuntime.execute()` (Package XXIV) is the sole
 *   execution consumer of every `DirectionDecision` from BOTH operators
 *   (Package XXV), so the canvas `compileForPublishing` receives is always
 *   exactly the accumulated effect of every decision ever executed. A
 *   dedicated new test (`__tests__/pre-publishing-boundary.test.ts`, the
 *   first test this file has ever had) issues real DirectionDecisions from
 *   both operators — add, group, reorder, classify, disable, lock —
 *   through the real AssemblyRuntime, then compiles the result and asserts
 *   every one of those effects is visible in the graph.
 * - "Manual and Automatic Directors require no rendering-specific logic":
 *   already true without any change — neither operator's handlers
 *   (app/ras-amr/page.tsx) reference `PrePublishingBoundary` at all; the
 *   pre-existing "Master Render" button (`triggerMasterRender`) only POSTs
 *   to the already-certified compile route and displays the result.
 * - "The Rendering Engine becomes the single constitutional rendering
 *   consumer": already true — `PrePublishingBoundary` is reached through
 *   exactly one path (POST /api/sovereign/entry/ras-al-amr/compile → SOEL
 *   → `PrePublishingBoundary.compileForPublishing`, per that route's own
 *   header comment); Makman's `FlattenedRenderingBridge` consumes the
 *   already-produced graph downstream, it does not independently recompile.
 *
 * NOT built, per this package's own prohibition: video export, file
 * encoding, FFmpeg/Fleet dispatch — Makman's `FlattenedRenderingBridge`
 * already performs real dispatch to a Fleet materialization runtime for
 * cinematic flattening, which is Export Engine territory, not Rendering
 * Engine territory; untouched by this package.
 *
 * PACKAGE XXVII — SOVEREIGN EXPORT ENGINE (2026-07-28): the final
 * constitutional package for the Sovereign Direction State. Investigated
 * first, per this package's own "search first, reuse first" rule, and
 * found the Export Engine already exists as three already-wired
 * components in `src/chambers/makman-al-ghayah/`, none created or
 * redesigned by this package:
 *
 * - `MakmanGoalDistributionBridge.bridgeToDestination()`
 *   (MAKMAN_GOAL_DISTRIBUTION_BRIDGE.ts) — takes the Render Graph (as
 *   `MakmanCommercialIntent.compiledAssemblyGraph`), creates and registers
 *   a `SovereignPublication`, and forwards the SAME graph unmodified to
 *   the Rendering Bridge below.
 * - `FlattenedRenderingBridge.evaluateAndDispatchRender()`
 *   (rendering-bridge.ts) — decides DYNAMIC (structural/logic graphs
 *   served as-is) vs. flattening-required (CINEMATIC), and dispatches
 *   real Fleet materialization intents for the latter.
 * - `PublicConsumptionBoundary.requestConsumption()`
 *   (consumption-boundary.ts) — "to deliver the already-rendered
 *   constitutional output": enforces entitlements/access policy, then
 *   returns the real delivery payload (a dynamic JSON reference or a
 *   flattened Vault asset reference).
 *
 * Reached through exactly two live paths, confirmed by grep of every
 * external reference to these three classes: `POST /api/sovereign/entry/
 * creator-goal` → SOEL.submitCreatorGoal() → ... → bridgeToDestination()
 * (publish/export), and `GET /api/sovereign/entry/consumption` → SOEL.
 * requestConsumption() → PublicConsumptionBoundary.requestConsumption()
 * (delivery) — composed exactly once in src/sovereign-entry/composition.ts.
 * No duplicate export pipeline exists anywhere in the platform.
 *
 * AN HONESTLY DISCLOSED, PRE-EXISTING GAP, NOT CLOSED BY THIS PACKAGE:
 * `FlattenedRenderingBridge`'s Fleet dispatch for CINEMATIC flattening
 * depends on a real `FleetDispatcher`, but composition.ts wires it with
 * `createUnbuiltAlWatinPlaceholder()` (src/sovereign-entry/
 * unbuilt-al-watin-placeholder.ts) — a disclosed placeholder (since
 * MAG-LF-001) whose `ILedgerManager`/`IFleetRegistry` methods throw
 * loudly rather than fabricate success. This means real video/audio file
 * export genuinely fails today for CINEMATIC canvases — caught, and
 * honestly resolved to `RenderStatus.FAILED`, never a false COMPLETED —
 * proven by this package's own new test
 * (`makman-al-ghayah/__tests__/sovereign-export-engine.test.ts`, the
 * first test any of these three files has ever had). Building a real
 * `IFleetRegistry`/`ILedgerManager` would be "new orchestration"/"new
 * media processing," explicitly forbidden by this package's own scope;
 * closing that platform-level gap remains a separate, not-yet-authorized
 * effort. NARRATIVE/DIRECTORIAL (structural/logic graphs) export and
 * deliver successfully today without needing Fleet at all.
 *
 * Confirmed without requiring any change: Manual and Automatic Director
 * (app/ras-amr/page.tsx) reference none of these three classes — export
 * logic lives exclusively in Makman, never in Ras Al Amr's own Direction
 * handlers.
 *
 * RAS AL AMR — MINISTRY I: VOICE ECOSYSTEM (2026-07-29): the first of the
 * Chief Architect's "Final Constitutional Production Phase" production
 * ministries — imported voices, voice library, voice identity, voice
 * selection (NOT generation or cloning — Ministries II/III). Investigated
 * first: no VOICE-specific AssetFamily/CapabilityTarget exists, and none
 * was created — a voice is simply a real VaultAsset (AssetFamily.MEDIA,
 * CapabilityTarget.AUDIO) the Creator explicitly marked as one.
 *
 * - Voice identity / imported voices: `VaultAssetMetadata.isVoiceAsset` /
 *   `voiceDisplayName` (sovereign-vault-types.ts, new, both optional) set
 *   at upload time via POST /api/vault/assets/upload (Package XIX's own
 *   real route, extended, not duplicated) — no parallel ingestion path.
 * - Voice library: `filterVoiceLibrary()` (sovereign-vault-types.ts, new)
 *   — a pure filter over the Creator's already-fetched Vault asset list;
 *   no new storage, no new fetch.
 * - Voice selection: `VoiceAssignmentDirective` (assembly-directive-
 *   payloads.ts, new) under the already-real `UPDATE_ADVANCED_DIRECTIVE`
 *   mutation (new `'voice'` directiveKey added to its existing closed
 *   union) — `RasAlAmrStateManager.handleUpdateAdvanced` is already fully
 *   generic over `directiveKey`, so ZERO state-manager code changed; zero
 *   new `CanvasActionType`. Assigning a voice to a node is a genuine
 *   Manual Direction Decision, executed through `executeDirectionDecision()`
 *   → `AssemblyRuntime.execute()` (app/ras-amr/page.tsx) — the same
 *   Direction Decision → Assembly Runtime path every other real Manual
 *   Direction Decision already uses; nothing bypasses it, per this
 *   phase's own constitutional requirement.
 *
 * RAS AL AMR — MINISTRY II: TEXT TO SPEECH ENGINE (2026-07-29): the
 * Empire's first native voice generation capability. Investigated first:
 * no audio-generation provider wrapper existed anywhere in Ras Al Amr;
 * `speech-provider.ts` (new) mirrors `src/qiyamah-generation/
 * image-provider.ts`'s own exact isolation shape (single point of
 * contact with the Launch Provider, cached client, provider-neutral),
 * living in Ras Al Amr rather than Qiyamah per the Sovereign Direction
 * State ruling. Its sole output is a Voice Asset — it never directs,
 * renders, or exports. `POST /api/vault/assets/generate-speech` (new)
 * persists the generated audio through the SAME
 * `persistUploadedAsset()`/`SovereignVaultManager.depositAsset()`
 * boundary Ministry I's own upload path already uses, tagged with the
 * SAME `isVoiceAsset`/`voiceDisplayName` metadata — imported and
 * generated voices coexist in exactly one Voice Library, one Voice
 * Selection path (`VoiceAssignmentDirective`, unchanged from Ministry I).
 * No new AssetFamily/CapabilityTarget, no new mutation, no new
 * state-manager code. Gated behind the same billing entitlement every
 * other real AI generation capability already requires — TTS consumes
 * the same paid Launch Provider as Qiyamah's own image generation.
 */

import type { CanvasMutationPayload } from './assembly-directive-payloads';

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

// ── Direction Decision Model — Package XXIII ─────────────────────────────
// The single shared constitutional contract every Direction Decision — no
// matter which operator issued it — is represented as. Deliberately NOT a
// new description of a mutation's own fields (that would be a "duplicate
// contract" per this package's own rule): it is a thin, generic wrapper
// tagging an already-real CanvasMutationPayload with WHO issued it and
// WHEN. Manual Director's real handlers (app/ras-amr/page.tsx) already
// build these; Export/Assembly/Rendering and a future Automatic Director
// integration can all depend on this exact shape without redesign.

export interface DirectionDecision {
  readonly operator: DirectionOperator;
  readonly mutation: CanvasMutationPayload;
  readonly issuedAtMs: number;
}

export function toDirectionDecision(
  operator: DirectionOperator,
  mutation: CanvasMutationPayload,
  issuedAtMs: number = Date.now(),
): DirectionDecision {
  return { operator, mutation, issuedAtMs };
}

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
    capability: 'Voice cloning',
    constitutionalLocation:
      'voice-cloning-provider.ts (Ministry III, new) wraps the Launch Provider\'s real voice cloning API, ' +
      'mirroring speech-provider.ts\'s own isolation pattern; POST /api/vault/assets/clone-voice (new) ' +
      'reads the Creator\'s own reference Voice Asset from local storage, submits it to the Launch Provider, ' +
      'and deposits the resulting cloned voice identity as a new Sovereign Voice Asset — tagged ' +
      'isVoiceAsset/isClonedVoice/voiceDisplayName/clonedVoiceProviderId exactly like every other Voice ' +
      'Asset (Ministry I imported, Ministry II TTS-generated) — one Voice Library, one Voice Selection ' +
      'path, no duplicate pipeline. Gated behind the same billing entitlement every other real AI ' +
      'generation capability requires.',
    implemented: true,
  },
  {
    capability: 'Imported voice management (library / identity / selection)',
    constitutionalLocation:
      'VaultAssetMetadata.isVoiceAsset/voiceDisplayName (sovereign-vault-types.ts, Ministry I) — a real, ' +
      'Creator-declared classification set at upload time (POST /api/vault/assets/upload); ' +
      'filterVoiceLibrary() is the real Voice Library query; VoiceAssignmentDirective under ' +
      "CanvasActionType.UPDATE_ADVANCED_DIRECTIVE ('voice' directiveKey, assembly-directive-payloads.ts) is " +
      'real Voice Selection, executed through the same Direction Decision / Assembly Runtime path as every ' +
      'other Manual Direction Decision. Voice cloning remains separately unbuilt (see above)',
    implemented: true,
  },
  {
    capability: 'Text To Speech (Voice Asset generation)',
    constitutionalLocation:
      'speech-provider.ts (Ministry II, new) wraps the Launch Provider\'s real TTS API, mirroring ' +
      'src/qiyamah-generation/image-provider.ts\'s own isolation pattern; POST /api/vault/assets/' +
      'generate-speech (new) persists the real generated audio via the already-real ' +
      'persistUploadedAsset()/SovereignVaultManager.depositAsset() boundary, tagged isVoiceAsset/' +
      'voiceDisplayName exactly like an imported voice (Ministry I) — one Voice Library, one Voice ' +
      'Selection path, no duplicate pipeline. Gated behind the same billing entitlement every other real ' +
      'AI generation capability requires',
    implemented: true,
  },
  {
    capability: 'Music / sound placement',
    constitutionalLocation:
      'Music Asset (CapabilityTarget.AUDIO, DirectionNodeRole.MUSIC_LAYER) placed as AssemblyNode via ADD_NODE; ' +
      'AudioMixingDirective written via UPDATE_ADVANCED_DIRECTIVE(\'audio\') through AssemblyRuntime; ' +
      'compiled into CompiledMixPlan.nodeMixes by PrePublishingBoundary.compileMixPlan() — Ministry IV',
    implemented: true,
  },
  {
    capability: 'Mixing',
    constitutionalLocation:
      'AudioMixingDirective (assembly-directive-payloads.ts): volumeDb/panCenter/isMuted/fadeInSeconds/fadeOutSeconds; ' +
      'AssemblyTrack.trackVolumeDb (assembly-contracts.ts) via SET_TRACK_VOLUME mutation; ' +
      'UPDATE_ADVANCED_DIRECTIVE(\'audio\') → AssemblyRuntime → RasAlAmrStateManager; ' +
      'CompiledMixPlan (nodeMixes + trackMixes) compiled by PrePublishingBoundary.compileMixPlan() — Ministry IV; ' +
      'all three Sovereign Voice Asset types (imported/TTS/cloned) mix through the same path',
    implemented: true,
  },
  {
    capability: 'Subtitle decisions',
    constitutionalLocation:
      'SubtitleDirective (subtitle-directive.ts) in AssemblyNode.customDirectives.subtitles; ' +
      'written via UPDATE_ADVANCED_DIRECTIVE(\'subtitles\') through AssemblyRuntime; ' +
      'parseSrt()/parseVtt() (subtitle-parser.ts) → POST /api/vault/assets/import-subtitles; ' +
      'CompiledSubtitlePlan.absoluteCues compiled by PrePublishingBoundary.compileSubtitlePlan() — Ministry V; ' +
      'cue times are relative to parent Direction Node, made absolute only at compile time',
    implemented: true,
  },
  {
    capability: 'Export / delivery',
    constitutionalLocation:
      'SUPERSEDED by "Sovereign Export Engine (Render Graph delivery)" below (Package XXVII) — ' +
      'MakmanGoalDistributionBridge/FlattenedRenderingBridge/PublicConsumptionBoundary now publish, ' +
      'render-dispatch, and deliver in full for all three canvas types. CINEMATIC flattening dispatches a ' +
      'real fleet job (Ministry VII), records PROCESSING in the Cinematic Ledger (Ministry VIII), and ' +
      'resolves to COMPLETED via GET /api/ras-amr/resolution/[operationId] (Resolution Gate 6059812). ' +
      'The disclosed Fleet/Ledger placeholder gap (MAG-LF-001) is fully closed.',
    implemented: true,
  },
  {
    capability: 'Manual Direction Decisions (Promote/Demote/Activate/Disable/Mark Primary/Mark Supporting/Lock/Unlock)',
    constitutionalLocation:
      'AssemblyNode.isActive/directionEmphasis/isLocked (assembly-contracts.ts) via ' +
      'CanvasActionType.REORDER_NODE (reused, Package XX)/SET_NODE_ACTIVE/SET_NODE_EMPHASIS/SET_NODE_LOCK ' +
      '(Package XXII) — see MANUAL_DIRECTION_DECISIONS below for the full, tested mapping',
    implemented: true,
  },
  {
    capability: 'Shared Direction Decision language (Manual + Automatic)',
    constitutionalLocation:
      'DirectionDecision + toDirectionDecision() (this file, Package XXIII) — a thin operator/timestamp wrapper ' +
      'around the already-real CanvasMutationPayload union; both Manual Director\'s nine handlers and the ' +
      'Automatic Director\'s handleApplyDirectorDecision (Package XXV) produce it today, tagged with their own ' +
      'real operator, through the exact same builder function',
    implemented: true,
  },
  {
    capability: 'Assembly Runtime (DirectionDecision execution)',
    constitutionalLocation:
      'AssemblyRuntime.execute() (assembly-runtime.ts, Package XXIV) — the single constitutional execution ' +
      'consumer of a DirectionDecision, delegating purely to the already-real ' +
      'RasAlAmrStateManager.applyMutation(); all nine Manual Director handlers execute through it. The ' +
      'Automatic Director does not yet emit DirectionDecision objects — that integration awaits separate ' +
      'authorization per the Chief Architect\'s "no producers without consumers" ruling',
    implemented: true,
  },
  {
    capability: 'Automatic Director Direction Decision emission',
    constitutionalLocation:
      'handleApplyDirectorDecision (app/ras-amr/page.tsx, Package XXV) builds real DirectionDecision objects ' +
      'via toDirectionDecision(\'automatic-director\', ...) and submits them to AssemblyRuntime.execute() — ' +
      'the same execution path Manual Director uses; the Automatic Director itself never mutates state or ' +
      'executes anything directly',
    implemented: true,
  },
  {
    capability: 'Sovereign Rendering Engine (Render Graph production)',
    constitutionalLocation:
      'PrePublishingBoundary.compileForPublishing() (pre-publishing-boundary.ts, Package XXVI) IS the ' +
      'Rendering Engine — its CompiledAssemblyGraph output IS the Render Graph, faithfully materializing ' +
      'the current Direction Workspace (via VaultRehydrationBridge, every AssemblyNode field preserved) and ' +
      'reflecting every Direction Decision ever executed through AssemblyRuntime, proven end-to-end by ' +
      '__tests__/pre-publishing-boundary.test.ts. Reached through exactly one live path (SOEL); video ' +
      'export/encoding/Fleet dispatch remain future Export Engine work',
    implemented: true,
  },
  {
    capability: 'Sovereign Export Engine (Render Graph delivery)',
    constitutionalLocation:
      'MakmanGoalDistributionBridge.bridgeToDestination() + FlattenedRenderingBridge.evaluateAndDispatchRender() ' +
      '+ PublicConsumptionBoundary.requestConsumption() (src/chambers/makman-al-ghayah/, Package XXVII) ARE the ' +
      'Export Engine — publish, render-dispatch, and deliver the already-produced Render Graph, reached ' +
      'through exactly two live SOEL paths. NARRATIVE/DIRECTORIAL export and deliver synchronously (DYNAMIC). ' +
      'CINEMATIC dispatches a real fleet job → OperationLedgerManager (Ministry VII) → CinematicLedger records ' +
      'PROCESSING (Ministry VIII) → Creator polls GET /api/ras-amr/resolution/[operationId] → ' +
      'AsynchronousResolutionGateway resolves → Vault deposition → CinematicLedger updated COMPLETED ' +
      '(Resolution Gate 6059812). The complete cinematic production lifecycle — Direction to final production ' +
      'record — is constitutionally complete.',
    implemented: true,
  },
  {
    capability: 'Project Resume (canvas persistence)',
    constitutionalLocation:
      'sovereign_canvases table (src/persistent-storage/schema.ts); ' +
      'saveCanvas()/loadCanvas()/listCanvasesForTenant() (src/persistent-storage/canvas-repository.ts); ' +
      'POST /api/ras-amr/canvas (save, tenant-forced from session) + ' +
      'GET /api/ras-amr/canvas/[canvasId] (restore full SovereignCanvas) + ' +
      'GET /api/ras-amr/canvas (list summaries); ' +
      'restoration IS the SovereignCanvas itself — JSON-roundtripped, no secondary state, no reconstruction; ' +
      'Manual Director, Automatic Director, Assembly Runtime, and Rendering Engine all resume from the same object — Ministry VI',
    implemented: true,
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

// ── Manual Direction Decisions — Package XXII ────────────────────────────
// The eight named Direction Decisions, recorded as real, tested data —
// each row cites the exact real mutation that implements it, so "did we
// cover all eight" is a provable fact, not a claim.

export interface ManualDirectionDecisionMapping {
  readonly decision: string;
  readonly realMechanism: string;
}

export const MANUAL_DIRECTION_DECISIONS: readonly ManualDirectionDecisionMapping[] = [
  {
    decision: 'Promote Node',
    realMechanism: "CanvasActionType.REORDER_NODE with direction: 'up' (reused from Package XX, no new mutation)",
  },
  {
    decision: 'Demote Node',
    realMechanism: "CanvasActionType.REORDER_NODE with direction: 'down' (reused from Package XX, no new mutation)",
  },
  {
    decision: 'Activate Node',
    realMechanism: 'CanvasActionType.SET_NODE_ACTIVE with active: true',
  },
  {
    decision: 'Disable Node',
    realMechanism: 'CanvasActionType.SET_NODE_ACTIVE with active: false',
  },
  {
    decision: 'Mark as Primary',
    realMechanism: "CanvasActionType.SET_NODE_EMPHASIS with emphasis: 'primary'",
  },
  {
    decision: 'Mark as Supporting',
    realMechanism: "CanvasActionType.SET_NODE_EMPHASIS with emphasis: 'supporting'",
  },
  {
    decision: 'Lock Direction',
    realMechanism: 'CanvasActionType.SET_NODE_LOCK with locked: true',
  },
  {
    decision: 'Unlock Direction',
    realMechanism: 'CanvasActionType.SET_NODE_LOCK with locked: false',
  },
] as const;
