import { BusMemory } from './bus-memory';
import { BusRuntimeState } from './bus-runtime-state';
import { BusDiagnostics } from './intelligence-message-contracts';

export class DiagnosticsLayer {
  public generate(memory: BusMemory, state: BusRuntimeState, queueDepth: number, blockedCount: number): BusDiagnostics {
    const snapshot = state.snapshot();

    return {
      generatedAt: new Date(),
      totalMessagesObserved: memory.publishedCount(),
      totalMessagesRouted: memory.routedCount(),
      queueDepth,
      invalidMessagesBlocked: blockedCount,
      lastMessageId: snapshot.lastMessageId,
      healthy: queueDepth === 0 && blockedCount === snapshot.invalidMessagesBlocked,
    };
  }
}
