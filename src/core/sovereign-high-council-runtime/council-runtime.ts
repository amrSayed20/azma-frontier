import {
  AlWateenIntegrationRuntime,
} from '../al-wateen';
import { BriefingDistributor } from './briefing-distributor';
import { CouncilState } from './council-state';
import { FounderSessionManager } from './founder-session-manager';
import { RuntimeMemory } from './runtime-memory';
import { RuntimeSynchronizer } from './runtime-synchronizer';
import {
  CouncilRuntimeInput,
  CouncilSynchronizationResult,
  SovereignCouncilRuntimeSnapshot,
} from './runtime-types';

export class CouncilRuntime {
  constructor(
    private readonly sessionManager: FounderSessionManager,
    private readonly synchronizer: RuntimeSynchronizer,
    private readonly briefingDistributor: BriefingDistributor,
    private readonly memory: RuntimeMemory,
    private readonly state: CouncilState,
    private readonly alWateenRuntime: AlWateenIntegrationRuntime
  ) {}

  public synchronizeFounderSession(input: CouncilRuntimeInput): CouncilSynchronizationResult {
    const session = this.sessionManager.getOrCreate(input.founderId, input.trigger);
    this.state.recordSession(session);

    const result = this.synchronizer.synchronize(session, input);
    const briefingBundle = this.briefingDistributor.distribute(result.unifiedPackage);

    const finalized: CouncilSynchronizationResult = {
      ...result,
      briefingBundle,
    };

    this.memory.store(finalized);
    this.state.recordSynchronization(finalized.synchronizationId, finalized.session.lastSyncedAt ?? new Date());

    return finalized;
  }

  public latestSynchronization(): CouncilSynchronizationResult | undefined {
    return this.memory.latest();
  }

  public snapshot(): SovereignCouncilRuntimeSnapshot {
    return {
      state: this.state.snapshot(),
      alWateenRuntime: this.alWateenRuntime.snapshot(),
    };
  }
}
