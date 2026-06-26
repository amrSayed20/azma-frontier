export class StrategicIntelligenceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class StrategicRuntimeValidationError extends StrategicIntelligenceError {
  constructor(message: string) {
    super(message, 'STRATEGIC_RUNTIME_VALIDATION_ERROR');
  }
}

export class StrategicAuthorityBoundaryError extends StrategicIntelligenceError {
  constructor(message: string) {
    super(message, 'STRATEGIC_AUTHORITY_BOUNDARY_ERROR');
  }
}
