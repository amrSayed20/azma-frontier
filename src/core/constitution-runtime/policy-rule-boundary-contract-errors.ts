import { ConstitutionRuntimeError } from './constitution-errors';

export class PolicyBoundaryNotFoundError extends ConstitutionRuntimeError {
  constructor(boundaryId: string) {
    super(`Policy boundary evaluation not found: ${boundaryId}`, 'POLICY_BOUNDARY_NOT_FOUND');
  }
}

export class PolicyBoundaryTraceabilityError extends ConstitutionRuntimeError {
  constructor(boundaryId: string) {
    super(`Policy boundary traceability is incomplete: ${boundaryId}`, 'POLICY_BOUNDARY_TRACEABILITY_ERROR');
  }
}

export class PolicyBoundaryConflictError extends ConstitutionRuntimeError {
  constructor(boundaryId: string, message: string) {
    super(`Policy boundary conflict for ${boundaryId}: ${message}`, 'POLICY_BOUNDARY_CONFLICT');
  }
}
