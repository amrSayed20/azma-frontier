/**
 * AZMA OS – Al-Wateen Assistant
 * File: health-checks.ts
 *
 * Health check implementations and interfaces.
 */

import { HealthCheck, HealthCheckStatus } from '../types/al-wateen.types';

export interface HealthCheckFunction {
  (componentId: string): Promise<HealthCheck>;
}

export interface HealthCheckProvider {
  getCheckName(): string;
  execute(componentId: string): Promise<HealthCheck>;
}

export class BasicHealthCheck implements HealthCheckProvider {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getCheckName(): string {
    return this.name;
  }

  public async execute(componentId: string): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      await this.performCheck(componentId);
      const duration = Date.now() - startTime;

      return {
        name: this.name,
        passed: true,
        duration,
        message: 'Health check passed',
        timestamp: Date.now()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);

      return {
        name: this.name,
        passed: false,
        duration,
        message: `Health check failed: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  protected async performCheck(componentId: string): Promise<void> {
    // Base implementation
  }
}

export class ConnectionHealthCheck extends BasicHealthCheck {
  constructor(private readonly testConnection: (componentId: string) => Promise<boolean>) {
    super('ConnectionCheck');
  }

  protected async performCheck(componentId: string): Promise<void> {
    const connected = await this.testConnection(componentId);
    if (!connected) {
      throw new Error('Connection test failed');
    }
  }
}

export class ResourceHealthCheck extends BasicHealthCheck {
  constructor(
    private readonly getResourceUsage: (componentId: string) => Promise<number>,
    private readonly maxUsage: number = 0.9
  ) {
    super('ResourceCheck');
  }

  protected async performCheck(componentId: string): Promise<void> {
    const usage = await this.getResourceUsage(componentId);
    if (usage > this.maxUsage) {
      throw new Error(`Resource usage ${(usage * 100).toFixed(2)}% exceeds threshold ${(this.maxUsage * 100).toFixed(2)}%`);
    }
  }
}

export class ResponseTimeHealthCheck extends BasicHealthCheck {
  constructor(
    private readonly measureResponseTime: (componentId: string) => Promise<number>,
    private readonly maxResponseTime: number = 1000
  ) {
    super('ResponseTimeCheck');
  }

  protected async performCheck(componentId: string): Promise<void> {
    const responseTime = await this.measureResponseTime(componentId);
    if (responseTime > this.maxResponseTime) {
      throw new Error(`Response time ${responseTime}ms exceeds threshold ${this.maxResponseTime}ms`);
    }
  }
}

export class HealthCheckRegistry {
  private checks: Map<string, HealthCheckProvider> = new Map();

  public register(name: string, check: HealthCheckProvider): void {
    this.checks.set(name, check);
  }

  public unregister(name: string): void {
    this.checks.delete(name);
  }

  public get(name: string): HealthCheckProvider | undefined {
    return this.checks.get(name);
  }

  public getAll(): HealthCheckProvider[] {
    return Array.from(this.checks.values());
  }

  public async runAll(componentId: string): Promise<HealthCheck[]> {
    const checks = Array.from(this.checks.values());
    return Promise.all(checks.map(check => check.execute(componentId)));
  }

  public async runSpecific(componentId: string, checkNames: string[]): Promise<HealthCheck[]> {
    const checks = checkNames
      .map(name => this.checks.get(name))
      .filter((check): check is HealthCheckProvider => check !== undefined);

    return Promise.all(checks.map(check => check.execute(componentId)));
  }
}
