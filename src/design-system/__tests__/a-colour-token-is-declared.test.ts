/**
 * AZMA OS — a colour a stylesheet asks for must be a colour the Empire declares.
 *
 * ─── WHAT WAS MEASURED (2026-09-26) ─────────────────────────────────────────
 *
 *   Three rules in القيامة read `var(--qiyamah-gold, #D4AF37)`. That token is
 *   declared NOWHERE. All three fell silently to a hand-written hex, bypassing
 *   the chamber's own `--gold-neon`. One of them had shipped in an earlier
 *   commit. Sweeping the whole file then found two more of the same shape:
 *   `var(--text-soft, #d8d2c6)` and `var(--qiyamah-text-dim, #b9ad8c)`.
 *
 *   Nothing complains about this. The page renders, the colour is close
 *   enough to look right, and the rule simply stops following the palette the
 *   moment the palette changes. It is the CSS form of a defect this Empire
 *   keeps finding in other shapes: a value carrying an authority nobody
 *   declared.
 *
 * ─── WHY THIS GUARD IS ABOUT COLOUR AND NOT EVERY TOKEN ─────────────────────
 *
 *   Measured across every stylesheet: six undeclared tokens remain, and not
 *   one is a colour — `--breath-from`, `--breath-to`, `--arrival-breath-scale`,
 *   `--stage-duration`, `--font-arabic`, `--font-latin`. Each is set at
 *   runtime with a static default behind it, which is a legitimate pattern and
 *   not this defect. Banning all of them would forbid honest work to catch
 *   dishonest work. The defect has a precise shape — a COLOUR fallback behind
 *   a token that does not exist — and that is what is held shut here.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, sep } from 'path';

const ROOT = process.cwd();

function collectCss(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = full.slice(ROOT.length).split(sep).join('/');
    if (rel.includes('/node_modules') || rel.includes('/.next')) continue;
    if (statSync(full).isDirectory()) { collectCss(full, acc); continue; }
    if (entry.endsWith('.css')) acc.push(full);
  }
  return acc;
}

const CSS_FILES = [...collectCss(join(ROOT, 'app')), ...collectCss(join(ROOT, 'src'))];

/** Every custom property the Empire declares, anywhere. */
const DECLARED = new Set<string>();
for (const file of CSS_FILES) {
  for (const m of readFileSync(file, 'utf8').matchAll(/(--[A-Za-z0-9-]+)\s*:/g)) {
    DECLARED.add(m[1]);
  }
}

/** A fallback that is a colour: a hex, or an rgb/hsl function. */
const IS_COLOUR = /^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla)\()/;

describe('a colour token is declared, or it is not used', () => {
  it('the sweep found stylesheets and declarations at all', () => {
    // Guards against the whole measurement silently collecting nothing.
    expect(CSS_FILES.length).toBeGreaterThan(5);
    expect(DECLARED.size).toBeGreaterThan(20);
  });

  it('no stylesheet falls back to a hand-written colour behind an undeclared token', () => {
    const offences: string[] = [];
    for (const file of CSS_FILES) {
      const text = readFileSync(file, 'utf8');
      const rel = file.slice(ROOT.length).split(sep).join('/');
      for (const m of text.matchAll(/var\(\s*(--[A-Za-z0-9-]+)\s*,\s*([^);]+)\)/g)) {
        const token = m[1];
        const fallback = m[2].trim();
        if (DECLARED.has(token)) continue;
        if (!IS_COLOUR.test(fallback)) continue;
        const line = text.slice(0, m.index).split('\n').length;
        offences.push(`${rel}:${line}  var(${token}, ${fallback})  — ${token} is declared nowhere`);
      }
    }
    expect(offences).toEqual([]);
  });

  it('a control in the chamber of creation paints its own surface', () => {
    // SEEN BY EYE, never by measurement: .edit-act-input declared its geometry
    // and nothing else, so the browser drew a white box with black ink inside a
    // dark chamber — every rule it DID declare was valid, so nothing complained.
    const css = readFileSync(join(ROOT, 'app/qiyamah-chamber/qiyamah-chamber.css'), 'utf8');
    for (const cls of ['.edit-act-input', '.edit-act-run', '.next-act', '.source-btn']) {
      const start = css.indexOf(`${cls} {`);
      expect(start).toBeGreaterThan(-1);
      const rule = css.slice(start, css.indexOf('}', start));
      expect(rule).toMatch(/background\s*:/);
      expect(rule).toMatch(/(^|[^-])color\s*:/m);
    }
  });

  it('the chamber of creation uses its own declared palette', () => {
    const qiyamah = readFileSync(join(ROOT, 'app/qiyamah-chamber/qiyamah-chamber.css'), 'utf8');
    // The three exact tokens that were falling silently, by name, so their
    // return is named rather than merely counted.
    for (const gone of ['--qiyamah-gold', '--qiyamah-text-dim', '--text-soft']) {
      expect(qiyamah).not.toContain(gone);
    }
    for (const declared of ['--gold-neon', '--text-main', '--text-muted', '--crimson-neon']) {
      expect(qiyamah).toContain(`${declared}:`);
    }
  });
});
