export interface InteractionEvent {
  id: string;
  topic: string;
  action: 'search' | 'extract' | 'export' | 'bookmark';
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export class InteractionLogger {
  private static logs: InteractionEvent[] = [];

  public static log(topic: string, action: InteractionEvent['action'], metadata: Record<string, unknown> = {}): void {
    const event: InteractionEvent = {
      id: crypto.randomUUID(),
      topic,
      action,
      metadata,
      timestamp: new Date(),
    };
    
    this.logs.push(event);
  }

  public static getLogs(): InteractionEvent[] {
    return [...this.logs];
  }
}