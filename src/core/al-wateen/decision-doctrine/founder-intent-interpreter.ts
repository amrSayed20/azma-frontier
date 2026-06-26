import { FounderIntentSignal } from './doctrine-types';

export class FounderIntentInterpreter {
  public interpret(founderIntent: string): FounderIntentSignal {
    const normalized = founderIntent.trim().toLowerCase();

    const urgency =
      normalized.includes('urgent') || normalized.includes('immediately')
        ? 'high'
        : normalized.includes('later') || normalized.includes('defer')
        ? 'low'
        : 'normal';

    const constitutionalSensitivity =
      normalized.includes('constitution') || normalized.includes('policy')
        ? 'high'
        : normalized.includes('security') || normalized.includes('risk')
        ? 'moderate'
        : 'low';

    return {
      intentId: `doctrine-intent-${Date.now().toString(36)}`,
      intentSummary: founderIntent,
      urgency,
      constitutionalSensitivity,
    };
  }
}
