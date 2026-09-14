/**
 * AZMA OS — Al Hujjah Al-Damighah
 * The Intelligence Composition Factory.
 *
 * The sovereign bootstrap boundary for the Intelligence Chamber.
 * Wires the Ministry Registry, attaches launch providers to their Ministries,
 * builds the RepositoryManager, and yields a Singleton IntelligenceEngine.
 *
 * ─── MINISTRY → PROVIDER MAP (current) ──────────────────────────────────────
 *
 *   ministry-human-knowledge       → SovereignScriptureProvider (real HTTP, the Qur'an, Arabic)
 *                                  → GutenbergProvider (real HTTP, 50K+ books with full text)
 *                                  → OpenLibraryProvider (real HTTP, 20M+ books with descriptions)
 *   ministry-business-intelligence → GoogleTrendsProvider (real HTTP)
 *                                  → HackerNewsProvider (real HTTP)
 *   ministry-media-intelligence    → WikipediaProvider (real HTTP)
 *                                  → ArabicWikipediaProvider (real HTTP)
 *   all other Ministries           → deferred (return empty results honestly)
 *
 *   Every repository here holds English text except the Arabic Wikipedia and the
 *   Qur'an, so an Arabic question reaches them through the language bridge in
 *   sovereign-language-bridge.ts. Without it the library stays silent. The two
 *   Arabic sources receive the Creator's own words instead, carried alongside
 *   the rendering as IRepositoryProvider.search()'s nativeQuery.
 *
 * ─── HOW TO ADD A PROVIDER ───────────────────────────────────────────────────
 *
 *   1. Create the provider in providers/ implementing IRepositoryProvider.
 *   2. Import it here.
 *   3. Call registry.attachProvider(ministryId, new YourProvider()).
 *   No other changes needed. Constitutional chain is unaffected.
 */

import { IntelligenceEngine } from './core/intelligence-engine';
import { GutenbergProvider } from './providers/gutenberg-provider';
import { OpenLibraryProvider } from './providers/open-library-provider';
import { GoogleTrendsProvider } from './providers/google-trends-provider';
import { HackerNewsProvider } from './providers/hacker-news-provider';
import { WikipediaProvider } from './providers/wikipedia-provider';
import { ArabicWikipediaProvider } from './providers/arabic-wikipedia-provider';
import { SovereignScriptureProvider } from './providers/sovereign-scripture-provider';
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
    // The Qur'an, asked in Arabic. The Founder's standing rule is that for
    // religious content it is the sole authority; until now the chamber had no
    // access to it at all and answered a question about أصحاب الكهف out of an
    // English media catalogue. No ninth Ministry was created to hold it — the
    // eight are constitutional and not mine to extend — so it sits under the
    // Ministry the library sits under, and whether revelation warrants a
    // Ministry of its own is raised with the Founder rather than decided here.
    registry.attachProvider('ministry-human-knowledge', new SovereignScriptureProvider());
    registry.attachProvider('ministry-human-knowledge', new GutenbergProvider());
    registry.attachProvider('ministry-human-knowledge', new OpenLibraryProvider());
    registry.attachProvider('ministry-business-intelligence', new GoogleTrendsProvider());
    registry.attachProvider('ministry-business-intelligence', new HackerNewsProvider());
    // Reddit is detached, not disabled. Measured from the production server it
    // answers 403 in 32ms to every request, browser User-Agent included — the
    // public JSON endpoint refuses this host outright. Leaving it attached
    // meant every investigation paid a round trip for a provider that could
    // never contribute a single piece of evidence.
    registry.attachProvider('ministry-media-intelligence', new WikipediaProvider());
    registry.attachProvider('ministry-media-intelligence', new ArabicWikipediaProvider());

    // 3. Build the RepositoryManager through the Ministry layer
    const repositoryManager = registry.buildRepositoryManager();

    // 4. Assemble and seal the Engine
    this.activeEngineInstance = new IntelligenceEngine(repositoryManager);

    console.log('[Hujjah Al-Damighah] Intelligence Engine Wiring Complete and ONLINE.');

    return this.activeEngineInstance;
  }
}