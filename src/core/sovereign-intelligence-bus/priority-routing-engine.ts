import { ConstitutionPriority } from '../constitution-runtime';
import { SovereignBusMessage } from './intelligence-message-contracts';

const PRIORITY_WEIGHT: Record<ConstitutionPriority, number> = {
  low: 10,
  normal: 25,
  high: 50,
  critical: 80,
  constitutional: 100,
};

export class PriorityRoutingEngine {
  public order(messages: readonly SovereignBusMessage[]): readonly SovereignBusMessage[] {
    return [...messages].sort((left, right) => {
      const byPriority = PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];
      if (byPriority !== 0) {
        return byPriority;
      }

      return left.createdAt.getTime() - right.createdAt.getTime();
    });
  }
}
