/**
 * AZMA OS — Ras Al-Amr: The Automatic Director
 *
 * Per the Chief Architect's Minimum Construction directive (2026-07-26):
 * the Automatic Director is NOT a content generator — it creates no
 * images, video, or audio. Its one real constitutional artifact is the
 * Cinematic Direction Decision: asset selection/rejection, narrative
 * sequencing, scene timing, rhythm, transition strategy, audio/music
 * placement, narrative continuity, and final cinematic structure.
 * Execution engines (RasAlAmrStateManager) execute this decision — this
 * module only decides. It never mutates a canvas and never generates
 * media itself.
 *
 * SCOPE, DISCLOSED: `decideCinematicDirection` itself still judges one
 * Vault asset at a time — that per-asset judgment is a real, complete
 * unit of work on its own (see the Real Spatial/Visual/Temporal
 * Adjustment Packages). Narrative sequencing ACROSS multiple assets is
 * now handled by `decideMultiNodeCinematicDirection` below (Package
 * XIII), which composes per-asset decisions rather than replacing them.
 * `rhythm` honestly echoes the Creator's own stated `pacingPreference`
 * (Package XV) when one genuinely exists, and stays `null` otherwise.
 * `transitionStrategy` (Package XVI) echoes the Creator's own stated
 * `transitionPreference` the same way — a genuinely distinct source, never
 * derived from pacing (see RHYTHM_TRANSITION_TIMING_BASIS,
 * automatic-director-constitution.ts). Fabricating either from the other,
 * or from duration data alone, would repeat the exact "fake precision"
 * mistake this platform has already declined twice (Hujjah's orphaned
 * confidence/verdict engines; Ras Al-Amr's own pixel-grade/chroma-
 * forge/optical-flow).
 *
 * UPDATE — NARRATIVE CANVAS FOUNDATION: the canvas itself can now hold
 * multiple nodes (see ras-al-amr-state-manager.ts). `decideCinematicDirection`
 * itself remains deliberately per-asset (see Package XIII below for how
 * multiple nodes are actually reasoned across).
 *
 * UPDATE — PACKAGE VI, THE CINEMATIC JUDGMENT CONSTITUTION
 * (automatic-director-constitution.ts): `temporalBasis` now shares its
 * type (`EvidenceBasis`) with that file's own Constitutional Humility
 * principle (Article X) instead of declaring a private union — the same
 * "real evidence vs. honest fallback" vocabulary is now available to any
 * future decision facet, not just this one.
 *
 * UPDATE — PACKAGE VII, CREATOR GOAL INTEGRATION: the Decision now
 * carries `creatorGoal` (the asset's own real `generationPrompt`,
 * verbatim — see automatic-director-constitution.ts's own header for
 * exactly why this, not the downstream Makman GoalContract, is the real
 * signal used) and `primaryConsideration` (a genuine call into
 * PRIORITY_HIERARCHY via determinePrimaryConsideration, ending that
 * hierarchy's reference-only status).
 *
 * UPDATE — PACKAGE IX, FORMAL GOAL CONTRACT TRIAD CLOSURE:
 * decideCinematicDirection() now accepts an optional, already-fetched
 * `formalGoal`. Purity is preserved deliberately — this function still
 * makes no network call itself; the caller (app/ras-amr/page.tsx) is
 * responsible for genuinely fetching a GoalContract (via GET /api/
 * sovereign/entry/creator-goal/[goalId]) and passing the result in. When
 * supplied, it takes precedence over prompt-echo (the richer, now-honest
 * source per automatic-director-constitution.ts's own closure); when
 * absent, prompt-echo remains the truthful fallback — never both blended
 * into one fabricated value.
 *
 * UPDATE — PACKAGE XI, COMMERCIAL INTENT DURABLE STORAGE: `formalGoal`
 * may now genuinely carry a `commercialIntent` (see goal-contracts.ts) —
 * this function's own signature needed no change, since
 * `deriveCreatorGoalFromFormalContract` already accepts the full
 * `GoalContract` and now echoes a scoped view of it when present.
 *
 * UPDATE — PACKAGE XII, FULL MAKMAN COMMERCIAL INTENT READ DECISION:
 * `formalGoal`'s type is now `FormalGoalContractView` (automatic-director-
 * constitution.ts) instead of the full `GoalContract` — this function
 * never read anything beyond description/title/priority/commercialIntent
 * from it, so the parameter type now honestly states what it uses, and
 * matches what the GET /api/sovereign/entry/creator-goal/[goalId] route
 * itself now actually sends over the wire (see that route's own header).
 * A full `GoalContract` still structurally satisfies this narrower type,
 * so no in-process caller (e.g. tests passing a complete fixture) breaks.
 *
 * UPDATE — PACKAGE XIII, MULTI-NODE CINEMATIC DIRECTION:
 * `decideCinematicDirection` now accepts an optional `orderIndex`
 * (defaulting to `0`, preserving every existing call site's behavior
 * unchanged) so a caller reasoning across a real, ordered set of nodes
 * can supply each node's genuine array position — real, already-evidenced
 * data, never fabricated. The new `decideMultiNodeCinematicDirection`
 * composes this function across a whole node set, reusing
 * `validateNarrativeIntegrity` (Article III/IV, already cross-node-
 * capable) and the new `determinePrimaryNode` (automatic-director-
 * constitution.ts) — no new rendering, rhythm, or transition logic; no
 * duplicate canvas or orchestration layer. Both functions stay pure.
 *
 * UPDATE — PACKAGE XIV, TIMING SIGNAL FOUNDATION: Package XIII fixed
 * `executionOrderIndex` but left `temporal.globalStartTimeSeconds`
 * hardcoded to `0` for every node — meaning a real multi-node composition
 * would have every node claiming to start at the same instant. The one
 * genuinely real timing signal available anywhere in the platform (see
 * this file's own investigation, recorded in
 * `RHYTHM_TRANSITION_TIMING_BASIS`) is each node's own real (or honestly
 * defaulted) `playDurationSeconds` — from this, `startTimeSeconds`
 * (new, optional, defaults to `0`) lets a caller supply the real
 * cumulative sum of every preceding node's own decided duration, so
 * sequential nodes genuinely no longer overlap. This is arithmetic over
 * already-real data — the same kind of end-time math
 * pre-publishing-boundary.ts already performs on applied canvas state —
 * not a new timing signal invented from nothing. `rhythm` and
 * `transitionStrategy` remain honestly `null`: a real clock is not the
 * same as a real cinematic pace or cut-type judgment, and no signal for
 * either exists yet — see Package XV below for how `rhythm` specifically
 * was later resolved.
 *
 * UPDATE — PACKAGE XV, CREATOR PACING PREFERENCE FOUNDATION: `rhythm`'s
 * type widened from the literal `null` to `PacingPreference | null` — it
 * now equals `creatorGoal.pacingPreference` verbatim (a real, durably-
 * stored, Creator-chosen value — see goal-contracts.ts) when the fetched
 * formal Goal genuinely carries one, and stays `null` otherwise, exactly
 * as before. `transitionStrategy` remained `null` unconditionally at the
 * time — see Package XVI below for its own, later, independent
 * resolution.
 *
 * UPDATE — PACKAGE XVI, CREATOR TRANSITION PREFERENCE FOUNDATION:
 * `transitionStrategy`'s type widened from the literal `null` to
 * `TransitionPreference | null` — the same echo-verbatim treatment
 * `rhythm` received in Package XV, applied to a genuinely distinct,
 * independent Creator-chosen field (`creatorGoal.transitionPreference`).
 * Never derived from `pacingPreference` — a Creator may state either,
 * both, or neither.
 *
 * UPDATE — PACKAGE XVII, REAL AUDIO / BEAT ANALYSIS SIGNAL FOUNDATION:
 * investigated whether a genuinely different signal source — real
 * audio-content analysis (beat/tempo/waveform), independent of Creator
 * preference — exists anywhere in the platform. It does not (see
 * `AUDIO_BEAT_ANALYSIS_BASIS`, automatic-director-constitution.ts): no
 * audio/DSP dependency, no decode/analyze code path, Vault assets store
 * only a URI and a duration, never audio bytes. This function's own
 * `rhythm`/`transitionStrategy` computation is UNCHANGED by this
 * package — they still, and only, echo real Creator preference exactly
 * as Packages XV/XVI left them.
 */

import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import type { VaultAsset } from '../../vault/sovereign-vault-types';
import type { TemporalDirective } from './assembly-contracts';
import type { StructuralLogicDirective, AudioMixingDirective } from './assembly-directive-payloads';
import type {
  EvidenceBasis,
  CreatorGoalInput,
  PriorityConsideration,
  FormalGoalContractView,
  NarrativeIntegrityResult,
} from './automatic-director-constitution';
import type { PacingPreference, TransitionPreference } from '../../sovereign-entry';
import {
  deriveCreatorGoalFromPrompt,
  deriveCreatorGoalFromFormalContract,
  determinePrimaryConsideration,
  validateNarrativeIntegrity,
  determinePrimaryNode,
} from './automatic-director-constitution';

const FALLBACK_DURATION_SECONDS = 5;

export interface CinematicDirectionDecision {
  /** Asset selection/rejection — a real structural check, never creative judgment. */
  readonly included: boolean;
  readonly rejectionReason?: string;

  /**
   * Scene timing — grounded in the asset's own real duration metadata
   * when available. temporalBasis shares its vocabulary with the
   * Cinematic Judgment Constitution's own EvidenceBasis type (Article
   * X, Constitutional Humility) rather than declaring a second one.
   */
  readonly temporal?: TemporalDirective;
  readonly temporalBasis: EvidenceBasis;

  /**
   * Narrative sequencing — the asset's real position when a caller
   * genuinely knows one (Package XIII's `orderIndex`, e.g. a node's real
   * array position within its track); defaults to the first position (0)
   * when no order is supplied, which remains accurate for a genuinely
   * single-node canvas.
   */
  readonly structural?: StructuralLogicDirective;

  /** Audio/music placement — decided only for an asset that actually originated from the AUDIO capability. */
  readonly audio?: AudioMixingDirective;

  /**
   * Rhythm (Package XV) is the Creator's own stated `pacingPreference`,
   * echoed verbatim — real, never scored or inferred — when one was
   * genuinely declared; honestly `null` otherwise. transitionStrategy
   * (Package XVI) is the Creator's own stated `transitionPreference`, the
   * same echo-verbatim treatment applied to a genuinely distinct,
   * independent field — never derived from rhythm/pacing. See this
   * module's own header and RHYTHM_TRANSITION_TIMING_BASIS
   * (automatic-director-constitution.ts).
   */
  readonly rhythm: PacingPreference | null;
  readonly transitionStrategy: TransitionPreference | null;
  readonly narrativeContinuity: 'not-applicable-single-node';

  readonly singleNodeScope: true;

  /** Package VII — the real Creator Goal signal for this asset, echoed verbatim, never interpreted. */
  readonly creatorGoal: CreatorGoalInput;
  /** Package VII — which Article IX hierarchy tier actually drove this decision; the real first caller for PRIORITY_HIERARCHY. */
  readonly primaryConsideration: PriorityConsideration;
}

/**
 * Decides the Cinematic Direction for one real Vault asset. Pure and
 * deterministic — no side effects, no randomness, no network access.
 * The caller (today: a Creator's own "Apply" action; never this
 * function itself) is responsible for feeding the result into
 * RasAlAmrStateManager.applyMutation() — and, per Package IX, for
 * genuinely fetching `formalGoal` beforehand if one is to be used.
 *
 * Package XIII: `orderIndex` is optional and defaults to `0` — supply the
 * asset's real position within its track (e.g. from
 * `decideMultiNodeCinematicDirection` below) when reasoning across more
 * than one node; omit it for a genuinely single-node canvas, where `0`
 * remains the honest, real position.
 *
 * Package XIV: `startTimeSeconds` is optional and defaults to `0` —
 * supply the real cumulative sum of every preceding node's own decided
 * `playDurationSeconds` (e.g. from `decideMultiNodeCinematicDirection`
 * below) so sequential nodes on one timeline genuinely do not overlap;
 * omit it for a genuinely single-node canvas, where `0` remains the
 * honest, real start time.
 */
export function decideCinematicDirection(
  asset: VaultAsset,
  formalGoal?: FormalGoalContractView,
  orderIndex: number = 0,
  startTimeSeconds: number = 0,
): CinematicDirectionDecision {
  const creatorGoal = formalGoal
    ? deriveCreatorGoalFromFormalContract(formalGoal)
    : deriveCreatorGoalFromPrompt(asset.metadata?.generationPrompt);

  if (!asset.assetId || !asset.assetFamily) {
    return {
      included: false,
      rejectionReason: 'Asset is missing the identity or family required to place it on a canvas.',
      temporalBasis: 'fallback-default',
      rhythm: creatorGoal.pacingPreference ?? null,
      transitionStrategy: creatorGoal.transitionPreference ?? null,
      narrativeContinuity: 'not-applicable-single-node',
      singleNodeScope: true,
      creatorGoal,
      primaryConsideration: determinePrimaryConsideration(creatorGoal),
    };
  }

  const durationSeconds = asset.metadata?.durationSeconds;
  const temporal: TemporalDirective = {
    globalStartTimeSeconds: startTimeSeconds,
    playDurationSeconds: durationSeconds ?? FALLBACK_DURATION_SECONDS,
  };

  const structural: StructuralLogicDirective = {
    executionOrderIndex: orderIndex,
  };

  const audio: AudioMixingDirective | undefined =
    asset.capabilityTarget === CapabilityTarget.AUDIO
      ? { volumeDb: 0, panCenter: 0, isMuted: false }
      : undefined;

  return {
    included: true,
    temporal,
    temporalBasis: durationSeconds !== undefined ? 'real-evidence' : 'fallback-default',
    structural,
    audio,
    rhythm: creatorGoal.pacingPreference ?? null,
    transitionStrategy: creatorGoal.transitionPreference ?? null,
    narrativeContinuity: 'not-applicable-single-node',
    singleNodeScope: true,
    creatorGoal,
    primaryConsideration: determinePrimaryConsideration(creatorGoal),
  };
}

/** One real node's own Cinematic Direction Decision, identified by the real ids that produced it. */
export interface NodeCinematicDirection {
  readonly nodeId: string;
  readonly assetId: string;
  readonly decision: CinematicDirectionDecision;
}

/**
 * Package XIII — the real composition judgment across a whole node set.
 * Pure and deterministic: composes `decideCinematicDirection` once per
 * node (passing each node's own real array position as `orderIndex`),
 * then reuses `validateNarrativeIntegrity` (Article III/IV) and
 * `determinePrimaryNode` (Article IX extended) to judge the SET, not just
 * its individual members. No new rendering, rhythm, transition, or
 * sequencing logic — every fact here already existed somewhere in the
 * platform; this function is the smallest honest way to compose them for
 * more than one node at once.
 *
 * `nodes` is supplied in the caller's own real order (e.g. a track's
 * `AssemblyNode[]`, each paired with its already-fetched `VaultAsset` and,
 * where genuinely available, an already-fetched `formalGoal`) — this
 * function makes no network call and does not reorder its input; the
 * array's own order IS the real evidence used for `orderIndex`.
 *
 * Package XIV: also threads a real, running `startTimeSeconds` through
 * the set — node 0 starts at `0`; every later node starts at the sum of
 * every earlier node's own decided `playDurationSeconds`. A rejected node
 * (no `temporal`) contributes no duration, since it occupies no real time
 * on the timeline. This is the smallest honest way to make sequential
 * nodes stop all claiming to start at the same instant.
 */
export interface MultiNodeCinematicDirectionResult {
  readonly nodeDecisions: readonly NodeCinematicDirection[];
  readonly narrativeIntegrity: NarrativeIntegrityResult;
  /** The one node genuinely representing the Creator's primary stated direction, or `null` when the evidence does not honestly single one out — see determinePrimaryNode. */
  readonly primaryNodeId: string | null;
}

export function decideMultiNodeCinematicDirection(
  nodes: readonly { readonly nodeId: string; readonly asset: VaultAsset; readonly formalGoal?: FormalGoalContractView }[],
): MultiNodeCinematicDirectionResult {
  let cumulativeStartTimeSeconds = 0;
  const nodeDecisions: readonly NodeCinematicDirection[] = nodes.map((node, index) => {
    const decision = decideCinematicDirection(node.asset, node.formalGoal, index, cumulativeStartTimeSeconds);
    if (decision.temporal) {
      cumulativeStartTimeSeconds += decision.temporal.playDurationSeconds;
    }
    return {
      nodeId: node.nodeId,
      assetId: node.asset.assetId,
      decision,
    };
  });

  const narrativeIntegrity = validateNarrativeIntegrity(
    nodeDecisions.map((nodeDecision) => ({
      nodeId: nodeDecision.nodeId,
      assetId: nodeDecision.assetId,
      temporal: nodeDecision.decision.temporal,
    })),
  );

  const primaryNodeId = determinePrimaryNode(
    nodeDecisions.map((nodeDecision) => ({ nodeId: nodeDecision.nodeId, creatorGoal: nodeDecision.decision.creatorGoal })),
  );

  return { nodeDecisions, narrativeIntegrity, primaryNodeId };
}
