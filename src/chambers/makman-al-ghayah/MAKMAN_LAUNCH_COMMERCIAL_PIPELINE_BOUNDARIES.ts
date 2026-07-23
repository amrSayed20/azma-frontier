/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LAUNCH FOUNDATION — COMMERCIAL GOAL COMPLETION PIPELINE
 * (WORK PACKAGE F: PIPELINE BOUNDARIES)
 * (Construction ID MAG-LF-001)
 *
 * The directive's own "shall NOT" list, mapped to a verified compliance
 * statement for each item.
 */

export const MAKMAN_LAUNCH_PIPELINE_SHALL_NEVER = [
  {
    prohibition: 'Modify any Living Layer.',
    verifiedCompliance: 'git status confirms zero modifications to any GOAL_PRESENCE_*.ts, GOAL_AWARENESS_*.ts, GOAL_GUARDIAN_*.ts, GOAL_STRATEGY_*.ts, or GOAL_COMMUNICATION_*.ts file.',
  },
  {
    prohibition: 'Modify the Constitutional Personality.',
    verifiedCompliance: 'Zero changes to MAKMAN_AL_GHAYAH_SOVEREIGN_CHAMBER_REFERENCE.ts or any MAKMAN_CONSTITUTIONAL_*.ts / MAKMAN_CHAMBER_ARCHITECTURE.ts file.',
  },
  {
    prohibition: 'Reinterpret Runtime responsibilities.',
    verifiedCompliance: 'MAKMAN_RUNTIME_CORE_*.ts is unmodified; this Package calls MakmanGoalRuntime.commitGoal() exactly as MAG-OPF-001 defined it, with no new meaning attached to it.',
  },
  {
    prohibition: 'Introduce new constitutional concepts.',
    verifiedCompliance: 'MakmanCommercialIntent and GoalDistributionBridgeResult are Operational Contracts (the same classification the Chief Architect gave GoalNotification in MAG-OPF-002), not constitutional concepts — they bundle already-required data, they do not add a new Article-level authority or verb.',
  },
  {
    prohibition: 'Redesign existing destination systems.',
    verifiedCompliance: 'git status confirms zero modifications to rendering-bridge.ts, publication-contracts.ts, access-policy-engine.ts, monetization-ledger-gateway.ts, or consumption-boundary.ts. MakmanPublicationRegistry implements consumption-boundary.ts\'s own pre-existing IPublicationRegistry interface exactly as declared — it does not alter that interface.',
  },
  {
    prohibition: 'Introduce polish-only features.',
    verifiedCompliance: 'No Recommendation/Notification generation was built (deferred per the Launch Gate, see MAKMAN_LAUNCH_PIPELINE_REORDERING_DECISION); no feature exists in this Package beyond what the commercial lifecycle requires.',
  },
  {
    prohibition: 'Build future optimizations that do not improve launch readiness.',
    verifiedCompliance: 'Phase C was deliberately reduced to zero new files once it was shown Runtime Core already satisfies it — the opposite of building unnecessary optimization.',
  },
] as const;

export const MAKMAN_LAUNCH_COMMERCIAL_PIPELINE_BOUNDARIES_DECLARATION = {
  everyProhibitionVerified: true,
  status: 'LAUNCH FOUNDATION (MAG-LF-001), WORK PACKAGE F, PIPELINE BOUNDARIES, complete.',
} as const;
