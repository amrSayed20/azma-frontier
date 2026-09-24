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
import { SovereignLibraryProvider } from './providers/sovereign-library-provider';
import { OpenLibraryProvider } from './providers/open-library-provider';
import { GutenbergProvider } from './providers/gutenberg-provider';
import { GoogleTrendsProvider } from './providers/google-trends-provider';
import { HackerNewsProvider } from './providers/hacker-news-provider';
import { WikipediaProvider } from './providers/wikipedia-provider';
import { ArabicWikipediaProvider } from './providers/arabic-wikipedia-provider';
import { SovereignScriptureProvider } from './providers/sovereign-scripture-provider';
import { HadithProvider } from './providers/hadith-provider';
import { TafsirProvider } from './providers/tafsir-provider';
import { MedicalLiteratureProvider } from './providers/medical-literature-provider';
import { TransmittedProvider } from './providers/transmitted-provider';
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
    // The nine collections of the Sunnah, in Arabic. The three Hadith
    // authorities the Founder named all refuse this host — measured 403, 403,
    // and a challenge page — so the collections are reached by a route that
    // answers, and the refusals stay recorded in the source registry so the
    // Creator learns a named authority was consulted and could not be reached.
    // Still the eighth Ministry: a standing was added, not a Ministry.
    registry.attachProvider('ministry-human-knowledge', new HadithProvider());
    // The medical layer. A doctor explaining an operation was answered from a
    // general encyclopedia; the hierarchy of clinical evidence is now read from
    // what each record's publisher declared it to be. Under the Ministry of
    // Scientific Knowledge, which had no provider at all until now — still the
    // eighth Ministry, no ninth.
    // Six Arabic commentaries. The Founder asked why an Arabic library would be
    // needed; the honest answer is that it is not — these were measured hours
    // earlier while searching for Isra'iliyyat and then left unconnected, and
    // the chamber answered questions about the stories of the Prophets from an
    // English encyclopedia while they sat reachable and unasked. A commentary
    // is DOCUMENTED, never SCRIPTURE: it is a scholar's reading of a verse, not
    // the verse, and «التفسير مرجعه أهله».
    registry.attachProvider('ministry-human-knowledge', new TafsirProvider());
    registry.attachProvider('ministry-scientific-knowledge', new MedicalLiteratureProvider());
    // What «الإسرائيليات» was drawn from, searched for and added at the
    // Founder's instruction. It carries provenance and refuses classification:
    // see providers/transmitted-provider.ts for what was measured first.
    registry.attachProvider('ministry-human-knowledge', new TransmittedProvider());
    // The library, indexed by the Empire itself. Its old provider asked an
    // index service that answers 403 to this host, and for weeks a blocked
    // route was mistaken for a poor library — so the chamber searched the
    // outside world for 78,130 volumes it already owned. It reads 200KB of a
    // book now and finds the passage that bears on the question, rather than
    // handing back a title page.
    registry.attachProvider('ministry-human-knowledge', new SovereignLibraryProvider());
    registry.attachProvider('ministry-human-knowledge', new OpenLibraryProvider());
    // ── THE OLD BOOKS, RESTORED AT THE FOUNDER'S INSTRUCTION ─────────────
    //
    //   GutenbergProvider was built, kept, and never attached. The comment
    //   at the head of OpenLibraryProvider says it «replaces» Gutenberg for
    //   being English-only — and the replacement is not equivalent: Open
    //   Library is a CATALOGUE, answering with titles, subjects and a first
    //   sentence. Gutenberg is a CORPUS, answering with the text of the book
    //   itself. Evidence is extracted from text; a catalogue record has none
    //   to give.
    //
    //   English-only was never the obstacle it was taken for: the chamber
    //   already renders an Arabic question into the terms an English
    //   catalogue indexes (toSearchLanguage in sovereign-language-bridge),
    //   which exists precisely so that libraries like this one can be asked.
    //
    //   Its standing is already ruled on and unchanged: `gutenberg` sits in
    //   DOCUMENTED_SOURCE_KEYS, never in SCRIPTURE. So a very old book reaches
    //   the Creator as something recounted — the hedged register the chamber
    //   reserves for what is transmitted rather than established. That is
    //   exactly what old histories and old religious tales are, and stating
    //   them any more firmly than that would be the error.
    registry.attachProvider('ministry-human-knowledge', new GutenbergProvider());
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