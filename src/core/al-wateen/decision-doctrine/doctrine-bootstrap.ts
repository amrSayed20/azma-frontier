import { ConstitutionalBalancer } from './constitutional-balancer';
import { ConstitutionalTradeoffEngine } from './constitutional-tradeoff-engine';
import { DoctrineMemory } from './doctrine-memory';
import { DoctrineRuntimeState } from './doctrine-runtime-state';
import { EthicalDecisionPolicy } from './ethical-decision-policy';
import { FounderIntentInterpreter } from './founder-intent-interpreter';
import { ImperialDecisionDoctrineEngine } from './imperial-decision-doctrine-engine';
import { LongTermImpactEvaluator } from './long-term-impact-evaluator';
import { PriorityResolutionEngine } from './priority-resolution-engine';
import { RecommendationJustificationBuilder } from './recommendation-justification';

export function createImperialDecisionDoctrineEngine(): ImperialDecisionDoctrineEngine {
  return new ImperialDecisionDoctrineEngine(
    new FounderIntentInterpreter(),
    new PriorityResolutionEngine(),
    new EthicalDecisionPolicy(),
    new LongTermImpactEvaluator(),
    new ConstitutionalTradeoffEngine(new ConstitutionalBalancer()),
    new RecommendationJustificationBuilder(),
    new DoctrineMemory(),
    new DoctrineRuntimeState()
  );
}
