/**
 * AZMA OS – Ras Al-Amr Chamber (Hollywood Master Director Console)
 * File: app/ras-amr/page.tsx
 *
 * IMPERIAL CHAMBER UNIFICATION, PACKAGE I (2026-07-23): wrapped in
 * RasAmrExperience (src/imperial-experience-engine/experiences/ras-amr/)
 * — additive only, no logic below changed. One real, pre-existing bug
 * fixed as a side effect of this wrap: the root <main>'s className was
 * 'ras-amr-chamber-viewport', which matched no rule in ras-amr.css (the
 * real selector is '.ras-amr-viewport') — the intended fixed/flex-column
 * layout was silently never applying. Corrected to the real class name.
 *
 * INTEGRATION PACKAGE III — THE FIRST CHAMBER-TO-CHAMBER OPERATIONAL
 * FLOW (2026-07-25): the Sovereign Summoning Bridge now enumerates and
 * consumes real assets from the real Sovereign Vault, via the same
 * GET /api/vault/assets route Integration Package II built for Vault
 * Palace — no new backend, no new orchestration layer, the smallest
 * real connection available. The fake vaultRepositories catalogue
 * (6 hardcoded categories, 18 fabricated item names) is removed
 * entirely, not hidden, per this platform's own remove-not-cover rule
 * — real categories are derived from whatever capabilityTarget values
 * actually exist in the Creator's real Vault. initialSmartQueue's 3
 * pre-seeded demo items are untouched — a separate, already-disclosed
 * gap this Package's own directive did not ask to close.
 *
 * INTEGRATION PACKAGE IV — FROM DIRECTION TO FULFILLMENT (2026-07-25):
 * the "forward to Makman" button now carries a real handoff payload
 * (sessionStorage, the exact same one-shot convention Vault Palace's
 * own cross-chamber transfers already use) whenever the active queue
 * item is a real, Vault-sourced asset — no fabricated title, no
 * fabricated preview reaches Makman. When the active item is one of
 * initialSmartQueue's pre-seeded demo entries (not real), navigation
 * behaves exactly as before this Package — no payload, Makman falls
 * back to its own existing display, nothing regresses.
 *
 * RAS AL AMR COMPLETION PACKAGE I — REAL DIRECTOR COMPILATION
 * (2026-07-25): Master Render no longer simulates — it calls the real,
 * already-certified POST /api/sovereign/entry/ras-al-amr/compile
 * (PrePublishingBoundary + VaultRehydrationBridge, untouched), building
 * a minimal, honest single-track, single-node SovereignCanvas from the
 * currently active REAL asset. Only enabled when the active item is
 * real — there is nothing genuine to compile from a demo seed item, and
 * per this Package's own success criteria the primary workflow no
 * longer relies on simulated compilation at all; the button is disabled
 * with a visible explanation rather than falling back to the old fake
 * timer. No Automatic Director logic, no new Hollywood tools, no
 * publishing/release, no changes to Makman — compilation ends at a real
 * CompiledAssemblyGraph shown in this Chamber's own console.
 *
 * THE CORRIDOR PACKAGE — RAS AL AMR TO MAKMAN (2026-07-25): the real
 * CompiledAssemblyGraph a successful Master Render produces is now kept
 * in state, and "forward to Makman" carries it onward — via the exact
 * same one-shot sessionStorage handoff convention already used for the
 * raw production payload — under its own key, separate from that raw
 * payload, so Makman can tell "a title/preview arrived" apart from "a
 * real sealed assembly arrived, ready to submit to real distribution."
 * Only ever set from a graph this Chamber itself really compiled — never
 * fabricated for a demo item.
 *
 * REAL SPATIAL ADJUSTMENT PACKAGE (2026-07-26): RasAlAmrStateManager
 * (src/chambers/ras-al-amr/ras-al-amr-state-manager.ts) was real, working,
 * pure/stateless logic with zero live callers — its only caller was an
 * orphaned chamber-integration adapter no app/ page ever imports. Council
 * authorized wiring it into the live Hollywood tools; investigation found
 * the six named tools (pixel-grade, neural-sync, chroma-forge, ai-director,
 * optical-flow) don't correspond to any real computation anywhere in this
 * platform — there is no LUT engine, no audio DSP, no optical-flow
 * interpolation to back them, and inventing plausible-looking values for
 * them would repeat the exact "fake precision" mistake just declined for
 * Hujjah Al-Damighah's orphaned confidence/verdict engines. Those five
 * buttons are therefore left exactly as they were — still cosmetic,
 * still disclosed as such — and this Package instead wires the ONE
 * directive kind with a real, simple, meaningful, Creator-authored shape
 * that needs no unbuilt rendering backend to mean something: Spatial
 * (position/scale/rotation — see SpatialDirective, assembly-contracts.ts).
 * A real per-session SovereignCanvas is now seeded when a real asset
 * becomes active; a real spatial-adjustment control lets the Creator set
 * genuine values, applied via RasAlAmrStateManager.applyMutation(); Master
 * Render now compiles that real, possibly-edited canvas instead of always
 * building a bare single-node one from scratch — so a real spatial edit
 * genuinely reaches the compiled output for the first time.
 *
 * REAL VISUAL + TEMPORAL ADJUSTMENT (2026-07-26, per the Chief Architect's
 * Minimum Construction directive — extend, don't duplicate): the same
 * honest pattern as Spatial, extended to the two other directive kinds
 * the assembly contracts already define with real, well-formed shapes.
 * pixel-grade and chroma-forge both drive ONE real Visual directive
 * (opacity/blendMode/optional colorGradeReferenceId — the chamber has
 * exactly one real 'visual' slot per node, so two buttons sharing one
 * real editor is honest, not a compromise). neural-sync drives a real
 * Temporal directive (start time/duration/trim) — "sync" has no real
 * audio-mixing field to back it, but timing on the master timeline is
 * the truthful reading of what synchronization means here. ai-director
 * and optical-flow remain untouched pending their own separately-scoped
 * packages (the former now has a real constitutional definition — the
 * Cinematic Direction Decision — but building it is a new package, not
 * this one; the latter needs a genuinely new contract field, which this
 * directive's own "don't invent speculative architecture" rule reserves
 * for an explicit future decision).
 *
 * THE AUTOMATIC DIRECTOR — CINEMATIC DIRECTION DECISION (separately
 * scoped package, per the approved constitutional specification): a new
 * pure function, decideCinematicDirection() (src/chambers/ras-al-amr/
 * automatic-director.ts), decides — never generates or mutates — a real
 * Cinematic Direction Decision for the active real Vault asset: asset
 * inclusion/rejection (structural validity, not creative judgment),
 * scene timing (the asset's own real duration metadata when present,
 * the platform's existing fallback default otherwise, never a fabricated
 * value), narrative sequencing position, and audio placement for an
 * AUDIO-capability asset — reusing the exact same TemporalDirective/
 * StructuralLogicDirective/AudioMixingDirective contracts and the same
 * RasAlAmrStateManager execution engine the Spatial/Visual/Temporal
 * panels already use; no new runtime, no new execution layer. Rhythm and
 * transition strategy are honestly left null: both require more than the
 * one node this Chamber's canvas can compile today, and optical-flow's
 * own precedent already ruled that fabricating a value the platform
 * cannot execute repeats the exact mistake this directive exists to
 * prevent. A new "REAL — DIRECTOR" panel shows the decision and applies
 * it via the same non-destructive mutation path as its siblings.
 *
 * THE NARRATIVE CANVAS FOUNDATION (2026-07-27, per Chief Architect
 * authorization — structure only, no execution behavior): sessionCanvas
 * was a single-node scratch pad, rebuilt from scratch every time the
 * active queue item changed. It is now a persistent, multi-asset
 * workspace: created once (still lazily, on the first real asset), never
 * torn down afterward. A real "أضف الأصل النشط" action adds the
 * currently active real asset as its own AssemblyNode via
 * RasAlAmrStateManager's own ADD_NODE handler — already fully built,
 * previously zero real callers anywhere in the platform (see
 * project_idle_treasures_investigation's own finding) — reused here, not
 * duplicated. One real, disclosed bug fixed in the same handler:
 * AddNodePayload never carried the asset's real family/capability, so
 * every added node silently claimed AssetFamily.MEDIA/CapabilityTarget.
 * VISUAL regardless of what it actually was — harmless while nothing
 * called it, but a real constitutional-identity violation the instant it
 * became Creator-visible. assetFamily/capabilityOrigin are now optional
 * additive fields on the existing payload (backward compatible with any
 * other untyped caller), and this page always supplies the real values.
 * A node is selected (selectedNodeId) rather than always assumed to be
 * 'node-1'; the existing Spatial/Visual/Temporal/Director panels now
 * target whichever node is selected — a mechanical generalization, not
 * new logic. Ordered placement is the node's own position in the
 * track's nodes[] array (no second, parallel ordering field invented).
 * Temporal relationship per node defaults to the platform's existing
 * neutral values and is otherwise only ever Creator- or Director-set —
 * no cascading/auto-sequenced timing is computed anywhere here. Master
 * Render, the compile route, and the Corridor Package's forward-to-
 * Makman staleness guard are untouched — compiling a multi-node canvas
 * already worked (PrePublishingBoundary/VaultRehydrationBridge iterate
 * every track's every node generically; verified by direct inspection),
 * so no execution-layer change was needed or made.
 *
 * PACKAGE VI — THE CINEMATIC JUDGMENT CONSTITUTION (2026-07-27): a new
 * declarative file, src/chambers/ras-al-amr/automatic-director-
 * constitution.ts, records the Automatic Director's judgment rules —
 * the priority hierarchy (Creator Goal > Constitutional Identity >
 * Narrative Integrity > Emotional Continuity > Cinematic Beauty, real
 * data today, honestly not yet fed any real Goal signal to resolve), the
 * shared EvidenceBasis vocabulary (now also used by automatic-
 * director.ts's own temporalBasis, replacing its private union), and one
 * real, called rule: validateNarrativeIntegrity(), which audits the
 * Narrative Canvas for duplicate assets or malformed temporal values and
 * surfaces any violation directly in the Narrative Canvas panel below.
 * No new orchestration, no new execution engine — judgment data and one
 * pure validation function only.
 *
 * PACKAGE VII — CREATOR GOAL INTEGRATION (2026-07-27): the Director now
 * derives a real, honest Creator Goal signal from the active node's own
 * VaultAsset.metadata.generationPrompt (already fetched, no new plumbing)
 * and reports which Article IX hierarchy tier actually drove each
 * decision (creatorGoal/primaryConsideration, surfaced in the Director
 * panel below). The formal Makman GoalContract was investigated and
 * deliberately not wired in — see automatic-director-constitution.ts's
 * own header for exactly why (it is created FROM an already-compiled
 * graph, for distribution, and not honestly queryable back into
 * directing without new infrastructure this package declines to build).
 *
 * PACKAGE VIII — HONEST CREATOR GOAL SOURCE INTEGRATION (2026-07-27):
 * re-investigated whether a real, boundary-respecting, tenant-safe
 * GoalContract read path exists — it does not (see automatic-director-
 * constitution.ts's own four-point finding: GoalState.getGoal() works
 * but SOEL forwards no read method; GoalContract carries no tenant
 * field; no goalId ever links back to the originating asset/canvas).
 * Recorded as real, tested data (FORMAL_GOAL_CONTRACT_READ_PATH), not
 * just prose. creatorGoal now also carries `source: 'asset-prompt-echo'`
 * so nothing in this Chamber's output ever implies a richer source than
 * genuinely exists.
 *
 * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE (2026-07-27): all
 * three prerequisites Package VIII found missing are now real (tenant
 * field, SOEL forward, goalId linkage — see automatic-director-
 * constitution.ts's own account). This page fetches the formal Goal
 * only when the selected asset's own metadata.goalId is present (never
 * guessed), via the new sanctioned GET /api/sovereign/entry/
 * creator-goal/[goalId] route, and passes it into
 * decideCinematicDirection() as an optional argument — the function
 * itself stays pure and network-free. Prompt-echo remains the honest
 * fallback whenever no goalId is linked yet.
 *
 * PACKAGE X — CREATOR GOAL INPUT EXPANSION (2026-07-27): the Director
 * panel now also shows the formal Goal's own title/priority when the
 * formal source is active — real GoalContract fields, never invented.
 * commercialIntent was deliberately not shown at this time: it was
 * investigated and found genuinely unavailable from this read path (see
 * Package XI below for the resolution).
 *
 * PACKAGE XI — COMMERCIAL INTENT DURABLE STORAGE (2026-07-27):
 * commercialIntent is now genuinely durable (see automatic-director-
 * constitution.ts's own Package XI account) and the panel shows a scoped
 * view of it — distributionTier and whether cover art exists — only when
 * the fetched formal GoalContract genuinely carries one. Never shown for
 * prompt-echo or an older Goal created before this package's own wiring.
 *
 * PACKAGE XII — FULL MAKMAN COMMERCIAL INTENT READ DECISION (2026-07-27):
 * investigated whether any consumer needs the full MakmanCommercialIntent
 * and found none (see automatic-director-constitution.ts's own
 * FULL_COMMERCIAL_INTENT_READ_DECISION) — this page never did either. The
 * `formalGoal` state is now typed `FormalGoalContractView`, not the full
 * `GoalContract`, matching what the GET route itself now actually sends;
 * this is a type-honesty correction, not a behavior change — the panel
 * already only ever read description/title/priority/commercialIntent's
 * scoped fields.
 *
 * PACKAGE XIII — MULTI-NODE CINEMATIC DIRECTION (2026-07-27): the
 * Narrative Canvas panel now also computes `multiNodeDirection` — a real
 * judgment across every node currently on the canvas, via the new
 * `decideMultiNodeCinematicDirection` (automatic-director.ts). It marks
 * the real primary node (★) when the evidence honestly singles one out,
 * and states plainly when it does not (no stated Goal anywhere, or more
 * than one competing). A formal Goal is still only genuinely fetched for
 * the selected node; every other node's own decision honestly falls back
 * to prompt-echo, exactly as the single-node case already did when no
 * formalGoal was available.
 *
 * PACKAGE XIV — TIMING SIGNAL FOUNDATION (2026-07-27): `directorDecision`
 * (the selected node's own detail decision) is now derived directly from
 * `multiNodeDirection` instead of a second, separate
 * `decideCinematicDirection` call — one source of truth for both its
 * real `executionOrderIndex` and its real, cumulative
 * `globalStartTimeSeconds`, rather than two computations that could
 * honestly drift apart. The Narrative Canvas node list now also shows
 * each node's real PROPOSED sequential start/end time (from
 * `multiNodeDirection`) alongside its already-APPLIED one (from the
 * canvas's own persisted `node.temporal`) — judgment and execution stay
 * visibly distinct, never conflated.
 *
 * PACKAGE XV — CREATOR PACING PREFERENCE FOUNDATION (2026-07-27): the
 * Director panel now shows the real `rhythm` value (the Creator's own
 * stated `pacingPreference`, echoed verbatim) when the fetched formal
 * Goal genuinely carries one — see automatic-director-constitution.ts's
 * own account for where that preference is set and stored. No UI change
 * was needed to fetch it: `formalGoal` was already being fetched for the
 * selected node since Package IX; this package only added the field to
 * what that fetch honestly returns.
 *
 * PACKAGE XVI — CREATOR TRANSITION PREFERENCE FOUNDATION (2026-07-27): the
 * same panel line now also shows the real `transitionStrategy` value (the
 * Creator's own stated `transitionPreference`, echoed verbatim) the same
 * way — a genuinely distinct, independent field from rhythm/pacing, never
 * derived from it.
 *
 * PACKAGE XVIII — DIRECTION WORKSPACE FOUNDATION (2026-07-28): per the
 * Chief Architect's Constitutional Ruling naming Ras Al Amr "The Sovereign
 * State of Direction," the `tools-sidebar` aside below — already the one
 * real, shared container for both the `directingMode` toggle and every
 * "REAL —" panel (Narrative Canvas, Spatial, Visual, Temporal, Director)
 * — is now explicitly labeled as the visible Direction Workspace. No
 * restructuring: this was already the single sovereign state both
 * operators shared; only its constitutional identity is now named, in
 * the UI and in `direction-workspace-constitution.ts` (new file, the
 * declarative registry of where future Direction capabilities — voice,
 * imported media, export, etc. — will constitutionally attach).
 *
 * PACKAGE XIX — MEDIA INGESTION LAYER (2026-07-28): the Sovereign
 * Summoning Bridge HUD drawer now also carries a real file-upload control
 * (`handleUploadAsset`). A Creator-uploaded file becomes a genuine
 * VaultAsset through `POST /api/vault/assets/upload` — the same
 * `SovereignVaultManager.depositAsset()` boundary Qiyamah generation
 * already deposits through — and is appended to the same `vaultAssets`
 * list this drawer already reads, so it is immediately injectable and
 * addable to the canvas through the exact same, already-existing paths.
 * No new asset registry, no parallel ingestion pipeline. Of the ruling's
 * four approved input sources, this closes the one genuine gap (Creator
 * uploads); Qiyamah-generated and Sovereign Vault assets were already
 * real (see direction-workspace-constitution.ts's own
 * MEDIA_INGESTION_SOURCES for the full, honest account, including why
 * "previously saved project assets" is satisfied by Vault durability
 * across sessions rather than by a full canvas-resume feature, which
 * does not exist and is not built by this package).
 *
 * PACKAGE XX — DIRECTION ASSEMBLY LAYER (2026-07-28): the Narrative
 * Canvas panel now renders every real group (`sessionCanvas.tracks`), not
 * just the first — each with its own node list, real up/down reorder
 * buttons (`handleReorderNode`), and a real "move to group" control
 * (`handleMoveNodeToGroup`), plus a real "add group" control
 * (`handleAddGroup`). `selectedNode`/`narrativeIntegrity` now scan every
 * group instead of assuming `tracks[0]`. The Automatic Director's own
 * `multiNodeDirection` deliberately still reasons only over the first
 * group's nodes — extending its composition judgment across groups is
 * real Automatic Director decision-making, explicitly out of this
 * package's scope; a disclosed limitation, not a silent gap.
 *
 * PACKAGE XXI — DIRECTION NODE LAYER (2026-07-28): each node's own row
 * now carries a real cinematic classification select (`DirectionNodeRole`
 * — Opening Shot/Dialogue Scene/Narration/Music Layer/Ambient Layer/
 * Transition/Closing Shot, plus an honest "not classified" default),
 * wired to `handleUpdateNodeClassification`. The node's own display line
 * echoes its real assigned role when one exists. No new node type, no
 * new runtime — `AssemblyNode` already was the Direction Node; this only
 * gives the Creator a real way to assign it cinematic identity.
 *
 * PACKAGE XXII — MANUAL DIRECTION ENGINE (2026-07-28): each node's row now
 * also carries an emphasis select (Mark as Primary/Supporting,
 * `handleSetNodeEmphasis`), an active toggle (Activate/Disable,
 * `handleSetNodeActive`), and a lock toggle (Lock/Unlock Direction,
 * `handleSetNodeLock`) — real Direction Decisions, not editing. "Promote
 * Node"/"Demote Node" reuse the existing up/down reorder buttons
 * (`handleReorderNode`, Package XX) verbatim — no new control was needed.
 * A locked node visibly dashes its border and disables every control
 * except the lock toggle itself and removal; a disabled node visibly
 * dims. Both states are real, stored, and enforced by
 * RasAlAmrStateManager, not decorative.
 *
 * PACKAGE XXIII — DIRECTION DECISION MODEL (2026-07-28): every one of the
 * nine real Manual Direction handlers above (`handleAddActiveAssetToCanvas`
 * through `handleSetNodeLock`) wraps the exact same real
 * `CanvasMutationPayload` it already builds into a real `DirectionDecision`
 * (`toDirectionDecision()`, direction-workspace-constitution.ts) — tagging
 * it `'manual-director'` plus a real timestamp — and appends it to a real,
 * visible, capped `directionDecisionLog`. The Narrative Canvas panel shows
 * the most recent one live, so "Manual decisions produce it" is a
 * provable, live-verifiable fact, not just a callable function.
 * `handleApplySpatialAdjustment`/`handleApplyVisualAdjustment`/
 * `handleApplyTemporalAdjustment` also feed this log — wired through
 * `executeDirectionDecision()` during Constitutional Consolidation
 * (Chief Architect ruling 2026-07-31) which closed the final transitional
 * path. Every execution path in the Sovereign State of Direction now
 * flows through `AssemblyRuntime.execute()` without exception.
 *
 * PACKAGE XXIV — SOVEREIGN ASSEMBLY RUNTIME (2026-07-28): those same nine
 * handlers no longer call `RasAlAmrStateManager.applyMutation()` directly.
 * A new single helper, `executeDirectionDecision()`, builds the
 * `DirectionDecision`, appends it to the visible log, and then executes it
 * through `AssemblyRuntime.execute()` (assembly-runtime.ts, new file,
 * Package XXIV) — the Empire's first real execution consumer of a
 * `DirectionDecision`. `AssemblyRuntime` performs no reasoning; it is pure
 * delegation to the already-real `RasAlAmrStateManager.applyMutation()`.
 * The Automatic Director's own `handleApplyDirectorDecision` was
 * deliberately left untouched by this package — per the Chief Architect's
 * own ruling, "the Empire does not permit producers without consumers,"
 * it could not begin emitting `DirectionDecision` objects until the
 * Runtime existed to consume them.
 *
 * PACKAGE XXV — AUTOMATIC DIRECTOR INTEGRATION (2026-07-28): now that the
 * Runtime exists, `handleApplyDirectorDecision` no longer calls
 * `RasAlAmrStateManager.applyMutation()` directly either. Its three real
 * mutations (temporal, structural, optional audio) each become their own
 * real `DirectionDecision`, tagged `'automatic-director'`, executed through
 * the same `AssemblyRuntime.execute()` Manual Director already uses —
 * `executeDirectionDecision()` gained an `operator` parameter
 * (`DirectionOperator`, default `'manual-director'`) for exactly this. The
 * Automatic Director still performs zero reasoning here — the reasoning
 * (`directorDecision`, from `multiNodeDirection`) was already computed
 * upstream by `automatic-director.ts`; this handler only ever produces
 * `DirectionDecision` objects from an already-decided judgment, never
 * mutates state itself, and never executes anything outside the Runtime.
 * `handleApplySpatialAdjustment`/`handleApplyVisualAdjustment`/
 * `handleApplyTemporalAdjustment` now also route through
 * `executeDirectionDecision()` — the Constitutional Consolidation
 * (Chief Architect ruling 2026-07-31) closed the final transitional path.
 * `RasAlAmrStateManager.applyMutation()` is no longer called directly by
 * any handler in this file; every mutation flows through
 * `AssemblyRuntime.execute()` without exception.
 *
 * MINISTRY I — VOICE ECOSYSTEM (2026-07-29): real Voice Library, Voice
 * Identity, Imported Voices, and Voice Selection. The upload form
 * (`handleUploadAsset`) gained a real "this is a voice" checkbox + a
 * voice display-name input, threaded to POST /api/vault/assets/upload
 * (Package XIX's own real upload route). `voiceLibrary` filters the
 * already-fetched `vaultAssets` down to real voices via the new
 * `filterVoiceLibrary()` (sovereign-vault-types.ts) — no new fetch, no
 * new storage. `handleAssignVoiceToNode` is a genuine Manual Direction
 * Decision — it builds a real `VoiceAssignmentDirective` under the
 * already-real `UPDATE_ADVANCED_DIRECTIVE` mutation (new `'voice'`
 * directiveKey; `RasAlAmrStateManager.handleUpdateAdvanced` is already
 * fully generic over `directiveKey`, so zero state-manager code changed)
 * and executes through `executeDirectionDecision()`/`AssemblyRuntime` —
 * the same Direction Decision → Assembly Runtime path every other real
 * Manual Direction Decision already uses; nothing bypasses it.
 */

'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useConstitutionalNavigation } from '@/src/constitutional-navigation';
import { RasAmrExperience } from '@/src/imperial-experience-engine';
import type { VaultAsset, AssetFamily } from '@/src/vault/sovereign-vault-types';
import { filterVoiceLibrary } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';
import { CanvasType, DirectionNodeRole } from '@/src/chambers/ras-al-amr/assembly-contracts';
import type { SovereignCanvas, SpatialDirective, TemporalDirective } from '@/src/chambers/ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '@/src/chambers/ras-al-amr/pre-publishing-boundary';
import { RasAlAmrStateManager } from '@/src/chambers/ras-al-amr/ras-al-amr-state-manager';
import { CanvasActionType } from '@/src/chambers/ras-al-amr/assembly-directive-payloads';
import type {
  AddNodePayload,
  RemoveNodePayload,
  UpdateNodeSpatialPayload,
  UpdateNodeTemporalPayload,
  UpdateNodeAdvancedPayload,
  ReorderNodePayload,
  AddTrackPayload,
  MoveNodeToTrackPayload,
  UpdateNodeClassificationPayload,
  SetNodeActivePayload,
  SetNodeEmphasisPayload,
  SetNodeLockPayload,
  SetTrackVolumePayload,
  VisualFilterDirective,
  StructuralLogicDirective,
  AudioMixingDirective,
  VoiceAssignmentDirective,
} from '@/src/chambers/ras-al-amr/assembly-directive-payloads';
import type { SubtitleDirective } from '@/src/chambers/ras-al-amr/subtitle-directive';
import { decideMultiNodeCinematicDirection } from '@/src/chambers/ras-al-amr/automatic-director';
import { validateNarrativeIntegrity } from '@/src/chambers/ras-al-amr/automatic-director-constitution';
import type { FormalGoalContractView } from '@/src/chambers/ras-al-amr/automatic-director-constitution';
import { toDirectionDecision } from '@/src/chambers/ras-al-amr/direction-workspace-constitution';
import type { DirectionDecision, DirectionOperator } from '@/src/chambers/ras-al-amr/direction-workspace-constitution';
import { AssemblyRuntime } from '@/src/chambers/ras-al-amr/assembly-runtime';
import type { CanvasMutationPayload } from '@/src/chambers/ras-al-amr/assembly-directive-payloads';
import { useVoiceMode } from '@/src/components/living-companion/useVoiceMode';
import './ras-amr.css';

// Pure, stateless transformer (see its own header comment) — one shared
// instance is sufficient, no per-render instantiation needed.
const rasAlAmrStateManager = new RasAlAmrStateManager();
// PACKAGE XXIV — SOVEREIGN ASSEMBLY RUNTIME: the single constitutional
// execution consumer of a DirectionDecision — see assembly-runtime.ts.
const assemblyRuntime = new AssemblyRuntime(rasAlAmrStateManager);

const DEFAULT_SPATIAL: SpatialDirective = {
  zIndex: 0,
  scaleX: 1,
  scaleY: 1,
  positionX: 0,
  positionY: 0,
  rotationDegrees: 0,
};

const DEFAULT_VISUAL: VisualFilterDirective = {
  opacity: 1,
  blendMode: 'NORMAL',
  colorGradeReferenceId: undefined,
};

const DEFAULT_TEMPORAL: TemporalDirective = {
  globalStartTimeSeconds: 0,
  playDurationSeconds: 5,
  trimStartSeconds: undefined,
  trimEndSeconds: undefined,
};

const BLEND_MODES: VisualFilterDirective['blendMode'][] = ['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY'];


const CAPABILITY_LABELS: Record<string, { name: string; icon: string }> = {
  VISUAL:      { name: 'الصور المولَّدة',    icon: '🖼️' },
  MOTION:      { name: 'الفيديوهات المولَّدة', icon: '🎬' },
  AUDIO:       { name: 'الأصوات المولَّدة',   icon: '🎙' },
  WRITING:     { name: 'النصوص المولَّدة',    icon: '📄' },
  DIRECTORIAL: { name: 'مخططات الإخراج',      icon: '🎯' },
};

function typeLabelForCapability(target: string): string {
  switch (target) {
    case 'VISUAL': return 'صورة';
    case 'MOTION':  return 'فيديو';
    case 'AUDIO':   return 'صوت';
    default:        return 'وثيقة';
  }
}

// MINISTRY II — ElevenLabs curated preset voices (popular + distinctive).
// Must stay in sync with VALID_PRESET_VOICE_IDS in app/api/vault/assets/generate-speech/route.ts.
const ELEVENLABS_PRESET_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',    label: 'Adam — عميق وواثق'      },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  label: 'Rachel — هادئ وطبيعي'   },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',    label: 'Josh — قوي وذكوري'      },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella',   label: 'Bella — ناعم وواضح'     },
  { id: 'ErXwobaYiN019PkySvjV',  name: 'Antoni',  label: 'Antoni — متوازن ورسمي'  },
  { id: 'ThT5KcBeYPX3keUQqHPh',  name: 'Dorothy', label: 'Dorothy — بريطاني وهادئ' },
  { id: 'IKne3meq5aSn9XLyUdCD',  name: 'Charlie', label: 'Charlie — أسترالي ومميّز' },
  { id: 'N2lVS1w4EtoT3dr4eOWO',  name: 'Callum',  label: 'Callum — مكثّف وبارز'   },
] as const;

interface QueueItem {
  id: string;
  title: string;
  type: string;
  source: string;
  duration: string;
  status: string;
  /** INTEGRATION PACKAGE III/IV: true only for an item genuinely summoned
      from the real Sovereign Vault — never set on the demo seed items
      below. Governs whether a handoff to Makman carries real data. */
  isRealAsset?: boolean;
  secureStorageUri?: string;
  /** RAS AL AMR COMPLETION PACKAGE I: the real Vault asset's own family/
      capability (id doubles as the real Vault assetId for real items),
      carried through so a real compile can build a node without a
      second Vault lookup. */
  assetFamily?: AssetFamily;
  capabilityOrigin?: CapabilityTarget;
}

const initialSmartQueue: QueueItem[] = [];

// PACKAGE XXI — DIRECTION NODE LAYER: real Arabic labels for the Chief
// Architect's own seven DirectionNodeRole examples — display only, the
// enum values themselves remain the real, stored classification.
const DIRECTION_NODE_ROLE_LABELS: Record<DirectionNodeRole, string> = {
  [DirectionNodeRole.OPENING_SHOT]: 'لقطة افتتاحية',
  [DirectionNodeRole.DIALOGUE_SCENE]: 'مشهد حواري',
  [DirectionNodeRole.NARRATION]: 'سرد صوتي',
  [DirectionNodeRole.MUSIC_LAYER]: 'طبقة موسيقية',
  [DirectionNodeRole.AMBIENT_LAYER]: 'طبقة صوتية محيطة',
  [DirectionNodeRole.TRANSITION]: 'انتقال',
  [DirectionNodeRole.CLOSING_SHOT]: 'لقطة ختامية',
};


export default function RasAmrChamber() {
  const { goTo } = useConstitutionalNavigation();
  
  // --- Core States ---
  const [queue, setQueue] = useState<QueueItem[]>(initialSmartQueue);
  const [activeAsset, setActiveAsset] = useState<QueueItem | null>(null);
  // CONSTITUTIONAL NOTE (Ras Al Amr Chamber Reconstruction, 2026-07-25;
  // superseded/expanded by the Sovereign Direction State Ruling,
  // 2026-07-28, and Package XVIII, direction-workspace-constitution.ts):
  // 'smart' is the Automatic Director, 'manual' is the Manual Director —
  // the two DirectionOperator values that same file now names
  // constitutionally ('automatic-director'/'manual-director'). Both
  // operate inside the ONE Direction Workspace (the same SovereignCanvas +
  // RasAlAmrStateManager every panel below already shares) — never two
  // systems, never a separate editing chamber. 'smart' remains a
  // delegated directing AUTHORITY, never an automation shortcut,
  // workflow engine, or scripted pipeline: any future real implementation
  // behind it must make genuine editorial decisions on the Creator's
  // behalf, within the Creator's own declared vision/goals/constraints
  // (it may decide HOW to direct, never redefine WHAT the Creator
  // intends), and the delegation it represents must remain
  // limitable/revocable by the Creator at any time. This state still only
  // drives which decorative tools are shown/dimmed — no real
  // differentiated logic exists yet behind either mode beyond the real
  // Spatial/Visual/Temporal panels (manual) and the REAL — DIRECTOR panel
  // (automatic) already below, both always visible regardless of mode.
  const [directingMode, setDirectingMode] = useState<'smart' | 'manual'>('smart');
  // CREATOR OUTPUT COMPLETION PACKAGE — Part II: the canvas type the Creator
  // selects before the first asset is added. Defaults to CINEMATIC (FFmpeg
  // MP4 production path). NARRATIVE and DIRECTORIAL produce real structural
  // graphs — not media files. Changing after the canvas is seeded resets it.
  const [selectedCanvasType, setSelectedCanvasType] = useState<CanvasType>(CanvasType.CINEMATIC);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderStatus, setRenderStatus] = useState<string>('في وضع الاستعداد الإخراجي');
  // THE CORRIDOR PACKAGE: the real compiled graph from the most recent
  // successful Master Render — the only thing "forward to Makman" is
  // allowed to carry as a real, submittable assembly. compiledForAssetId
  // pins it to the exact active asset it was compiled from, so switching
  // the active asset after rendering can never forward a stale graph.
  const [compiledGraph, setCompiledGraph] = useState<CompiledAssemblyGraph | null>(null);
  const [compiledForAssetId, setCompiledForAssetId] = useState<string | null>(null);

  // REAL SPATIAL ADJUSTMENT PACKAGE: a real, single-node SovereignCanvas,
  // seeded whenever a real asset becomes active and mutated only through
  // RasAlAmrStateManager.applyMutation() — never hand-edited. Master
  // Render compiles exactly this object. Seeded during render (React's
  // documented "adjust state when a prop changes" pattern, tracked via
  // seededForAssetId) rather than in an effect, so a real spatial edit
  // survives ordinary re-renders instead of being wiped every time.
  const [sessionCanvas, setSessionCanvas] = useState<SovereignCanvas | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [spatialForm, setSpatialForm] = useState<SpatialDirective>(DEFAULT_SPATIAL);
  // REAL VISUAL + TEMPORAL ADJUSTMENT: same non-destructive pattern as
  // Spatial, one form each, reset alongside it whenever the Creator
  // selects a different node to edit.
  const [visualForm, setVisualForm] = useState<VisualFilterDirective>(DEFAULT_VISUAL);
  const [temporalForm, setTemporalForm] = useState<TemporalDirective>(DEFAULT_TEMPORAL);
  // PACKAGE XX — DIRECTION ASSEMBLY LAYER: which group a newly-added
  // asset lands in, and the Creator's own in-progress name for a new
  // group not yet created.
  const [activeTrackId, setActiveTrackId] = useState<string>('track-1');
  const [newGroupName, setNewGroupName] = useState<string>('');
  // PACKAGE XXIII — DIRECTION DECISION MODEL: a real, visible log of the
  // Manual Director's own Direction Decisions, each a genuine
  // DirectionDecision built by toDirectionDecision() — capped so the UI
  // stays a recent log, not an unbounded history.
  const [directionDecisionLog, setDirectionDecisionLog] = useState<DirectionDecision[]>([]);
  // PACKAGE XXIV — SOVEREIGN ASSEMBLY RUNTIME / PACKAGE XXV — AUTOMATIC
  // DIRECTOR INTEGRATION: the single call site through which every Manual
  // AND Automatic Director mutation now executes — builds the real
  // DirectionDecision (tagged with whichever operator is acting), logs it,
  // and applies it via AssemblyRuntime.execute() rather than calling
  // RasAlAmrStateManager.applyMutation() directly. `operator` defaults to
  // 'manual-director' since the nine Manual Direction handlers below are
  // its original, unchanged callers; handleApplyDirectorDecision (Package
  // XXV) is the only caller that passes 'automatic-director' explicitly.
  const executeDirectionDecision = (
    canvas: SovereignCanvas,
    mutation: CanvasMutationPayload,
    operator: DirectionOperator = 'manual-director',
  ): SovereignCanvas => {
    const decision = toDirectionDecision(operator, mutation);
    setDirectionDecisionLog((prev) => [decision, ...prev].slice(0, 10));
    return assemblyRuntime.execute(canvas, decision);
  };

  // PACKAGE XXXII — SOVEREIGN CREATIVE CANVAS
  // Composition surface ref — needed for pointer coordinate math.
  const compositionRef = useRef<HTMLDivElement>(null);

  // PACKAGE XXXII — COORDINATE SYSTEM (Constitutional Contract):
  // positionX / positionY = percentage-point offsets from the composition surface center.
  //   (0, 0)   = node center at surface center
  //   (10, 0)  = node center at 60% of surface width  (50% + 10%)
  //   (-25, 0) = node center at 25% of surface width  (50% - 25%)
  //   (0, 20)  = node center at 70% of surface height (50% + 20%)
  // CSS: top: calc(50% + positionY%); left: calc(50% + positionX%);
  //      transform: translate(-50%, -50%) scale(sX, sY) rotate(Rdeg);
  // left/top percentages are relative to the SURFACE (containing block) — asset-size-independent.
  // translate(-50%, -50%) centers the node's box on the anchor point only.
  // Drag: dx = (pointerDelta / surfaceWidth) * 100 — already in surface-percent space.

  // Drag interaction state — stored in a ref to avoid per-frame React state updates.
  const dragRef = useRef<{
    nodeId: string;
    pointerId: number;
    startX: number;
    startY: number;
    originSpatial: SpatialDirective;
    handleType: 'move' | 'scale' | 'rotate';
    liveSpatial: SpatialDirective;
  } | null>(null);

  // Live drag preview — single state update per pointer-move frame.
  const [liveTransform, setLiveTransform] = useState<{ nodeId: string; spatial: SpatialDirective } | null>(null);

  // Drop-zone active flag for drag-over visual feedback.
  const [isDragOverSurface, setIsDragOverSurface] = useState(false);

  const handleLayerPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    handleType: 'move' | 'scale' | 'rotate',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const node = sessionCanvas?.tracks.flatMap((t) => t.nodes).find((n) => n.nodeId === nodeId);
    if (!node || node.isLocked) return;
    // Capture on the surface so surface's onPointerMove/Up receive all drag events,
    // even when the pointer moves off the originating layer or handle element.
    compositionRef.current?.setPointerCapture(e.pointerId);
    setSelectedNodeId(nodeId);
    const originSpatial = node.spatial ?? DEFAULT_SPATIAL;
    dragRef.current = { nodeId, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, originSpatial, handleType, liveSpatial: { ...originSpatial } };
  };

  const handleSurfacePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const surface = compositionRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;
    const next: SpatialDirective = { ...drag.originSpatial };
    if (drag.handleType === 'move') {
      next.positionX = drag.originSpatial.positionX + dx;
      next.positionY = drag.originSpatial.positionY + dy;
    } else if (drag.handleType === 'scale') {
      const delta = 1 + (dx - dy) * 0.015;
      next.scaleX = Math.max(0.05, drag.originSpatial.scaleX * delta);
      next.scaleY = Math.max(0.05, drag.originSpatial.scaleY * delta);
    } else if (drag.handleType === 'rotate') {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const a0 = Math.atan2(drag.startY - cy, drag.startX - cx);
      const a1 = Math.atan2(e.clientY - cy, e.clientX - cx);
      next.rotationDegrees = drag.originSpatial.rotationDegrees + ((a1 - a0) * 180) / Math.PI;
    }
    dragRef.current = { ...drag, liveSpatial: next };
    setLiveTransform({ nodeId: drag.nodeId, spatial: next });
  };

  const handleSurfacePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setLiveTransform(null);
    if (!drag || !sessionCanvas) return;
    const finalSpatial = drag.liveSpatial;
    const mutation: UpdateNodeSpatialPayload = {
      actionType: CanvasActionType.UPDATE_SPATIAL,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: drag.nodeId,
      spatialUpdates: finalSpatial,
    };
    setSpatialForm(finalSpatial);
    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  const handleSurfaceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverSurface(false);
    const assetId = e.dataTransfer.getData('application/x-ras-amr-asset-id');
    if (assetId && sessionCanvas) {
      const asset = queue.find((a) => a.id === assetId);
      if (asset?.isRealAsset && asset.assetFamily && asset.capabilityOrigin) {
        if (sessionCanvas.tracks.flatMap((t) => t.nodes).some((n) => n.assetId === assetId)) return;
        setActiveAsset(asset);
        const mutation: AddNodePayload = {
          actionType: CanvasActionType.ADD_NODE,
          canvasId: sessionCanvas.canvasId,
          subscriberTenantId: sessionCanvas.subscriberTenantId,
          targetTrackId: activeTrackId,
          vaultAssetId: asset.id,
          assetFamily: asset.assetFamily,
          capabilityOrigin: asset.capabilityOrigin,
          initialTemporal: DEFAULT_TEMPORAL,
          initialSpatial: DEFAULT_SPATIAL,
        };
        const updatedCanvas = executeDirectionDecision(sessionCanvas, mutation);
        setSessionCanvas(updatedCanvas);
        const tgt = updatedCanvas.tracks.find((t) => t.trackId === activeTrackId);
        const newNode = tgt?.nodes[tgt.nodes.length - 1];
        if (newNode) { setSelectedNodeId(newNode.nodeId); setSpatialForm(DEFAULT_SPATIAL); }
      } else if (asset) {
        setActiveAsset(asset);
      }
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUploadAsset(file);
  };

  // Per-node audio volume (AudioMixingDirective already in data model).
  const handleSetNodeVolume = (nodeId: string, volumeDb: number) => {
    if (!sessionCanvas) return;
    const track = sessionCanvas.tracks.find((t) => t.nodes.some((n) => n.nodeId === nodeId));
    if (!track) return;
    const existing = track.nodes.find((n) => n.nodeId === nodeId)?.customDirectives?.audio as AudioMixingDirective | undefined;
    const mutation: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: track.trackId,
      targetNodeId: nodeId,
      directiveKey: 'audio',
      directivePayload: { volumeDb, panCenter: existing?.panCenter ?? 0, isMuted: existing?.isMuted ?? false } as AudioMixingDirective,
    };
    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  const wantsRealCanvas = Boolean(activeAsset?.isRealAsset && activeAsset.assetFamily && activeAsset.capabilityOrigin);

  // THE NARRATIVE CANVAS FOUNDATION: created once, lazily, the first time
  // any real asset becomes active — and never reset or rebuilt after
  // that, unlike the single-node scratch pad it replaces. Starts empty;
  // nodes are only ever added through the Creator's own explicit action
  // (handleAddActiveAssetToCanvas below), never automatically.
  if (wantsRealCanvas && sessionCanvas === null) {
    // Pure/deterministic seed (no Date.now() — render must stay pure per
    // React's rules); real wall-clock timestamps are set where they
    // belong, inside event handlers.
    setSessionCanvas({
      canvasId: 'canvas_narrative_session',
      // Overwritten server-side with the real, session-verified tenant id
      // at compile time regardless of what's carried here — see the
      // compile route's own note.
      subscriberTenantId: 'pending-server-verification',
      canvasType: selectedCanvasType,
      title: 'مشهد الإخراج',
      tracks: [
        {
          trackId: 'track-1',
          trackName: 'المسار الرئيسي',
          isMuted: false,
          isHidden: false,
          nodes: [],
        },
      ],
      createdAt: 0,
      updatedAt: 0,
    });
  }

  // PACKAGE XX — DIRECTION ASSEMBLY LAYER: a node can now live in any
  // group, not just the first track, so finding it means scanning every
  // real track rather than assuming tracks[0] — the same correctness fix
  // RasAlAmrStateManager's own locateNode() now applies internally.
  const selectedNode = sessionCanvas?.tracks.flatMap((t) => t.nodes).find((n) => n.nodeId === selectedNodeId);

  // PACKAGE VI — THE CINEMATIC JUDGMENT CONSTITUTION: a real, honest
  // structural audit of the Narrative Canvas's own current state —
  // "how does it protect narrative integrity," answered concretely.
  // Complements (does not replace) handleAddActiveAssetToCanvas's own
  // pre-add duplicate guard below by also catching issues a manual
  // Spatial/Visual/Temporal edit could introduce. PACKAGE XX: now spans
  // every group — the same asset must not occupy two nodes anywhere in
  // the canvas, not just within one group.
  const narrativeIntegrity = useMemo(
    () => (sessionCanvas ? validateNarrativeIntegrity(sessionCanvas.tracks.flatMap((t) => t.nodes)) : null),
    [sessionCanvas],
  );

  // Adds the currently active real asset to the Narrative Canvas as its
  // own real AssemblyNode — an explicit Creator action, never automatic.
  // Reuses RasAlAmrStateManager's own ADD_NODE handler (already built,
  // previously zero real callers anywhere in the platform). PACKAGE XX:
  // lands in whichever group (`activeTrackId`) the Creator currently has
  // selected, and the duplicate guard now spans every group.
  const handleAddActiveAssetToCanvas = () => {
    if (!sessionCanvas || !activeAsset?.isRealAsset || !activeAsset.assetFamily || !activeAsset.capabilityOrigin) return;
    if (sessionCanvas.tracks.flatMap((t) => t.nodes).some((n) => n.assetId === activeAsset.id)) return; // already present — no duplicate node for the same asset anywhere in the canvas

    const mutation: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: activeTrackId,
      vaultAssetId: activeAsset.id,
      assetFamily: activeAsset.assetFamily,
      capabilityOrigin: activeAsset.capabilityOrigin,
      initialTemporal: DEFAULT_TEMPORAL,
      initialSpatial: DEFAULT_SPATIAL,
    };

    const updatedCanvas = executeDirectionDecision(sessionCanvas, mutation);
    setSessionCanvas(updatedCanvas);

    const targetTrack = updatedCanvas.tracks.find((t) => t.trackId === activeTrackId);
    const newNode = targetTrack?.nodes[targetTrack.nodes.length - 1];
    if (newNode) setSelectedNodeId(newNode.nodeId);
    setSpatialForm(DEFAULT_SPATIAL);
    setVisualForm(DEFAULT_VISUAL);
    setTemporalForm(DEFAULT_TEMPORAL);
  };

  // Removes one node from the Narrative Canvas — reuses
  // RasAlAmrStateManager's own REMOVE_NODE handler, same as above.
  // PACKAGE XX: the node can be in any group; RasAlAmrStateManager's own
  // locateNode() finds it regardless of which targetTrackId is supplied
  // here, so 'track-1' below is a harmless formality, not a real
  // constraint (see assembly-directive-payloads.ts's own note).
  const handleRemoveNodeFromCanvas = (nodeId: string) => {
    if (!sessionCanvas) return;

    const mutation: RemoveNodePayload = {
      actionType: CanvasActionType.REMOVE_NODE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
    };

    const updatedCanvas = executeDirectionDecision(sessionCanvas, mutation);
    setSessionCanvas(updatedCanvas);

    if (selectedNodeId === nodeId) {
      const remaining = updatedCanvas.tracks.flatMap((t) => t.nodes);
      setSelectedNodeId(remaining.length > 0 ? remaining[0].nodeId : null);
    }
  };

  // PACKAGE XX — DIRECTION ASSEMBLY LAYER: non-destructive reordering —
  // moves a node one position up or down within its own group.
  const handleReorderNode = (nodeId: string, direction: 'up' | 'down') => {
    if (!sessionCanvas) return;
    const track = sessionCanvas.tracks.find((t) => t.nodes.some((n) => n.nodeId === nodeId));
    if (!track) return;

    const mutation: ReorderNodePayload = {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: track.trackId,
      targetNodeId: nodeId,
      direction,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // PACKAGE XX — DIRECTION ASSEMBLY LAYER: creates a new, real, empty
  // group — reusing AssemblyTrack, never a parallel "groupId" concept.
  const handleAddGroup = () => {
    if (!sessionCanvas || !newGroupName.trim()) return;

    const mutation: AddTrackPayload = {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      trackName: newGroupName.trim(),
    };

    const updatedCanvas = executeDirectionDecision(sessionCanvas, mutation);
    setSessionCanvas(updatedCanvas);
    setNewGroupName('');
  };

  // PACKAGE XX — DIRECTION ASSEMBLY LAYER: moves an existing node to a
  // different group — the write-side of "asset grouping can be changed."
  const handleMoveNodeToGroup = (nodeId: string, destinationTrackId: string) => {
    if (!sessionCanvas) return;
    const sourceTrack = sessionCanvas.tracks.find((t) => t.nodes.some((n) => n.nodeId === nodeId));
    if (!sourceTrack || sourceTrack.trackId === destinationTrackId) return;

    const mutation: MoveNodeToTrackPayload = {
      actionType: CanvasActionType.MOVE_NODE_TO_TRACK,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      sourceTrackId: sourceTrack.trackId,
      targetNodeId: nodeId,
      destinationTrackId,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // PACKAGE XXI — DIRECTION NODE LAYER: assigns or changes a node's real
  // cinematic classification. `role` may genuinely be `undefined` (the
  // Creator choosing the "not classified" option), which honestly returns
  // the node to its unclassified state rather than forcing a default.
  const handleUpdateNodeClassification = (nodeId: string, role: DirectionNodeRole | undefined) => {
    if (!sessionCanvas) return;

    const mutation: UpdateNodeClassificationPayload = {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: role,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // PACKAGE XXII — MANUAL DIRECTION ENGINE: Activate Node / Disable Node.
  const handleSetNodeActive = (nodeId: string, active: boolean) => {
    if (!sessionCanvas) return;

    const mutation: SetNodeActivePayload = {
      actionType: CanvasActionType.SET_NODE_ACTIVE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      active,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // PACKAGE XXII — MANUAL DIRECTION ENGINE: Mark as Primary / Mark as
  // Supporting — a Creator-DECLARED emphasis, deliberately distinct from
  // multiNodeDirection's own separately-computed primaryNodeId (see
  // assembly-contracts.ts's own header for why these are not unified).
  const handleSetNodeEmphasis = (nodeId: string, emphasis: 'primary' | 'supporting' | null) => {
    if (!sessionCanvas) return;

    const mutation: SetNodeEmphasisPayload = {
      actionType: CanvasActionType.SET_NODE_EMPHASIS,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      emphasis,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // PACKAGE XXII — MANUAL DIRECTION ENGINE: Lock Direction / Unlock
  // Direction — genuinely protects the node's own direction decisions
  // from further mutation (RasAlAmrStateManager's own lock-guard), never
  // blocks removal.
  const handleSetNodeLock = (nodeId: string, locked: boolean) => {
    if (!sessionCanvas) return;

    const mutation: SetNodeLockPayload = {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      locked,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  const activeSpatialDirective = selectedNode?.spatial;

  const handleApplySpatialAdjustment = () => {
    if (!sessionCanvas || !selectedNodeId) return;

    const mutation: UpdateNodeSpatialPayload = {
      actionType: CanvasActionType.UPDATE_SPATIAL,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: selectedNodeId,
      spatialUpdates: spatialForm,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // pixel-grade + chroma-forge share this one real 'visual' directive slot.
  const activeVisualDirective = selectedNode?.customDirectives?.visual as VisualFilterDirective | undefined;

  const handleApplyVisualAdjustment = () => {
    if (!sessionCanvas || !selectedNodeId) return;

    const mutation: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: selectedNodeId,
      directiveKey: 'visual',
      directivePayload: visualForm,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // neural-sync drives real timeline timing — the truthful reading of
  // "synchronization" available in the real assembly contracts today.
  const activeTemporalDirective = selectedNode?.temporal;

  const handleApplyTemporalAdjustment = () => {
    if (!sessionCanvas || !selectedNodeId) return;

    const mutation: UpdateNodeTemporalPayload = {
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: selectedNodeId,
      temporalUpdates: temporalForm,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // --- Summoning Bridge States ---
  const [isSummonOpen, setIsSummonOpen] = useState<boolean>(false);
  const [selectedVault, setSelectedVault] = useState<string>('');
  const [injectionFlash, setInjectionFlash] = useState<boolean>(false);
  const [hudActiveTab, setHudActiveTab] = useState<'vault' | 'create'>('vault');

  // --- Real Sovereign Vault assets — the Summoning Bridge's real source ---
  const [vaultAssets, setVaultAssets] = useState<VaultAsset[]>([]);
  const [vaultAssetsLoaded, setVaultAssetsLoaded] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/vault/assets')
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 'succeeded') setVaultAssets(result.assets);
      })
      .catch(() => {
        // Honest degrade: an unreachable Vault means an empty Summoning
        // Bridge, not a crash — the same silent-catch pattern already
        // used throughout this platform's real API consumers.
      })
      .finally(() => setVaultAssetsLoaded(true));
  }, []);

  // PACKAGE XIX — MEDIA INGESTION LAYER: a Creator-uploaded file becomes
  // a real VaultAsset via POST /api/vault/assets/upload (which reuses
  // SovereignVaultManager.depositAsset(), the same boundary Qiyamah
  // generation already deposits through) — appended to the same
  // vaultAssets list the Summoning Bridge already reads, so it's
  // immediately available to both Manual and Automatic Director through
  // the exact same, already-existing injection/canvas-add path. No
  // parallel ingestion pipeline.
  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAsset, setIsUploadingAsset] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // MINISTRY I — VOICE ECOSYSTEM: real Creator-declared "this is a voice"
  // intent, never inferred from the file itself. Both genuinely optional —
  // an unchecked upload behaves exactly as it did before this Ministry.
  const [isVoiceUpload, setIsVoiceUpload] = useState<boolean>(false);
  const [voiceDisplayNameInput, setVoiceDisplayNameInput] = useState<string>('');

  const handleUploadAsset = async (file: File) => {
    setIsUploadingAsset(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      if (isVoiceUpload) {
        body.append('isVoice', 'true');
        if (voiceDisplayNameInput.trim()) body.append('voiceDisplayName', voiceDisplayNameInput.trim());
      }
      const response = await fetch('/api/vault/assets/upload', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok || result.status !== 'succeeded') {
        setUploadError(result.message ?? 'الملف لم يصل إلى الخزانة.');
        return;
      }
      setVaultAssets((prev) => [...prev, result.asset]);
      setIsVoiceUpload(false);
      setVoiceDisplayNameInput('');
    } catch {
      setUploadError('بوابة الرفع لا تستجيب.');
    } finally {
      setIsUploadingAsset(false);
      if (uploadFileInputRef.current) uploadFileInputRef.current.value = '';
    }
  };

  // MINISTRY I — VOICE ECOSYSTEM: the real Voice Library — every VaultAsset
  // the Creator explicitly marked as a voice, reusing the already-fetched
  // vaultAssets list (no new fetch, no new storage).
  const voiceLibrary = useMemo(() => filterVoiceLibrary(vaultAssets), [vaultAssets]);
  // Cloned voice identities (STRUCTURAL — provider-backed, not playable audio).
  const clonedVoiceIdentities = useMemo(
    () => voiceLibrary.filter((v) => v.metadata.isClonedVoice === true),
    [voiceLibrary],
  );
  // Real audio voices — uploaded or TTS-generated — assignable to Direction Nodes.
  const audioVoiceAssets = useMemo(
    () => voiceLibrary.filter((v) => v.metadata.isClonedVoice !== true),
    [voiceLibrary],
  );

  // PACKAGE XXXII — VOICE-TO-TEXT: reuse the existing useVoiceMode hook.
  // Transcribed speech appends to the TTS textarea. Does NOT interpret commands
  // — speech recognition only. Natural-language directing is out of scope.
  const handleVoiceTranscript = useCallback((text: string) => {
    setTtsText((prev) => (prev.trim() ? prev.trim() + ' ' + text : text));
  }, []);
  const voiceMode = useVoiceMode(true, handleVoiceTranscript, 'ar-SA');

  // MINISTRY II — TEXT TO SPEECH ENGINE (ElevenLabs preset voices).
  const [ttsText, setTtsText] = useState<string>('');
  const [ttsPresetVoiceId, setTtsPresetVoiceId] = useState<string>(ELEVENLABS_PRESET_VOICES[0].id);
  const [ttsDisplayNameInput, setTtsDisplayNameInput] = useState<string>('');
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState<boolean>(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handleGenerateSpeech = async () => {
    if (!ttsText.trim()) return;
    setIsGeneratingSpeech(true);
    setTtsError(null);
    try {
      const chosenVoice = ELEVENLABS_PRESET_VOICES.find((v) => v.id === ttsPresetVoiceId);
      const voiceDisplayName = ttsDisplayNameInput.trim() || chosenVoice?.name || 'TTS Voice';
      const response = await fetch('/api/vault/assets/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText.trim(),
          voice: ttsPresetVoiceId,
          voiceDisplayName,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'succeeded') {
        setTtsError(result.message ?? 'الصوت لم يُولَّد.');
        return;
      }
      setVaultAssets((prev) => [...prev, result.asset]);
      setTtsText('');
      setTtsDisplayNameInput('');
    } catch {
      setTtsError('بوابة الصوت لا تستجيب.');
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  // MINISTRY III — VOICE CLONING ENGINE: clone a real voice from the Voice Library.
  const [cloneSourceVoiceId, setCloneSourceVoiceId] = useState<string>('');
  const [cloneVoiceNameInput, setCloneVoiceNameInput] = useState<string>('');
  const [cloneConsentConfirmed, setCloneConsentConfirmed] = useState<boolean>(false);
  const [isVoiceCloning, setIsVoiceCloning] = useState<boolean>(false);
  const [voiceCloneError, setVoiceCloneError] = useState<string | null>(null);
  // MINISTRY III — SYNTHESIS: generate new speech using a cloned voice identity.
  const [clonedVoiceSynthTarget, setClonedVoiceSynthTarget] = useState<string>('');
  const [clonedVoiceSynthText, setClonedVoiceSynthText] = useState<string>('');
  const [isGeneratingClonedSpeech, setIsGeneratingClonedSpeech] = useState<boolean>(false);
  const [clonedSpeechError, setClonedSpeechError] = useState<string | null>(null);

  const handleCloneVoice = async () => {
    if (!cloneSourceVoiceId || !cloneConsentConfirmed) return;
    setIsVoiceCloning(true);
    setVoiceCloneError(null);
    try {
      const response = await fetch('/api/vault/assets/clone-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceAssetId: cloneSourceVoiceId,
          consentConfirmed: true,
          ...(cloneVoiceNameInput.trim() ? { voiceDisplayName: cloneVoiceNameInput.trim() } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'succeeded') {
        setVoiceCloneError(result.message ?? 'الاستنساخ لم يكتمل.');
        return;
      }
      setVaultAssets((prev) => [...prev, result.asset]);
      setCloneSourceVoiceId('');
      setCloneVoiceNameInput('');
      setCloneConsentConfirmed(false);
    } catch {
      setVoiceCloneError('بوابة الاستنساخ لا تستجيب.');
    } finally {
      setIsVoiceCloning(false);
    }
  };

  const handleGenerateClonedSpeech = async () => {
    if (!clonedVoiceSynthTarget || !clonedVoiceSynthText.trim()) return;
    setIsGeneratingClonedSpeech(true);
    setClonedSpeechError(null);
    try {
      const response = await fetch('/api/vault/assets/generate-cloned-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clonedVoiceAssetId: clonedVoiceSynthTarget,
          text: clonedVoiceSynthText.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'succeeded') {
        setClonedSpeechError(result.message ?? 'فشل توليد الكلام بالصوت المستنسَخ.');
        return;
      }
      setVaultAssets((prev) => [...prev, result.asset]);
      setClonedVoiceSynthText('');
    } catch {
      setClonedSpeechError('بوابة التوليد لا تستجيب.');
    } finally {
      setIsGeneratingClonedSpeech(false);
    }
  };

  // MINISTRY IV — SOVEREIGN MIXING ENGINE: track-level volume via SET_TRACK_VOLUME.
  const handleSetTrackVolume = (trackId: string, volumeDb: number) => {
    if (!sessionCanvas) return;
    const mutation: SetTrackVolumePayload = {
      actionType: CanvasActionType.SET_TRACK_VOLUME,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: trackId,
      volumeDb,
    };
    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // MINISTRY V — SOVEREIGN SUBTITLE SYSTEM: import SRT/VTT for a Direction Node.
  // One hidden file input shared across all nodes — the target node ID is set
  // into state when the Creator clicks the per-node import button.
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const [subtitleTargetNodeId, setSubtitleTargetNodeId] = useState<string | null>(null);
  const [subtitleImportBusy, setSubtitleImportBusy] = useState<boolean>(false);
  const [subtitleImportError, setSubtitleImportError] = useState<string | null>(null);

  const handleSubtitleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !subtitleTargetNodeId || !sessionCanvas) return;
    const nodeId = subtitleTargetNodeId;
    setSubtitleImportBusy(true);
    setSubtitleImportError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/vault/assets/import-subtitles', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'succeeded') {
        setSubtitleImportError(result.message ?? 'فشل استيراد الترجمة.');
        return;
      }
      const track = sessionCanvas.tracks.find((t) => t.nodes.some((n) => n.nodeId === nodeId));
      if (!track) return;
      const mutation: UpdateNodeAdvancedPayload = {
        actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
        canvasId: sessionCanvas.canvasId,
        subscriberTenantId: sessionCanvas.subscriberTenantId,
        targetTrackId: track.trackId,
        targetNodeId: nodeId,
        directiveKey: 'subtitles',
        directivePayload: result.directive as SubtitleDirective,
      };
      setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
      setSubtitleImportError(null);
    } catch {
      setSubtitleImportError('بوابة الاستيراد لا تستجيب.');
    } finally {
      setSubtitleImportBusy(false);
      setSubtitleTargetNodeId(null);
      if (subtitleInputRef.current) subtitleInputRef.current.value = '';
    }
  };

  // MINISTRY I — VOICE ECOSYSTEM: Voice Selection — a genuine Manual
  // Direction Decision, executed through the same Direction Decision /
  // Assembly Runtime path every other real decision uses. `vaultAssetId`
  // of '' means "unassign" and is honestly represented as undefined in
  // the resulting VoiceAssignmentDirective's absence — handled by
  // clearing the directive rather than storing an empty string.
  const handleAssignVoiceToNode = (nodeId: string, vaultAssetId: string) => {
    if (!sessionCanvas) return;
    const track = sessionCanvas.tracks.find((t) => t.nodes.some((n) => n.nodeId === nodeId));
    if (!track) return;

    const mutation: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: sessionCanvas.canvasId,
      subscriberTenantId: sessionCanvas.subscriberTenantId,
      targetTrackId: track.trackId,
      targetNodeId: nodeId,
      directiveKey: 'voice',
      directivePayload: { vaultAssetId } as VoiceAssignmentDirective,
    };

    setSessionCanvas(executeDirectionDecision(sessionCanvas, mutation));
  };

  // ai-director — THE AUTOMATIC DIRECTOR: decides the real Cinematic
  // Direction Decision for whichever node is selected on the Narrative
  // Canvas (see src/chambers/ras-al-amr/automatic-director.ts for the
  // full constitutional scope and its disclosed single-node-per-decision
  // limits — the Decision itself still reasons about one asset at a
  // time; the Canvas now simply lets more than one such decision have a
  // real place to land). Looked up from the already-fetched real
  // vaultAssets list — no new fetch, no new contract field.
  const activeVaultAsset = useMemo(
    () => (selectedNode ? vaultAssets.find((a) => a.assetId === selectedNode.assetId) : undefined),
    [selectedNode, vaultAssets],
  );

  // PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: fetches the real,
  // tenant-verified GoalContract through the sanctioned SOEL-backed GET
  // route, but only when the selected asset actually carries a linked
  // goalId (written back at Goal-creation time — see
  // automatic-director-constitution.ts's own Package IX account). Never
  // guesses a goalId; when absent, formalGoal simply stays null and
  // decideCinematicDirection falls back to the honest prompt-echo source.
  const [formalGoal, setFormalGoal] = useState<FormalGoalContractView | null>(null);
  const [formalGoalTrackedForId, setFormalGoalTrackedForId] = useState<string | null>(null);
  const activeGoalId = activeVaultAsset?.metadata?.goalId ?? null;

  // Adjust state during render — the same established pattern
  // sessionCanvas seeding already uses above — rather than an
  // unconditional setState at the top of an effect: clears the
  // previously-fetched formal Goal the instant the selected asset's own
  // goalId changes to anything else, including null.
  if (activeGoalId !== formalGoalTrackedForId) {
    setFormalGoal(null);
    setFormalGoalTrackedForId(activeGoalId);
  }

  useEffect(() => {
    if (!activeGoalId) return;
    let cancelled = false;
    fetch(`/api/sovereign/entry/creator-goal/${activeGoalId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (!cancelled) setFormalGoal(result?.goal ?? null);
      })
      .catch(() => {
        if (!cancelled) setFormalGoal(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeGoalId]);

  // Imperial Continuity — consumes the InteractionSession the Imperial Foyer
  // writes before departing (sessionStorage['azma.kernel.session']). If
  // RESOLVED, records the mode so the chamber can acknowledge the journey.
  // Also consumes treasure context written by the Vault Palace (Package D).
  const [kernelContinuity, setKernelContinuity] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('azma.kernel.session');
    if (raw) sessionStorage.removeItem('azma.kernel.session');

    // Consume Palace treasure context — acknowledged via the continuity banner
    const treasureRaw = sessionStorage.getItem('azma.transfer.treasure');
    if (treasureRaw) {
      sessionStorage.removeItem('azma.transfer.treasure');
      sessionStorage.removeItem('azma.transfer.origin');
      setKernelContinuity('palace-treasure');
      return;
    }

    if (!raw) return;
    try {
      const s = JSON.parse(raw) as { status?: string; activeInteractionMode?: string };
      if (s?.status === 'RESOLVED') setKernelContinuity(s.activeInteractionMode ?? 'navigate');
    } catch { /* ignore malformed session */ }
  }, []);

  // PACKAGE XIII — MULTI-NODE CINEMATIC DIRECTION: reasons across every
  // real node currently on the canvas, not just the selected one. A
  // formal Goal is only genuinely fetched today for the selected node
  // (see the effect above) — every other node honestly falls back to its
  // own prompt-echo inside decideCinematicDirection, exactly like the
  // single-node case already does when no formalGoal is available. Nodes
  // whose own Vault asset can no longer be resolved are excluded, the
  // same tolerance activeVaultAsset's own lookup already accepts.
  //
  // PACKAGE XX — DIRECTION ASSEMBLY LAYER: real grouping now exists
  // (multiple tracks), but this deliberately still only reasons over
  // `tracks[0]` — the first group. Extending the Automatic Director's
  // own composition judgment across every group is real Automatic
  // Director decision-making, explicitly out of this package's scope
  // ("Do not implement... Automatic Director decisions"). A node in any
  // other group therefore honestly has no `directorDecision` — the REAL
  // — DIRECTOR panel simply shows nothing for it, never a fabricated one.
  const multiNodeDirection = useMemo(() => {
    if (!sessionCanvas) return null;
    // PACKAGE XXXII fix: reason across ALL tracks, not only tracks[0].
    const nodesWithAssets = sessionCanvas.tracks.flatMap((t) => t.nodes)
      .map((node) => {
        const asset = vaultAssets.find((a) => a.assetId === node.assetId);
        if (!asset) return null;
        return {
          nodeId: node.nodeId,
          asset,
          formalGoal: node.nodeId === selectedNodeId ? (formalGoal ?? undefined) : undefined,
        };
      })
      .filter((n): n is { nodeId: string; asset: VaultAsset; formalGoal: FormalGoalContractView | undefined } => n !== null);
    return nodesWithAssets.length > 0 ? decideMultiNodeCinematicDirection(nodesWithAssets) : null;
  }, [sessionCanvas, vaultAssets, selectedNodeId, formalGoal]);

  // PACKAGE XIV: derived directly from multiNodeDirection rather than a
  // second, separate decideCinematicDirection call — the selected node is
  // always itself a member of the same real node set multiNodeDirection
  // already reasons across (selectedNodeId can only be set by clicking an
  // existing canvas node), so this is the single source of truth for its
  // executionOrderIndex AND its real cumulative globalStartTimeSeconds,
  // rather than two parallel computations that could honestly drift.
  const directorDecision = useMemo(
    () => multiNodeDirection?.nodeDecisions.find((nd) => nd.nodeId === selectedNodeId)?.decision ?? null,
    [multiNodeDirection, selectedNodeId],
  );
  const activeStructuralDirective = selectedNode?.customDirectives?.structural as StructuralLogicDirective | undefined;
  const activeAudioDirective = selectedNode?.customDirectives?.audio as AudioMixingDirective | undefined;

  // PACKAGE XXV — AUTOMATIC DIRECTOR INTEGRATION: the Automatic Director's
  // sole constitutional responsibility is producing DirectionDecision
  // objects — it never mutates state or executes anything itself. Each of
  // its three real mutations now becomes its own real DirectionDecision,
  // tagged 'automatic-director', submitted to the same Assembly Runtime
  // Manual Director already executes through — no second execution path.
  const handleApplyDirectorDecision = () => {
    if (!sessionCanvas || !selectedNodeId || !directorDecision?.included || !directorDecision.temporal || !directorDecision.structural) return;

    let canvas = executeDirectionDecision(
      sessionCanvas,
      {
        actionType: CanvasActionType.UPDATE_TEMPORAL,
        canvasId: sessionCanvas.canvasId,
        subscriberTenantId: sessionCanvas.subscriberTenantId,
        targetTrackId: 'track-1',
        targetNodeId: selectedNodeId,
        temporalUpdates: directorDecision.temporal,
      },
      'automatic-director',
    );

    canvas = executeDirectionDecision(
      canvas,
      {
        actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
        canvasId: canvas.canvasId,
        subscriberTenantId: canvas.subscriberTenantId,
        targetTrackId: 'track-1',
        targetNodeId: selectedNodeId,
        directiveKey: 'structural',
        directivePayload: directorDecision.structural,
      },
      'automatic-director',
    );

    if (directorDecision.audio) {
      canvas = executeDirectionDecision(
        canvas,
        {
          actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
          canvasId: canvas.canvasId,
          subscriberTenantId: canvas.subscriberTenantId,
          targetTrackId: 'track-1',
          targetNodeId: selectedNodeId,
          directiveKey: 'audio',
          directivePayload: directorDecision.audio,
        },
        'automatic-director',
      );
    }

    setSessionCanvas(canvas);
  };

  const realVaultCategories = useMemo(() => {
    const byTarget = new Map<string, VaultAsset[]>();
    for (const asset of vaultAssets) {
      const list = byTarget.get(asset.capabilityTarget) ?? [];
      list.push(asset);
      byTarget.set(asset.capabilityTarget, list);
    }
    return Array.from(byTarget.entries()).map(([target, assets]) => ({
      id: target,
      name: CAPABILITY_LABELS[target]?.name ?? target,
      icon: CAPABILITY_LABELS[target]?.icon ?? '◆',
      assets,
    }));
  }, [vaultAssets]);

  const activeVaultCategory = realVaultCategories.find((c) => c.id === selectedVault) ?? realVaultCategories[0];


  // --- Real Director Compilation: compiles the real, per-session
  // SovereignCanvas (sessionCanvas) — including any real spatial edits
  // the Creator applied — via the real, already-certified compile
  // endpoint. Never simulated.
  const canCompile = Boolean(activeAsset?.isRealAsset && activeAsset.secureStorageUri && sessionCanvas);

  const triggerMasterRender = async () => {
    if (!activeAsset?.isRealAsset || !sessionCanvas) return;

    setIsRendering(true);
    setRenderStatus('الصهر الحقيقي جارٍ…');

    const canvas: SovereignCanvas = { ...sessionCanvas, updatedAt: Date.now() };

    try {
      const response = await fetch('/api/sovereign/entry/ras-al-amr/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvas }),
      });
      const result = await response.json();

      if (!response.ok) {
        setRenderStatus(`الصهر لم يكتمل — ${result.message ?? result.error ?? 'ما لم يُتوقَّع'}`);
        return;
      }

      const compiled = result as CompiledAssemblyGraph;
      setCompiledGraph(compiled);
      setCompiledForAssetId(activeAsset.id);
      setRenderStatus(
        `تم الصهر الحقيقي بنجاح — ${compiled.compilationId} — ${compiled.metadata.totalNodes} عنصر مضمَّن`,
      );
    } catch {
      setRenderStatus('بوابة الصهر لا تستجيب.');
    } finally {
      setIsRendering(false);
    }
  };

  // --- Summoning Pull Action: injects a REAL Vault asset into the console ---
  const handleInjectAsset = (asset: VaultAsset) => {
    const prompt = typeof asset.metadata.generationPrompt === 'string' ? asset.metadata.generationPrompt : null;
    const newAsset: QueueItem = {
      id: asset.assetId,
      title: prompt ? prompt.slice(0, 60) : 'أصل من الخزانة السيادية',
      type: typeLabelForCapability(asset.capabilityTarget),
      source: 'الخزانة السيادية',
      duration: '--:--',
      status: 'أصل حقيقي — تم استدعاؤه من الخزانة السيادية',
      isRealAsset: true,
      secureStorageUri: asset.secureStorageUri,
      assetFamily: asset.assetFamily,
      capabilityOrigin: asset.capabilityTarget,
    };

    setQueue(prevQueue => [newAsset, ...prevQueue.filter((a) => a.id !== newAsset.id)]);
    setActiveAsset(newAsset);
    setIsSummonOpen(false);

    // Trigger neon golden flash animation sequence
    setInjectionFlash(true);
    setTimeout(() => setInjectionFlash(false), 800);
  };

  // --- Forward to Makman: carries a real handoff payload only for a
  // real, Vault-sourced active asset — the demo seed items forward with
  // no payload, exactly as before this Package. THE CORRIDOR PACKAGE:
  // also carries the real compiled graph, but ONLY when it was compiled
  // from the asset currently being forwarded — a stale compile from a
  // since-replaced active asset must never ride along as if it matched.
  const handleForwardToMakman = () => {
    if (activeAsset?.isRealAsset && activeAsset.secureStorageUri) {
      try {
        sessionStorage.setItem('azma.transfer.rasAmrProduction', JSON.stringify({
          id: activeAsset.id,
          title: activeAsset.title,
          secureStorageUri: activeAsset.secureStorageUri,
        }));
        sessionStorage.setItem('azma.transfer.origin', 'ras-amr');

        if (compiledGraph && compiledForAssetId === activeAsset.id) {
          sessionStorage.setItem('azma.transfer.rasAmrCompiledGraph', JSON.stringify(compiledGraph));
        } else {
          sessionStorage.removeItem('azma.transfer.rasAmrCompiledGraph');
        }
      } catch { /* ignore — navigation still proceeds */ }
    }
    goTo('/makman-al-ghayah');
  };

  // PACKAGE F — CONSTITUTIONAL CAPABILITY REVELATION
  // Canvas save/load: reveals the certified persistence capability
  // that was previously 100% hidden. Uses the already-certified
  // POST /api/ras-amr/canvas and GET /api/ras-amr/canvas routes.
  const [isSavingCanvas,   setIsSavingCanvas]   = useState(false);
  const [saveCanvasStatus, setSaveCanvasStatus] = useState<string | null>(null);
  const [savedCanvases,    setSavedCanvases]    = useState<{ canvasId: string; title: string }[]>([]);
  const [showCanvasLoad,   setShowCanvasLoad]   = useState(false);
  const [isLoadingCanvases, setIsLoadingCanvases] = useState(false);

  // PACKAGE XXXI — 5-tab right workspace: المشهد | التوجيه | الصوت | الترجمة | المشروع
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'canvas' | 'direction' | 'audio' | 'subtitles' | 'project'>('canvas');

  const handleSaveCanvas = async () => {
    if (!sessionCanvas) return;
    setIsSavingCanvas(true);
    setSaveCanvasStatus(null);
    try {
      const r = await fetch('/api/ras-amr/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvas: sessionCanvas }),
      });
      if (r.ok) {
        setSaveCanvasStatus('المشهد محفوظ ✔');
      } else {
        const d = await r.json() as { error?: string };
        setSaveCanvasStatus(d.error ?? 'لم يُحفظ المشهد.');
      }
    } catch {
      setSaveCanvasStatus('بوابة الحفظ لا تستجيب.');
    } finally {
      setIsSavingCanvas(false);
    }
  };

  const handleLoadCanvases = async () => {
    setIsLoadingCanvases(true);
    setShowCanvasLoad(true);
    try {
      const r = await fetch('/api/ras-amr/canvas');
      if (r.ok) {
        const d = await r.json() as { status: string; canvases: { canvasId: string; title: string }[] };
        if (d.status === 'succeeded') setSavedCanvases(d.canvases);
      }
    } catch { /* silent */ }
    finally { setIsLoadingCanvases(false); }
  };

  const handleRestoreCanvas = async (canvasId: string) => {
    try {
      const r = await fetch(`/api/ras-amr/canvas/${encodeURIComponent(canvasId)}`);
      if (r.ok) {
        const d = await r.json() as { status: string; canvas: SovereignCanvas };
        if (d.status === 'succeeded') {
          setSessionCanvas(d.canvas);
          setShowCanvasLoad(false);
          setSaveCanvasStatus('المشهد مُستعاد ✔');
        }
      }
    } catch { /* silent */ }
  };

  return (
    <RasAmrExperience>
    <main className={`ras-amr-viewport ${injectionFlash ? 'neon-flash-active' : ''}`}>

      {/* Neon atmosphere — fixed behind all content */}
      <div className="neon-layer">
        <div className="cyber-grid" />
        <div className="neon-pulse-glow np-left" />
        <div className="neon-pulse-glow np-right" />
      </div>

      {/* STICKY HEADER — Phase B */}
      <header className="ras-header">
        <button className="ras-exit-btn" onClick={() => {
          try { sessionStorage.setItem('azma.return.session', JSON.stringify({ origin: 'ras-amr', constitutionalAct: 'direction' })); } catch { /* ignore */ }
          goTo('/imperial-foyer');
        }}>
          ⮜ قلب الإمبراطورية
        </button>
        <span className="ras-header-name">رأس الأمر</span>
        <div className="ras-mode-toggle" role="group" aria-label="وضع التوجيه">
          <button
            className={`ras-mode-btn ${directingMode === 'manual' ? 'ras-mode-active' : ''}`}
            onClick={() => setDirectingMode('manual')}
            aria-pressed={directingMode === 'manual'}
          >يدوي</button>
          <button
            className={`ras-mode-btn ${directingMode === 'smart' ? 'ras-mode-active' : ''}`}
            onClick={() => setDirectingMode('smart')}
            aria-pressed={directingMode === 'smart'}
          >آلي</button>
        </div>
        {selectedNodeId && sessionCanvas && (
          <span className="ras-selected-node-badge">عقدة: {selectedNodeId.slice(-6)}</span>
        )}
        <div className="ras-header-status">
          <span className={`strip-pulse${isRendering ? ' strip-pulse-active' : ''}`} aria-hidden="true" />
          <span className="ras-header-render-status">
            {isRendering ? renderStatus : (compiledGraph && compiledForAssetId === activeAsset?.id ? '✓ مُصهَر' : '◉ جاهز')}
          </span>
        </div>
        <button
          className={`ras-render-btn ${isRendering ? 'rendering' : ''}`}
          onClick={triggerMasterRender}
          disabled={isRendering || !canCompile}
          title={!canCompile ? 'استدعِ أصلاً حقيقياً من الخزانة السيادية أولاً' : undefined}
        >
          {isRendering ? '⏳ صهر…' : '🎬 صهر نهائي'}
        </button>
      </header>

      {/* BODY GRID — Phase C: Desktop 280px 1fr 300px */}
      <div className="ras-body-grid">

        {/* LEFT: Asset Queue */}
        <aside className="ras-panel-left neon-border">
          <header className="panel-header">
            <div className="neon-tag">الأصول</div>
            <h2>أصول الإنتاج</h2>
            <p>الأصول المستدعاة من الخزانة السيادية</p>
            <button className="summon-bridge-trigger-btn" onClick={() => setIsSummonOpen(true)}>
              استدعِ من الخزانة السيادية
            </button>
          </header>
          <div className="queue-container custom-scroll">
            {queue.length === 0 && (
              <p className="queue-empty-hint">
                لا توجد أصول مستدعاة بعد. استدعِ أصلاً حقيقياً من الخزانة السيادية للبدء.
              </p>
            )}
            {queue.map(asset => (
              <div
                key={asset.id}
                className={`queue-item-card ${activeAsset?.id === asset.id ? 'active-neon-card' : ''}`}
                onClick={() => setActiveAsset(asset)}
                draggable={asset.isRealAsset === true}
                onDragStart={(e) => { e.dataTransfer.setData('application/x-ras-amr-asset-id', asset.id); e.dataTransfer.effectAllowed = 'copy'; }}
              >
                <div className="item-meta">
                  <span className="item-type-badge">{asset.type}</span>
                  <span className="item-source">{asset.source}</span>
                </div>
                <h3 className="item-title">{asset.title}</h3>
                <div className="item-footer">
                  <span className="item-duration">⏱ {asset.duration}</span>
                  <span className="item-status-text">{asset.status}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER: Viewport + Quick Actions + Status */}
        <section className="ras-center">

          {/* CINEMATIC VIEWPORT */}
          <div className={`cinema-viewport neon-border-heavy ${!activeAsset ? 'viewport-empty-state' : activeAsset.isRealAsset ? 'viewport-real' : 'viewport-demo'}`}>
            <div className="viewport-scanlines" aria-hidden="true" />
            {kernelContinuity && (
              <div className="viewport-continuity-ribbon" role="status">
                {kernelContinuity === 'palace-treasure'
                  ? 'أصل قادم من القصر — المخرج الإمبراطوري على استعداد'
                  : 'الإمبراطورية أعدّت هذه الجلسة — المخرج الإمبراطوري يستقبلك'}
              </div>
            )}
            {/* PACKAGE XXXII — SOVEREIGN CREATIVE CANVAS
                The composition surface renders ALL canvas nodes as positioned layers
                when the canvas has nodes. Single-asset preview is shown otherwise. */}
            {(() => {
              const canvasNodes = sessionCanvas?.tracks.flatMap((t) => t.nodes) ?? [];
              const hasCanvasNodes = canvasNodes.length > 0;

              if (hasCanvasNodes) {
                return (
                  <div
                    className={`composition-surface${isDragOverSurface ? ' composition-drop-active' : ''}`}
                    ref={compositionRef}
                    onPointerMove={handleSurfacePointerMove}
                    onPointerUp={handleSurfacePointerUp}
                    onPointerCancel={handleSurfacePointerUp}
                    onDrop={handleSurfaceDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOverSurface(true); }}
                    onDragLeave={() => setIsDragOverSurface(false)}
                    aria-label="سطح التأليف السينمائي"
                  >
                    {canvasNodes.map((node) => {
                      const vaultAsset = vaultAssets.find((a) => a.assetId === node.assetId);
                      const uri = vaultAsset?.secureStorageUri;
                      const isSelected = node.nodeId === selectedNodeId;
                      const liveSpatial = (liveTransform?.nodeId === node.nodeId) ? liveTransform.spatial : null;
                      const spatial = liveSpatial ?? node.spatial ?? DEFAULT_SPATIAL;
                      const visual = (node.customDirectives?.visual as VisualFilterDirective | undefined) ?? DEFAULT_VISUAL;
                      const blendMode = visual.blendMode === 'NORMAL' ? 'normal'
                        : visual.blendMode === 'MULTIPLY' ? 'multiply'
                        : visual.blendMode === 'SCREEN' ? 'screen'
                        : 'overlay';
                      return (
                        <div
                          key={node.nodeId}
                          className={`canvas-layer${isSelected ? ' canvas-layer-selected' : ''}${node.isActive === false ? ' canvas-layer-inactive' : ''}`}
                          style={{
                            position: 'absolute',
                            top: `calc(50% + ${spatial.positionY}%)`,
                            left: `calc(50% + ${spatial.positionX}%)`,
                            transform: `translate(-50%, -50%) scale(${spatial.scaleX}, ${spatial.scaleY}) rotate(${spatial.rotationDegrees}deg)`,
                            opacity: visual.opacity,
                            zIndex: spatial.zIndex + 1,
                            mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
                            cursor: node.isLocked ? 'not-allowed' : 'grab',
                          }}
                          onPointerDown={(e) => handleLayerPointerDown(e, node.nodeId, 'move')}
                          onClick={() => { setSelectedNodeId(node.nodeId); setActiveWorkspaceTab('direction'); }}
                        >
                          {vaultAsset?.capabilityTarget === CapabilityTarget.VISUAL && uri ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={uri} className="layer-asset-img" alt="" draggable={false} />
                          ) : vaultAsset?.capabilityTarget === CapabilityTarget.MOTION && uri ? (
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video src={uri} className="layer-asset-img" muted playsInline preload="metadata" />
                          ) : (
                            <div className="layer-audio-pill">
                              {vaultAsset?.capabilityTarget === CapabilityTarget.AUDIO ? '🎙' : '◆'}{' '}
                              {vaultAsset?.metadata?.voiceDisplayName as string ?? node.capabilityOrigin}
                            </div>
                          )}
                          {isSelected && !node.isLocked && (
                            <div className="selection-handles" onPointerDown={(e) => e.stopPropagation()}>
                              <div className="selection-handle handle-se" title="حجم" onPointerDown={(e) => { e.stopPropagation(); handleLayerPointerDown(e, node.nodeId, 'scale'); }} />
                              <div className="selection-handle handle-sw" title="حجم" onPointerDown={(e) => { e.stopPropagation(); handleLayerPointerDown(e, node.nodeId, 'scale'); }} />
                              <div className="selection-handle handle-ne" title="حجم" onPointerDown={(e) => { e.stopPropagation(); handleLayerPointerDown(e, node.nodeId, 'scale'); }} />
                              <div className="selection-handle handle-nw" title="حجم" onPointerDown={(e) => { e.stopPropagation(); handleLayerPointerDown(e, node.nodeId, 'scale'); }} />
                              <div className="selection-handle handle-rotate" title="دوران" onPointerDown={(e) => { e.stopPropagation(); handleLayerPointerDown(e, node.nodeId, 'rotate'); }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {isDragOverSurface && (
                      <div className="composition-drop-hint" aria-hidden="true">أسقط الأصل هنا ← أضفه للمشهد</div>
                    )}
                  </div>
                );
              }

              // No canvas nodes yet — show single-asset preview (or identity state).
              return (
                <div
                  className={`viewport-main-content${isDragOverSurface ? ' composition-drop-active' : ''}`}
                  onDrop={handleSurfaceDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOverSurface(true); }}
                  onDragLeave={() => setIsDragOverSurface(false)}
                >
                  {!activeAsset ? (
                    <div className="viewport-chamber-identity">
                      <div className="viewport-sigil" aria-hidden="true">✦</div>
                      <h2 className="viewport-chamber-name">رأس الأمر</h2>
                      <p className="viewport-chamber-mandate">الجهة الدستورية لتوجيه الإنتاج السيادي — مكانية، بصرية، زمنية، وصوتية</p>
                      <p className="viewport-summon-cue">← استدعِ أصلاً من الخزانة للبدء</p>
                    </div>
                  ) : activeAsset.isRealAsset && activeAsset.capabilityOrigin === CapabilityTarget.VISUAL && activeAsset.secureStorageUri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="viewport-asset-image" src={activeAsset.secureStorageUri} alt={activeAsset.title} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : activeAsset.isRealAsset && activeAsset.capabilityOrigin === CapabilityTarget.AUDIO ? (
                    <div className="viewport-audio-surface">
                      <span className="viewport-audio-icon" aria-hidden="true">🎙</span>
                      <p className="viewport-audio-title">{activeAsset.title}</p>
                      <p className="viewport-audio-hint">أصل صوتي حقيقي</p>
                      {activeAsset.secureStorageUri && (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <audio controls src={activeAsset.secureStorageUri} className="viewport-audio-player" />
                      )}
                    </div>
                  ) : activeAsset.isRealAsset && activeAsset.capabilityOrigin === CapabilityTarget.MOTION && activeAsset.secureStorageUri ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video className="viewport-asset-image" src={activeAsset.secureStorageUri} controls playsInline style={{ background: '#000', objectFit: 'contain' }} />
                  ) : (
                    <div className="viewport-generic-identity">
                      <div className="viewport-sigil viewport-sigil-dim" aria-hidden="true">✦</div>
                      <p className="viewport-generic-label">{activeAsset.title}</p>
                    </div>
                  )}
                  {isDragOverSurface && (
                    <div className="composition-drop-hint" aria-hidden="true">أسقط الأصل هنا ← أضفه للمشهد</div>
                  )}
                </div>
              );
            })()}
            <div className="viewport-meta-strip">
              {activeAsset ? (
                <>
                  <span className={`viewport-real-badge ${activeAsset.isRealAsset ? 'badge-real' : 'badge-demo'}`}>
                    {activeAsset.isRealAsset ? '● حقيقي' : '◌ تجريبي'}
                  </span>
                  <span className="viewport-asset-type">{activeAsset.type}</span>
                  <span className="viewport-asset-source">{activeAsset.source}</span>
                </>
              ) : (
                <span className="viewport-idle">في وضع الاستعداد الإخراجي</span>
              )}
              <span className="viewport-id-tag">المخرج الإمبراطوري</span>
            </div>
          </div>

          {/* QUICK ACTIONS — add to scene; render button is in header only */}
          {activeAsset && (
            <div className="creator-quick-actions">
              {activeAsset.isRealAsset && sessionCanvas &&
                !sessionCanvas.tracks.flatMap(t => t.nodes).some(n => n.assetId === activeAsset.id) && (
                <button className="creator-action-btn creator-action-primary" onClick={handleAddActiveAssetToCanvas}>
                  ➕ أضف إلى مشهد الإخراج
                </button>
              )}
              {activeAsset.isRealAsset && !sessionCanvas && (
                <button className="creator-action-btn creator-action-primary" onClick={handleAddActiveAssetToCanvas}>
                  ➕ ابدأ مشهد الإخراج بهذا الأصل
                </button>
              )}
              {activeAsset.isRealAsset && sessionCanvas &&
                sessionCanvas.tracks.flatMap(t => t.nodes).some(n => n.assetId === activeAsset.id) &&
                !canCompile && (
                <span style={{ fontSize: '11px', color: 'var(--neon-gold-dim)' }}>
                  ✓ الأصل في المشهد — أضف أصولاً إضافية أو اصهر للتصدير
                </span>
              )}
            </div>
          )}

          {/* DIRECTOR STATUS STRIP
              Three live cells: active operator, canvas summary, render state. */}
          <div className="director-status-strip neon-border">
            <div className="strip-cell strip-operator">
              <span className={`strip-pulse${isRendering ? ' strip-pulse-active' : ''}`} aria-hidden="true" />
              <span>{directingMode === 'smart' ? 'المخرج الآلي' : 'المخرج اليدوي'}</span>
            </div>
            <div className="strip-cell strip-canvas">
              {sessionCanvas ? `${sessionCanvas.tracks.flatMap(t => t.nodes).length} عنصر` : 'لا يوجد مشهد'}
            </div>
            <div className="strip-cell strip-render">
              {renderStatus !== 'في وضع الاستعداد الإخراجي' ? renderStatus : '◉ جاهز'}
            </div>
          </div>

        </section>

        {/* RIGHT: 5-Tab Workspace */}
        <aside className="ras-panel-right neon-border">
          {/* Tab bar — Phase D */}
          <div className="ras-tab-bar" role="tablist">
            {(['canvas', 'direction', 'audio', 'subtitles', 'project'] as const).map((tab) => {
              const labels: Record<typeof tab, string> = { canvas: 'المشهد', direction: 'التوجيه', audio: 'الصوت', subtitles: 'الترجمة', project: 'المشروع' };
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeWorkspaceTab === tab}
                  className={`ras-tab-btn ${activeWorkspaceTab === tab ? 'ras-tab-active' : ''}`}
                  onClick={() => setActiveWorkspaceTab(tab)}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab: المشهد */}
          {activeWorkspaceTab === 'canvas' && (
            <div className="ras-tab-content custom-scroll">
              <div className="canvas-mode-selector">
                <div className="neon-tag">نوع الإخراج</div>
                <select
                  className="canvas-type-select"
                  value={selectedCanvasType}
                  onChange={(e) => {
                    const newType = e.target.value as CanvasType;
                    setSelectedCanvasType(newType);
                    if (sessionCanvas) { setSessionCanvas(null); setSelectedNodeId(null); setCompiledGraph(null); setCompiledForAssetId(null); }
                  }}
                  aria-label="نوع الإخراج"
                >
                  <option value={CanvasType.CINEMATIC}>سينمائي — ملف MP4 حقيقي عبر مشفّر FFmpeg</option>
                  <option value={CanvasType.NARRATIVE}>سردي — بنية تجميع ديناميكية</option>
                  <option value={CanvasType.DIRECTORIAL}>توجيهي — بنية حالة توجيه</option>
                </select>
                {sessionCanvas && <p className="canvas-mode-reset-note">⚠ تغيير النوع يُعيد تهيئة المشهد الحالي</p>}
              </div>

              {sessionCanvas && directionDecisionLog.length > 0 && (
                <div className="direction-decision-log" data-testid="direction-decision-log">
                  <span className="neon-tag">سجل القرارات التوجيهية</span>
                  <p className="direction-decision-latest">
                    آخر قرار: {directionDecisionLog[0].mutation.actionType} — {directionDecisionLog[0].operator} — {new Date(directionDecisionLog[0].issuedAtMs).toLocaleTimeString('ar-EG')}
                  </p>
                </div>
              )}

              {sessionCanvas && (
                <div className="spatial-adjust-panel">
                  <div className="group-controls-row">
                    <select className="group-select" value={activeTrackId} onChange={(e) => setActiveTrackId(e.target.value)} aria-label="المجموعة المستهدفة">
                      {sessionCanvas.tracks.map((track) => (
                        <option key={track.trackId} value={track.trackId}>{track.trackName}</option>
                      ))}
                    </select>
                    <input type="text" className="group-name-input" placeholder="اسم مجموعة جديدة" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                    <button className="action-trigger-btn" onClick={handleAddGroup} disabled={!newGroupName.trim()}>＋ مجموعة</button>
                  </div>
                  <button
                    className="action-trigger-btn spatial-apply-btn"
                    onClick={handleAddActiveAssetToCanvas}
                    disabled={!wantsRealCanvas || (sessionCanvas !== null && sessionCanvas.tracks.flatMap((t) => t.nodes).some((n) => n.assetId === activeAsset?.id))}
                  >
                    ➕ أضف الأصل النشط إلى المجموعة
                  </button>
                  {sessionCanvas.tracks.every((t) => t.nodes.length === 0) ? (
                    <p className="spatial-current-state">المشهد فارغ — أضف أصلاً حقيقياً للبدء</p>
                  ) : (
                    sessionCanvas.tracks.map((track) => (
                      <div key={track.trackId} className="narrative-canvas-group">
                        <h3 className="narrative-canvas-group-name">{track.trackName}</h3>
                        {track.nodes.length === 0 ? (
                          <p className="spatial-current-state">هذه المجموعة فارغة</p>
                        ) : (
                          <ul className="narrative-canvas-node-list">
                            {track.nodes.map((node, index) => (
                              <li key={node.nodeId} className={`narrative-canvas-node ${node.nodeId === selectedNodeId ? 'node-selected' : ''} ${node.isActive === false ? 'node-inactive' : ''} ${node.isLocked ? 'node-locked' : ''}`}>
                                <button className="narrative-node-select" onClick={() => { setSelectedNodeId(node.nodeId); setActiveWorkspaceTab('direction'); }}>
                                  #{index + 1} — {node.assetFamily}/{node.capabilityOrigin}
                                  {node.directionRole ? ` — ${DIRECTION_NODE_ROLE_LABELS[node.directionRole]}` : ''}
                                  {node.directionEmphasis === 'primary' ? ' — ◆' : node.directionEmphasis === 'supporting' ? ' — ◇' : ''}
                                  {node.isActive === false ? ' — (معطَّل)' : ''}{node.isLocked ? ' — 🔒' : ''}
                                </button>
                                <select className="narrative-node-classification" value={node.directionRole ?? ''} onChange={(e) => handleUpdateNodeClassification(node.nodeId, (e.target.value || undefined) as DirectionNodeRole | undefined)} disabled={node.isLocked} aria-label="التصنيف السينمائي">
                                  <option value="">غير مصنَّف</option>
                                  {Object.values(DirectionNodeRole).map((role) => (<option key={role} value={role}>{DIRECTION_NODE_ROLE_LABELS[role]}</option>))}
                                </select>
                                <select className="narrative-node-emphasis" value={node.directionEmphasis ?? ''} onChange={(e) => handleSetNodeEmphasis(node.nodeId, (e.target.value || null) as 'primary' | 'supporting' | null)} disabled={node.isLocked} aria-label="الأهمية الإخراجية">
                                  <option value="">بلا تمييز</option>
                                  <option value="primary">أساسي</option>
                                  <option value="supporting">مساند</option>
                                </select>
                                <button className="narrative-node-reorder" onClick={() => handleReorderNode(node.nodeId, 'up')} disabled={index === 0 || node.isLocked} aria-label="ترقية العقدة">↑</button>
                                <button className="narrative-node-reorder" onClick={() => handleReorderNode(node.nodeId, 'down')} disabled={index === track.nodes.length - 1 || node.isLocked} aria-label="خفض رتبة العقدة">↓</button>
                                {sessionCanvas.tracks.length > 1 && (
                                  <select className="narrative-node-move-group" value={track.trackId} onChange={(e) => handleMoveNodeToGroup(node.nodeId, e.target.value)} disabled={node.isLocked} aria-label="نقل إلى مجموعة">
                                    {sessionCanvas.tracks.map((dest) => (<option key={dest.trackId} value={dest.trackId}>{dest.trackName}</option>))}
                                  </select>
                                )}
                                <button className="narrative-node-toggle" onClick={() => handleSetNodeActive(node.nodeId, node.isActive === false)} disabled={node.isLocked} aria-label={node.isActive === false ? 'تفعيل العقدة' : 'تعطيل العقدة'}>
                                  {node.isActive === false ? '✓' : '⏸'}
                                </button>
                                <button className="narrative-node-toggle" onClick={() => handleSetNodeLock(node.nodeId, !node.isLocked)} aria-label={node.isLocked ? 'إلغاء القفل' : 'قفل التوجيه'}>
                                  {node.isLocked ? '🔓' : '🔒'}
                                </button>
                                <button className="narrative-node-remove" onClick={() => handleRemoveNodeFromCanvas(node.nodeId)} aria-label="إزالة من المشهد">✕</button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                  {narrativeIntegrity && !narrativeIntegrity.valid && (
                    <p className="spatial-current-state narrative-integrity-violation">انتهاك للسلامة السردية: {narrativeIntegrity.violations.join(' — ')}</p>
                  )}
                  {multiNodeDirection && multiNodeDirection.nodeDecisions.length > 1 && (
                    <p className="spatial-current-state">
                      {multiNodeDirection.primaryNodeId ? 'تم تحديد اتجاه أساسي حقيقي واحد من بين العقد.' : 'لا يوجد اتجاه أساسي محدَّد — لا يوجد هدف خالق مصرَّح به.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: التوجيه — Phase E: real mode consequence */}
          {activeWorkspaceTab === 'direction' && (
            <div className="ras-tab-content custom-scroll">
              {/* Mode indicator — read-only label. The authoritative toggle is in the sticky header. */}
              <div className="ras-direction-mode-indicator">
                <div className="neon-tag">{directingMode === 'manual' ? 'المخرج اليدوي' : 'المخرج الآلي'}</div>
              </div>

              {directingMode === 'manual' ? (
                <>
                  {sessionCanvas && selectedNodeId ? (
                    <>
                      <div className="spatial-adjust-panel panel-manual-spatial">
                        <header className="panel-header">
                          <div className="neon-tag">التوجيه المكاني</div>
                          <h2>تعديل مكاني حقيقي</h2>
                          <p>يُطبَّق على المشهد ويصل إلى الصهر النهائي</p>
                        </header>
                        <p className="ras-honesty-note">⚠ التوجيه المكاني يظهر مباشرة في سطح التأليف — اسحب العقدة للتحريك، أو استخدم الحقول أدناه للقيم الدقيقة. التأثيرات البصرية المتقدمة تظهر في الصهر النهائي.</p>
                        <div className="spatial-input-grid">
                          <label>X (%)<input type="number" step="0.5" value={spatialForm.positionX} onChange={(e) => setSpatialForm((prev) => ({ ...prev, positionX: Number(e.target.value) }))} /></label>
                          <label>Y (%)<input type="number" step="0.5" value={spatialForm.positionY} onChange={(e) => setSpatialForm((prev) => ({ ...prev, positionY: Number(e.target.value) }))} /></label>
                          <label>Scale X<input type="number" step="0.05" value={spatialForm.scaleX} onChange={(e) => setSpatialForm((prev) => ({ ...prev, scaleX: Number(e.target.value) }))} /></label>
                          <label>Scale Y<input type="number" step="0.05" value={spatialForm.scaleY} onChange={(e) => setSpatialForm((prev) => ({ ...prev, scaleY: Number(e.target.value) }))} /></label>
                          <label>دوران°<input type="number" step="1" value={spatialForm.rotationDegrees} onChange={(e) => setSpatialForm((prev) => ({ ...prev, rotationDegrees: Number(e.target.value) }))} /></label>
                          <label>z-Index<input type="number" step="1" value={spatialForm.zIndex} onChange={(e) => setSpatialForm((prev) => ({ ...prev, zIndex: Number(e.target.value) }))} /></label>
                        </div>
                        <button className="action-trigger-btn spatial-apply-btn" onClick={handleApplySpatialAdjustment}>⇲ تطبيق التعديل المكاني</button>
                        {activeSpatialDirective && (
                          <p className="spatial-current-state">الحالي: X={activeSpatialDirective.positionX}, Y={activeSpatialDirective.positionY}, Scale=({activeSpatialDirective.scaleX}, {activeSpatialDirective.scaleY}), Rotation={activeSpatialDirective.rotationDegrees}°</p>
                        )}
                      </div>
                      <div className="spatial-adjust-panel panel-manual-visual">
                        <header className="panel-header">
                          <div className="neon-tag">التوجيه البصري</div>
                          <h2>تعديل بصري حقيقي</h2>
                          <p>معالج البكسل + صهر اللون</p>
                        </header>
                        <p className="ras-honesty-note">⚠ Opacity يظهر مباشرة في سطح التأليف — Blend Mode يظهر في الصهر النهائي فقط</p>
                        <div className="spatial-input-grid">
                          <label>Opacity<input type="number" min="0" max="1" step="0.05" value={visualForm.opacity} onChange={(e) => setVisualForm((prev) => ({ ...prev, opacity: Number(e.target.value) }))} /></label>
                          <label>Blend Mode<select value={visualForm.blendMode} onChange={(e) => setVisualForm((prev) => ({ ...prev, blendMode: e.target.value as VisualFilterDirective['blendMode'] }))}>{BLEND_MODES.map((mode) => (<option key={mode} value={mode}>{mode}</option>))}</select></label>
                        </div>
                        <button className="action-trigger-btn spatial-apply-btn" onClick={handleApplyVisualAdjustment}>🎨 تطبيق التعديل البصري الحقيقي</button>
                        {activeVisualDirective && (
                          <p className="spatial-current-state">الحالي: Opacity={activeVisualDirective.opacity}, Blend={activeVisualDirective.blendMode}</p>
                        )}
                      </div>
                      <div className="spatial-adjust-panel panel-manual-temporal">
                        <header className="panel-header">
                          <div className="neon-tag">التوجيه الزمني</div>
                          <h2>تعديل زمني حقيقي</h2>
                          <p>المزامنة العصبية للصوت — توقيت حقيقي على الخط الزمني</p>
                        </header>
                        <div className="spatial-input-grid">
                          <label>بداية (ث)<input type="number" min="0" value={temporalForm.globalStartTimeSeconds} onChange={(e) => setTemporalForm((prev) => ({ ...prev, globalStartTimeSeconds: Number(e.target.value) }))} /></label>
                          <label>مدة (ث)<input type="number" min="0" value={temporalForm.playDurationSeconds} onChange={(e) => setTemporalForm((prev) => ({ ...prev, playDurationSeconds: Number(e.target.value) }))} /></label>
                          <label>قص-من (ث)<input type="number" min="0" value={temporalForm.trimStartSeconds ?? ''} onChange={(e) => setTemporalForm((prev) => ({ ...prev, trimStartSeconds: e.target.value === '' ? undefined : Number(e.target.value) }))} /></label>
                          <label>قص-إلى (ث)<input type="number" min="0" value={temporalForm.trimEndSeconds ?? ''} onChange={(e) => setTemporalForm((prev) => ({ ...prev, trimEndSeconds: e.target.value === '' ? undefined : Number(e.target.value) }))} /></label>
                        </div>
                        <button className="action-trigger-btn spatial-apply-btn" onClick={handleApplyTemporalAdjustment}>🎙 تطبيق التعديل الزمني الحقيقي</button>
                        {activeTemporalDirective && (
                          <p className="spatial-current-state">
                            الحالي: بداية={activeTemporalDirective.globalStartTimeSeconds}ث، مدة={activeTemporalDirective.playDurationSeconds}ث
                            {activeTemporalDirective.trimStartSeconds !== undefined ? `، قص-من=${activeTemporalDirective.trimStartSeconds}ث` : ''}
                            {activeTemporalDirective.trimEndSeconds !== undefined ? `، قص-إلى=${activeTemporalDirective.trimEndSeconds}ث` : ''}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="spatial-current-state" style={{ padding: '12px' }}>اختر عقدة من تبويب «المشهد» لتطبيق التعديلات اليدوية</p>
                  )}
                </>
              ) : (
                sessionCanvas && directorDecision ? (
                  <div className="spatial-adjust-panel panel-auto-director">
                    <header className="panel-header">
                      <div className="neon-tag">قرار المخرج الآلي</div>
                      <h2>قرار الإخراج السينمائي الحقيقي</h2>
                      <p>المخرج الذكي الآلي يقرر — التنفيذ عبر محرك الحالة الحقيقي</p>
                    </header>
                    {!directorDecision.included ? (
                      <p className="spatial-current-state">مرفوض: {directorDecision.rejectionReason}</p>
                    ) : (
                      <>
                        <p className="spatial-current-state">التوقيت: بداية={directorDecision.temporal?.globalStartTimeSeconds}ث، مدة={directorDecision.temporal?.playDurationSeconds}ث ({directorDecision.temporalBasis === 'real-evidence' ? 'بيانات حقيقية' : 'قيمة افتراضية'})</p>
                        <p className="spatial-current-state">الترتيب السردي: الموضع {directorDecision.structural?.executionOrderIndex}</p>
                        {directorDecision.audio && (<p className="spatial-current-state">الصوت: مستوى={directorDecision.audio.volumeDb}dB، توازن={directorDecision.audio.panCenter}</p>)}
                        <p className="spatial-current-state">{directorDecision.creatorGoal.stated ? `هدف الخالق: "${directorDecision.creatorGoal.statedIntent}"` : 'لا يوجد هدف خالق مصرَّح به — لم يُختلَق بديل'} ({directorDecision.creatorGoal.source === 'formal-goal-contract' ? 'مصدر رسمي حقيقي' : 'صدى الطلب'})</p>
                        {directorDecision.creatorGoal.title && (<p className="spatial-current-state">عنوان الهدف: {directorDecision.creatorGoal.title}</p>)}
                        {directorDecision.creatorGoal.priority && (<p className="spatial-current-state">أولوية الهدف: {directorDecision.creatorGoal.priority}</p>)}
                        {directorDecision.creatorGoal.commercialIntent && (<p className="spatial-current-state">النية التجارية: {directorDecision.creatorGoal.commercialIntent.accessPolicy.distributionTier}{directorDecision.creatorGoal.commercialIntent.coverArtUri ? ` — صورة الغلاف متوفرة` : ''}</p>)}
                        <p className="spatial-current-state">الاعتبار الأساسي: {directorDecision.primaryConsideration}</p>
                        <p className="spatial-current-state">{directorDecision.rhythm ? `الإيقاع: ${directorDecision.rhythm}` : 'لا إيقاع مصرَّح به'} — {directorDecision.transitionStrategy ? `الانتقال: ${directorDecision.transitionStrategy}` : 'لا انتقال مصرَّح به'}</p>
                        <button className="action-trigger-btn spatial-apply-btn" onClick={handleApplyDirectorDecision}>🤖 تطبيق قرار الإخراج الحقيقي</button>
                        {(activeStructuralDirective || activeAudioDirective) && (
                          <p className="spatial-current-state">المُطبَّق:{activeStructuralDirective ? ` ترتيب=${activeStructuralDirective.executionOrderIndex}` : ''}{activeAudioDirective ? `، صوت مطبَّق` : ''}</p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="spatial-current-state" style={{ padding: '12px' }}>
                    {sessionCanvas ? 'لا يوجد قرار آلي بعد — أضف أصولاً لتفعيل المخرج الآلي' : 'ابدأ مشهداً لاستخدام المخرج الآلي'}
                  </p>
                )
              )}
            </div>
          )}

          {/* Tab: الصوت — Phase D: track volume + per-node voice */}
          {activeWorkspaceTab === 'audio' && (
            <div className="ras-tab-content custom-scroll">
              {!sessionCanvas ? (
                <p className="spatial-current-state" style={{ padding: '12px' }}>ابدأ مشهداً لضبط الصوت</p>
              ) : (
                sessionCanvas.tracks.map((track) => (
                  <div key={track.trackId} className="spatial-adjust-panel">
                    <header className="panel-header">
                      <div className="neon-tag">مجموعة</div>
                      <h2>{track.trackName}</h2>
                    </header>
                    <div className="track-volume-row">
                      <span className="track-volume-label">🔊 {track.trackVolumeDb ?? 0} dB</span>
                      <input type="range" className="track-volume-slider" min={-60} max={12} step={1} value={track.trackVolumeDb ?? 0} onChange={(e) => handleSetTrackVolume(track.trackId, Number(e.target.value))} aria-label={`مستوى صوت ${track.trackName}`} />
                    </div>
                    {track.nodes.length > 0 && (
                      <div>
                        <p className="spatial-current-state" style={{ marginBottom: '6px' }}>صوت ومستوى صوت لكل عقدة:</p>
                        {track.nodes.map((node, idx) => {
                          const nodeAudio = node.customDirectives?.audio as AudioMixingDirective | undefined;
                          return (
                            <div key={node.nodeId} style={{ marginBottom: '10px', padding: '6px', border: '1px solid rgba(255,215,0,0.08)', borderRadius: '6px' }}>
                              <p className="spatial-current-state" style={{ marginBottom: '4px' }}>عقدة {idx + 1}</p>
                              <div className="ras-audio-node-row">
                                <select className="narrative-node-voice" value={(node.customDirectives?.voice as VoiceAssignmentDirective | undefined)?.vaultAssetId ?? ''} onChange={(e) => handleAssignVoiceToNode(node.nodeId, e.target.value)} disabled={node.isLocked || audioVoiceAssets.length === 0} aria-label={`الصوت المُسنَد للعقدة ${idx + 1}`}>
                                  <option value="">بلا صوت مُسنَد</option>
                                  {audioVoiceAssets.map((voice) => (<option key={voice.assetId} value={voice.assetId}>{voice.metadata.voiceDisplayName ?? voice.assetId}</option>))}
                                </select>
                              </div>
                              <div className="ras-audio-node-row" style={{ marginTop: '4px' }}>
                                <span className="track-volume-label">🔊 {(nodeAudio?.volumeDb ?? 0).toFixed(0)} dB</span>
                                <input type="range" className="track-volume-slider" min={-60} max={12} step={1} value={nodeAudio?.volumeDb ?? 0} onChange={(e) => handleSetNodeVolume(node.nodeId, Number(e.target.value))} disabled={node.isLocked} aria-label={`مستوى صوت العقدة ${idx + 1}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: الترجمة — Phase D: per-node subtitle import */}
          {activeWorkspaceTab === 'subtitles' && (
            <div className="ras-tab-content custom-scroll">
              <input type="file" ref={subtitleInputRef} accept=".srt,.vtt,text/plain" style={{ display: 'none' }} onChange={handleSubtitleFileChosen} />
              {subtitleImportError && (<p className="spatial-current-state narrative-integrity-violation" style={{ padding: '8px' }}>{subtitleImportError}</p>)}
              {!sessionCanvas ? (
                <p className="spatial-current-state" style={{ padding: '12px' }}>ابدأ مشهداً لاستيراد ترجمات</p>
              ) : (
                sessionCanvas.tracks.flatMap(t => t.nodes).map((node, idx) => {
                  const nodeSubs = node.customDirectives?.subtitles as SubtitleDirective | undefined;
                  const cueCount = nodeSubs?.cues?.length ?? 0;
                  return (
                    <div key={node.nodeId} className="spatial-adjust-panel">
                      <p className="spatial-current-state">عقدة {idx + 1} — {node.assetFamily}/{node.capabilityOrigin}</p>
                      <button className="action-trigger-btn spatial-apply-btn" onClick={() => { setSubtitleTargetNodeId(node.nodeId); subtitleInputRef.current?.click(); }} disabled={node.isLocked || (subtitleImportBusy && subtitleTargetNodeId === node.nodeId)} aria-label={`استيراد ترجمات للعقدة ${idx + 1}`}>
                        {subtitleImportBusy && subtitleTargetNodeId === node.nodeId ? '⏳ جارٍ الاستيراد…' : cueCount > 0 ? `💬 ${cueCount} ترجمة — تحديث` : '💬 استيراد SRT/VTT'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab: المشروع — Phase D: save/restore + forward */}
          {activeWorkspaceTab === 'project' && (
            <div className="ras-tab-content custom-scroll">
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="action-trigger-btn forward-btn" onClick={handleForwardToMakman} title={compiledGraph && compiledForAssetId === activeAsset?.id ? 'سيصل تجميع حقيقي مختوم إلى مكمن الغاية' : 'لا يوجد تجميع مُصهَر بعد — سيصل عرض أولي فقط'}>
                  👑 ترحيل العمل المكتمل لـ &quot;مكمن الغاية&quot;
                </button>
                {sessionCanvas && (
                  <button className={`action-trigger-btn canvas-save-btn ${isSavingCanvas ? 'rendering' : ''}`} onClick={() => void handleSaveCanvas()} disabled={isSavingCanvas}>
                    {isSavingCanvas ? 'المشهد يُحفظ…' : '💾 حفظ المشهد'}
                  </button>
                )}
                <button className="action-trigger-btn canvas-load-btn" onClick={() => void handleLoadCanvases()}>📂 استعادة مشهد محفوظ</button>
                {saveCanvasStatus && (<p className="canvas-save-status">{saveCanvasStatus}</p>)}
                {showCanvasLoad && (
                  <div className="canvas-load-panel">
                    {isLoadingCanvases && <p className="canvas-load-hint">التشكيلات تُحمَّل…</p>}
                    {!isLoadingCanvases && savedCanvases.length === 0 && (<p className="canvas-load-hint">لا توجد تشكيلات محفوظة بعد.</p>)}
                    {savedCanvases.map((c) => (
                      <button key={c.canvasId} className="canvas-load-item" onClick={() => void handleRestoreCanvas(c.canvasId)}>{c.title || c.canvasId}</button>
                    ))}
                    <button className="canvas-load-close" onClick={() => setShowCanvasLoad(false)}>✖ إغلاق</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

      </div>{/* end ras-body-grid */}

      {/* STICKY TIMELINE — Phase G: 180px, time ruler, role icons, corridor CTA */}
      <div className="ras-timeline">
        <div className="ras-timeline-header">
          <span className="neon-tag" style={{ margin: 0 }}>الخط الزمني</span>
          {sessionCanvas && (<span className="spatial-current-state">{sessionCanvas.tracks.flatMap(t => t.nodes).length} عقدة</span>)}
          {compiledGraph && compiledForAssetId === activeAsset?.id && (
            <button className="ras-corridor-btn" onClick={handleForwardToMakman}>
              ✦ الصهر مكتمل — انتقل إلى مكمن الغاية
            </button>
          )}
        </div>
        {!sessionCanvas || sessionCanvas.tracks.flatMap(t => t.nodes).length === 0 ? (
          <p className="timeline-empty-hint" style={{ padding: '0 14px' }}>
            {!sessionCanvas ? 'أضف أصلاً لبدء الإخراج' : 'المشهد جاهز — أضف أصلك'}
          </p>
        ) : (
          <>
            {(() => {
              const allNodes = sessionCanvas.tracks.flatMap(t => t.nodes);
              const totalDuration = Math.max(...allNodes.map(n => (n.temporal?.globalStartTimeSeconds ?? 0) + (n.temporal?.playDurationSeconds ?? 5)), 5);
              const tickInterval = totalDuration <= 30 ? 5 : totalDuration <= 120 ? 10 : 30;
              const ticks: number[] = [];
              for (let ti = 0; ti <= totalDuration; ti += tickInterval) ticks.push(ti);
              return (
                <div className="ras-timeline-ruler">
                  {ticks.map((tick) => (
                    <div key={tick} className="ras-ruler-tick" style={{ left: `${(tick / totalDuration) * 100}%` }}>
                      <span>{tick}s</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="timeline-tracks-container">
              {(() => {
                const allNodes2 = sessionCanvas.tracks.flatMap(t => t.nodes);
                const totalDur2 = Math.max(...allNodes2.map(n => (n.temporal?.globalStartTimeSeconds ?? 0) + (n.temporal?.playDurationSeconds ?? 5)), 5);
                const roleIconMap: Partial<Record<DirectionNodeRole, string>> = {
                  [DirectionNodeRole.OPENING_SHOT]: '◀',
                  [DirectionNodeRole.DIALOGUE_SCENE]: '💬',
                  [DirectionNodeRole.NARRATION]: '🎙',
                  [DirectionNodeRole.MUSIC_LAYER]: '🎵',
                  [DirectionNodeRole.AMBIENT_LAYER]: '〰',
                  [DirectionNodeRole.TRANSITION]: '—',
                  [DirectionNodeRole.CLOSING_SHOT]: '▶',
                };
                return sessionCanvas.tracks.filter(t => t.nodes.length > 0).map((track) => (
                  <div key={track.trackId} className={`timeline-track-row${track.isMuted ? ' track-muted' : ''}`}>
                    <span className="timeline-track-label" title={track.trackName}>{track.trackName.slice(0, 8)}</span>
                    <div className="timeline-nodes-bar">
                      {track.nodes.map((node, idx) => {
                        const start = node.temporal?.globalStartTimeSeconds ?? 0;
                        const dur = node.temporal?.playDurationSeconds ?? 5;
                        const isSelected = selectedNodeId === node.nodeId;
                        const isCurrentAsset = activeAsset?.id === node.assetId;
                        const roleIcon = node.directionRole ? (roleIconMap[node.directionRole] ?? '') : '';
                        return (
                          <div
                            key={node.nodeId}
                            className={`timeline-node-block${isSelected ? ' node-block-selected' : ''}${isCurrentAsset ? ' node-block-active' : ''}${node.isLocked ? ' node-block-locked' : ''}${node.isActive === false ? ' node-block-inactive' : ''}`}
                            style={{ left: `${(start / totalDur2) * 100}%`, width: `${Math.max((dur / totalDur2) * 100, 4)}%` }}
                            onClick={() => { setSelectedNodeId(node.nodeId); setActiveWorkspaceTab('direction'); }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedNodeId(node.nodeId); setActiveWorkspaceTab('direction'); } }}
                            aria-label={`عقدة ${idx + 1}: من ${start}ث إلى ${start + dur}ث`}
                            aria-pressed={isSelected}
                            title={`${start}s → ${start + dur}s`}
                          >
                            <span className="timeline-node-index">{roleIcon || (idx + 1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </div>

      {/* SOVEREIGN SUMMONING BRIDGE: VAULT GATEWAY HUD — COMPLETELY UNCHANGED */}
      {isSummonOpen && (
        <div className="summon-hud-overlay">
          <div className="hud-window-container metallic-surface neon-border-heavy fade-in">
            <header className="hud-header">
              <div className="hud-title-block">
                <span className="hud-badge">الخزانة السيادية</span>
                <h2>استدعِ أصلاً من الخزانة</h2>
                <p>الأصول المُستدعاة تنضم إلى المشهد وتدخل تحت سلطة المخرج الإمبراطوري</p>
              </div>
              <button className="hud-close-btn" onClick={() => setIsSummonOpen(false)}>✖ إغلاق</button>
            </header>

            <div className="hud-tab-switcher">
              <button className={`hud-top-tab ${hudActiveTab === 'vault' ? 'hud-top-tab-active' : ''}`} onClick={() => setHudActiveTab('vault')}>◆ من الخزانة السيادية</button>
              <button className={`hud-top-tab ${hudActiveTab === 'create' ? 'hud-top-tab-active' : ''}`} onClick={() => setHudActiveTab('create')}>⬆ رفع ملف | توليد صوت</button>
            </div>

            {hudActiveTab === 'vault' && (
              vaultAssetsLoaded && realVaultCategories.length === 0 ? (
                <div className="hud-empty-state">
                  <p>لا توجد أصول في الخزانة السيادية بعد.</p>
                  <p>انتقل إلى تبويب «إنشاء أصل جديد» لرفع ملف أو توليد صوت، أو أنشئ صورة في حجرة القيامة.</p>
                </div>
              ) : (
                <div className="hud-body-layout">
                  <aside className="hud-vaults-picker custom-scroll">
                    {realVaultCategories.map(v => (
                      <button key={v.id} className={`hud-vault-tab ${activeVaultCategory?.id === v.id ? 'active-hud-tab' : ''}`} onClick={() => setSelectedVault(v.id)}>
                        <span className="hud-tab-icon">{v.icon}</span>
                        <span className="hud-tab-name">{v.name}</span>
                      </button>
                    ))}
                  </aside>
                  <main className="hud-items-viewer custom-scroll">
                    <h3 className="viewer-title-context">محتويات {activeVaultCategory?.name} المتاحة للاستدعاء الفوري:</h3>
                    <div className="hud-items-grid">
                      {activeVaultCategory?.assets.map((asset) => {
                        const prompt = typeof asset.metadata.generationPrompt === 'string' && asset.metadata.generationPrompt ? asset.metadata.generationPrompt : null;
                        const voiceName = typeof asset.metadata.voiceDisplayName === 'string' && asset.metadata.voiceDisplayName ? asset.metadata.voiceDisplayName : null;
                        const TYPE_ICONS: Record<string, string> = { VISUAL: '🖼', MOTION: '🎬', AUDIO: '🎙', WRITING: '📄' };
                        const typeIcon = TYPE_ICONS[asset.capabilityTarget] ?? '◆';
                        const dateStr = asset.createdAt ? new Date(asset.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                        const label = prompt ? prompt.slice(0, 45) : voiceName ?? `${typeIcon} ${dateStr || asset.assetId.slice(0, 10)}`;
                        const isImage = asset.assetFamily === 'MEDIA' && /\.(jpg|jpeg|png|webp)$/i.test(asset.secureStorageUri);
                        const isVideo = asset.capabilityTarget === 'MOTION' && asset.secureStorageUri;
                        return (
                          <div key={asset.assetId} className="hud-asset-item-chip glassmorphism">
                            {isImage ? (
                              <img src={asset.secureStorageUri} alt={label} className="hud-item-thumbnail" />
                            ) : isVideo ? (
                              // eslint-disable-next-line jsx-a11y/media-has-caption
                              <video src={asset.secureStorageUri} className="hud-item-thumbnail" preload="metadata" muted playsInline />
                            ) : (
                              <div className="hud-item-graphic" style={{ fontSize: '28px' }}>{typeIcon}</div>
                            )}
                            <span className="hud-item-name">{label}</span>
                            <button className="hud-inject-btn" onClick={() => handleInjectAsset(asset)}>⚡ حقن</button>
                          </div>
                        );
                      })}
                    </div>
                  </main>
                </div>
              )
            )}

            {hudActiveTab === 'create' && (
              <div className="hud-create-tab-scroll custom-scroll">
                <div className="hud-upload-row">
                  <input ref={uploadFileInputRef} type="file" id="ras-amr-media-upload" className="hud-upload-input" disabled={isUploadingAsset} onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleUploadAsset(file); }} />
                  <label htmlFor="ras-amr-media-upload" className="action-trigger-btn hud-upload-label">{isUploadingAsset ? '⏳ الرفع إلى الخزانة جارٍ…' : '⬆ رفع ملف حقيقي من الجهاز إلى الخزانة'}</label>
                  {uploadError && <p className="spatial-current-state narrative-integrity-violation">{uploadError}</p>}
                </div>
                <div className="hud-voice-upload-row">
                  <label className="hud-voice-checkbox-label">
                    <input type="checkbox" checked={isVoiceUpload} onChange={(e) => setIsVoiceUpload(e.target.checked)} disabled={isUploadingAsset} />
                    هذا الملف صوت (Voice)
                  </label>
                  {isVoiceUpload && (<input type="text" className="hud-voice-name-input" placeholder="اسم هوية الصوت (اختياري)" value={voiceDisplayNameInput} onChange={(e) => setVoiceDisplayNameInput(e.target.value)} disabled={isUploadingAsset} />)}
                </div>
                <div className="hud-tts-row">
                  <div style={{ position: 'relative', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <textarea className="hud-tts-text-input" style={{ flex: 1 }} placeholder="اكتب نصًا لتحويله إلى كلام حقيقي، أو انقر 🎤 للتحدث..." value={ttsText} onChange={(e) => setTtsText(e.target.value)} disabled={isGeneratingSpeech} rows={2} />
                    {voiceMode.isSupported && (
                      <button
                        className={`voice-to-text-btn${voiceMode.isListening ? ' voice-listening' : ''}`}
                        onClick={voiceMode.startListening}
                        disabled={voiceMode.isListening || isGeneratingSpeech}
                        title={voiceMode.hasPermission === false ? 'إذن الميكروفون مرفوض' : voiceMode.isListening ? 'جارٍ الاستماع…' : 'انقر للإملاء بالعربية'}
                        aria-label={voiceMode.isListening ? 'جارٍ الاستماع' : 'إملاء بالصوت'}
                      >
                        {voiceMode.isListening ? '🔴' : '🎤'}
                      </button>
                    )}
                  </div>
                  <div className="hud-tts-controls">
                    <select className="hud-tts-voice-select" value={ttsPresetVoiceId} onChange={(e) => setTtsPresetVoiceId(e.target.value)} disabled={isGeneratingSpeech} aria-label="الصوت الجاهز">
                      {ELEVENLABS_PRESET_VOICES.map((voice) => (<option key={voice.id} value={voice.id}>{voice.label}</option>))}
                    </select>
                    <input type="text" className="hud-voice-name-input" placeholder="اسم هوية الصوت الناتج (اختياري)" value={ttsDisplayNameInput} onChange={(e) => setTtsDisplayNameInput(e.target.value)} disabled={isGeneratingSpeech} />
                    <button className="action-trigger-btn" onClick={handleGenerateSpeech} disabled={isGeneratingSpeech || !ttsText.trim()}>{isGeneratingSpeech ? '⏳ الصوت يُولَّد…' : '🗣 توليد كلام حقيقي'}</button>
                  </div>
                  {ttsError && <p className="spatial-current-state narrative-integrity-violation">{ttsError}</p>}
                </div>
                {audioVoiceAssets.length > 0 && (
                  <div className="hud-tts-row">
                    <select className="hud-tts-voice-select" value={cloneSourceVoiceId} onChange={(e) => setCloneSourceVoiceId(e.target.value)} disabled={isVoiceCloning} aria-label="الصوت المرجعي للاستنساخ">
                      <option value="">اختر صوتاً مرجعياً للاستنساخ…</option>
                      {audioVoiceAssets.map((voice) => (<option key={voice.assetId} value={voice.assetId}>{String(voice.metadata.voiceDisplayName ?? voice.assetId)}</option>))}
                    </select>
                    <div className="hud-tts-controls">
                      <input type="text" className="hud-voice-name-input" placeholder="اسم الهوية المستنسَخة (اختياري)" value={cloneVoiceNameInput} onChange={(e) => setCloneVoiceNameInput(e.target.value)} disabled={isVoiceCloning} />
                      <label className="hud-consent-label" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isVoiceCloning ? 0.5 : 1 }}>
                        <input type="checkbox" checked={cloneConsentConfirmed} onChange={(e) => setCloneConsentConfirmed(e.target.checked)} disabled={isVoiceCloning} />
                        أؤكد أن لديّ إذناً بإنشاء هوية صوتية من هذا التسجيل
                      </label>
                      <button className="action-trigger-btn" onClick={handleCloneVoice} disabled={isVoiceCloning || !cloneSourceVoiceId || !cloneConsentConfirmed}>{isVoiceCloning ? '⏳ الاستنساخ جارٍ…' : '🔮 استنسخ صوتاً حقيقياً'}</button>
                    </div>
                    {voiceCloneError && <p className="spatial-current-state narrative-integrity-violation">{voiceCloneError}</p>}
                  </div>
                )}
                {clonedVoiceIdentities.length > 0 && (
                  <div className="hud-tts-row">
                    <select className="hud-tts-voice-select" value={clonedVoiceSynthTarget} onChange={(e) => setClonedVoiceSynthTarget(e.target.value)} disabled={isGeneratingClonedSpeech} aria-label="الهوية الصوتية المستنسَخة">
                      <option value="">اختر هوية صوتية مستنسَخة…</option>
                      {clonedVoiceIdentities.map((v) => (<option key={v.assetId} value={v.assetId}>{String(v.metadata.voiceDisplayName ?? v.assetId)} — هوية مستنسَخة</option>))}
                    </select>
                    <div className="hud-tts-controls">
                      <textarea className="hud-tts-text-input" placeholder="النص الجديد المراد توليده بالصوت المستنسَخ…" value={clonedVoiceSynthText} onChange={(e) => setClonedVoiceSynthText(e.target.value)} disabled={isGeneratingClonedSpeech} rows={2} />
                      <button className="action-trigger-btn" onClick={handleGenerateClonedSpeech} disabled={isGeneratingClonedSpeech || !clonedVoiceSynthTarget || !clonedVoiceSynthText.trim()}>{isGeneratingClonedSpeech ? '⏳ الكلام يُولَّد…' : '🗣 توليد كلام بالهوية المستنسَخة'}</button>
                    </div>
                    {clonedSpeechError && <p className="spatial-current-state narrative-integrity-violation">{clonedSpeechError}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </main>
    </RasAmrExperience>
  );
}