/**
 * AZMA OS – Al-Wateen Assistant
 * File: assistant-runtime.ts
 *
 * Runtime management and operation of Al-Wateen Assistant.
 */

import { ILogger } from '../utils/logger';
import { BootstrappedServices } from './assistant-bootstrap';
import { AssistantStatus } from '../types/al-wateen.types';

export interface RuntimeOperation {
  execute(): Promise<void>;
}

export interface AssistantRuntime {
  getStatus(): AssistantStatus;
  isHealthy(): Promise<boolean>;
  executeOperation(operation: RuntimeOperation): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
}

export class AlWateenAssistantRuntime implements AssistantRuntime {
  private isPaused: boolean = false;

  constructor(
    private readonly services: BootstrappedServices,
    private readonly logger: ILogger = services.logger
  ) {
    this.logger.info('AlWateenAssistantRuntime', 'Initialized');
  }

  public getStatus(): AssistantStatus {
    return this.services.state.getAssistantStatus();
  }

  public async isHealthy(): Promise<boolean> {
    try {
      const snapshot = this.services.monitoring.captureSnapshot();
      return snapshot.activeAlerts.length === 0;
    } catch (error) {
      this.logger.error(
        'AlWateenAssistantRuntime',
        'Error checking health',
        error instanceof Error ? error : undefined
      );
      return false;
    }
  }

  public async executeOperation(operation: RuntimeOperation): Promise<void> {
    if (this.isPaused) {
      throw new Error('Runtime is paused');
    }

    try {
      await operation.execute();
    } catch (error) {
      this.logger.error(
        'AlWateenAssistantRuntime',
        'Error executing operation',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }

  public async pause(): Promise<void> {
    this.isPaused = true;
    this.services.state.setAssistantStatus(AssistantStatus.PAUSED);
    this.logger.info('AlWateenAssistantRuntime', 'Runtime paused');
  }

  public async resume(): Promise<void> {
    this.isPaused = false;
    this.services.state.setAssistantStatus(AssistantStatus.RUNNING);
    this.logger.info('AlWateenAssistantRuntime', 'Runtime resumed');
  }

  public getServices(): BootstrappedServices {
    return this.services;
  }
}
