export class ConstitutionRuntimeError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ConstitutionNotLoadedError extends ConstitutionRuntimeError {
  constructor() {
    super('Constitution Runtime Engine has not loaded Constitution v1.0.', 'CONSTITUTION_NOT_LOADED');
  }
}

export class ConstitutionArticleNotFoundError extends ConstitutionRuntimeError {
  constructor(articleId: string) {
    super(`Constitution article not found: ${articleId}`, 'CONSTITUTION_ARTICLE_NOT_FOUND');
  }
}

export class ConstitutionPolicyConflictError extends ConstitutionRuntimeError {
  constructor(message: string) {
    super(message, 'CONSTITUTION_POLICY_CONFLICT');
  }
}

export class ConstitutionValidationError extends ConstitutionRuntimeError {
  constructor(message: string) {
    super(message, 'CONSTITUTION_VALIDATION_ERROR');
  }
}
