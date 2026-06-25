/**
 * AZMA OS – Qiyamah Chamber
 * File: character-agent.ts
 *
 * Character Agent
 * Responsible for managing sovereign characters,
 * preserving identity consistency across generations.
 */

export interface SovereignCharacter {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly createdAt: Date;
}

export class CharacterAgent {
  /**
   * Creates a new sovereign character.
   */
  public createCharacter(
    id: string,
    name: string,
    description: string
  ): SovereignCharacter {
    return {
      id,
      name,
      description,
      createdAt: new Date(),
    };
  }

  /**
   * Updates a character description while preserving identity.
   */
  public updateDescription(
    character: SovereignCharacter,
    description: string
  ): SovereignCharacter {
    return {
      ...character,
      description,
    };
  }

  /**
   * Checks whether two characters are the same identity.
   */
  public isSameCharacter(
    first: SovereignCharacter,
    second: SovereignCharacter
  ): boolean {
    return first.id === second.id;
  }
}