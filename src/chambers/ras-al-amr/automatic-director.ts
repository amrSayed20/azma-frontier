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
 * SCOPE, DISCLOSED: the real, live Ras Al-Amr canvas is deliberately
 * single-node today (one active Vault asset per session — see the Real
 * Spatial/Visual/Temporal Adjustment Packages). Narrative sequencing
 * across MULTIPLE assets, real rhythm across a timeline, and genuine
 * shot-to-shot transition strategy therefore have no real destination to
 * apply to yet. Fabricating a multi-asset decision the platform cannot
 * execute would repeat the exact "fake precision" mistake this platform
 * has already declined twice (Hujjah's orphaned confidence/verdict
 * engines; Ras Al-Amr's own pixel-grade/chroma-forge/optical-flow). This
 * first implementation makes real, grounded decisions for the one node
 * the architecture can actually apply today, and is explicit about which
 * facets of the full constitutional spec do not yet have a real
 * destination (`rhythm`/`transitionStrategy` are `null`, not fabricated).
 *
 * UPDATE — NARRATIVE CANVAS FOUNDATION: the canvas itself can now hold
 * multiple nodes (see ras-al-amr-state-manager.ts), but this function's
 * own reasoning is still deliberately per-asset — it has not been
 * extended to reason across multiple nodes at once, since that would be
 * real new sequencing intelligence, out of scope for that package.
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
 */

import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import type { VaultAsset } from '../../vault/sovereign-vault-types';
import type { TemporalDirective } from './assembly-contracts';
import type { StructuralLogicDirective, AudioMixingDirective } from './assembly-directive-payloads';
import type { EvidenceBasis, CreatorGoalInput, PriorityConsideration, FormalGoalContractView } from './automatic-director-constitution';
import { deriveCreatorGoalFromPrompt, deriveCreatorGoalFromFormalContract, determinePrimaryConsideration } from './automatic-director-constitution';

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

  /** Narrative sequencing — real within today's single-node scope (always the first position). */
  readonly structural?: StructuralLogicDirective;

  /** Audio/music placement — decided only for an asset that actually originated from the AUDIO capability. */
  readonly audio?: AudioMixingDirective;

  /**
   * Rhythm and transition strategy require more than one node to mean
   * anything real. Honestly undecided rather than fabricated — see this
   * module's own header.
   */
  readonly rhythm: null;
  readonly transitionStrategy: null;
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
 */
export function decideCinematicDirection(asset: VaultAsset, formalGoal?: FormalGoalContractView): CinematicDirectionDecision {
  const creatorGoal = formalGoal
    ? deriveCreatorGoalFromFormalContract(formalGoal)
    : deriveCreatorGoalFromPrompt(asset.metadata?.generationPrompt);

  if (!asset.assetId || !asset.assetFamily) {
    return {
      included: false,
      rejectionReason: 'Asset is missing the identity or family required to place it on a canvas.',
      temporalBasis: 'fallback-default',
      rhythm: null,
      transitionStrategy: null,
      narrativeContinuity: 'not-applicable-single-node',
      singleNodeScope: true,
      creatorGoal,
      primaryConsideration: determinePrimaryConsideration(creatorGoal),
    };
  }

  const durationSeconds = asset.metadata?.durationSeconds;
  const temporal: TemporalDirective = {
    globalStartTimeSeconds: 0,
    playDurationSeconds: durationSeconds ?? FALLBACK_DURATION_SECONDS,
  };

  const structural: StructuralLogicDirective = {
    executionOrderIndex: 0,
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
    rhythm: null,
    transitionStrategy: null,
    narrativeContinuity: 'not-applicable-single-node',
    singleNodeScope: true,
    creatorGoal,
    primaryConsideration: determinePrimaryConsideration(creatorGoal),
  };
}
