import { ExecutiveDecisionPackage, ExecutiveRuntimeStateSnapshot } from './executive-intelligence-types';

export class ExecutiveRuntimeState {
  private readonly processedEventIds = new Set<string>();
  private readonly decisionPackages: ExecutiveDecisionPackage[] = [];
  private totalObservedEvents = 0;
  private lastUpdatedAt?: Date;

  public hasProcessedEvent(eventId: string): boolean {
    return this.processedEventIds.has(eventId);
  }

  public markObservedEvent(eventId: string): void {
    this.totalObservedEvents += 1;
    this.processedEventIds.add(eventId);
    this.lastUpdatedAt = new Date();
  }

  public recordDecisionPackage(value: ExecutiveDecisionPackage): void {
    this.decisionPackages.push(value);
    this.lastUpdatedAt = new Date();
  }

  public getLatestDecisionPackage(): ExecutiveDecisionPackage | undefined {
    return this.decisionPackages[this.decisionPackages.length - 1];
  }

  public snapshot(): ExecutiveRuntimeStateSnapshot {
    const latest = this.getLatestDecisionPackage();

    return {
      processedEventIds: Array.from(this.processedEventIds.values()),
      totalObservedEvents: this.totalObservedEvents,
      totalDecisionPackages: this.decisionPackages.length,
      lastActionId: latest?.input.action.actionId,
      lastPackageId: latest?.packageId,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }
}
