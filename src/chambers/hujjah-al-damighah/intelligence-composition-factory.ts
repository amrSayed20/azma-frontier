/**
 * AZMA OS — Al Hujjah Al-Damighah
 * The Intelligence Composition Factory.
 *
 * The sovereign bootstrap boundary for the Intelligence Chamber.
 * Wires the Ministry Registry, attaches launch providers to their Ministries,
 * builds the RepositoryManager, and yields a Singleton IntelligenceEngine.
 *
 * PACKAGE XV UPDATE (Knowledge Ministries Foundation):
 *   Providers are no longer registered directly on the RepositoryManager.
 *   They are attached to constitutional Ministries via MinistryRegistry.
 *   MinistryRegistry.buildRepositoryManager() produces a RepositoryManager
 *   whose registered providers are Ministry wrappers — each carrying the
 *   Ministry's constitutional ID as their providerId.
 *
 *   Evidence items produced by Investigation now carry
 *   evidence.sourceProvider = 'ministry-human-knowledge' (not 'gutenberg').
 *   Replacing GutenbergProvider with a real HTTP client requires only a change
 *   to the attachProvider() call below — zero changes to the constitutional chain.
 */

import { IntelligenceEngine } from './core/intelligence-engine';
import { GutenbergProvider } from './providers/gutenberg-provider';
import { MinistryRegistry } from './ministries/ministry-registry';

export class IntelligenceCompositionFactory {
  private static activeEngineInstance: IntelligenceEngine | null = null;

  /**
   * Bootstraps and retrieves the fully configured Intelligence Engine.
   * Enforces a strict Singleton pattern to preserve memory and operational state.
   *
   * @returns A production-ready IntelligenceEngine backed by the Ministry architecture.
   */
  public static getEngine(): IntelligenceEngine {
    if (this.activeEngineInstance) {
      return this.activeEngineInstance;
    }

    console.log('[Hujjah Al-Damighah] Bootstrapping Intelligence Chamber...');

    // 1. Declare all 8 constitutional Ministries
    const registry = new MinistryRegistry();

    // 2. Attach launch providers to their Ministries
    //    Human Knowledge: GutenbergProvider (simulated; real HTTP deferred)
    //    All other Ministries: providers deferred to Knowledge Sources phase
    registry.attachProvider('ministry-human-knowledge', new GutenbergProvider());

    // 3. Build the RepositoryManager through the Ministry layer
    const repositoryManager = registry.buildRepositoryManager();

    // 4. Assemble and seal the Engine
    this.activeEngineInstance = new IntelligenceEngine(repositoryManager);

    console.log('[Hujjah Al-Damighah] Intelligence Engine Wiring Complete and ONLINE.');

    return this.activeEngineInstance;
  }
}