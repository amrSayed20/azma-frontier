import { ConstitutionRuntimeError } from './constitution-errors';

export class MissingAuthorityBindingError extends ConstitutionRuntimeError {
  constructor(domain: string) {
    super(`Missing authority binding for domain: ${domain}`, 'MISSING_AUTHORITY_BINDING');
  }
}

export class ConflictingAuthorityResolutionError extends ConstitutionRuntimeError {
  constructor(domain: string, conflicts: readonly string[]) {
    super(
      `Conflicting authority resolution for domain ${domain}: ${conflicts.join(', ')}`,
      'CONFLICTING_AUTHORITY_RESOLUTION'
    );
  }
}

export class UntraceableAuthorityRuleError extends ConstitutionRuntimeError {
  constructor(ruleId: string) {
    super(`Authority rule is missing constitutional traceability: ${ruleId}`, 'UNTRACEABLE_AUTHORITY_RULE');
  }
}

export class UnauthorizedByConstitutionError extends ConstitutionRuntimeError {
  constructor(actor: string, domain: string) {
    super(`Actor ${actor} is not authorized by constitution for domain ${domain}.`, 'UNAUTHORIZED_BY_CONSTITUTION');
  }
}
