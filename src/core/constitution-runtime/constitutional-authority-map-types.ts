import { ConstitutionActionType, ConstitutionArticleId, ConstitutionModuleOwner } from './constitution-types';

export type AuthorityTier =
  | 'founder'
  | 'sovereign-high-council'
  | 'constitutional-intelligence'
  | 'runtime-authority';

export type AuthorityActor = ConstitutionModuleOwner | 'founder';

export type AuthorityDomain =
  | 'governance'
  | 'policy'
  | 'approval'
  | 'escalation'
  | 'audit-accountability'
  | 'security'
  | 'simulation'
  | 'evolution'
  | 'memory'
  | 'provider-management'
  | 'founder-interaction'
  | 'communication'
  | 'infrastructure'
  | 'chamber-interaction';

export type AuthorityTransitionMode = 'allowed' | 'conditional' | 'forbidden';

export type AuthorityValidationDecision = 'pass' | 'deny' | 'escalate-required';

export interface AuthorityDomainBinding {
  readonly domain: AuthorityDomain;
  readonly primaryOwner: AuthorityActor;
  readonly fallbackOwner: AuthorityActor;
  readonly allowedDelegates: readonly AuthorityActor[];
  readonly constitutionalAnchors: readonly ConstitutionArticleId[];
}

export interface AuthorityTransitionRule {
  readonly fromTier: AuthorityTier;
  readonly toTier: AuthorityTier;
  readonly mode: AuthorityTransitionMode;
  readonly rationale: string;
}

export interface AuthorityRuleTrace {
  readonly ruleId: string;
  readonly domain: AuthorityDomain;
  readonly constitutionalAnchors: readonly ConstitutionArticleId[];
  readonly rationale: string;
}

export interface AuthorityQueryRequest {
  readonly domain: AuthorityDomain;
  readonly actionType: ConstitutionActionType;
  readonly contextClass: string;
  readonly highImpact?: boolean;
}

export interface AuthorityQueryResult {
  readonly domain: AuthorityDomain;
  readonly effectiveOwner: AuthorityActor;
  readonly effectiveTier: AuthorityTier;
  readonly fallbackOwner: AuthorityActor;
  readonly ruleId: string;
  readonly traceId: string;
  readonly rationale: string;
}

export interface AuthorityValidationRequest {
  readonly actor: AuthorityActor;
  readonly domain: AuthorityDomain;
  readonly actionType: ConstitutionActionType;
  readonly contextClass: string;
  readonly highImpact?: boolean;
}

export interface AuthorityValidationResult {
  readonly decision: AuthorityValidationDecision;
  readonly ruleId: string;
  readonly traceId: string;
  readonly reasons: readonly string[];
  readonly conflicts: readonly AuthorityActor[];
}

export interface AuthorityModelValidationResult {
  readonly valid: boolean;
  readonly missingDomains: readonly AuthorityDomain[];
  readonly duplicateDomains: readonly AuthorityDomain[];
  readonly untraceableRules: readonly string[];
}

export interface ConstitutionalAuthorityMapSnapshot {
  readonly domainMatrix: readonly AuthorityDomainBinding[];
  readonly transitionMatrix: readonly AuthorityTransitionRule[];
  readonly traceabilityMatrix: readonly AuthorityRuleTrace[];
}
