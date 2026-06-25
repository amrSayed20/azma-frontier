/**
 * AZMA OS – Al-Wateen Assistant
 * File: provider-manager.ts
 *
 * AI provider management and coordination.
 */

import { AIProvider, ProviderStatus } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';
import { AlWateenProviderHealthMonitor } from './provider-health';
import { ProviderSelector } from './provider-selection';

export interface ProviderManager {
  registerProvider(provider: AIProvider): void;
  unregisterProvider(providerId: string): void;
  getProvider(providerId: string): AIProvider | undefined;
  getAllProviders(): readonly AIProvider[];
  selectProvider(): AIProvider | undefined;
  updateProviderStatus(providerId: string, status: ProviderStatus): void;
}

export class AlWateenProviderManager implements ProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private healthMonitor: AlWateenProviderHealthMonitor;
  private selector: ProviderSelector;

  constructor(private readonly logger: ILogger) {
    this.healthMonitor = new AlWateenProviderHealthMonitor(logger);
    this.selector = new ProviderSelector();
    this.logger.info('AlWateenProviderManager', 'Initialized');
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.providerId, provider);
    this.logger.info('AlWateenProviderManager', `Provider registered: ${provider.providerId}`, {
      name: provider.name,
      type: provider.type
    });
  }

  public unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
    this.logger.info('AlWateenProviderManager', `Provider unregistered: ${providerId}`);
  }

  public getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  public getAllProviders(): readonly AIProvider[] {
    return Array.from(this.providers.values());
  }

  public selectProvider(): AIProvider | undefined {
    const providers = Array.from(this.providers.values());
    return this.selector.selectProvider(providers);
  }

  public updateProviderStatus(providerId: string, status: ProviderStatus): void {
    const provider = this.providers.get(providerId);

    if (provider) {
      const updated: AIProvider = {
        ...provider,
        status
      };

      this.providers.set(providerId, updated);
      this.logger.debug('AlWateenProviderManager', `Provider status updated: ${providerId}`, {
        newStatus: status
      });
    }
  }

  public getHealthMonitor(): AlWateenProviderHealthMonitor {
    return this.healthMonitor;
  }

  public getSelector(): ProviderSelector {
    return this.selector;
  }
}
