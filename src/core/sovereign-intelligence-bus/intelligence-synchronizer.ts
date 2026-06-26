import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { FutureSimulationRuntime } from '../future-simulation';
import { IntelligenceContextDistributor } from './intelligence-context-distributor';
import { SovereignBusMessage } from './intelligence-message-contracts';

export class IntelligenceSynchronizer {
  constructor(private readonly distributor: IntelligenceContextDistributor) {}

  public synchronize(
    constitutionRuntime: ConstitutionRuntime,
    executiveRuntime: ExecutiveIntelligenceRuntime,
    strategicRuntime: StrategicIntelligenceRuntime,
    futureSimulationRuntime: FutureSimulationRuntime
  ): readonly SovereignBusMessage[] {
    const now = new Date();
    const context = this.distributor.distribute(
      constitutionRuntime,
      executiveRuntime,
      strategicRuntime,
      futureSimulationRuntime
    );

    const messages: SovereignBusMessage[] = [];

    if (context.constitutionState) {
      messages.push({
        messageId: `sib-msg-constitution-${now.getTime()}`,
        messageType: 'constitution-state',
        source: 'constitution-runtime',
        target: 'all',
        authorityLevel: 'constitutional',
        priority: 'constitutional',
        createdAt: now,
        immutable: true,
        payload: {
          loaded: context.constitutionState.loaded,
          articleCount: context.constitutionState.articleCount,
          policyCount: context.constitutionState.policyCount,
          eventCount: context.constitutionState.eventCount,
        },
      });
    }

    messages.push({
      messageId: `sib-msg-executive-${now.getTime()}`,
      messageType: 'executive-state',
      source: 'executive-intelligence',
      target: 'all',
      authorityLevel: 'executive',
      priority: 'high',
      createdAt: now,
      immutable: true,
      payload: {
        totalDecisionPackages: context.executiveState?.totalDecisionPackages ?? 0,
        totalObservedEvents: context.executiveState?.totalObservedEvents ?? 0,
      },
    });

    messages.push({
      messageId: `sib-msg-strategic-${now.getTime()}`,
      messageType: 'strategic-state',
      source: 'strategic-intelligence',
      target: 'all',
      authorityLevel: 'strategic',
      priority: 'high',
      createdAt: now,
      immutable: true,
      payload: {
        totalPackages: context.strategicState?.totalPackages ?? 0,
        totalSignals: context.strategicState?.totalSignals ?? 0,
      },
    });

    messages.push({
      messageId: `sib-msg-future-${now.getTime()}`,
      messageType: 'future-simulation-state',
      source: 'future-simulation',
      target: 'all',
      authorityLevel: 'simulation',
      priority: 'normal',
      createdAt: now,
      immutable: true,
      payload: {
        totalPackages: context.futureSimulationState?.totalPackages ?? 0,
        totalSimulatedPaths: context.futureSimulationState?.totalSimulatedPaths ?? 0,
      },
    });

    return messages;
  }
}
