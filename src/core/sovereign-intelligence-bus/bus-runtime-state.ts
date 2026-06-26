import { BusRuntimeSnapshot } from './intelligence-message-contracts';

export class BusRuntimeState {
  private totalPublishedMessages = 0;
  private totalRoutedMessages = 0;
  private totalSynchronizationCycles = 0;
  private invalidMessagesBlocked = 0;
  private lastMessageId?: string;
  private lastSynchronizationAt?: Date;

  public recordPublished(messageId: string): void {
    this.totalPublishedMessages += 1;
    this.lastMessageId = messageId;
  }

  public recordRouted(): void {
    this.totalRoutedMessages += 1;
  }

  public recordSynchronizationCycle(timestamp: Date): void {
    this.totalSynchronizationCycles += 1;
    this.lastSynchronizationAt = timestamp;
  }

  public recordBlocked(): void {
    this.invalidMessagesBlocked += 1;
  }

  public snapshot(): BusRuntimeSnapshot {
    return {
      totalPublishedMessages: this.totalPublishedMessages,
      totalRoutedMessages: this.totalRoutedMessages,
      totalSynchronizationCycles: this.totalSynchronizationCycles,
      invalidMessagesBlocked: this.invalidMessagesBlocked,
      lastMessageId: this.lastMessageId,
      lastSynchronizationAt: this.lastSynchronizationAt,
    };
  }
}
