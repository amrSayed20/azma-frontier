import { ConstitutionPriority } from '../../constitution-runtime';
import { DoctrinePriorityResolution, FounderIntentSignal } from './doctrine-types';

export class PriorityResolutionEngine {
  public resolve(signal: FounderIntentSignal): DoctrinePriorityResolution {
    const constitutionalPriority: ConstitutionPriority =
      signal.constitutionalSensitivity === 'high'
        ? 'constitutional'
        : signal.urgency === 'high'
        ? 'critical'
        : 'high';

    const longTermPriorityWeight =
      constitutionalPriority === 'constitutional' ? 1.0 : constitutionalPriority === 'critical' ? 0.9 : 0.8;

    const speedPenaltyWeight =
      signal.urgency === 'high' && signal.constitutionalSensitivity === 'low' ? 0.3 : 0.55;

    return {
      constitutionalPriority,
      longTermPriorityWeight,
      speedPenaltyWeight,
    };
  }
}
