import { CouncilSynchronizationResult } from './runtime-types';

export class RuntimeMemory {
  private readonly history: CouncilSynchronizationResult[] = [];

  public store(value: CouncilSynchronizationResult): void {
    this.history.push(value);
  }

  public latest(): CouncilSynchronizationResult | undefined {
    return this.history[this.history.length - 1];
  }

  public count(): number {
    return this.history.length;
  }
}
