/**
 * AZMA OS – Al-Wateen Assistant
 * File: restart-engine.ts
 *
 * Component restart and recovery.
 */

import { ILogger } from '../utils/logger';

export interface RestartableComponent {
  readonly componentId: string;
  readonly componentType: string;
  restart(): Promise<boolean>;
  isRestartable(): boolean;
}

export interface RestartEngine {
  registerComponent(component: RestartableComponent): void;
  unregisterComponent(componentId: string): void;
  restartComponent(componentId: string): Promise<boolean>;
  restartMultiple(componentIds: string[]): Promise<Map<string, boolean>>;
}

export class AlWateenRestartEngine implements RestartEngine {
  private components: Map<string, RestartableComponent> = new Map();

  constructor(private readonly logger: ILogger) {
    this.logger.info('AlWateenRestartEngine', 'Initialized');
  }

  public registerComponent(component: RestartableComponent): void {
    this.components.set(component.componentId, component);
  }

  public unregisterComponent(componentId: string): void {
    this.components.delete(componentId);
  }

  public async restartComponent(componentId: string): Promise<boolean> {
    const component = this.components.get(componentId);

    if (!component) {
      this.logger.warn('AlWateenRestartEngine', `Component not found: ${componentId}`);
      return false;
    }

    if (!component.isRestartable()) {
      this.logger.warn('AlWateenRestartEngine', `Component not restartable: ${componentId}`);
      return false;
    }

    try {
      this.logger.info('AlWateenRestartEngine', `Restarting component: ${componentId}`, {
        type: component.componentType
      });

      const success = await component.restart();

      if (success) {
        this.logger.info('AlWateenRestartEngine', `Component restarted successfully: ${componentId}`);
      } else {
        this.logger.warn('AlWateenRestartEngine', `Component restart failed: ${componentId}`);
      }

      return success;
    } catch (error) {
      this.logger.error(
        'AlWateenRestartEngine',
        `Error restarting component: ${componentId}`,
        error instanceof Error ? error : undefined
      );
      return false;
    }
  }

  public async restartMultiple(componentIds: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const componentId of componentIds) {
      const success = await this.restartComponent(componentId);
      results.set(componentId, success);
    }

    return results;
  }
}
