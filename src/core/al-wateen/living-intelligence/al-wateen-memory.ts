import { ConstitutionalIntelligencePackage } from './al-wateen-integration-types';

export class AlWateenMemory {
  private readonly packages: ConstitutionalIntelligencePackage[] = [];

  public store(value: ConstitutionalIntelligencePackage): void {
    this.packages.push(value);
  }

  public latest(): ConstitutionalIntelligencePackage | undefined {
    return this.packages[this.packages.length - 1];
  }

  public count(): number {
    return this.packages.length;
  }
}
