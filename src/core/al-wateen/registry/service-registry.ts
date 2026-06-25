/**
 * Service registry for runtime subsystem discovery.
 */

export interface ServiceRegistration<TService> {
  readonly serviceId: string;
  readonly type: string;
  readonly service: TService;
  readonly registeredAt: number;
}

export class ServiceRegistry {
  private readonly registrations = new Map<string, ServiceRegistration<unknown>>();

  public register<TService>(entry: ServiceRegistration<TService>): void {
    this.registrations.set(entry.serviceId, entry as ServiceRegistration<unknown>);
  }

  public unregister(serviceId: string): void {
    this.registrations.delete(serviceId);
  }

  public get<TService>(serviceId: string): TService | undefined {
    const entry = this.registrations.get(serviceId);
    if (!entry) {
      return undefined;
    }

    return entry.service as TService;
  }

  public listByType<TService>(type: string): readonly ServiceRegistration<TService>[] {
    const result: ServiceRegistration<TService>[] = [];
    for (const entry of this.registrations.values()) {
      if (entry.type === type) {
        result.push(entry as ServiceRegistration<TService>);
      }
    }
    return result;
  }

  public listAll(): readonly ServiceRegistration<unknown>[] {
    return Array.from(this.registrations.values());
  }

  public size(): number {
    return this.registrations.size;
  }
}
