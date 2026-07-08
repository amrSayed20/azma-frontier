/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 11 — IMPLEMENTATION FOUNDATION PACKAGE (STEP 2 OF 5: IMPLEMENTATION PIPELINE)
 * (Construction ID RAS-II-10, certified as hierarchy Stage 11 — see
 * IMPLEMENTATION_CONTEXT.ts header for the numbering ruling.)
 *
 * POINTER FILE, NOT A NEW DEFINITION. Implementation introduces no new flow —
 * per this Stage's own directive, the implementation pipeline is "derived
 * exclusively from the approved Runtime Foundation." The two ordered flows
 * (session lifecycle, recommendation cycle) already exist as
 * RUNTIME_PIPELINE_SESSION_FLOW and RUNTIME_PIPELINE_RECOMMENDATION_FLOW
 * (Package II, Stage 9). This file re-exports them and adds only what did
 * not exist as a named artifact before: which already-certified
 * IMPLEMENTATION.ts function gives executable enforcement to each flow. That
 * mapping is fact, not new authority — it is already stated in IMPLEMENTATION.ts's
 * own section comments and IMPLEMENTATION_TRACEABILITY_MATRIX; this file
 * only makes it explicit under a pipeline-flavored name.
 */

export {
  RUNTIME_PIPELINE_SESSION_FLOW as IMPLEMENTATION_PIPELINE_SESSION_FLOW,
  RUNTIME_PIPELINE_SESSION_FLOW_AUTHORITY as IMPLEMENTATION_PIPELINE_SESSION_FLOW_AUTHORITY,
  RUNTIME_PIPELINE_RECOMMENDATION_STAGES as IMPLEMENTATION_PIPELINE_RECOMMENDATION_STAGES,
  RUNTIME_PIPELINE_RECOMMENDATION_FLOW as IMPLEMENTATION_PIPELINE_RECOMMENDATION_FLOW,
} from './RUNTIME_PIPELINE';

export const IMPLEMENTATION_PIPELINE_ENFORCEMENT_MAP = {
  sessionFlow: {
    flow: 'IMPLEMENTATION_PIPELINE_SESSION_FLOW (= RUNTIME_SESSION_LIFECYCLE_TRANSITIONS, RUNTIME.ts)',
    enforcedBy: ['getAuthorizedNextBeat', 'attemptBeatTransition', 'isExportConfirmationSatisfied', 'attemptExportConfirmedTransition'],
    reason: 'IMPLEMENTATION.ts, Section I — enforces forward-only progression and creatorAuthorizesNarrative over this exact flow; introduces no beat the flow does not already name.',
  },
  recommendationFlow: {
    flow: 'IMPLEMENTATION_PIPELINE_RECOMMENDATION_FLOW (= RUNTIME_RECOMMENDATION_CYCLE_TRANSITIONS, RUNTIME.ts)',
    enforcedBy: ['mayLayerVSignal', 'evaluateRecommendationCycle', 'resolveRecommendationCycle'],
    reason: 'IMPLEMENTATION.ts, Sections II-III — aggregates externally-supplied gate results over this exact flow; assigns none of them.',
  },
  introducesNewStage: false,
} as const;

export const IMPLEMENTATION_PIPELINE_POINTER = {
  sessionFlow: { definedIn: 'RUNTIME.ts / RUNTIME_PIPELINE.ts', reAsExportName: 'IMPLEMENTATION_PIPELINE_SESSION_FLOW' },
  recommendationFlow: { definedIn: 'RUNTIME.ts / RUNTIME_PIPELINE.ts', reAsExportName: 'IMPLEMENTATION_PIPELINE_RECOMMENDATION_FLOW' },
  reason: 'Restating these two flows under new names a second time (after RUNTIME_PIPELINE.ts already did so once) would duplicate a duplication — this file instead names which Implementation mechanism enforces each flow, the one piece not yet made explicit anywhere.',
  status: 'PACKAGE II — STAGE 11, STEP 2 OF 5 — IMPLEMENTATION PIPELINE, submitted for Chief Architect review. No new flow introduced.',
} as const;
