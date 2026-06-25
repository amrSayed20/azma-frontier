/**
 * AZMA OS – Qiyamah Chamber
 * File: style-agent.ts
 *
 * Style Agent
 * Responsible for managing visual generation styles
 * and their associated quality profiles.
 */

export type GenerationStyle =
  | 'cinematic'
  | 'documentary'
  | 'hyper_real'
  | 'scifi'
  | 'animation';

export interface SovereignStyle {
  readonly type: GenerationStyle;
  readonly displayName: string;
  readonly premium: boolean;
  readonly createdAt: Date;
}

export class StyleAgent {
  /**
   * Creates a sovereign style profile.
   */
  public createStyle(type: GenerationStyle): SovereignStyle {
    return {
      type,
      displayName: this.getDisplayName(type),
      premium: this.isPremiumStyle(type),
      createdAt: new Date(),
    };
  }

  /**
   * Returns a human-readable style name.
   */
  public getDisplayName(type: GenerationStyle): string {
    switch (type) {
      case 'cinematic':
        return 'Cinematic 35mm';

      case 'documentary':
        return 'Classic Documentary';

      case 'hyper_real':
        return 'Hyper Real 8K';

      case 'scifi':
        return 'Sci-Fi Surreal';

      case 'animation':
        return 'Digital Animation';

      default:
        return 'Unknown Style';
    }
  }

  /**
   * Determines whether the style consumes premium resources.
   */
  public isPremiumStyle(type: GenerationStyle): boolean {
    return (
      type === 'cinematic' ||
      type === 'hyper_real'
    );
  }
}