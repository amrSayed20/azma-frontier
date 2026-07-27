/**
 * AZMA OS — Ras Al-Amr: The Automatic Director's Cinematic Judgment
 * Constitution
 *
 * Per "RAS AL AMR CONSTITUTION — THE AUTOMATIC DIRECTOR — Constitutional
 * Charter, Version I" (2026-07-27, ratified) and Package VI's
 * authorization to build "the smallest possible constitutional layer
 * that defines how the Automatic Director judges, prioritizes, and
 * resolves cinematic decisions." This file is that layer: judgment
 * rules, not execution behavior. It follows the same declarative
 * CONSTITUTIONAL_CONTRACT pattern already established for IXE/IAE/IME
 * (purpose/responsibilities/non-responsibilities as real, typed,
 * exported data) rather than inventing a new documentation convention.
 *
 * WHAT IS AND ISN'T A LIVE RUNTIME CALLER HERE, DISCLOSED HONESTLY:
 * PRIORITY_HIERARCHY and AUTOMATIC_DIRECTOR_SUBORDINATION are reference
 * data — real, typed — exactly like IAE/IME's own certified contracts.
 * AUTOMATIC_DIRECTOR_SUBORDINATION remains uncalled by design (it is a
 * boundary statement, not logic). PRIORITY_HIERARCHY now has a genuine
 * first caller (see determinePrimaryConsideration below, Package VII).
 *
 * PACKAGE VII — CREATOR GOAL INTEGRATION (2026-07-27): "Where does the
 * real Creator Goal come from?" Investigated, not assumed. The
 * platform's one FORMAL, ratified Goal contract is Makman Al-Ghayah's
 * `GoalContract` (goal-contracts.ts) — created via
 * `createGoalFromCompiledAssembly(compiledGraph, description, priority)`
 * inside `runFirstCustomerJourney`, reached only through the real
 * `POST /api/sovereign/entry/creator-goal` route. That Goal is
 * structurally DOWNSTREAM of compilation (it is created FROM an
 * already-compiled graph, for distribution) and its backing
 * `MakmanGoalRuntime` is documented as single-use ("a Core instance
 * serves exactly one Goal's full lifecycle") — there is no honest,
 * already-existing way to query it back into Ras Al-Amr's own directing
 * process without building new read infrastructure, which this
 * package's own prohibitions decline to do.
 *
 * The real, smallest, already-flowing signal instead used here is
 * `VaultAssetMetadata.generationPrompt` — the Creator's own recorded
 * instruction for a specific asset, already fetched by `app/ras-amr/
 * page.tsx` and already passed into `decideCinematicDirection(asset)`
 * today. No new fetch, no new contract, no new registry — the same
 * `VaultAsset` the Director already receives. This is disclosed as a
 * narrower, honest proxy for "Creator Goal" (one asset's stated intent,
 * not a project-wide GoalContract's title/priority/commercialIntent),
 * not a claim that the formal Makman Goal system has been wired in.
 *
 * PACKAGE VIII — HONEST CREATOR GOAL SOURCE INTEGRATION (2026-07-27):
 * re-investigated, more deeply, whether a real GoalContract read path
 * exists — not just whether SOEL happens to expose one today, but
 * whether it honestly *could*, per this package's own instruction to
 * "determine whether a real read path exists" rather than assume the
 * prior package's conclusion. Findings:
 *
 * 1. `GoalState` (goal-state.ts) DOES have real, working read methods —
 *    `getGoal(goalId)` and `getGoals()` — genuinely implemented, not
 *    stubs. So a read *capability* exists inside Makman's own chamber.
 * 2. But `SovereignOperationalEntryLayer` (soel.ts) — the one
 *    constitutionally sanctioned boundary anything outside Makman may
 *    call ("SOEL is the ONLY module outside Makman Al-Ghayah's own
 *    chamber that imports its Runtime/Bridge/Consumption constructs
 *    directly") — forwards exactly three capabilities
 *    (submitCreatorGoal/requestConsumption/compileCanvasForPublishing)
 *    and none of them read a Goal back. Importing `GoalState` directly
 *    from Ras Al-Amr would violate that already-ratified boundary.
 * 3. Even setting the boundary aside: `GoalContract` (goal-contracts.ts)
 *    carries NO tenant/subscriber identity field at all — `getGoals()`
 *    would return every Creator's Goals indistinguishably. Exposing it
 *    as-is would be a real cross-tenant data leak, not a safe read path.
 * 4. Even setting THAT aside: `goalId` is generated fresh and random by
 *    `createGoalFromCompiledAssembly()` (`generateGoalId()`) — nothing
 *    is ever written back onto the originating `VaultAsset` or
 *    `SovereignCanvas`, so the Director has no honest way to know
 *    *which* goalId, if any, belongs to whatever it is currently
 *    directing, even if a safe, boundary-respecting read method existed.
 *
 * CONCLUSION (Success Criterion B, at the time): no honest read path
 * existed — not for lack of a `getGoal` method, but for lack of (a) a
 * boundary-respecting forward of it, (b) tenant isolation on the
 * contract itself, and (c) any linkage from a directing session back to
 * a goalId.
 *
 * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE (2026-07-27): all
 * three gaps closed together, as one indivisible unit, per the Chief
 * Architect's own ruling that "no single gap may be solved in
 * isolation":
 * 1. `GoalContract` (goal-contracts.ts) now carries a real
 *    `subscriberTenantId`, sourced from the already-verified compiled
 *    graph it was created from — no bulk read can mix tenants anymore.
 * 2. `SovereignOperationalEntryLayer.getCreatorGoal(goalId, tenantId)`
 *    (soel.ts) is the real, sanctioned, tenant-checked forward — the
 *    boundary gap is closed. A new `GET /api/sovereign/entry/
 *    creator-goal/[goalId]` route is the Public API Surface for it.
 * 3. `SovereignVaultManager.linkGoalToAsset()` writes the new Goal's id
 *    back onto every real Vault asset the compiled graph referenced,
 *    at Goal-creation time (`app/api/sovereign/entry/creator-goal/
 *    route.ts`'s own POST handler) — the linkage gap is closed. A Goal
 *    created without a fully successful linkage is reported as a failed
 *    request, never a silent partial success.
 *
 * `FORMAL_GOAL_CONTRACT_READ_PATH.available` is now `true` — recorded as
 * real, tested data, not prose alone, exactly as Package VIII's own
 * record predicted it would be the day all three closed together.
 *
 * PACKAGE X — CREATOR GOAL INPUT EXPANSION (2026-07-27): "Which fields
 * are genuinely available from the formal GoalContract?" Investigated
 * before extending anything. `GoalContract` (goal-contracts.ts) really
 * does carry `title` and `priority` — both now added to `CreatorGoalInput`
 * honestly, populated only when `source === 'formal-goal-contract'`.
 *
 * `commercialIntent` was NOT genuinely available at Package X's own time
 * of writing, for the reason recorded there: `MakmanCommercialIntent`
 * was a one-time argument to `submitCreatorGoal()`'s request, never
 * stored onto `GoalContract`, never held in `GoalState`. See Package XI
 * below for the resolution.
 *
 * PACKAGE XI — COMMERCIAL INTENT DURABLE STORAGE (2026-07-27): the prior
 * package's own finding was a storage question, not a field-naming
 * question — re-investigated on that basis, per this package's own
 * framing ("not a field expansion question. It is a constitutional
 * storage question"). Finding: `GoalState` (goal-state.ts) is an
 * in-memory `Map<string, GoalContract>`, and `MakmanGoalRuntime.
 * handoverGoal()`/`commitGoal()` (the only two writers) store/replace
 * the whole `GoalContract` object by reference — meaning ANY field
 * present on the object at creation time survives for exactly as long as
 * the Goal itself does, with zero additional wiring. This is the same
 * durability standard every other `GoalContract` field already relies on
 * (none of them are SQL-backed either) — no new or different storage
 * mechanism was invented for this one field alone.
 *
 * `GoalContract.commercialIntent` (goal-contracts.ts) now carries the
 * real `MakmanCommercialIntent`, populated at creation time by
 * `createGoalFromCompiledAssembly()` from its own already-required
 * caller-supplied parameter (`MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE.ts`'s
 * own `request.commercialIntent`, previously discarded after the
 * distribution bridge call — nothing new is fetched or invented, an
 * already-flowing value is simply also kept). It now survives the same
 * `GoalState` round-trip Package IX already proved for every other field.
 *
 * `CreatorGoalInput.commercialIntent` below exposes a NARROWER, scoped
 * view (`{ accessPolicy, coverArtUri? }`) rather than echoing the full
 * `MakmanCommercialIntent` — the full object also carries a redundant
 * second copy of `compiledAssemblyGraph`, which the Director has no use
 * for and which `GoalContract` itself already stores durably for anyone
 * who genuinely needs it. Storing the full intent (honesty/completeness
 * of the durable record) and exposing a scoped view to the Director
 * (relevance, no duplicate data) are two separate, independently
 * justified decisions. Present only when `source === 'formal-goal-
 * contract'` AND the fetched Goal genuinely carries a commercialIntent —
 * never inferred, never defaulted, honestly `undefined` otherwise.
 *
 * PACKAGE XII — FULL MAKMAN COMMERCIAL INTENT READ DECISION (2026-07-27):
 * durability (Package XI) was re-examined as a SEPARATE question from
 * entitlement — "a durable record is not the same as a public record."
 * A real, repo-wide search for any consumer that reads
 * `MakmanCommercialIntent.publisherTenantId` or `.compiledAssemblyGraph`
 * back OFF a stored/fetched `GoalContract` (as opposed to receiving a
 * fresh `MakmanCommercialIntent` directly as a same-call parameter, a
 * different and already-satisfied path) found NONE:
 * - `MakmanGoalDistributionBridge.bridgeToDestination()` already receives
 *   the full intent as its own direct parameter, never re-reads it off a
 *   Goal.
 * - `PublicConsumptionBoundary`/`SovereignAccessPolicyEngine` read
 *   `accessPolicy`/`publisherTenantId` off `SovereignPublication` (a
 *   different object the Bridge already builds), never off `GoalContract`.
 * - The one real Goal-reading caller, `SOEL.getCreatorGoal()`, has exactly
 *   one caller in turn — this Chamber's own GET route — and this Chamber
 *   only ever wanted the scoped view already built in Package XI.
 *
 * SUCCESS CRITERION B: no further consumer is constitutionally entitled to
 * the full `MakmanCommercialIntent`. Recorded as real, tested data — see
 * `FULL_COMMERCIAL_INTENT_READ_DECISION` below — not prose alone.
 *
 * The one real gap this investigation exposed: the GET route itself was
 * ALREADY serializing the full `commercialIntent` (including
 * `publisherTenantId`/`compiledAssemblyGraph`) over the network to the
 * browser, even though nothing ever read those two fields after receipt —
 * durability had quietly become default network exposure. Fixed at the
 * route itself (see its own header) by narrowing the response to the same
 * scoped view Package XI already uses, making the scoped view the actual
 * SOLE access path end-to-end, not merely the sole path this file's own
 * functions chose to read from.
 *
 * PACKAGE XIII — MULTI-NODE CINEMATIC DIRECTION (2026-07-27): the
 * Narrative Canvas has been able to hold multiple real nodes since the
 * Narrative Canvas Foundation package; this file's own judgment layer had
 * not been extended to reason across them. `determinePrimaryNode` below
 * is the one new judgment rule this package adds — it identifies which
 * node, among several, represents the Creator's primary stated direction,
 * reusing the exact same per-node `creatorGoal.stated` evidence Package
 * VII already established, never a new score. Honestly returns `null`
 * when zero or more than one node has a stated Goal — a real,
 * undismissed ambiguity, not resolved by guessing from array position.
 *
 * Sequencing itself required no new invented signal either: a node's
 * position within its track's own array IS real, already-evidenced order
 * (RasAlAmrStateManager.handleAddNode appends to the end of the array;
 * nothing about that position is fabricated) — `decideCinematicDirection`
 * (automatic-director.ts) now accepts this real index instead of always
 * hardcoding it to 0. Cross-node narrative integrity required no new rule
 * at all: `validateNarrativeIntegrity` (Article III/IV, Package VI) was
 * already cross-node-capable from the day it was built — the new
 * `decideMultiNodeCinematicDirection` (automatic-director.ts) simply
 * reuses it directly on the assembled per-node decisions, rather than
 * requiring every caller to remember to invoke it separately.
 *
 * No rhythm, transition, or rendering logic was added — those remain
 * honestly `null` on every per-node decision, exactly as before.
 *
 * PACKAGE XIV — TIMING SIGNAL FOUNDATION (2026-07-27): investigated
 * whether ANY real musical/cinematic rhythm signal exists anywhere in
 * the platform — BPM, beat, tempo, waveform, scene-cut markers. None do.
 * `VaultAsset.metadata` carries exactly one real timing field:
 * `durationSeconds`. The one honest timing foundation buildable from it:
 * a node's real sequential start time is the sum of every earlier node's
 * own real (or honestly defaulted) duration — arithmetic over already-
 * real data, the same kind of end-time math `pre-publishing-boundary.ts`
 * already performs on applied canvas state, not a new invented signal.
 * `decideCinematicDirection`'s new `startTimeSeconds` parameter
 * (automatic-director.ts) carries this; `decideMultiNodeCinematicDirection`
 * threads it through as a real running sum.
 *
 * `rhythm` and `transitionStrategy` remain honestly `null` — recorded as
 * real, tested data below (`RHYTHM_TRANSITION_TIMING_BASIS`), not prose
 * alone: knowing WHEN a shot starts and ends is not the same as knowing
 * what PACE or CUT TYPE should govern it, and no signal for either exists
 * yet. Success Criterion B for those two fields specifically; Success
 * Criterion A for the sequential timing foundation itself.
 *
 * PACKAGE XV — CREATOR PACING PREFERENCE FOUNDATION (2026-07-27): the
 * real pacing source Package XIV found absent now exists — a genuinely
 * optional, Creator-chosen `PacingPreference` (CONTEMPLATIVE/BALANCED/
 * ENERGETIC — never a BPM/beat value) durably carried on `GoalContract`
 * (see goal-contracts.ts's own account) via the exact same GoalState
 * object-identity mechanism Package XI already proved for
 * commercialIntent. `FormalGoalContractView` and `CreatorGoalInput` below
 * both gained a `pacingPreference` field, echoed verbatim — never scored,
 * never interpreted — by `deriveCreatorGoalFromFormalContract`.
 *
 * `rhythm` (automatic-director.ts) now honestly reflects this: it equals
 * the Creator's own stated `pacingPreference` when one was genuinely
 * declared, and stays `null` otherwise — never inferred, never defaulted.
 * `transitionStrategy` remained `null` even with pacing known: a pacing
 * preference expresses cinematic ENERGY, not a specific cut TYPE — see
 * Package XVI below for its own, later, independent resolution.
 *
 * PACKAGE XVI — CREATOR TRANSITION PREFERENCE FOUNDATION (2026-07-27): the
 * distinct transition/cut-type source Package XV explicitly declined to
 * derive from pacing now exists — a genuinely optional, Creator-chosen
 * `TransitionPreference` (SOFT/GRADUAL/DECISIVE/DIRECT — the Chief
 * Architect's own four descriptors, never an invented vocabulary, never
 * a "dissolve"/"wipe" executable behavior this platform cannot honestly
 * produce) durably carried on `GoalContract`, same GoalState mechanism as
 * every prior optional field. `FormalGoalContractView` and
 * `CreatorGoalInput` both gained a `transitionPreference` field, echoed
 * verbatim by `deriveCreatorGoalFromFormalContract` — completely
 * independent of `pacingPreference`, never derived from it.
 *
 * `transitionStrategy` (automatic-director.ts) now equals the Creator's
 * own stated `transitionPreference` when genuinely declared, honestly
 * `null` otherwise — the same echo-verbatim treatment `rhythm` already
 * received in Package XV, applied to a genuinely distinct field.
 * `RHYTHM_TRANSITION_TIMING_BASIS` below is updated again to record both
 * fields as available, not just rhythm.
 *
 * PACKAGE XVII — REAL AUDIO / BEAT ANALYSIS SIGNAL FOUNDATION (2026-07-27):
 * a genuinely different question from Packages XV/XVI — not "what does the
 * Creator prefer," but "what is the work itself doing." Investigated
 * definitively whether ANY real audio-content analysis capability exists
 * anywhere in the platform: `package.json` carries zero audio/DSP
 * dependencies (no waveform, beat-detection, or frequency-analysis
 * library of any kind — `openai` is a text/LLM SDK, not an audio
 * analyzer); a repo-wide search for `AudioContext`/`AnalyserNode`/
 * `decodeAudioData`/waveform/spectral/FFT code found none; Vault assets
 * (`sovereign-vault-types.ts`) store only a `secureStorageUri` (a cloud
 * URL) and `durationSeconds` — never the actual audio bytes, and nothing
 * anywhere ever fetches/decodes them. `AudioMixingDirective`
 * (automatic-director.ts) already honestly hardcodes `{volumeDb: 0,
 * panCenter: 0, isMuted: false}` for any AUDIO-capability asset — not
 * derived from analysis, and this package changes nothing about that.
 *
 * CONCLUSION: Success Criterion B. No honest audio/beat signal exists to
 * expose. Recorded as real, tested data — `AUDIO_BEAT_ANALYSIS_BASIS`
 * below — deliberately kept a SEPARATE record from
 * `RHYTHM_TRANSITION_TIMING_BASIS`, since that constant answers a
 * different question (does a real CREATOR PREFERENCE exist) than this
 * one (does real AUDIO EVIDENCE exist) — the Architect's own distinction,
 * not merged into one constant that would blur two different truths.
 * `rhythm`/`transitionStrategy` are UNCHANGED by this package: they still
 * echo Creator preference exactly as Packages XV/XVI left them: this
 * package adds no new consumable signal, only an honest, tested record
 * that none was found.
 */

// Package X: the real GoalPriority, imported via the same SOEL boundary
// automatic-director.ts already uses for GoalContract itself — not a
// duplicate enum. Package XI adds AccessPolicy through the same boundary.
// Package XV adds PacingPreference; Package XVI adds TransitionPreference.
import type { GoalPriority, AccessPolicy, PacingPreference, TransitionPreference } from '../../sovereign-entry';

// ── Constitutional Identity ──────────────────────────────────────────────

export const AUTOMATIC_DIRECTOR_PURPOSE =
  'The Automatic Director exists to transform complexity into clarity by producing the Cinematic ' +
  'Direction Decision — it decides, it never creates, and it never becomes the source of command.';

// ── Subordination — Article VII/II: judgment, never authority ───────────

export const AUTOMATIC_DIRECTOR_SUBORDINATION = [
  'AZMA OS gives the orders; the Automatic Director carries out judgment inside that hierarchy — it never becomes an independent authority.',
  'It owns no generators, no rendering engines, no production engines, and no orchestration layer.',
  'It never executes its own decision — RasAlAmrStateManager (an execution engine) consumes, executes, and renders; the Director only decides.',
  'It never rewrites the Creator\'s intention, invents facts, destroys constitutional history, or replaces the Creator\'s final authority.',
] as const;

// ── Article IX — Constitutional Hierarchy ────────────────────────────────
// Priority order when responsibilities conflict.

export type PriorityConsideration =
  | 'creator-goal'
  | 'constitutional-identity'
  | 'narrative-integrity'
  | 'emotional-continuity'
  | 'cinematic-beauty';

export const PRIORITY_HIERARCHY: readonly PriorityConsideration[] = [
  'creator-goal',
  'constitutional-identity',
  'narrative-integrity',
  'emotional-continuity',
  'cinematic-beauty',
] as const;

/** Resolves which of two competing considerations must prevail, per Article IX's fixed order. Pure, deterministic. */
export function resolvePriorityConflict(a: PriorityConsideration, b: PriorityConsideration): PriorityConsideration {
  return PRIORITY_HIERARCHY.indexOf(a) <= PRIORITY_HIERARCHY.indexOf(b) ? a : b;
}

// ── Package VII — Creator Goal Input ─────────────────────────────────────
// The smallest honest representation of "Creator Goal" available today —
// see the header disclosure for exactly why this, and not the formal
// Makman GoalContract, is what's wired in.

/**
 * Package IX: the formal source is now real. 'formal-goal-contract' is
 * used only via deriveCreatorGoalFromFormalContract below, and only by
 * a caller that has itself genuinely fetched a GoalContract through the
 * sanctioned SOEL/API path — never fabricated by this file.
 */
export type CreatorGoalSource = 'asset-prompt-echo' | 'formal-goal-contract';

export interface CreatorGoalInput {
  /** True only when a real, non-empty Creator-authored instruction was found. Never inferred or guessed. */
  readonly stated: boolean;
  readonly statedIntent?: string;
  /** Package VIII/IX — which source produced this input, so nothing pretends to know more than it does. */
  readonly source: CreatorGoalSource;
  /**
   * Package X — real GoalContract.title, present only when source is
   * 'formal-goal-contract'. Prompt-echo has no equivalent field and
   * leaves this undefined, never a guessed value.
   */
  readonly title?: string;
  /**
   * Package X — real GoalContract.priority, present only when source is
   * 'formal-goal-contract'. Never scored or inferred — echoed exactly as
   * the Creator's own formal Goal declared it.
   */
  readonly priority?: GoalPriority;
  /**
   * Package XI — a scoped view of the real, now-durably-stored
   * GoalContract.commercialIntent (accessPolicy + optional coverArtUri
   * only, never the redundant full compiledAssemblyGraph copy). Present
   * only when source is 'formal-goal-contract' AND the fetched Goal
   * genuinely carries a commercialIntent — never inferred, never
   * defaulted.
   */
  readonly commercialIntent?: {
    readonly accessPolicy: AccessPolicy;
    readonly coverArtUri?: string;
  };
  /**
   * Package XV — the real, now-durably-stored GoalContract.pacingPreference,
   * echoed verbatim. Present only when source is 'formal-goal-contract'
   * AND the fetched Goal genuinely carries one — the Creator may
   * legitimately choose not to state a pacing preference at all, which is
   * an honest absence, never defaulted to a guessed tier.
   */
  readonly pacingPreference?: PacingPreference;
  /**
   * Package XVI — the real, now-durably-stored GoalContract.transitionPreference,
   * echoed verbatim. Independent of pacingPreference — never derived from
   * it. Present only when source is 'formal-goal-contract' AND the
   * fetched Goal genuinely carries one; an honest absence otherwise.
   */
  readonly transitionPreference?: TransitionPreference;
}

/**
 * Package IX closed all three prerequisites together — see this file's
 * header for the full account. Recorded as real, tested data rather
 * than prose alone, exactly as Package VIII's own record predicted.
 * Flip back to `false` only if one of the three closures is ever
 * genuinely reverted — never speculatively.
 */
export const FORMAL_GOAL_CONTRACT_READ_PATH: { readonly available: true; readonly reason: string } = {
  available: true,
  reason:
    'GoalContract now carries subscriberTenantId; SovereignOperationalEntryLayer.getCreatorGoal() is the real, ' +
    'tenant-checked SOEL forward (GET /api/sovereign/entry/creator-goal/[goalId]); and SovereignVaultManager.' +
    'linkGoalToAsset() writes the goalId back onto every real asset a Goal was created from, at creation time. ' +
    'All three closed together, per the Chief Architect\'s own ruling that no single gap may be solved in isolation.',
};

/**
 * Package XII — recorded as real, tested data (Success Criterion B): no
 * further consumer beyond this Chamber's own scoped view is
 * constitutionally entitled to the full MakmanCommercialIntent. `entitled:
 * false` means "no broader read path is justified today" — flip only if a
 * real, named consumer is later found and given its own minimum honest
 * read path, never speculatively.
 */
export const FULL_COMMERCIAL_INTENT_READ_DECISION: {
  readonly entitled: false;
  readonly soleAccessPath: 'scoped-creator-goal-input-view';
  readonly reason: string;
} = {
  entitled: false,
  soleAccessPath: 'scoped-creator-goal-input-view',
  reason:
    'A repo-wide search found no consumer that reads publisherTenantId or compiledAssemblyGraph back off a ' +
    'stored/fetched GoalContract: MakmanGoalDistributionBridge and the Consumption Boundary/Access Policy Engine ' +
    'already receive MakmanCommercialIntent (or the SovereignPublication built from it) as a direct, same-call ' +
    'parameter, never re-read from a Goal; and the one real Goal-reading path (SOEL.getCreatorGoal(), called only ' +
    'by this Chamber\'s own GET route) never needed more than accessPolicy/coverArtUri. The GET route\'s own ' +
    'response is now narrowed to match, so this scoped view is the sole access path end-to-end, not just the ' +
    'sole path this file chooses to read from.',
};

/**
 * Package XIV recorded that neither rhythm nor transitionStrategy had a
 * real signal. Package XV closed the rhythm gap: a real, durable,
 * Creator-chosen `PacingPreference` now exists (goal-contracts.ts) and
 * `rhythm` (automatic-director.ts) echoes it verbatim when genuinely
 * stated. Package XVI closes the transitionStrategy gap the same way,
 * with a genuinely DISTINCT source: `TransitionPreference` (SOFT/
 * GRADUAL/DECISIVE/DIRECT) — never derived from pacing, a Creator may
 * state one, both, neither, or either independently. `rhythmAvailable`/
 * `transitionStrategyAvailable: true` record that both mechanisms are
 * now real, NOT that every Goal has both preferences stated (a Goal with
 * neither still honestly produces `rhythm: null, transitionStrategy:
 * null`, exactly as before either package existed).
 */
export const RHYTHM_TRANSITION_TIMING_BASIS: {
  readonly sequentialTimingAvailable: true;
  readonly rhythmAvailable: true;
  readonly transitionStrategyAvailable: true;
  readonly reason: string;
} = {
  sequentialTimingAvailable: true,
  rhythmAvailable: true,
  transitionStrategyAvailable: true,
  reason:
    'A repo-wide search found no BPM/beat/tempo/waveform/scene-cut-marker data anywhere in the platform. ' +
    'VaultAsset.metadata carries exactly one real timing field, durationSeconds. From it, a real sequential ' +
    'timing basis is now built: each node\'s own real (or honestly-defaulted) duration accumulates into the next ' +
    'node\'s real start time, so sequential nodes stop overlapping at time zero. Package XV added a real, ' +
    'durable, Creator-chosen PacingPreference (CONTEMPLATIVE/BALANCED/ENERGETIC) that rhythm now echoes verbatim ' +
    'when genuinely stated. Package XVI added a second, independent, real, durable, Creator-chosen ' +
    'TransitionPreference (SOFT/GRADUAL/DECISIVE/DIRECT) that transitionStrategy now echoes verbatim when ' +
    'genuinely stated — never derived from pacing, never a fabricated dissolve/wipe/crossfade execution detail ' +
    'this platform cannot honestly produce. Both stay honestly null whenever the Creator did not state the ' +
    'corresponding preference, rather than fabricating either from duration data or from each other.',
};

/**
 * Package XVII — recorded as real, tested data (Success Criterion B): no
 * honest audio-content-derived signal (beat, tempo, waveform, spectral
 * data) exists anywhere in the platform to inform rhythm/transitionStrategy
 * independently of Creator preference. Deliberately a SEPARATE constant
 * from `RHYTHM_TRANSITION_TIMING_BASIS` — that one answers "does a real
 * CREATOR PREFERENCE exist" (yes, since Packages XV/XVI); this one answers
 * a genuinely different question, "does real AUDIO EVIDENCE exist"
 * (no) — merging them would blur two distinct truths the Chief Architect
 * himself distinguished. Flip `available` to `true` only if a real
 * audio-processing capability (a real dependency, a real decode/analyze
 * code path) is later actually built and verified, never speculatively.
 */
export const AUDIO_BEAT_ANALYSIS_BASIS: {
  readonly available: false;
  readonly reason: string;
} = {
  available: false,
  reason:
    'package.json carries zero audio/DSP dependencies (no waveform, beat-detection, or frequency-analysis ' +
    'library of any kind; openai is a text/LLM SDK, not an audio analyzer). A repo-wide search for ' +
    'AudioContext/AnalyserNode/decodeAudioData/waveform/spectral/FFT code found none. Vault assets store only a ' +
    'secureStorageUri (a cloud URL) and durationSeconds — never the actual audio bytes, and nothing anywhere ' +
    'ever fetches or decodes them. AudioMixingDirective already honestly hardcodes ' +
    '{volumeDb: 0, panCenter: 0, isMuted: false} for any AUDIO-capability asset, not derived from analysis. ' +
    'rhythm and transitionStrategy therefore continue to be informed only by real Creator preference ' +
    '(PacingPreference/TransitionPreference, Packages XV/XVI) — never by a fabricated audio-derived value.',
};

/**
 * Derives the real Creator Goal signal from a Vault asset's own
 * metadata.generationPrompt — echoes it verbatim, never interprets,
 * scores, or summarizes it. Pure, deterministic. This remains the
 * truthful fallback whenever no formal GoalContract has been fetched
 * for the asset (no goalId linked yet, or the caller chose not to
 * fetch) — per Requirement 4, prompt-echo stays the active source until
 * a formal Goal is genuinely available for this specific asset.
 */
export function deriveCreatorGoalFromPrompt(generationPrompt: unknown): CreatorGoalInput {
  if (typeof generationPrompt === 'string' && generationPrompt.trim().length > 0) {
    return { stated: true, statedIntent: generationPrompt, source: 'asset-prompt-echo' };
  }
  return { stated: false, source: 'asset-prompt-echo' };
}

/**
 * Package XII — FULL MAKMAN COMMERCIAL INTENT READ DECISION: the exact
 * shape a caller needs to have genuinely fetched before calling
 * `deriveCreatorGoalFromFormalContract`/`decideCinematicDirection` with a
 * formal Goal. Named and exported (rather than left as two duplicate
 * inline object types) so both this file and automatic-director.ts, and
 * the API route that actually produces this shape, share one real
 * definition of "what Ras Al Amr is honestly entitled to read" — not the
 * full internal `GoalContract`/`MakmanCommercialIntent`. Deliberately
 * excludes `publisherTenantId` and `compiledAssemblyGraph`: investigation
 * (Package XII) found no real consumer anywhere in the platform that
 * reads either field back off a stored Goal — see this function's own
 * header below for the full account.
 */
export interface FormalGoalContractView {
  readonly description: string;
  readonly title: string;
  readonly priority: GoalPriority;
  readonly commercialIntent?: {
    readonly accessPolicy: AccessPolicy;
    readonly coverArtUri?: string;
  };
  /** Package XV — the Creator's own, genuinely optional pacing preference. */
  readonly pacingPreference?: PacingPreference;
  /** Package XVI — the Creator's own, genuinely optional transition preference. */
  readonly transitionPreference?: TransitionPreference;
}

/**
 * Derives the Creator Goal signal from a genuinely fetched, tenant-
 * verified GoalContract (Package IX/X/XI). Echoes `description`, `title`,
 * `priority`, and (Package XI) a scoped view of `commercialIntent`
 * verbatim — real GoalContract fields, never interpreted, scored, or
 * merged. `commercialIntent` is only echoed when the fetched Goal
 * genuinely carries one; a Goal created before Package XI's own wiring
 * honestly leaves it `undefined`, never defaulted. Pure — takes the
 * contract as a plain value; fetching it is the caller's responsibility,
 * not this function's.
 *
 * PACKAGE XII: the parameter type is now the named, exported
 * `FormalGoalContractView` — the same scoped shape the GET /api/
 * sovereign/entry/creator-goal/[goalId] route itself now serializes
 * (see that route's own header), not the full internal `GoalContract`.
 * A full `GoalContract` still structurally satisfies this type (it has
 * every field this function reads, and more), so no existing in-process
 * caller breaks — only the type now honestly states what this function
 * actually uses, and what the network boundary actually sends.
 */
export function deriveCreatorGoalFromFormalContract(goal: FormalGoalContractView): CreatorGoalInput {
  return {
    stated: true,
    statedIntent: goal.description,
    source: 'formal-goal-contract',
    title: goal.title,
    priority: goal.priority,
    commercialIntent: goal.commercialIntent
      ? { accessPolicy: goal.commercialIntent.accessPolicy, coverArtUri: goal.commercialIntent.coverArtUri }
      : undefined,
    pacingPreference: goal.pacingPreference,
    transitionPreference: goal.transitionPreference,
  };
}

/**
 * The real first caller for PRIORITY_HIERARCHY: determines which
 * hierarchy tier is actually driving a given decision. When a real
 * stated Goal exists, 'creator-goal' is resolved against
 * 'constitutional-identity' per Article IX's own fixed order (the
 * result is always 'creator-goal', since it ranks first — the call is
 * kept explicit rather than hardcoded so the hierarchy, not this
 * function, remains the single source of truth for the order). Absent a
 * stated Goal, there is nothing real to weigh it against, so the
 * decision honestly reports 'constitutional-identity' — the structural
 * check that already gates every decision — as its primary
 * consideration, rather than fabricating Goal-driven reasoning that
 * never happened.
 */
export function determinePrimaryConsideration(goal: CreatorGoalInput): PriorityConsideration {
  return goal.stated ? resolvePriorityConflict('creator-goal', 'constitutional-identity') : 'constitutional-identity';
}

// ── Package XIII — Article IX extended to multiple nodes ────────────────
// determinePrimaryConsideration (above) answers "which hierarchy tier
// drives ONE node's decision." determinePrimaryNode answers the sibling
// question a real multi-node canvas now raises: "which NODE, among
// several, represents the platform's primary cinematic direction." It
// reuses the exact same real evidence — whether a node's own decision
// carries a genuinely stated Creator Goal — rather than inventing a new
// scoring signal. Array position alone is never used to break a tie: a
// position is where a node sits, not evidence of what the Creator wants.

export interface NodeGoalEvidence {
  readonly nodeId: string;
  readonly creatorGoal: CreatorGoalInput;
}

/**
 * Identifies the one node, among several, that genuinely represents the
 * Creator's stated direction — per Article IX, a stated Creator Goal
 * outranks every other consideration, so a node that has one is the only
 * honest candidate for "primary." Returns the sole such node's id when
 * exactly one node qualifies. Returns `null` — never a guess — when zero
 * nodes carry a stated Goal (nothing real to prefer) or more than one
 * does (a real, unresolved conflict between competing stated Goals; this
 * package declines to break that tie by array position or any other
 * fabricated tiebreaker). Pure, deterministic, no side effects.
 */
export function determinePrimaryNode(nodes: readonly NodeGoalEvidence[]): string | null {
  const withStatedGoal = nodes.filter((node) => node.creatorGoal.stated);
  return withStatedGoal.length === 1 ? withStatedGoal[0].nodeId : null;
}

// ── Article X — Constitutional Humility ──────────────────────────────────
// The shared vocabulary for "is this a real, evidenced value, or an
// honest fallback." Extracted from automatic-director.ts's own
// temporalBasis field (built before this Charter existed) rather than
// inventing a parallel mechanism — every future decision facet that
// always produces *some* value, but must disclose whether it's grounded
// in real evidence, uses this same type. A facet with genuinely no real
// signal at all (Package V1's rhythm/transitionStrategy) stays `null`
// instead — EvidenceBasis is for "a value exists, here is its grounding,"
// not for "no value could honestly be produced."

export type EvidenceBasis = 'real-evidence' | 'fallback-default';

// ── Article III/IV — Narrative Integrity (canvas-level judgment) ────────
// The one real, callable rule this package adds: a structural check over
// the Narrative Canvas's own real data (see the Narrative Canvas
// Foundation package) — no creative judgment, no fabricated signal.

export interface NarrativeIntegrityNode {
  readonly nodeId: string;
  readonly assetId: string;
  readonly temporal?: {
    readonly globalStartTimeSeconds: number;
    readonly playDurationSeconds: number;
  };
}

export interface NarrativeIntegrityResult {
  readonly valid: boolean;
  readonly violations: readonly string[];
}

/**
 * Validates the Narrative Canvas's own structural integrity — the real
 * "how does it protect narrative integrity" answer this package must
 * give. Pure, deterministic, no side effects.
 */
export function validateNarrativeIntegrity(nodes: readonly NarrativeIntegrityNode[]): NarrativeIntegrityResult {
  const violations: string[] = [];

  const seenAssetIds = new Set<string>();
  for (const node of nodes) {
    if (seenAssetIds.has(node.assetId)) {
      violations.push(`Asset '${node.assetId}' appears in more than one node — the same production asset may not occupy two places in one narrative.`);
    }
    seenAssetIds.add(node.assetId);

    if (node.temporal) {
      if (node.temporal.globalStartTimeSeconds < 0) {
        violations.push(`Node '${node.nodeId}' has a negative start time — a scene cannot begin before the timeline does.`);
      }
      if (node.temporal.playDurationSeconds <= 0) {
        violations.push(`Node '${node.nodeId}' has a non-positive duration — a scene must occupy real time to exist in the narrative.`);
      }
    }
  }

  return { valid: violations.length === 0, violations };
}
