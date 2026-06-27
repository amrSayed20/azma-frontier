import { AuthorityActor, AuthorityDomain } from './constitutional-authority-map-types';
import { ConstitutionActionContext, ConstitutionArticleId, ConstitutionDecision, ConstitutionPolicyDefinition } from './constitution-types';

export type PolicyBoundaryDecision = ConstitutionDecision;

export interface PolicyBoundaryRequest {
  readonly boundaryId: string;
  readonly actor: AuthorityActor;
  readonly action: ConstitutionActionContext;
  readonly highImpact?: boolean;
  readonly autoEscalate?: boolean;
}

export interface PolicyBoundaryViolation {
  readonly policyId: string;
  readonly articleId: ConstitutionArticleId;
  readonly reason: string;
}

export interface PolicyBoundaryEvaluation {
  readonly boundaryId: string;
  readonly domain: AuthorityDomain;
  readonly decision: PolicyBoundaryDecision;
  readonly applicablePolicies: readonly ConstitutionPolicyDefinition[];
  readonly appliedPolicyIds: readonly string[];
  readonly violations: readonly PolicyBoundaryViolation[];
  readonly reasons: readonly string[];
  readonly escalationId?: string;
  readonly traceId: string;
  readonly constitutionalAnchors: readonly ConstitutionArticleId[];
}

export interface PolicyBoundaryTrace {
  readonly boundaryId: string;
  readonly traceId: string;
  readonly decision: PolicyBoundaryDecision;
  readonly domain: AuthorityDomain;
  readonly policyIds: readonly string[];
  readonly constitutionalAnchors: readonly ConstitutionArticleId[];
}

export interface PolicyBoundarySnapshot {
  readonly evaluations: readonly PolicyBoundaryEvaluation[];
}

export interface PolicyBoundaryValidationResult {
  readonly valid: boolean;
  readonly untraceableBoundaries: readonly string[];
  readonly emptyPolicyCoverage: readonly string[];
}
