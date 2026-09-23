/**
 * AZMA OS — a capability the Creator cannot reach is not a capability.
 *
 * ─── WHAT WAS MEASURED (2026-09-23) ─────────────────────────────────────────
 *
 *   The Truth registry declared 40 capabilities. Five of them — all in
 *   مكمن الغاية — had a working route and no control anywhere in the
 *   interface: define-success, observe-reality, mark-milestone,
 *   name-knowledge-requirements, issue-knowledge-requests. The Empire said
 *   the Chamber performs them; no Creator could ask it to.
 *
 *   Worse, the chain broke in its middle. الغاية ← الهدف ← [تعريف النجاح ←
 *   رصد الواقع] ← التقييم ← الفجوة: assessment had a button while the
 *   definition it assesses against had none, so the Chamber judged success
 *   by a standard the Creator had no way to state.
 *
 * ─── WHAT THIS HOLDS SHUT ───────────────────────────────────────────────────
 *
 *   Declaring a capability in `truth-registry.ts` now obliges the interface
 *   to reach its boundary. Add a capability without a control and this test
 *   names it. Delete the control and this test names it. The registry and
 *   the interface cannot drift apart in silence again.
 *
 *   This is the Founder's own rule made executable: the repository is the
 *   sole authority for the interface, and a declaration that no button
 *   honours is a claim the Empire cannot keep.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, sep } from 'path';

const ROOT = process.cwd();

/** Source a Creator can actually reach: pages and components, never routes. */
function collectUiSources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = full.slice(ROOT.length).split(sep).join('/');
    if (rel.includes('/node_modules') || rel.includes('/.next') || rel.includes('/__tests__')) continue;
    if (statSync(full).isDirectory()) {
      collectUiSources(full, acc);
      continue;
    }
    // API route files are the boundary itself — a route calling itself proves nothing.
    if (rel.startsWith('/app/api/')) continue;
    if (entry.endsWith('.tsx') || entry.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

const UI_FILES = [
  ...collectUiSources(join(ROOT, 'app')),
  ...collectUiSources(join(ROOT, 'src')),
];
const UI_TEXT = UI_FILES.map((f) => readFileSync(f, 'utf8'));

/**
 * Every URL the interface actually fetches, with `${…}` collapsed to `[x]`.
 *
 * The collapse matters: an earlier, cruder version of this measurement cut
 * each path at its first `[` and compared only the prefix, which made
 * `/api/vault/assets/[id]/edit` "match" `/api/vault/assets` and reported
 * every capability as reachable. A matcher that cannot tell a branch from
 * its root proves nothing.
 */
const FETCHED = new Set<string>();
for (const text of UI_TEXT) {
  for (const m of text.matchAll(/fetch\(\s*[`'"]([^`'"]+)[`'"]/g)) {
    const url = m[1];
    if (url.startsWith('/api')) {
      FETCHED.add(url.replace(/\$\{[^}]*\}/g, '[x]').split('?')[0].replace(/\/$/, ''));
    }
  }
}

interface DeclaredCapability {
  chamber: string;
  id: string;
  kind: string;
  at: string;
}

/** The declarations, read from the one authority that may make them. */
function declaredCapabilities(): DeclaredCapability[] {
  const registry = readFileSync(join(ROOT, 'src/chamber-truth/truth-registry.ts'), 'utf8');
  const chambers = [...registry.matchAll(/^ {2}'([a-z-]+)': \{/gm)];
  const out: DeclaredCapability[] = [];
  chambers.forEach((chapter, index) => {
    const end = index + 1 < chambers.length ? chambers[index + 1].index! : registry.length;
    const block = registry.slice(chapter.index!, end);
    const ids = [...block.matchAll(/id: '([a-z-]+)'/g)];
    ids.forEach((idMatch, j) => {
      const segEnd = j + 1 < ids.length ? ids[j + 1].index! : block.length;
      const seg = block.slice(idMatch.index!, segEnd);
      const boundary = /boundary: \{\s*kind: '(\w+)',\s*at: '([^']+)'/.exec(seg);
      out.push({
        chamber: chapter[1],
        id: idMatch[1],
        kind: boundary ? boundary[1] : 'UNDECLARED',
        at: boundary ? boundary[2] : 'UNDECLARED',
      });
    });
  });
  return out;
}

const CAPABILITIES = declaredCapabilities();

function isReachable(capability: DeclaredCapability): boolean {
  if (capability.kind === 'action') {
    const fn = capability.at.split('#').pop()!;
    return UI_TEXT.some((t) => t.includes(fn));
  }
  const normalised = capability.at
    .replace('app/api', '/api')
    .replace(/\[[^\]]+\]/g, '[x]')
    .replace(/\/$/, '');
  return FETCHED.has(normalised);
}

describe('the measurement itself is sound before it is trusted', () => {
  it('finds the declarations and the interface it measures them against', () => {
    expect(CAPABILITIES.length).toBeGreaterThanOrEqual(39);
    expect(UI_FILES.length).toBeGreaterThan(20);
    expect(FETCHED.size).toBeGreaterThan(20);
  });

  it('every declaration names a boundary — a capability with none cannot be reached by anyone', () => {
    const undeclared = CAPABILITIES.filter((c) => c.kind === 'UNDECLARED');
    expect(undeclared.map((c) => `${c.chamber}/${c.id}`)).toEqual([]);
  });

  it('a boundary nothing calls is reported unreachable — the test can fail', () => {
    // Without this, a matcher that answered "yes" to everything would pass
    // the suite below while the interface rotted. It must say no to a route
    // that does not exist.
    expect(isReachable({ chamber: 'nowhere', id: 'imaginary', kind: 'route', at: 'app/api/nothing/[id]/imaginary' }))
      .toBe(false);
  });

  it('it distinguishes a branch from its root', () => {
    // /api/vault/assets IS fetched; /api/vault/assets/[x]/imaginary is not.
    expect(isReachable({ chamber: 'x', id: 'root', kind: 'route', at: 'app/api/vault/assets' })).toBe(true);
    expect(isReachable({ chamber: 'x', id: 'branch', kind: 'route', at: 'app/api/vault/assets/[assetId]/imaginary' }))
      .toBe(false);
  });
});

describe('every capability the Empire declares, a Creator can reach', () => {
  it.each(CAPABILITIES.map((c) => [c.chamber, c.id, c] as const))(
    '%s / %s has a control that calls its boundary',
    (_chamber, _id, capability) => {
      expect({ capability: capability.id, boundary: capability.at, reachable: isReachable(capability) })
        .toEqual({ capability: capability.id, boundary: capability.at, reachable: true });
    },
  );

  it('states the count plainly, so a silent shrink is visible', () => {
    const unreachable = CAPABILITIES.filter((c) => !isReachable(c)).map((c) => `${c.chamber}/${c.id}`);
    expect(unreachable).toEqual([]);
  });
});

describe('مكمن الغاية: the chain the Creator walks has no missing step', () => {
  const MAKMAN_CHAIN = [
    'declare-purpose',           // الغاية
    'set-goal',                  // الهدف
    'mark-milestone',            // الهدف يخدم الغاية
    'define-success',            // ما معنى نجاحه
    'observe-reality',           // ما رُصد فعلاً
    'assess-fulfilment',         // الحكم
    'find-the-gap',              // الفجوة
    'name-knowledge-requirements', // ما يجب تعلُّمه
    'issue-knowledge-requests',  // الطلب الرسمي
  ] as const;

  it.each(MAKMAN_CHAIN)('%s is reachable', (id) => {
    const capability = CAPABILITIES.find((c) => c.chamber === 'makman-al-ghayah' && c.id === id);
    expect(capability).toBeDefined();
    expect(isReachable(capability!)).toBe(true);
  });

  it('the Chamber reads a Goal before offering anything about it', () => {
    const page = readFileSync(join(ROOT, 'app/makman-al-ghayah/page.tsx'), 'utf8');
    // What is offered depends on a fact only the Chamber holds; it is asked for.
    expect(page).toMatch(/const readGoal = async \(goalId: string\)/);
    expect(page).toMatch(/if \(next\) void readGoal\(next\)/);
    // A Milestone is recognised by the Chamber's own field, never inferred.
    expect(page).toMatch(/goalDetail\?\.sovereignPurposeStatement/);
  });

  it('a refusal is spoken as the Chamber’s real reason, not swallowed', () => {
    const page = readFileSync(join(ROOT, 'app/makman-al-ghayah/page.tsx'), 'utf8');
    // 400 on milestone = no Sovereign Purpose yet. 422 on the knowledge
    // boundaries = no assessment yet. Both are said, in Arabic, to the Creator.
    expect(page).toContain('عرِّف غايتك السيادية أوّلاً');
    expect(page).toContain('عيِّن هذا الهدف مرحلةً للغاية قبل تعريف نجاحه.');
    expect(page).toMatch(/res\.status === 422/);
    expect(page).toContain('اطلب تقييم الإنجاز أوّلاً');
  });

  it('issuing knowledge requests does not pretend to answer them', () => {
    const page = readFileSync(join(ROOT, 'app/makman-al-ghayah/page.tsx'), 'utf8');
    // The batch is stated and stops; the answer belongs to الحُجّة الدامغة.
    expect(page).toContain('تبقى دون جواب حتى تُحقَّق في حجّة الدامغة');
    const handler = page.slice(page.indexOf('const handleIssueRequests'), page.indexOf('const handleAssessFulfillment'));
    expect(handler).not.toMatch(/hujjah|runInvestigation/i);
  });

  it('an empty answer is shown as an empty answer, never as a placeholder', () => {
    const page = readFileSync(join(ROOT, 'app/makman-al-ghayah/page.tsx'), 'utf8');
    expect(page).toContain('لا رصد بعد');
    expect(page).toContain('لم تُعرَّف معايير النجاح بعد.');
    expect(page).toContain('لا متطلبات معرفية');
  });
});
