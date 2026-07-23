/**
 * AZMA OS — THE CONSTITUTIONAL ACTUATION (THE IMPERIAL MOTOR SYSTEM)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Campaign. See ENGINEERING_REVIEW.ts for what this module
 * built and deliberately did not build (most notably: "pathway" and
 * "target" here are both internal, disclosed placeholders — no AI
 * provider, external API, worker, queue, or infrastructure integration
 * exists or is authorized anywhere in this campaign; see types.ts).
 */

export type {
  ConstitutionalPathwayKind,
  ConstitutionalPathway,
  ConstitutionalTarget,
  ConstitutionalRouting,
  RoutingRejection,
  ConstitutionalActuationCertification,
} from './types';

export { CONSTITUTIONAL_ACTUATION_PIPELINE } from './actuation-registry';
export { CONSTITUTIONAL_PATHWAY } from './pathway-registry';
export { isValidTarget, listValidTargetOrganIds } from './target-registry';
export { evaluateExecutionForActuation } from './actuation-evaluator';

export {
  processExecutionsIntoRoutings,
  getRoutingQueue,
  getRoutingsForOrgan,
  getRoutingRejections,
  resetRoutingLayer,
} from './routing-layer';

export {
  verifyEveryActuationOriginatesFromExecution,
  verifyExecutionPathwaysAreAuthorized,
  verifyEveryRoutingDecisionIsTraceable,
  verifyNoAuthorityExistsBeyondRouting,
} from './certification';

export { getConstitutionalActuationCertificationReport } from './queries';
