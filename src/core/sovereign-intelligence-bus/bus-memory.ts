import { RoutedBusMessage, SovereignBusMessage } from './intelligence-message-contracts';

export class BusMemory {
  private readonly published: SovereignBusMessage[] = [];
  private readonly routed: RoutedBusMessage[] = [];

  public storePublished(message: SovereignBusMessage): void {
    this.published.push(message);
  }

  public storeRouted(message: RoutedBusMessage): void {
    this.routed.push(message);
  }

  public recentPublished(limit: number = 20): readonly SovereignBusMessage[] {
    return this.published.slice(-Math.max(0, limit));
  }

  public recentRouted(limit: number = 20): readonly RoutedBusMessage[] {
    return this.routed.slice(-Math.max(0, limit));
  }

  public publishedCount(): number {
    return this.published.length;
  }

  public routedCount(): number {
    return this.routed.length;
  }
}
