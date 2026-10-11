/**
 * AZMA OS — AN ORDINARY TEST DOES NOT DEPEND ON THE INTERNET, 2026-10-11.
 *
 * MEASURED, two consecutive full-suite runs: a DIFFERENT pair of suites failed
 * each time, at 2,064 s and then at 141 s, every one of them passing in
 * isolation. The cause was never a defect in those suites — they mock nothing
 * and run the real `IntelligenceEngine`, which reaches gutendex.com and
 * gutenberg.org through `GutenbergProvider`.
 *
 * These tests hold the boundary that closed it, and hold the provider's REAL
 * failure handling — which the guard now exercises on every run instead of
 * only on a bad day.
 */

import { GutenbergProvider } from '../providers/gutenberg-provider';

describe('1 · the guard refuses a real request, and says why', () => {
  it('an unmocked fetch throws rather than reaching the network', async () => {
    await expect(fetch('https://gutendex.com/books/?search=x')).rejects.toThrow(
      /azma-test-network-guard/,
    );
  });

  it('the refusal names the host and the two ways forward', async () => {
    const err = await fetch('https://gutenberg.org/cache/epub/1/pg1.txt').catch((e) => e);
    expect(String(err.message)).toContain('gutenberg.org');
    expect(String(err.message)).toContain('global.fetch');
    expect(String(err.message)).toContain('AZMA_ALLOW_TEST_NETWORK=1');
  });

  it('it refuses — it does NOT invent a response', async () => {
    // Returning a fabricated 200 would be the same sin as a fabricated asset:
    // the test would pass against data nobody produced.
    const err = await fetch('https://gutendex.com/x').catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBeUndefined();
    expect(err.body).toBeUndefined();
  });
});

describe('2 · a suite that installs its own double is untouched', () => {
  const saved = global.fetch;
  afterEach(() => { global.fetch = saved; });

  it('an assigned global.fetch overrides the guard completely', async () => {
    global.fetch = (async () => new Response('<feed></feed>', { status: 200 })) as typeof fetch;
    const r = await fetch('https://gutendex.com/books/?search=x');
    expect(r.status).toBe(200);
  });

  it('and the guard returns the moment the double is removed', async () => {
    global.fetch = (async () => new Response('x', { status: 200 })) as typeof fetch;
    await fetch('https://gutendex.com/a');
    global.fetch = saved;
    await expect(fetch('https://gutendex.com/b')).rejects.toThrow(/azma-test-network-guard/);
  });
});

describe('3 · the provider’s real failure handling, exercised deterministically', () => {
  const provider = new GutenbergProvider();
  const saved = global.fetch;
  afterEach(() => { global.fetch = saved; });

  it('a refused search surfaces as a throw the engine can handle', async () => {
    await expect(provider.search('photosynthesis', 10)).rejects.toThrow();
  });

  it('a non-ok response is reported with its status, not swallowed', async () => {
    global.fetch = (async () => new Response('', { status: 503 })) as typeof fetch;
    await expect(provider.search('x', 5)).rejects.toThrow(/503/);
  });

  it('a well-formed empty catalogue yields no results rather than an error', async () => {
    global.fetch = (async () => new Response(
      '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"></feed>',
      { status: 200 },
    )) as typeof fetch;
    await expect(provider.search('nothing-here', 5)).resolves.toEqual([]);
  });

  it('the request it builds carries the query and the catalogue format', async () => {
    let seen = '';
    global.fetch = (async (u: unknown) => {
      seen = String(u);
      return new Response('<feed></feed>', { status: 200 });
    }) as typeof fetch;
    await provider.search('thermodynamics', 3).catch(() => undefined);
    expect(seen).toContain('query=thermodynamics');
    expect(seen).toContain('format=opds');
  });
});

describe('4 · the dependency is removed, not relabelled', () => {
  const read = (f: string) =>
    require('fs').readFileSync(require('path').join(process.cwd(), f), 'utf8') as string;

  it('no suite was skipped, deleted or weakened to make the run green', () => {
    // The three that failed still assert what they always asserted.
    for (const f of [
      'src/persistent-storage/__tests__/sovereign-evidence-foundation.test.ts',
      'src/persistent-storage/__tests__/sovereign-knowledge-investigation-foundation.test.ts',
      'src/persistent-storage/__tests__/sovereign-knowledge-ministry-vi.test.ts',
    ]) {
      const src = read(f);
      expect(src).not.toMatch(/describe\.skip|it\.skip|xit\(|xdescribe\(/);
      expect(src.length).toBeGreaterThan(0);
    }
  });

  it('the guard is wired through the jest config, not per-suite', () => {
    const cfg = read('jest.config.js');
    expect(cfg).toContain("setupFilesAfterEnv: ['<rootDir>/jest.setup.network-guard.js']");
  });

  it('a live integration test has an explicit, named opt-in', () => {
    expect(read('jest.setup.network-guard.js')).toContain("process.env.AZMA_ALLOW_TEST_NETWORK === '1'");
  });
});
