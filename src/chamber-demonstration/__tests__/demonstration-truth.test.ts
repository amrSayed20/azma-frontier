/**
 * AZMA OS — a Chamber's guide cannot drift from what the Chamber does.
 *
 * ─── WHAT THIS HOLDS SHUT ────────────────────────────────────────────────────
 *
 *   The demonstration panel is derived from src/chamber-truth and from nothing
 *   else, so the moment a capability is added, withdrawn or reworded, the
 *   guide moves with it. These tests hold that derivation in place:
 *
 *     · every capability speaks to the Creator, in Arabic
 *     · every deferred responsibility does too
 *     · no English reaches a Creator through either
 *     · one component serves all five Chambers, never five copies
 *     · every Chamber actually mounts it
 *
 *   A guide that promises what the Empire no longer does is worse than none.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, sep } from 'path';
import { CHAMBER_TRUTH } from '../../chamber-truth';

const ROOT = process.cwd();
const CHAMBERS = Object.values(CHAMBER_TRUTH);
const ARABIC = /[؀-ۿ]/;
/** Latin runs that would read as foreign prose, not an identifier or a unit. */
const FOREIGN_PROSE = /[A-Za-z]{3,}\s+[A-Za-z]{3,}/;

describe('every capability speaks to the Creator', () => {
  const all = CHAMBERS.flatMap((c) => c.capabilities.map((cap) => [c.chamberId, cap] as const));

  it.each(all.map(([chamber, cap]) => [chamber, cap.id, cap] as const))(
    '%s / %s says what it does, in Arabic',
    (_chamber, _id, cap) => {
      expect(cap.performsAr.trim().length).toBeGreaterThan(10);
      expect(cap.performsAr).toMatch(ARABIC);
      expect(cap.performsAr).not.toMatch(FOREIGN_PROSE);
    },
  );

  it('the Arabic is its own sentence, never a copy of the engineering line', () => {
    for (const [, cap] of all) {
      expect(cap.performsAr).not.toBe(cap.performs);
    }
  });

  it('covers every declared capability — 41 or more', () => {
    expect(all.length).toBeGreaterThanOrEqual(41);
  });
});

describe('what a Chamber will not do is said in Arabic too', () => {
  const deferred = CHAMBERS.flatMap((c) => c.deferred.map((d) => [c.chamberId, d] as const));

  it('every deferred responsibility carries the Creator’s tongue', () => {
    for (const [, d] of deferred) {
      expect(d.responsibilityAr).toMatch(ARABIC);
      expect(d.responsibilityAr).not.toMatch(FOREIGN_PROSE);
      expect(d.responsibilityAr).not.toBe(d.responsibility);
    }
  });
});

describe('the panel is derived, not written twice', () => {
  const PANEL = readFileSync(join(ROOT, 'src/chamber-demonstration/ChamberDemonstration.tsx'), 'utf8');

  it('reads the Truth registry for every claim it makes', () => {
    expect(PANEL).toMatch(/import \{ CHAMBER_TRUTH \}/);
    expect(PANEL).toMatch(/truth\.capabilities/);
    expect(PANEL).toMatch(/c\.performsAr/);
  });

  /*
   * ── WHY TWO ASSERTIONS LEFT THIS TEST, 2026-11-20 ───────────────────────
   *
   *   It required the panel to RENDER `truth.deferred` and
   *   `d.responsibilityAr` — the list headed «ما لا تفعله هذه الحجرة بعد».
   *
   *   The Founder then ruled: «يُمنع ظهور تصنيفات حالة البناء والتطوير
   *   للمستخدم أو الزائر … ولا تعرض تقريراً عن مراحل تطويرها». So the panel
   *   stopped drawing it, and this test began failing on a requirement the
   *   constitution had withdrawn.
   *
   *   THE REQUIREMENT WAS NOT SIMPLY DELETED. It was INVERTED, and the test
   *   below is its replacement — the rule now runs in the opposite
   *   direction, so the coverage did not shrink, it changed sign.
   *
   *   What the deleted assertions protected — that the deferred record is
   *   kept in Arabic and never invented twice — is untouched: the describe
   *   block above this one still proves it over the registry itself, which
   *   is where the engineering side reads it.
   */
  it('and it does NOT draw a development report for a Creator', () => {
    // READ WHAT RUNS, NOT WHAT EXPLAINS. The first draft of this assertion
    // matched the panel's own comment — the one that records which heading
    // was removed and under whose order. A guard that cannot tell a
    // quotation from a rendered string forces every repair to go
    // undocumented to stay green, and the record of WHY a sentence left is
    // the main thing standing between it and a well-meaning restoration.
    const rendered = PANEL
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(rendered).not.toMatch(/truth\.deferred\.map/);
    expect(rendered).not.toMatch(/d\.responsibilityAr\}/);
    expect(rendered).not.toContain('ما لا تفعله هذه الحجرة بعد');
  });

  it('shows the Arabic and never the engineering line', () => {
    expect(PANEL).not.toMatch(/\{c\.performs\}/);
    expect(PANEL).not.toMatch(/\{d\.responsibility\}(?!Ar)/);
  });

  it('separates what needs an owned asset from what does not', () => {
    // The registry's own words: telling a Creator with an empty Vault that
    // they can edit is «the first lie an interface tells».
    expect(PANEL).toMatch(/requiresExistingAsset/);
    expect(PANEL).toMatch(/readyNow/);
    expect(PANEL).toMatch(/needsAsset/);
  });
});

describe('one panel, five Chambers', () => {
  function walk(dir: string, acc: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.slice(ROOT.length).split(sep).join('/');
      if (rel.includes('/node_modules') || rel.includes('/.next') || rel.includes('/__tests__')) continue;
      if (statSync(full).isDirectory()) walk(full, acc);
      else if (entry.endsWith('.tsx')) acc.push(full);
    }
    return acc;
  }

  const SOURCES = [...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'src'))];

  it('exactly one component defines it', () => {
    const definitions = SOURCES.filter((f) =>
      /export function ChamberDemonstration/.test(readFileSync(f, 'utf8')));
    expect(definitions.map((f) => f.slice(ROOT.length).split(sep).join('/')))
      .toEqual(['/src/chamber-demonstration/ChamberDemonstration.tsx']);
  });

  it.each([
    ['hujjah-al-damighah',     'app/hujjah-al-damighah/page.tsx'],
    ['qiyamah-chamber',        'app/qiyamah-chamber/QiyamahChamberClient.tsx'],
    ['sovereign-vault-palace', 'app/sovereign-vault-palace/page.tsx'],
    ['ras-amr',                'app/ras-amr/page.tsx'],
    ['makman-al-ghayah',       'app/makman-al-ghayah/page.tsx'],
  ])('%s mounts it, for its own chamber', (chamberId, file) => {
    const source = readFileSync(join(ROOT, file), 'utf8');
    expect(source).toMatch(/<ChamberDemonstration/);
    expect(source).toContain(`chamberId="${chamberId}"`);
    // And it tells the Creator what they leave with, and in what order.
    expect(source).toMatch(/outcomeAr="[^"]*[؀-ۿ]/);
    expect(source).toMatch(/stepsAr=\{\[/);
  });
});
