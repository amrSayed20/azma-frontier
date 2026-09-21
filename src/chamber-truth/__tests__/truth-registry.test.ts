/**
 * AZMA OS — The Chamber Truth Model must be true.
 *
 * ─── WHAT THIS HOLDS SHUT ───────────────────────────────────────────────────
 *
 *   A registry that says "this Chamber can do X" is worth less than nothing if
 *   X cannot be done: a guide derived from it would promise a Creator a
 *   capability that does not exist, which the Construction Mandate forbids in
 *   the strongest terms it uses.
 *
 *   So this file does not check that the registry is well-formed. It checks
 *   that every claim in it RESOLVES — the handler exists on disk, and exports
 *   the verbs the registry says it exports. When someone deletes a route, this
 *   fails and names it, instead of the Empire quietly beginning to lie.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { CHAMBER_TRUTH, getChamberTruth, getExercisableCapabilities } from '../truth-registry';
import { CHAMBER_DIRECTORY } from '@/src/constitutional-navigation';
import type { ChamberId } from '@/src/chamber-identity';

const ROOT = process.cwd();
const ALL = Object.values(CHAMBER_TRUTH);

/** Resolve a declared boundary to the file that must implement it. */
function boundaryFile(at: string, kind: 'route' | 'action'): string {
  return kind === 'route'
    ? join(ROOT, at, 'route.ts')
    : join(ROOT, at.split('#')[0]);
}

describe('every capability resolves to something that exists', () => {
  for (const truth of ALL) {
    for (const capability of truth.capabilities) {
      it(`${truth.chamberId} · ${capability.id} — its boundary is on disk`, () => {
        expect(existsSync(boundaryFile(capability.boundary.at, capability.boundary.kind))).toBe(true);
      });

      it(`${truth.chamberId} · ${capability.id} — the boundary exports what is claimed`, () => {
        const source = readFileSync(boundaryFile(capability.boundary.at, capability.boundary.kind), 'utf8');

        if (capability.boundary.kind === 'action') {
          // A Server Action: the named export must exist.
          const fn = capability.boundary.at.split('#')[1];
          expect(fn).toBeTruthy();
          expect(source).toMatch(new RegExp(`export\\s+async\\s+function\\s+${fn}\\b`));
          return;
        }

        // A route: the declared verbs must be EXACTLY the exported handlers.
        // Not a subset — live verification of the first deployment found
        // keep-canvas declaring POST while the handler also exported GET, an
        // under-claim a subset check is blind to. A model of what a Chamber
        // can do must be wrong in neither direction.
        expect(capability.boundary.methods?.length).toBeGreaterThan(0);
        const exported = [...source.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)]
          .map((m) => m[1])
          .sort();
        expect([...(capability.boundary.methods ?? [])].sort()).toEqual(exported);
      });
    }
  }
});

describe('the model covers the constitution exactly', () => {
  it('every Chamber the Tongue defines has a truth entry — and no other does', () => {
    const declared = Object.keys(CHAMBER_TRUTH).sort();
    const constitutional = CHAMBER_DIRECTORY.map((e) => e.chamber).sort();
    expect(declared).toEqual(constitutional);
  });

  it('no Chamber is silently empty', () => {
    for (const truth of ALL) {
      expect(truth.capabilities.length).toBeGreaterThan(0);
    }
  });

  it('capability ids are unique within a Chamber', () => {
    for (const truth of ALL) {
      const ids = truth.capabilities.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('a deferred responsibility is never offered', () => {
  /**
   * The rule that keeps a future guide honest: what the repository cannot do
   * is recorded as absent, never as a disabled capability. A disabled entry is
   * still an entry, and an interface that renders one has promised something.
   */
  it('nothing deferred appears among the capabilities', () => {
    for (const truth of ALL) {
      for (const deferred of truth.deferred) {
        for (const capability of truth.capabilities) {
          expect(capability.performs).not.toBe(deferred.responsibility);
        }
      }
    }
  });

  it('every deferred entry says where the constitution assigns it and what is missing', () => {
    for (const truth of ALL) {
      for (const deferred of truth.deferred) {
        expect(deferred.constitutionalSource.length).toBeGreaterThan(10);
        expect(deferred.missing.length).toBeGreaterThan(20);
      }
    }
  });

  it('رأس الأمر records that it has no real completion state', () => {
    // The specific gap that must never be enforced as an exit condition: doing
    // so would seal a Chamber a Creator cannot finish.
    const rasAmr = getChamberTruth('ras-amr');
    expect(rasAmr.deferred.some((d) => /completion state/i.test(d.missing))).toBe(true);
  });
});

describe('the Vault-empty distinction a guide cannot get wrong', () => {
  it('a Creator who owns nothing is not offered capabilities that need an asset', () => {
    for (const chamberId of Object.keys(CHAMBER_TRUTH) as ChamberId[]) {
      const offered = getExercisableCapabilities(chamberId, false);
      expect(offered.every((c) => !c.requiresExistingAsset)).toBe(true);
    }
  });

  it('a Creator who owns assets is offered everything the Chamber can do', () => {
    for (const chamberId of Object.keys(CHAMBER_TRUTH) as ChamberId[]) {
      expect(getExercisableCapabilities(chamberId, true)).toHaveLength(
        CHAMBER_TRUTH[chamberId].capabilities.length,
      );
    }
  });

  it('editing inside an asset requires an asset; generating one does not', () => {
    const qiyamah = getChamberTruth('qiyamah-chamber');
    const find = (id: string) => qiyamah.capabilities.find((c) => c.id === id)!;
    expect(find('edit-inside-asset').requiresExistingAsset).toBe(true);
    expect(find('generate-image').requiresExistingAsset).toBe(false);
  });
});

describe('this is an authority layer, not a second interface', () => {
  /**
   * The failure mode this model exists to prevent is becoming the thing it
   * replaced. A label, an icon or an order here would make it a UI definition
   * competing with presentation.
   */
  it('carries no presentation detail', () => {
    const source = readFileSync(join(ROOT, 'src/chamber-truth/types.ts'), 'utf8');
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    for (const forbidden of ['label', 'icon', 'colour', 'color', 'order', 'variant', 'className']) {
      expect(code.toLowerCase()).not.toContain(`readonly ${forbidden}`);
    }
  });
});

describe('no other capability list can be mistaken for the authority', () => {
  /**
   * Diwan Authority Closure, 2026-09-21. src/sovereign-capability holds a
   * governance-era capability list whose ids name no boundary. It was
   * measured to have no importer and no runtime reader; this keeps it so.
   * If a future module imports it to decide what a Creator can do, this
   * fails and names the file.
   */
  it('nothing outside src/sovereign-capability imports the Diwan', () => {
    // The filesystem, not `git ls-files`: a freshly written, not-yet-tracked
    // module is exactly the one this must catch — the first draft of this
    // guard used git and passed with an importer planted on disk.
    const { readdirSync, statSync } = require('fs') as typeof import('fs');
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.next') continue;
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full, out);
        else if (/\.tsx?$/.test(name)) out.push(full);
      }
      return out;
    };
    const files = [...walk(join(ROOT, 'src')), ...walk(join(ROOT, 'app'))]
      .filter((f) => !f.replace(/\\/g, '/').includes('/src/sovereign-capability/'));
    const importers = files
      .filter((f) => /(^|\n)\s*(import|export)[^;]*['"][^'"]*sovereign-capability['"]/.test(readFileSync(f, 'utf8')))
      .map((f) => f.replace(ROOT, '').replace(/\\/g, '/'));
    expect(importers).toEqual([]);
  });
});
