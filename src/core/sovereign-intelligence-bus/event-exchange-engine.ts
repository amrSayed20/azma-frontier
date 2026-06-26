import { SovereignBusMessage } from './intelligence-message-contracts';

export class EventExchangeEngine {
  private readonly queue: SovereignBusMessage[] = [];

  public publish(message: SovereignBusMessage): void {
    this.queue.push(message);
  }

  public drain(): readonly SovereignBusMessage[] {
    const batch = [...this.queue];
    this.queue.length = 0;
    return batch;
  }

  public depth(): number {
    return this.queue.length;
  }
}
