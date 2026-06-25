/**
 * AZMA OS – Qiyamah Chamber
 * File: cost-agent.ts
 *
 * Cost Agent
 * Responsible for calculating sovereign generation costs
 * based on duration, style, and voice configuration.
 */

import { GenerationStyle } from './style-agent';
import { VoiceType } from './voice-agent';

export interface CostBreakdown {
  readonly durationCost: number;
  readonly styleCost: number;
  readonly voiceCost: number;
  readonly totalCost: number;
  readonly calculatedAt: Date;
}

export class CostAgent {
  /**
   * Calculates the complete generation cost.
   */
  public calculate(
    duration: number,
    style: GenerationStyle,
    voice: VoiceType
  ): CostBreakdown {
    const durationCost = duration * 2;

    const styleCost =
      style === 'cinematic' || style === 'hyper_real'
        ? 50
        : style === 'documentary'
        ? 20
        : 0;

    const voiceCost =
      voice === 'clone'
        ? 100
        : 0;

    return {
      durationCost,
      styleCost,
      voiceCost,
      totalCost: durationCost + styleCost + voiceCost,
      calculatedAt: new Date(),
    };
  }

  /**
   * Determines whether the generation is expensive.
   */
  public isHighCost(totalCost: number): boolean {
    return totalCost >= 200;
  }
}