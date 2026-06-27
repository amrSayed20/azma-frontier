import { AuthorityActor, AuthorityDomain } from './constitutional-authority-map-types';
import { ConstitutionActionType, ConstitutionArticleId } from './constitution-types';

export type EscalationSeverity = 'low' | 'medium' | 'high' | 'critical' | 'constitutional';

export type EscalationDecision = 'route' | 'deny' | 'resolved' | 'closed';

export type EscalationTrigger =
  | 'authority-ambiguity'
  | 'policy-conflict'
  | 'repeated-failure'
  | 'high-impact'
  | 'constitutional-risk'
  | 'manual-escalation';

export interface EscalationRequest {
  readonly escalationId: string;
  readonly actor: AuthorityActor;
  readonly domain: AuthorityDomain;
  readonly actionType: ConstitutionActionType;
  readonly contextClass: string;
  readonly trigger: EscalationTrigger;
  readonly highImpact?: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface EscalationRouteStep {
  readonly stepOrder: number;
  readonly owner: AuthorityActor;
  readonly rationale: string;
}

export interface EscalationRoute {
  readonly escalationId: string;
  readonly domain: AuthorityDomain;
  readonly trigger: EscalationTrigger;
  readonly severity: EscalationSeverity;
  readonly decision: EscalationDecision;
  readonly traceId: string;
  readonly route: readonly EscalationRouteStep[];
  readonly constitutionalAnchors: readonly ConstitutionArticleId[];
}

export interface EscalationResolutionRequest {
  readonly escalationId: string;
  readonly resolvedBy: AuthorityActor;
  readonly outcome: 'approved' | 'rejected' | 'deferred';
  readonly notes: string;
}

export interface EscalationResolutionResult {
  readonly escalationId: string;
  readonly decision: EscalationDecision;
  readonly resolvedBy: AuthorityActor;
  readonly outcome: EscalationResolutionRequest['outcome'];
  readonly traceId: string;
  readonly closed: boolean;
}

export interface EscalationTrace {
  readonly escalationId: string;
  readonly traceId: string;
  readonly domain: AuthorityDomain;
  readonly route: readonly EscalationRouteStep[];
  readonly constitutionalAnchors: readonly ConstitutionArticleId[];
}

export interface EscalationHierarchySnapshot {
  readonly activeEscalations: readonly EscalationRoute[];
  readonly resolvedEscalations: readonly EscalationResolutionResult[];
}

export interface EscalationModelValidationResult {
  readonly valid: boolean;
  readonly untraceableEscalations: readonly string[];
  readonly emptyRoutes: readonly string[];
}
