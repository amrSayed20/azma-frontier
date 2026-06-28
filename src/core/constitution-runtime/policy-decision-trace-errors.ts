/**
 * WP-004: Policy Decision Trace Schema — Error Types
 * 
 * Defines error conditions specific to policy decision trace recording and validation.
 */

/**
 * Raised when policy decision trace chain integrity is compromised.
 */
export class PolicyDecisionTraceChainIntegrityError extends Error {
  constructor(
    public readonly traceId: string,
    public readonly reason: string,
    public readonly expectedHash?: string,
    public readonly actualHash?: string
  ) {
    super(`Policy Decision Trace chain integrity error for trace ${traceId}: ${reason}`);
    Object.setPrototypeOf(this, PolicyDecisionTraceChainIntegrityError.prototype);
  }
}

/**
 * Raised when a policy decision trace cannot be recorded.
 */
export class PolicyDecisionTraceRecordError extends Error {
  constructor(
    public readonly actor: string,
    public readonly reason: string
  ) {
    super(`Failed to record policy decision trace for actor ${actor}: ${reason}`);
    Object.setPrototypeOf(this, PolicyDecisionTraceRecordError.prototype);
  }
}

/**
 * Raised when authority context is missing or invalid for trace recording.
 */
export class PolicyDecisionTraceAuthorityError extends Error {
  constructor(
    public readonly reason: string,
    public readonly authorityDomain?: string,
    public readonly authorityValidationId?: string
  ) {
    super(`Policy Decision Trace authority error: ${reason}`);
    Object.setPrototypeOf(this, PolicyDecisionTraceAuthorityError.prototype);
  }
}

/**
 * Raised when a trace is not found.
 */
export class PolicyDecisionTraceNotFoundError extends Error {
  constructor(public readonly traceId: string) {
    super(`Policy Decision Trace not found: ${traceId}`);
    Object.setPrototypeOf(this, PolicyDecisionTraceNotFoundError.prototype);
  }
}

/**
 * Raised when query validation fails.
 */
export class PolicyDecisionTraceQueryError extends Error {
  constructor(public readonly reason: string) {
    super(`Policy Decision Trace query error: ${reason}`);
    Object.setPrototypeOf(this, PolicyDecisionTraceQueryError.prototype);
  }
}

/**
 * Raised when trace audit detects tampering.
 */
export class PolicyDecisionTraceTamperingDetectedError extends Error {
  constructor(
    public readonly traceId: string,
    public readonly tamperedFields: readonly string[]
  ) {
    super(`Tampering detected in Policy Decision Trace ${traceId}: ${tamperedFields.join(', ')}`);
    Object.setPrototypeOf(this, PolicyDecisionTraceTamperingDetectedError.prototype);
  }
}

/**
 * Raised when trace sequence is inconsistent.
 */
export class PolicyDecisionTraceSequenceError extends Error {
  constructor(
    public readonly expectedSequence: number,
    public readonly actualSequence: number
  ) {
    super(`Policy Decision Trace sequence error: expected ${expectedSequence}, got ${actualSequence}`);
    Object.setPrototypeOf(this, PolicyDecisionTraceSequenceError.prototype);
  }
}
