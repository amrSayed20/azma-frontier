/**
 * AZMA OS — The Awareness Engine learns where the Creator is standing.
 *
 * ─── WHAT THIS HOLDS SHUT ───────────────────────────────────────────────────
 *
 *   `AwarenessContext.chamber` was declared and never wired — its own comment
 *   said so: "Reserved for future integration — not yet wired to a real
 *   source." The engine that decides what a Creator may do did not know which
 *   Chamber they were in.
 *
 *   Wiring it creates one danger worth more than the feature: a pathname comes
 *   from the browser, and the browser is transport, never authority. If a path
 *   could name a Chamber directly, any crafted string would mint a sovereign
 *   identity.
 *
 *   So the resolver ASKS the registry — isChamberDestination, derived from
 *   CONTEXT_ROLES — rather than trusting the path. These tests are mostly
 *   about the refusals, because the acceptance is the easy half.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { resolveChamberFromPath } from '../resolve-chamber';
import { CHAMBER_DIRECTORY } from '@/src/constitutional-navigation';
import { CONTEXT_ROLES } from '@/src/core/tongue';

describe('a real Chamber resolves', () => {
  it('resolves every Chamber the Tongue defines — no more, no fewer', () => {
    // Derived from the registry, not from a list written here: a sixth
    // Chamber, or a renamed one, changes this test without anyone editing it.
    for (const entry of CHAMBER_DIRECTORY) {
      expect(resolveChamberFromPath(entry.pathname)).toBe(entry.chamber);
    }
    expect(CHAMBER_DIRECTORY).toHaveLength(
      Object.keys(CONTEXT_ROLES).filter((id) => id !== 'universal').length,
    );
  });

  it('a route nested inside a Chamber still stands in that Chamber', () => {
    const chamber = CHAMBER_DIRECTORY[0];
    expect(resolveChamberFromPath(`${chamber.pathname}/some/inner/route`)).toBe(chamber.chamber);
    expect(resolveChamberFromPath(`${chamber.pathname}?tab=gallery`)).toBe(chamber.chamber);
  });
});

describe('a place that is not a Chamber resolves to null, not to a guess', () => {
  /**
   * Null is an answer, not a failure. The Gate, /signup, the Foyer and the
   * High Council are legitimate places that are not Chambers, and a caller
   * must handle that rather than receive a sentinel it might mistake for one.
   */
  it('returns null for the Empire’s non-Chamber places', () => {
    for (const path of ['/', '/signup', '/login', '/imperial-foyer', '/subscribe', '/sovereign-high-council']) {
      expect(resolveChamberFromPath(path)).toBeNull();
    }
  });
});

describe('NO crafted string can mint a Chamber identity', () => {
  /**
   * The reason the resolver asks the registry instead of reading the path.
   * Each of these is a plausible attempt to make the browser the authority.
   */
  const FORGED = [
    ['a Chamber name with a suffix', '/qiyamah-chamber-x'],
    ['a Chamber name with a prefix', '/not-qiyamah-chamber'],
    ['traversal above a Chamber', '/../ras-amr'],
    ['a Chamber deeper in the path', '/anything/ras-amr'],
    ['a Chamber as a query value', '/?chamber=ras-amr'],
    ['a Chamber as a fragment', '/#ras-amr'],
    ['the non-Chamber sentinel itself', '/universal'],
    ['different case', '/RAS-AMR'],
    ['an invented sixth Chamber', '/sixth-chamber'],
    ['empty', ''],
    ['only slashes', '///'],
  ] as const;

  for (const [name, path] of FORGED) {
    it(`refuses ${name}`, () => {
      expect(resolveChamberFromPath(path)).toBeNull();
    });
  }

  it('refuses anything that is not a string', () => {
    for (const bad of [null, undefined, 42, {}, [], true]) {
      expect(resolveChamberFromPath(bad as unknown as string)).toBeNull();
    }
  });

  it('every answer it ever gives is a Chamber the Tongue defines', () => {
    const known = new Set(CHAMBER_DIRECTORY.map((e) => e.chamber));
    const probes = [
      ...CHAMBER_DIRECTORY.map((e) => e.pathname),
      ...FORGED.map(([, p]) => p),
      '/', '/signup', '/qiyamah-chamber/deep', '/universal',
    ];
    for (const probe of probes) {
      const resolved = resolveChamberFromPath(probe);
      if (resolved !== null) expect(known.has(resolved)).toBe(true);
    }
  });
});

describe('no second Chamber vocabulary was introduced', () => {
  /**
   * Two path-to-Chamber mechanisms already exist — chamber-directory derives
   * the five from CONTEXT_ROLES, route-context hardcodes them in a Set. This
   * resolver must build on the derived one, so the Empire does not acquire a
   * third list that can drift from the Tongue.
   */
  it('the resolver is built on the derived registry', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/imperial-awareness-engine/resolve-chamber.ts'),
      'utf8',
    );
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).toContain('isChamberDestination');
    // No hand-written Chamber id may appear in the resolver's own code.
    for (const entry of CHAMBER_DIRECTORY) {
      expect(code).not.toContain(`'${entry.chamber}'`);
    }
  });
});

describe('the resolver has a real consumer on a real journey', () => {
  /**
   * Verification of the first deployment found the resolver built, exported
   * and tested — and called by nobody at runtime. AwarenessContext.chamber was
   * carried through ButtonContext and populated by no call site, which is
   * authority without a consumer: the exact shape the Construction Mandate
   * forbids. This holds the wiring shut: the one call site that stands inside
   * a Chamber must ask the resolver for the real pathname's answer.
   */
  it('the Chamber call site passes the resolved Chamber into Awareness', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/qiyamah-chamber/QiyamahChamberClient.tsx'),
      'utf8',
    );
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).toContain('resolveChamberFromPath(usePathname())');
    // Every chamber-threshold resolution carries it — none is left blind.
    const chamberCalls = code.match(/resolveAvailableActions\(\{ threshold: 'chamber'[^}]*\}/g) ?? [];
    expect(chamberCalls.length).toBeGreaterThan(0);
    for (const call of chamberCalls) expect(call).toContain('chamber');
    // And no Chamber id is written by hand there: the registry answers, not the page.
    for (const entry of CHAMBER_DIRECTORY) {
      expect(code).not.toContain(`chamber: '${entry.chamber}'`);
    }
  });
});
