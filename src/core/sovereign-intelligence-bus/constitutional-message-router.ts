import { RoutingPlan, SovereignBusMessage } from './intelligence-message-contracts';

export class ConstitutionalMessageRouter {
  public route(message: SovereignBusMessage): RoutingPlan {
    const targets = message.target === 'all' ? this.resolveBroadcastTargets(message.source) : [message.target];

    return {
      messageId: message.messageId,
      targets,
    };
  }

  private resolveBroadcastTargets(source: SovereignBusMessage['source']): readonly SovereignBusMessage['source'][] {
    const all: SovereignBusMessage['source'][] = [
      'constitution-runtime',
      'executive-intelligence',
      'strategic-intelligence',
      'future-simulation',
      'sovereign-intelligence-bus',
    ];

    return all.filter((target) => target !== source);
  }
}
