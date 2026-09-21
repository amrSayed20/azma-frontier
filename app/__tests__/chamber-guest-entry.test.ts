/**
 * AZMA OS — A chamber that needs a Creator must tell a stranger where the door is.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   Playwright, anonymous contexts, against production:
 *
 *       /qiyamah-chamber         -> /signup    0 failed requests
 *       /sovereign-vault-palace  -> /signup    0 failed requests
 *       /hujjah-al-damighah      -> /login     0 failed requests
 *       /imperial-foyer          -> /login     0 failed requests
 *
 *       /makman-al-ghayah        -> STAYS      401 entry/purpose
 *                                              401 entry/creator-goal
 *                                              401 nervous-system/circulate
 *       /ras-amr                 -> STAYS      401 vault/assets
 *                                              401 ras-amr/canvas
 *                                              401 nervous-system/circulate
 *
 *   Four chambers turned a visitor toward a door. Two let them in and then
 *   fetched data they were not entitled to, failed, and rendered a room with
 *   nothing in it.
 *
 * ─── WHAT THIS DOES NOT ASSERT ──────────────────────────────────────────────
 *
 *   Not that the 401s are gone. They are correct and they remain: the server
 *   refuses an unauthenticated caller at every one of those routes, and this
 *   change does not touch that. What it asserts is that a chamber which calls a
 *   protected route also tells a visitor who has no identity where to get one.
 *
 *   The rule is derived from the chamber's own code rather than from a list a
 *   future engineer would have to remember to update: if a page fetches a route
 *   that requires a session, it must also ask /api/auth/me and navigate on the
 *   answer.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

/** Every API route whose handler requires a session. */
function protectedRoutes(): Set<string> {
  const found = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (entry !== 'route.ts') continue;
      if (!readFileSync(full, 'utf8').includes('verifySession')) continue;
      const apiPath = full
        .replace(join(ROOT, 'app'), '')
        .replace(/\\/g, '/')
        .replace('/route.ts', '');
      found.add(apiPath);
    }
  };
  walk(join(ROOT, 'app', 'api'));
  return found;
}

/** The chamber pages a Creator actually walks into. */
const CHAMBERS = [
  'app/qiyamah-chamber/QiyamahChamberClient.tsx',
  'app/sovereign-vault-palace/page.tsx',
  'app/ras-amr/page.tsx',
  'app/makman-al-ghayah/page.tsx',
];

describe('a chamber that requires a Creator turns a stranger toward the door', () => {
  const protectedSet = protectedRoutes();

  it('finds the protected API surface', () => {
    expect(protectedSet.size).toBeGreaterThan(5);
  });

  for (const chamber of CHAMBERS) {
    const file = join(ROOT, chamber);
    if (!existsSync(file)) continue;

    it(`${chamber.split('/')[1]} asks who is here and navigates on the answer`, () => {
      const source = readFileSync(file, 'utf8');
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

      // Does this chamber call anything that needs a session?
      const callsProtected = [...protectedSet].some((route) => code.includes(`'${route}`) || code.includes(`"${route}`));
      if (!callsProtected) return;

      expect(code).toContain("fetch('/api/auth/me')");

      // The NEGATIVE branch must navigate. Written tightly on purpose: a first
      // version allowed 80 characters of slack and therefore matched the
      // neighbouring `.catch(() => goTo('/signup'))`, so removing the real
      // guard left all six assertions green. Verified since by deleting the
      // branch and watching this fail.
      const negativeBranch = /if\s*\(\s*!\s*(?:data|result)\.authenticated\s*\)\s*\{?\s*(?:return\s+)?goTo\(['"]\/signup['"]\)/;
      expect(code).toMatch(negativeBranch);

      // And the unreachable-server path must not strand anyone either.
      expect(code).toMatch(/\.catch\(\(\)\s*=>\s*goTo\(['"]\/signup['"]\)\)/);
    });
  }

  it('none of them sends a visitor to a route that does not exist', () => {
    for (const chamber of CHAMBERS) {
      const file = join(ROOT, chamber);
      if (!existsSync(file)) continue;
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      expect(code).not.toContain('/creator-access');
    }
  });
});
