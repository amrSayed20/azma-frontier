/**
 * AZMA OS – Qiyamah Chamber
 * File: voice-agent.ts
 *
 * Voice Agent
 * Responsible for managing sovereign voice profiles
 * and selecting the appropriate voice for generation.
 */

export type VoiceType =
  | 'sovereign_male'
  | 'sovereign_female'
  | 'clone'
  | 'upload';

export interface SovereignVoice {
  readonly type: VoiceType;
  readonly displayName: string;
  readonly createdAt: Date;
}

export class VoiceAgent {
  /**
   * Creates a sovereign voice profile.
   */
  public createVoice(type: VoiceType): SovereignVoice {
    return {
      type,
      displayName: this.getDisplayName(type),
      createdAt: new Date(),
    };
  }

  /**
   * Returns a human-readable voice name.
   */
  public getDisplayName(type: VoiceType): string {
    switch (type) {
      case 'sovereign_male':
        return 'Sovereign Male Voice';

      case 'sovereign_female':
        return 'Sovereign Female Voice';

      case 'clone':
        return 'Voice Clone';

      case 'upload':
        return 'Uploaded Voice';

      default:
        return 'Unknown Voice';
    }
  }

  /**
   * Determines whether the voice requires premium resources.
   */
  public requiresPremiumResources(type: VoiceType): boolean {
    return type === 'clone';
  }
}