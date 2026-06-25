/**
 * Health check contracts and registry.
 */

import { HealthCheckResult } from '../types/al-wateen.types';

export interface HealthCheckProvider {
  readonly component: string;
  run(): Promise<HealthCheckResult>;
}

export class HealthCheckRegistry {
  private readonly providers = new Map<string, HealthCheckProvider>();

  public register(provider: HealthCheckProvider): void {
    this.providers.set(provider.component, provider);
  }

  public unregister(component: string): void {
    this.providers.delete(component);
  }

  public list(): readonly HealthCheckProvider[] {
    return Array.from(this.providers.values());
  }
}
