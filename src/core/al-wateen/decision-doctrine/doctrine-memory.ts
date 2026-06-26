import { ImperialDecisionDoctrinePackage } from './doctrine-types';

export class DoctrineMemory {
  private readonly packages: ImperialDecisionDoctrinePackage[] = [];

  public store(value: ImperialDecisionDoctrinePackage): void {
    this.packages.push(value);
  }

  public latest(): ImperialDecisionDoctrinePackage | undefined {
    return this.packages[this.packages.length - 1];
  }

  public count(): number {
    return this.packages.length;
  }
}
