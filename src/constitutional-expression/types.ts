/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION (THE IMPERIAL EXPRESSION)
 * Construction Campaign — Type Definitions
 *
 * Authority: "The Constitutional Construction Campaign," THE
 * CONSTITUTIONAL EXPRESSION ("The Birth of the Imperial Expression").
 *
 * CONTINUITY WITH THE COUNCIL'S OWN DECISION: following the First
 * Integration Campaign's certification, the Council ruled that Al-Wateen,
 * the Sovereign Core, Constitutional Consciousness, Constitutional
 * Memory, and Constitutional Evolution shall never expose output
 * directly — "These organs serve the Living Body. They do not
 * communicate directly with the Creator." This module is the ONE
 * authorized reader of their already-certified, already-existing query
 * functions (getOrganContinuity, getLatestAdvisoryForOrgan,
 * getConditionForOrgan, getKnowledgeHistoryForOrgan,
 * getMaturitySnapshotsForOrgan) — none of which is modified — and
 * repackages what they already produce into ONE unified expression. No
 * new data is invented; every field in a ConstitutionalExpressionInput
 * traces to a real, already-certified query.
 *
 * OUT OF SCOPE, per this Campaign's own directive: no dashboard, no
 * Creator-facing interface, no visual presentation, no UI integration.
 * This module produces data only — a future, separately-authorized
 * Integration Package would decide who, if anyone, ever renders it.
 */

export type ExpressionSourceOrgan =
  | 'al-wateen'
  | 'sovereign-core'
  | 'constitutional-consciousness'
  | 'constitutional-memory'
  | 'constitutional-evolution';

export interface ConstitutionalExpressionInput {
  readonly organId: string;
  readonly sourceOrgan: ExpressionSourceOrgan;
  readonly summary: string;
  readonly evidence: string;
  readonly hasRealEvidence: boolean;
}

export interface ConstitutionalExpressionDignity {
  readonly truthful: boolean;
  readonly useful: boolean;
  readonly worthy: boolean;
  readonly approved: boolean;
  readonly blockingGate: 'truthful' | 'useful' | 'worthy' | null;
}

export interface ConstitutionalExpression {
  readonly expressionId: string;
  readonly organId: string;
  readonly generatedAt: string;
  readonly contributingSources: readonly ExpressionSourceOrgan[];
  readonly unifiedSummary: string;
  readonly dignity: ConstitutionalExpressionDignity;
  readonly sourceInputs: readonly ConstitutionalExpressionInput[];
}

export interface ConstitutionalExpressionCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
