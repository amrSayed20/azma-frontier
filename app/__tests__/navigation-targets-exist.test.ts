/**
 * AZMA OS — Every place the Empire sends a Creator must exist.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   Sweeping the journey adversarially, an anonymous visitor opening the
 *   Qiyamah Chamber or the Vault Palace was redirected to:
 *
 *       https://azmaos.com/creator-access   ->  404
 *
 *   A route that has never existed in this repository. The guard that was
 *   supposed to send them to the door sent them to
 *   «هذا المسار غير موجود داخل الإمبراطورية» instead — and it had been doing so
 *   for as long as both guards have existed.
 *
 *   Nothing caught it. The guards were correct about WHETHER to redirect and
 *   wrong about WHERE, and a redirect to nowhere still looks like a redirect to
 *   every test that asserts one happened.
 *
 * ─── WHY THIS READS THE SOURCE ──────────────────────────────────────────────
 *
 *   The failure is a mismatch between a string in a client component and a
 *   directory on disk. Neither the type checker nor a render test can see it —
 *   only putting the two side by side can.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const APP = join(process.cwd(), 'app');

/** Every internal path the app navigates to, with the file that names it. */
function collectNavigationTargets(): Array<{ file: string; target: string }> {
  const found: Array<{ file: string; target: string }> = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '__tests__' || entry.startsWith('.')) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!/\.tsx?$/.test(entry)) continue;

      const source = readFileSync(full, 'utf8');
      // Comments name dead routes on purpose — this file's own header does.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      // goTo('/x'), router.push('/x'), window.location.assign('/x'), <Link to="/x">
      const pattern = /(?:goTo|push|replace|assign)\(\s*['"](\/[a-z0-9\-/]*)['"]|(?:to|href)=["'](\/[a-z0-9\-/]*)["']/gi;
      for (const m of code.matchAll(pattern)) {
        const target = (m[1] ?? m[2] ?? '').split(/[?#]/)[0];
        if (!target || target === '/') continue;
        // API routes are not pages and are exercised elsewhere.
        if (target.startsWith('/api/')) continue;
        found.push({ file: full.replace(process.cwd(), '').replace(/\\/g, '/'), target });
      }
    }
  };
  walk(APP);
  return found;
}

/** Whether app/<segment...> resolves to a real route directory. */
function routeExists(target: string): boolean {
  const segments = target.split('/').filter(Boolean);
  let dir = APP;
  for (const segment of segments) {
    const direct = join(dir, segment);
    if (existsSync(direct) && statSync(direct).isDirectory()) { dir = direct; continue; }
    // A dynamic segment — [id], [...path] — accepts anything at this level.
    const dynamic = existsSync(dir)
      ? readdirSync(dir).find((e) => e.startsWith('[') && statSync(join(dir, e)).isDirectory())
      : undefined;
    if (dynamic) { dir = join(dir, dynamic); continue; }
    return false;
  }
  return existsSync(join(dir, 'page.tsx')) || existsSync(join(dir, 'page.ts'));
}

describe('the Empire never sends a Creator to a path that is not there', () => {
  const targets = collectNavigationTargets();

  it('finds navigation targets to check', () => {
    expect(targets.length).toBeGreaterThan(5);
  });

  it('every internal navigation target resolves to a real route', () => {
    const broken = targets
      .filter(({ target }) => !routeExists(target))
      .map(({ file, target }) => `${target}  <-  ${file}`);

    // Named individually: a count tells nobody which door is missing.
    expect(broken).toEqual([]);
  });

  it('/creator-access specifically is gone — the route it named never existed', () => {
    expect(targets.some(({ target }) => target === '/creator-access')).toBe(false);
    expect(existsSync(join(APP, 'creator-access'))).toBe(false);
  });
});
