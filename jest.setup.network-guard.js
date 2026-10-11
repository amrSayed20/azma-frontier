/**
 * AZMA OS — NO ORDINARY TEST REACHES THE INTERNET
 *
 * ─── THE DEFECT THIS CLOSES ─────────────────────────────────────────────────
 *
 *   MEASURED 2026-10-11, two consecutive full-suite runs:
 *
 *     run 1   sovereign-evidence-foundation              2,064 s   FAIL
 *             sovereign-knowledge-investigation-…        2,070 s   FAIL
 *     run 2   sovereign-evidence-foundation                141 s   FAIL
 *             sovereign-knowledge-ministry-vi              138 s   FAIL
 *
 *   Different suites each run. Each one passes in isolation. None imports any
 *   file the work of that day touched. The cause is not a defect in them: they
 *   mock NOTHING — zero `global.fetch` assignments, zero `jest.mock` — and
 *   then run the real `IntelligenceEngine`, which calls real ministries, which
 *   call `GutenbergProvider.search()` → a real `fetch()` to gutendex.com and
 *   gutenberg.org. Under load those requests queue past the suite's own
 *   `jest.setTimeout(30000)`.
 *
 *   `jest.config.js` already carried the workaround — `maxWorkers: 2`, with a
 *   comment naming "simultaneous real-HTTP requests … (Wikipedia, Reddit,
 *   Gutenberg), which causes rate-limiting (HTTP 429)". Throttling the workers
 *   made it rarer. It did not make it deterministic, because the dependency
 *   was never removed.
 *
 * ─── WHAT THIS DOES, AND WHAT IT REFUSES TO DO ──────────────────────────────
 *
 *   `global.fetch` is replaced with one that REFUSES, loudly and by name. It
 *   does not return a fabricated body, a fake 200, or an empty result that
 *   could be mistaken for a real answer — inventing a response is the same sin
 *   as inventing an asset. It refuses, and the code under test exercises its
 *   own real failure handling, which is a path worth testing anyway.
 *
 *   A suite that installs its own `global.fetch` overrides this completely:
 *   fourteen already do, and not one of them is affected.
 *
 *   A test that genuinely needs the network opts in EXPLICITLY:
 *
 *       AZMA_ALLOW_TEST_NETWORK=1 npx jest path/to/live.test.ts
 *
 *   so a live integration test is a named, separate act — never something an
 *   ordinary unit test does by accident.
 */

const ALLOW = process.env.AZMA_ALLOW_TEST_NETWORK === '1';

if (!ALLOW) {
  const realFetch = global.fetch;

  /** Kept so a suite can restore the real one deliberately, never silently. */
  global.__azmaRealFetch = realFetch;

  global.fetch = async function azmaOfflineFetch(input) {
    const target = typeof input === 'string'
      ? input
      : (input && typeof input === 'object' && 'url' in input ? String(input.url) : String(input));
    const host = (() => {
      try { return new URL(target).host; } catch { return target.slice(0, 80); }
    })();

    throw new Error(
      `[azma-test-network-guard] Blocked a real network request to ${host}.\n`
      + '  An ordinary automated test must not depend on an external service: that is\n'
      + '  what made two suites fail nondeterministically on 2026-10-11, with a\n'
      + '  different pair failing on each run.\n'
      + '  · To test request construction, parsing, errors or timeouts, assign\n'
      + '    `global.fetch` in the suite — fourteen suites already do.\n'
      + '  · To run a genuine live integration test, opt in by name:\n'
      + '      AZMA_ALLOW_TEST_NETWORK=1 npx jest <path>',
    );
  };
}
