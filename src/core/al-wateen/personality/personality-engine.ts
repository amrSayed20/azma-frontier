import {
  PersonalityRuntimeSnapshot,
  PersonalityContext,
  PersonalityInteraction,
} from './personality-types';
import { AdvisoryStyleEngine } from './advisory-style-engine';
import { CommunicationPolicy } from './communication-policy';
import { ConstitutionalConsciousness } from './constitutional-consciousness';
import { DialoguePrinciples } from './dialogue-principles';
import { FounderRelationshipEngine } from './founder-relationship-engine';
import { PersonalityMemory } from './personality-memory';
import { ResponseComposer } from './response-composer';
import { TrustModel } from './trust-model';

export class PersonalityEngine {
  constructor(
    private readonly consciousness: ConstitutionalConsciousness,
    private readonly dialoguePrinciples: DialoguePrinciples,
    private readonly relationshipEngine: FounderRelationshipEngine,
    private readonly styleEngine: AdvisoryStyleEngine,
    private readonly communicationPolicy: CommunicationPolicy,
    private readonly responseComposer: ResponseComposer,
    private readonly memory: PersonalityMemory,
    private readonly trustModel: TrustModel
  ) {}

  public engage(context: PersonalityContext): PersonalityInteraction {
    const consciousnessSignal = this.consciousness.sense(context);
    const relationship = this.relationshipEngine.evolve(
      context,
      this.memory.latestRelationship(),
      consciousnessSignal
    );
    const style = this.styleEngine.determine(consciousnessSignal);
    const policy = this.communicationPolicy.evaluate(consciousnessSignal, style);
    const response = this.responseComposer.compose(
      consciousnessSignal,
      relationship,
      style,
      policy
    );

    const interaction: PersonalityInteraction = {
      interactionId: `alw-personality-${Date.now().toString(36)}`,
      context,
      consciousness: consciousnessSignal,
      relationship,
      style,
      policy,
      response,
      traits: this.dialoguePrinciples.immutableTraits,
    };

    this.memory.store(interaction);

    return interaction;
  }

  public snapshot(): PersonalityRuntimeSnapshot {
    const history = this.memory.allRelationships();
    const latest = this.memory.latestInteraction();

    return {
      totalInteractions: this.memory.count(),
      lastInteractionId: latest?.interactionId,
      averageTrustScore: this.trustModel.averageTrust(history),
      lastUpdatedAt: latest?.context.generatedAt,
    };
  }

  public latest(): PersonalityInteraction | undefined {
    return this.memory.latestInteraction();
  }
}
