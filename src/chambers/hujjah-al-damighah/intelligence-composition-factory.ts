 /**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/intelligence-composition-factory.ts
 * * The Intelligence Composition Factory.
 * Acts as the sovereign dependency injection container for the chamber.
 * Wires the Repository Manager, registers all physical data providers, 
 * and yields a production-ready Singleton instance of the Intelligence Engine.
 */

import { IntelligenceEngine } from './core/intelligence-engine';
import { RepositoryManager } from './core/repository-manager';
import { GutenbergProvider } from './providers/gutenberg-provider';

export class IntelligenceCompositionFactory {
  private static activeEngineInstance: IntelligenceEngine | null = null;

  /**
   * Bootstraps and retrieves the fully configured Intelligence Engine.
   * Enforces a strict Singleton pattern to preserve memory and operational state.
   * * @returns A production-ready IntelligenceEngine.
   */
  public static getEngine(): IntelligenceEngine {
    if (this.activeEngineInstance) {
      return this.activeEngineInstance;
    }

    console.log('[Hujjah Al-Damighah] Bootstrapping Intelligence Chamber...');

    // 1. Ignite the routing core using Phase 9 architecture
    const repositoryManager = new RepositoryManager();

    // 2. Instantiate and mount physical data providers
    const gutenbergProvider = new GutenbergProvider();
    repositoryManager.registerProvider(gutenbergProvider);

    // 3. Assemble and seal the Engine
    this.activeEngineInstance = new IntelligenceEngine(repositoryManager);

    console.log('[Hujjah Al-Damighah] Intelligence Engine Wiring Complete and ONLINE.');

    return this.activeEngineInstance;
  }
}