import {
  FounderRelationshipState,
  PersonalityInteraction,
} from './personality-types';

export class PersonalityMemory {
  private readonly interactions: PersonalityInteraction[] = [];
  private readonly relationshipHistory: FounderRelationshipState[] = [];

  public store(interaction: PersonalityInteraction): void {
    this.interactions.push(interaction);
    this.relationshipHistory.push(interaction.relationship);
  }

  public latestInteraction(): PersonalityInteraction | undefined {
    return this.interactions[this.interactions.length - 1];
  }

  public latestRelationship(): FounderRelationshipState | undefined {
    return this.relationshipHistory[this.relationshipHistory.length - 1];
  }

  public allRelationships(): readonly FounderRelationshipState[] {
    return [...this.relationshipHistory];
  }

  public count(): number {
    return this.interactions.length;
  }
}
