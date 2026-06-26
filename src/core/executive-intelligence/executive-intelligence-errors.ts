export class ExecutiveIntelligenceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ExecutiveValidationError extends ExecutiveIntelligenceError {
  constructor(message: string) {
    super(message, 'EXECUTIVE_VALIDATION_ERROR');
  }
}

export class ExecutiveFounderApprovalError extends ExecutiveIntelligenceError {
  constructor(message: string) {
    super(message, 'EXECUTIVE_FOUNDER_APPROVAL_ERROR');
  }
}

export class ExecutiveEventProcessingError extends ExecutiveIntelligenceError {
  constructor(message: string) {
    super(message, 'EXECUTIVE_EVENT_PROCESSING_ERROR');
  }
}
