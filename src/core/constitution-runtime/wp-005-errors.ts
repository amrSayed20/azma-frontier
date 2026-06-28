/**
 * WP-005: Immutable Decision Audit Backbone — Error Types
 * 
 * Custom error types for all failure scenarios in audit backbone operations.
 */

export class AuditBackboneError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditBackboneError.prototype);
  }
}

export class AuditRecordingError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditRecordingError.prototype);
  }
}

export class AuditRetrievalError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditRetrievalError.prototype);
  }
}

export class AuditQueryError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditQueryError.prototype);
  }
}

export class AuditIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditIntegrityError.prototype);
  }
}

export class AuditRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditRecoveryError.prototype);
  }
}

export class AuditTamperingDetectedError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditTamperingDetectedError.prototype);
  }
}

export class AuditSequenceError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuditSequenceError.prototype);
  }
}
