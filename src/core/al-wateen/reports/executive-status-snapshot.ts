/**
 * Executive snapshot coordinator.
 */

import { ExecutiveStatusSnapshot } from '../types/al-wateen.types';
import { RuntimeStateStore } from '../state/runtime-state-store';
import { ReportGenerator } from './report-generator';

export class ExecutiveStatusSnapshotService {
  constructor(
    private readonly stateStore: RuntimeStateStore,
    private readonly reportGenerator: ReportGenerator
  ) {}

  public generate(): ExecutiveStatusSnapshot {
    return this.reportGenerator.build(this.stateStore.snapshot());
  }
}
