import {
  ConstitutionalIntelligencePackage,
} from '../living-intelligence';
import { createPersonalityEngine } from './personality-bootstrap';
import { PersonalityEngine } from './personality-engine';
import { PersonalityContext } from './personality-types';

export class PersonalityRuntime {
  private readonly engine: PersonalityEngine;

  constructor(engine: PersonalityEngine = createPersonalityEngine()) {
    this.engine = engine;
  }

  public engage(
    sessionId: string,
    founderId: string,
    constitutionalPackage: ConstitutionalIntelligencePackage
  ) {
    const context: PersonalityContext = {
      sessionId,
      founderId,
      generatedAt: new Date(),
      constitutionalPackage,
    };

    return this.engine.engage(context);
  }

  public latest() {
    return this.engine.latest();
  }

  public snapshot() {
    return this.engine.snapshot();
  }
}
