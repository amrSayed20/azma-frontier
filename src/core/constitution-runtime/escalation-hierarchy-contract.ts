import { ConstitutionalAuthorityMap } from './constitutional-authority-map';
import { AuthorityActor } from './constitutional-authority-map-types';
import {
  EscalationDecision,
  EscalationHierarchySnapshot,
  EscalationModelValidationResult,
  EscalationRequest,
  EscalationResolutionRequest,
  EscalationResolutionResult,
  EscalationRoute,
  EscalationRouteStep,
  EscalationSeverity,
  EscalationTrace,
} from './escalation-hierarchy-contract-types';
import {
  EscalationResolutionAuthorityError,
  EscalationRouteConflictError,
  EscalationRouteNotFoundError,
  EscalationTraceabilityError,
} from './escalation-hierarchy-contract-errors';

function severityForTrigger(trigger: EscalationRequest['trigger'], highImpact: boolean): EscalationSeverity {
  if (trigger === 'constitutional-risk') {
    return 'constitutional';
  }
  if (trigger === 'policy-conflict' || highImpact) {
    return 'critical';
  }
  if (trigger === 'repeated-failure' || trigger === 'authority-ambiguity') {
    return 'high';
  }
  if (trigger === 'manual-escalation') {
    return 'medium';
  }
  return 'low';
}

function traceIdForEscalation(escalationId: string): string {
  return `trace-escalation-${escalationId}`;
}

function requiresFounderGate(severity: EscalationSeverity): boolean {
  return severity === 'constitutional' || severity === 'critical';
}

/**
 * Public interface: Approval and escalation contract for constitutional runtime.
 */
export class EscalationHierarchyContract {
  private readonly active = new Map<string, EscalationRoute>();
  private readonly resolved = new Map<string, EscalationResolutionResult>();
  private readonly archivedRoutes = new Map<string, EscalationRoute>();

  constructor(private readonly authorityMap: ConstitutionalAuthorityMap) {}

  public planEscalation(request: EscalationRequest): EscalationRoute {
    this.authorityMap.validateAuthority({
      actor: request.actor,
      domain: request.domain,
      actionType: request.actionType,
      contextClass: request.contextClass,
      highImpact: request.highImpact,
    });

    const authority = this.authorityMap.queryAuthority({
      domain: request.domain,
      actionType: request.actionType,
      contextClass: request.contextClass,
      highImpact: request.highImpact,
    });

    const severity = severityForTrigger(request.trigger, request.highImpact ?? false);
    const route: EscalationRouteStep[] = [];

    route.push({
      stepOrder: 1,
      owner: authority.effectiveOwner,
      rationale: 'Primary authority owner receives first escalation review.',
    });

    if (authority.fallbackOwner !== authority.effectiveOwner) {
      route.push({
        stepOrder: route.length + 1,
        owner: authority.fallbackOwner,
        rationale: 'Fallback authority reviews unresolved or high-impact conditions.',
      });
    }

    if (requiresFounderGate(severity) && !route.some((step) => step.owner === 'founder')) {
      route.push({
        stepOrder: route.length + 1,
        owner: 'founder',
        rationale: 'Constitutional and critical escalations require founder gate.',
      });
    }

    if (route.length === 0) {
      throw new EscalationRouteConflictError(request.escalationId);
    }

    const authorityTrace = this.authorityMap.traceAuthorityRule(authority.ruleId);
    if (authorityTrace.constitutionalAnchors.length === 0) {
      throw new EscalationTraceabilityError(request.escalationId);
    }

    const planned: EscalationRoute = {
      escalationId: request.escalationId,
      domain: request.domain,
      trigger: request.trigger,
      severity,
      decision: 'route',
      traceId: traceIdForEscalation(request.escalationId),
      route,
      constitutionalAnchors: authorityTrace.constitutionalAnchors,
    };

    this.active.set(request.escalationId, planned);
    return planned;
  }

  public resolveEscalation(request: EscalationResolutionRequest): EscalationResolutionResult {
    const current = this.active.get(request.escalationId);
    if (!current) {
      throw new EscalationRouteNotFoundError(request.escalationId);
    }

    const allowedResolvers = new Set<AuthorityActor>(current.route.map((step) => step.owner));
    if (!allowedResolvers.has(request.resolvedBy)) {
      throw new EscalationResolutionAuthorityError(request.escalationId, request.resolvedBy);
    }

    const decision: EscalationDecision = request.outcome === 'deferred' ? 'route' : 'resolved';
    const closed = request.outcome !== 'deferred';

    const result: EscalationResolutionResult = {
      escalationId: request.escalationId,
      decision,
      resolvedBy: request.resolvedBy,
      outcome: request.outcome,
      traceId: current.traceId,
      closed,
    };

    if (closed) {
      this.active.delete(request.escalationId);
      this.resolved.set(request.escalationId, result);
      this.archivedRoutes.set(request.escalationId, current);
      return result;
    }

    this.active.set(request.escalationId, { ...current, decision });
    return result;
  }

  public traceEscalation(escalationId: string): EscalationTrace {
    const active = this.active.get(escalationId);
    if (active) {
      return {
        escalationId,
        traceId: active.traceId,
        domain: active.domain,
        route: active.route,
        constitutionalAnchors: active.constitutionalAnchors,
      };
    }

    const resolved = this.resolved.get(escalationId);
    if (resolved) {
      const archived = this.archivedRoutes.get(escalationId);
      if (!archived) {
        throw new EscalationTraceabilityError(escalationId);
      }
      return {
        escalationId,
        traceId: archived.traceId,
        domain: archived.domain,
        route: archived.route,
        constitutionalAnchors: archived.constitutionalAnchors,
      };
    }

    throw new EscalationRouteNotFoundError(escalationId);
  }

  public getSnapshot(): EscalationHierarchySnapshot {
    return {
      activeEscalations: Array.from(this.active.values()),
      resolvedEscalations: Array.from(this.resolved.values()),
    };
  }

  public validateModel(): EscalationModelValidationResult {
    const untraceableEscalations: string[] = [];
    const emptyRoutes: string[] = [];

    for (const [escalationId, route] of this.active.entries()) {
      if (!route.traceId || route.constitutionalAnchors.length === 0) {
        untraceableEscalations.push(escalationId);
      }
      if (route.route.length === 0) {
        emptyRoutes.push(escalationId);
      }
    }

    for (const [escalationId, route] of this.archivedRoutes.entries()) {
      if (!route.traceId || route.constitutionalAnchors.length === 0) {
        untraceableEscalations.push(escalationId);
      }
      if (route.route.length === 0) {
        emptyRoutes.push(escalationId);
      }
    }

    return {
      valid: untraceableEscalations.length === 0 && emptyRoutes.length === 0,
      untraceableEscalations,
      emptyRoutes,
    };
  }
}

export function createEscalationHierarchyContract(authorityMap: ConstitutionalAuthorityMap): EscalationHierarchyContract {
  return new EscalationHierarchyContract(authorityMap);
}
