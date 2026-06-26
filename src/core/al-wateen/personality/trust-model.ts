import { FounderRelationshipState } from './personality-types';

export class TrustModel {
  public averageTrust(history: readonly FounderRelationshipState[]): number {
    if (history.length === 0) {
      return 0;
    }

    const total = history.reduce((sum, item) => sum + item.trustScore, 0);
    return Number((total / history.length).toFixed(2));
  }
}
