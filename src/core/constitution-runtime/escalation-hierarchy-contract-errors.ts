import { ConstitutionRuntimeError } from './constitution-errors';

export class EscalationRouteNotFoundError extends ConstitutionRuntimeError {
  constructor(escalationId: string) {
    super(`Escalation route not found: ${escalationId}`, 'ESCALATION_ROUTE_NOT_FOUND');
  }
}

export class EscalationTraceabilityError extends ConstitutionRuntimeError {
  constructor(escalationId: string) {
    super(`Escalation traceability is incomplete: ${escalationId}`, 'ESCALATION_TRACEABILITY_ERROR');
  }
}

export class EscalationResolutionAuthorityError extends ConstitutionRuntimeError {
  constructor(escalationId: string, actor: string) {
    super(`Actor ${actor} is not authorized to resolve escalation ${escalationId}.`, 'ESCALATION_RESOLUTION_AUTHORITY_ERROR');
  }
}

export class EscalationRouteConflictError extends ConstitutionRuntimeError {
  constructor(escalationId: string) {
    super(`Escalation route is invalid or conflicting for ${escalationId}.`, 'ESCALATION_ROUTE_CONFLICT');
  }
}
