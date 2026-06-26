export class FutureSimulationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class FutureSimulationValidationError extends FutureSimulationError {
  constructor(message: string) {
    super(message, 'FUTURE_SIMULATION_VALIDATION_ERROR');
  }
}

export class FutureSimulationAuthorityBoundaryError extends FutureSimulationError {
  constructor(message: string) {
    super(message, 'FUTURE_SIMULATION_AUTHORITY_BOUNDARY_ERROR');
  }
}
