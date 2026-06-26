import {
  ConstitutionalIntelligencePackage,
} from '../living-intelligence';
import { createImperialDecisionDoctrineEngine } from './doctrine-bootstrap';
import { DecisionDoctrineInput, DoctrineCandidatePath } from './doctrine-types';

export class DoctrineRuntime {
  private readonly engine = createImperialDecisionDoctrineEngine();

  public evaluate(
    founderIntent: string,
    constitutionalPackage: ConstitutionalIntelligencePackage,
    candidatePaths: readonly DoctrineCandidatePath[]
  ) {
    const input: DecisionDoctrineInput = {
      requestedAt: new Date(),
      founderIntent,
      constitutionalPackage,
      candidatePaths,
    };

    return this.engine.decide(input);
  }

  public latest() {
    return this.engine.latest();
  }

  public snapshot() {
    return this.engine.snapshot();
  }
}
