/**
 * A deadline that has nothing left to guard must not still be able to speak.
 *
 * ─── WHAT THIS COST ─────────────────────────────────────────────────────────
 *
 *   Promise.race does not cancel the loser. The deadline timer kept running
 *   after a provider had already answered and fired five seconds later
 *   announcing that the provider had "exceeded 5000ms" — for every provider, on
 *   every search, however fast it had been.
 *
 *   So a healthy investigation printed eight Ministries timing out in the same
 *   second, including the four Ministries that have no providers attached and
 *   return an empty array immediately. That reading was taken as evidence that
 *   the runtime itself was frozen, and an entire root cause was built on it —
 *   a root cause that did not exist.
 *
 *   A diagnostic that lies is worse than no diagnostic at all: it does not
 *   merely fail to help, it sends the next engineer somewhere false. These
 *   tests keep it honest.
 */

import { RepositoryManager, IRepositoryProvider } from '../core/repository-manager';
import type { RepositorySearchResult } from '../domain/evidence.types';
import type { SourceDocument } from '../core/evidence-extractor';

function provider(
  id: string,
  search: () => Promise<RepositorySearchResult[]>,
): IRepositoryProvider {
  return {
    providerId: id,
    search,
    async fetch(): Promise<SourceDocument> {
      return { id: 'd', provider: id, content: 'x' };
    },
  };
}

const oneResult = (id: string): RepositorySearchResult[] => [
  { id: 'r', provider: id, title: 't', snippet: 's', relevanceScore: 0.9 },
];

let warnings: string[];
let warnSpy: jest.SpyInstance;

beforeEach(() => {
  jest.useFakeTimers();
  warnings = [];
  warnSpy = jest.spyOn(console, 'warn').mockImplementation((msg: unknown) => {
    warnings.push(String(msg));
  });
});

afterEach(() => {
  warnSpy.mockRestore();
  jest.useRealTimers();
});

/** Lets pending microtasks settle while fake timers are installed. */
async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('a provider that answered', () => {
  it('is never reported as having exceeded the deadline', async () => {
    const manager = new RepositoryManager();
    manager.registerProvider(provider('fast', async () => oneResult('fast')));

    const results = await manager.searchAll('q', 5);
    expect(results).toHaveLength(1);

    // Five seconds pass. The timer that guarded this search is gone.
    jest.advanceTimersByTime(10_000);
    await settle();

    expect(warnings.filter((w) => w.includes('exceeded'))).toEqual([]);
  });

  it('is never reported even when it returned nothing', async () => {
    const manager = new RepositoryManager();
    manager.registerProvider(provider('empty', async () => []));

    await manager.searchAll('q', 5);
    jest.advanceTimersByTime(10_000);
    await settle();

    expect(warnings.filter((w) => w.includes('exceeded'))).toEqual([]);
  });

  it('leaves no timer behind for any of eight providers', async () => {
    const manager = new RepositoryManager();
    for (let i = 0; i < 8; i += 1) {
      manager.registerProvider(provider(`m${i}`, async () => []));
    }

    await manager.searchAll('q', 5);
    jest.advanceTimersByTime(10_000);
    await settle();

    // The exact shape of the false report: eight in the same second.
    expect(warnings.filter((w) => w.includes('exceeded'))).toEqual([]);
  });
});

describe('a provider that failed', () => {
  it('is reported as failed, and not also as having exceeded the deadline', async () => {
    const manager = new RepositoryManager();
    manager.registerProvider(provider('broken', async () => { throw new Error('down'); }));

    await manager.searchAll('q', 5);
    jest.advanceTimersByTime(10_000);
    await settle();

    expect(warnings.some((w) => w.includes('Search failed'))).toBe(true);
    expect(warnings.filter((w) => w.includes('exceeded'))).toEqual([]);
  });
});

describe('a provider that genuinely stalls', () => {
  it('is reported — the deadline still does its actual job', async () => {
    const manager = new RepositoryManager();
    manager.registerProvider(provider('stalled', () => new Promise(() => { /* never */ })));

    const pending = manager.searchAll('q', 5);
    jest.advanceTimersByTime(5_000);
    const results = await pending;

    expect(results).toEqual([]);
    expect(warnings.some((w) => w.includes('stalled') && w.includes('exceeded'))).toBe(true);
  });

  it('does not take the fast providers down with it', async () => {
    const manager = new RepositoryManager();
    manager.registerProvider(provider('stalled', () => new Promise(() => { /* never */ })));
    manager.registerProvider(provider('fast', async () => oneResult('fast')));

    const pending = manager.searchAll('q', 5);
    jest.advanceTimersByTime(5_000);
    const results = await pending;

    expect(results).toHaveLength(1);
    expect(results[0]!.provider).toBe('fast');
  });
});
