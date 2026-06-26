import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { FutureSimulationRuntime } from '../future-simulation';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { AuthorityBoundaryGuard } from './authority-boundary-guard';
import { BusMemory } from './bus-memory';
import { BusRuntimeState } from './bus-runtime-state';
import { ConstitutionalMessageRouter } from './constitutional-message-router';
import { DiagnosticsLayer } from './diagnostics-layer';
import { EventExchangeEngine } from './event-exchange-engine';
import { IntelligenceSynchronizer } from './intelligence-synchronizer';
import { PriorityRoutingEngine } from './priority-routing-engine';
import {
  BusDiagnostics,
  RoutedBusMessage,
  SovereignBusMessage,
} from './intelligence-message-contracts';

export class SovereignIntelligenceBusRuntime {
  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime,
    private readonly executiveRuntime: ExecutiveIntelligenceRuntime,
    private readonly strategicRuntime: StrategicIntelligenceRuntime,
    private readonly futureSimulationRuntime: FutureSimulationRuntime,
    private readonly router: ConstitutionalMessageRouter,
    private readonly exchange: EventExchangeEngine,
    private readonly boundaryGuard: AuthorityBoundaryGuard,
    private readonly priorityRouting: PriorityRoutingEngine,
    private readonly synchronizer: IntelligenceSynchronizer,
    private readonly memory: BusMemory,
    private readonly state: BusRuntimeState,
    private readonly diagnosticsLayer: DiagnosticsLayer
  ) {}

  public synchronizeIntelligence(): readonly RoutedBusMessage[] {
    const cycleTime = new Date();
    const messages = this.synchronizer.synchronize(
      this.constitutionRuntime,
      this.executiveRuntime,
      this.strategicRuntime,
      this.futureSimulationRuntime
    );

    for (const message of messages) {
      this.publish(message);
    }

    const routed = this.processExchange();
    this.state.recordSynchronizationCycle(cycleTime);

    return routed;
  }

  public publish(message: SovereignBusMessage): void {
    try {
      this.boundaryGuard.assert(message);
      this.exchange.publish(message);
      this.memory.storePublished(message);
      this.state.recordPublished(message.messageId);
    } catch (error) {
      this.state.recordBlocked();
      throw error;
    }
  }

  public processExchange(): readonly RoutedBusMessage[] {
    const orderedMessages = this.priorityRouting.order(this.exchange.drain());
    const routed: RoutedBusMessage[] = [];

    for (const message of orderedMessages) {
      const plan = this.router.route(message);

      for (const target of plan.targets) {
        const routedMessage: RoutedBusMessage = {
          routeId: `sib-route-${message.messageId}-${target}`,
          sourceMessageId: message.messageId,
          source: message.source,
          target,
          authorityLevel: message.authorityLevel,
          priority: this.boundaryGuard.normalizePriority(message.priority, message.authorityLevel),
          deliveredAt: new Date(),
          payload: message.payload,
        };

        this.memory.storeRouted(routedMessage);
        this.state.recordRouted();
        routed.push(routedMessage);
      }
    }

    return routed;
  }

  public getDiagnostics(): BusDiagnostics {
    return this.diagnosticsLayer.generate(
      this.memory,
      this.state,
      this.exchange.depth(),
      this.boundaryGuard.getBlockedCount()
    );
  }

  public getSnapshot() {
    return this.state.snapshot();
  }

  public getRecentPublishedMessages(limit: number = 20): readonly SovereignBusMessage[] {
    return this.memory.recentPublished(limit);
  }

  public getRecentRoutedMessages(limit: number = 20): readonly RoutedBusMessage[] {
    return this.memory.recentRouted(limit);
  }
}
