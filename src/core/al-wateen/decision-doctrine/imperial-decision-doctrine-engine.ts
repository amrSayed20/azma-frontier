import {
  DoctrineCandidatePath,
  DecisionDoctrineInput,
  ImperialDecisionDoctrinePackage,
  RankedDoctrinePath,
  TradeoffScore,
} from './doctrine-types';
import { ConstitutionalTradeoffEngine } from './constitutional-tradeoff-engine';
import { DoctrineMemory } from './doctrine-memory';
import { DoctrineRuntimeState } from './doctrine-runtime-state';
import { EthicalDecisionPolicy } from './ethical-decision-policy';
import { FounderIntentInterpreter } from './founder-intent-interpreter';
import { LongTermImpactEvaluator } from './long-term-impact-evaluator';
import { PriorityResolutionEngine } from './priority-resolution-engine';
import { RecommendationJustificationBuilder } from './recommendation-justification';

export class ImperialDecisionDoctrineEngine {
  constructor(
    private readonly intentInterpreter: FounderIntentInterpreter,
    private readonly priorityEngine: PriorityResolutionEngine,
    private readonly ethicalPolicy: EthicalDecisionPolicy,
    private readonly impactEvaluator: LongTermImpactEvaluator,
    private readonly tradeoffEngine: ConstitutionalTradeoffEngine,
    private readonly justificationBuilder: RecommendationJustificationBuilder,
    private readonly memory: DoctrineMemory,
    private readonly state: DoctrineRuntimeState
  ) {}

  public decide(input: DecisionDoctrineInput): ImperialDecisionDoctrinePackage {
    const founderIntent = this.intentInterpreter.interpret(input.founderIntent);
    const priorityResolution = this.priorityEngine.resolve(founderIntent);
    const ethicalPolicy = this.ethicalPolicy.evaluate(input.candidatePaths);

    const allowedCandidates = input.candidatePaths.filter(
      (candidate) => !ethicalPolicy.blockedPathIds.includes(candidate.pathId)
    );

    const decisionCandidates =
      allowedCandidates.length > 0 ? allowedCandidates : input.candidatePaths;

    const impacts = this.impactEvaluator.evaluate(decisionCandidates);
    const tradeoffs = this.tradeoffEngine.compare(
      decisionCandidates,
      impacts,
      priorityResolution
    );

    const ranking = this.rank(decisionCandidates, tradeoffs);
    const selected = this.select(decisionCandidates, ranking);
    const selectedTradeoff = tradeoffs.find((value) => value.pathId === selected.pathId) ?? tradeoffs[0];

    const recommendation = {
      recommendationId: `doctrine-rec-${Date.now().toString(36)}`,
      selectedPathId: selected.pathId,
      advisoryOnly: true as const,
      executionAuthority: 'none' as const,
      justification: this.justificationBuilder.build(selected, selectedTradeoff),
    };

    const doctrinePackage: ImperialDecisionDoctrinePackage = {
      packageId: `doctrine-package-${Date.now().toString(36)}`,
      generatedAt: new Date(),
      founderIntent,
      priorityResolution,
      ethicalPolicy,
      impacts,
      tradeoffs,
      ranking,
      recommendation,
      immutable: true,
    };

    this.memory.store(doctrinePackage);
    this.state.publish(doctrinePackage);

    return doctrinePackage;
  }

  public latest() {
    return this.memory.latest();
  }

  public snapshot() {
    return this.state.snapshot();
  }

  private rank(
    candidates: readonly DoctrineCandidatePath[],
    tradeoffs: readonly TradeoffScore[]
  ): readonly RankedDoctrinePath[] {
    const candidateMap = new Map(candidates.map((candidate) => [candidate.pathId, candidate]));

    return [...tradeoffs]
      .sort((left, right) => right.totalScore - left.totalScore)
      .map((score, index) => {
        const candidate = candidateMap.get(score.pathId);

        return {
          pathId: score.pathId,
          rank: index + 1,
          score: score.totalScore,
          why: candidate?.why ?? 'No explanation available.',
          whyNot: candidate?.whyNot ?? 'No counterfactual explanation available.',
        };
      });
  }

  private select(
    candidates: readonly DoctrineCandidatePath[],
    ranking: readonly RankedDoctrinePath[]
  ): DoctrineCandidatePath {
    const winnerId = ranking[0]?.pathId;
    const winner = candidates.find((candidate) => candidate.pathId === winnerId);

    if (winner) {
      return winner;
    }

    return candidates[0];
  }
}
