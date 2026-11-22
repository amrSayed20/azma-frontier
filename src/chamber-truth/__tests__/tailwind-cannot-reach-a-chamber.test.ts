/**
 * TAILWIND IS ON, AND IT CANNOT REACH A CHAMBER.
 *
 * ═══ WHAT PHASE ZERO FOUND ═════════════════════════════════════════════════
 *
 *   MEASURED 2026-11-22, before a line was changed: Tailwind was installed,
 *   configured, and emitting LITERALLY NOTHING — zero Tailwind signatures in
 *   the whole built CSS, because `app/globals.css` never imported it, which
 *   in v4 is the switch. `tailwind.config.ts` had therefore never been read
 *   by anything, and shadcn — which is Tailwind — could never have worked.
 *
 * ═══ THE TWO THINGS THAT MADE TURNING IT ON DANGEROUS ══════════════════════
 *
 *   1 · PREFLIGHT. Its 398 lines set `margin: 0` on everything, `font-size:
 *       inherit` on every heading and `list-style: none` on every list —
 *       across 32 stylesheets and 27,904 lines written without it. Every
 *       chamber would have shifted.
 *
 *   2 · EIGHTY-THREE DORMANT UTILITIES. Counted in the repository: 83 real
 *       Tailwind names already sit as standalone classes — and `min-h-full
 *       flex flex-col` is on <body> in app/layout.tsx, which is EVERY page.
 *       An unprefixed build animates all 83 at once.
 *
 *   Patching 83 call sites is vigilance. A prefix is a guarantee. This guard
 *   holds the guarantee, because the cheapest way to "fix" a future styling
 *   problem is to drop the prefix or import the full `tailwindcss` — and
 *   either would silently re-style the entire Empire.
 *
 * ═══ WHAT THIS GUARD DOES NOT CLAIM ════════════════════════════════════════
 *
 *   That the built CSS is correct. It reads configuration. The build output
 *   was measured separately and recorded in the Phase Zero report: 92 `az:`
 *   utilities generated, zero unprefixed, zero preflight markers, and 1,176
 *   computed properties identical across 11 surfaces before and after.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const CSS = read('app/globals.css');

/**
 * What RUNS, not the comments that explain why — with the quoted strings
 * protected first.
 *
 * THE FIRST DRAFT OF THIS LINE CORRUPTED ITS OWN EVIDENCE. A plain
 * `/\/\*[\s\S]*?\*\//g` strip reads the `/**\/` inside
 * `@source "../app/**\/*.{ts,tsx}"` as a comment and eats it, turning the
 * glob into `../app*.{ts,tsx}` — then reports the file does not declare its
 * sources. The file was right; the instrument was wrong.
 *
 * So strings are masked out before the strip and restored after it. A tool
 * that rewrites the thing it measures will keep finding whatever it just
 * created.
 */
const RULES = (() => {
  const strings: string[] = [];
  const masked = CSS.replace(/"[^"\n]*"|'[^'\n]*'/g, (s) => {
    strings.push(s);
    return `\u0000${strings.length - 1}\u0000`;
  });
  return masked
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => strings[Number(i)]!);
})();

describe('1 · Tailwind is switched on', () => {
  it('globals.css imports it, which in v4 is the switch', () => {
    expect(RULES).toContain('@import "tailwindcss/theme.css"');
    expect(RULES).toContain('@import "tailwindcss/utilities.css"');
  });

  it('and declares its sources, because the split import loses auto-detection', () => {
    // MEASURED: zero component utilities reached the served CSS until these
    // existed. A pipeline that compiles silently to nothing is the worst
    // kind of green.
    expect(RULES).toContain('@source "../app/**/*.{ts,tsx}"');
    expect(RULES).toContain('@source "../src/**/*.{ts,tsx}"');
  });
});

describe('2 · and it still cannot reach a chamber', () => {
  it('preflight is never imported', () => {
    // `@import "tailwindcss"` pulls it. The split import is the whole point.
    expect(RULES).not.toMatch(/@import\s+["']tailwindcss["']/);
    expect(RULES).not.toContain('tailwindcss/preflight');
  });

  it('every utility carries the prefix, so a bare `flex` can never resolve', () => {
    const imports = RULES.match(/@import\s+["']tailwindcss\/[^"']+["'][^;]*/g) ?? [];
    expect(imports.length).toBe(2);
    for (const line of imports) expect(line).toContain('prefix(az)');
  });

  it('the 83 dormant utilities are still dormant, and still there', () => {
    // If someone ever "tidies" them away, this guard should be revisited
    // deliberately — not have its premise quietly removed underneath it.
    const layout = read('app/layout.tsx');
    expect(layout).toContain('min-h-full flex flex-col');
    expect(layout).not.toContain('az:min-h-full');
  });

  it('the dead v3 config is gone, not left looking authoritative', () => {
    // v4 never read it without `@config`, and nothing used its theme —
    // measured: zero `mantahaa-*` classes in the repository.
    expect(existsSync(join(ROOT, 'tailwind.config.ts'))).toBe(false);
    expect(RULES).not.toContain('@config');
  });
});

describe('3 · the component palette is bound, never imposed', () => {
  it('the shadcn names are registered inline, so no variable lands on :root', () => {
    // `@theme` would emit a block of variables globally. `@theme inline`
    // substitutes the value into the utility instead — so the names compile
    // while the VALUES live only where the container declares them.
    expect(RULES).toContain('@theme inline');
    expect(RULES).not.toMatch(/@theme\s*\{/);
  });

  it('and the values are declared on the container, not the root', () => {
    const block = RULES.slice(RULES.indexOf('.az-ui {'));
    const body = block.slice(0, block.indexOf('}'));
    expect(body).toContain('--az-ui-primary');
    expect(body).toContain('--az-ui-bg');
    // Bound to the Empire's own palette — a component reads the gold because
    // it is INSIDE the Empire, not because a global was overwritten.
    expect(body).toContain('var(--azma-accent-color');
  });

  it('nothing new is defined on :root by this work', () => {
    // The Founder's rule, 2026-11-21: one line there recolours every chamber.
    const roots = RULES.match(/(^|\})\s*:root\s*\{/g) ?? [];
    expect(roots).toHaveLength(0);
  });

  it('the scoped reset cannot leave its room', () => {
    // shadcn's `border` utilities set a WIDTH and a COLOUR and assume a base
    // rule already set `border-style: solid` — the sliver of preflight they
    // genuinely need. Without it a bordered card draws no border at all, the
    // silent kind of defect no type-check and no test can see.
    expect(RULES).toContain('.az-ui *,');
    expect(RULES).toContain('border-style: solid');

    /*
     * AND EVERY `border-style` DECLARATION IS INSIDE `.az-ui`.
     *
     * THE FIRST DRAFT OF THIS ASSERTION WAS WRONG AND CONDEMNED THE PLATFORM.
     * It forbade any `*, *::before` rule at all — but one has been there
     * since 2026-09-28, carrying `box-sizing: border-box`, written after
     * thirteen screens scrolled sideways and documented at length at the top
     * of this very file. A guard that fails on the repair someone already
     * made is a guard arguing with its own repository.
     *
     * What actually matters is narrower: MY reset must not escape. So the
     * selector that precedes each `border-style` is what gets checked.
     */
    for (const m of RULES.matchAll(/([^{}]+)\{[^{}]*border-style[^{}]*\}/g)) {
      expect(m[1]).toContain('.az-ui');
    }
  });

  it('and a control inside it paints its own surface', () => {
    /*
     * SEEN BY EYE, AND BY NOTHING ELSE.
     *
     *   The first gallery render showed the ghost button, the link button
     *   and every accordion trigger as LIGHT GREY bars inside a dark page —
     *   measured afterwards as `rgb(240, 240, 240)`, the browser's own
     *   `buttonface`. Those variants set no background on purpose, because
     *   preflight normally zeroes it. Refusing preflight platform-wide was
     *   right; leaving this line out of the scoped replacement was not.
     *
     *   Every automated check was green while three controls painted
     *   themselves the wrong colour. This is the one that would have caught
     *   it.
     */
    const block = RULES.slice(RULES.indexOf('.az-ui button,'));
    const body = block.slice(0, block.indexOf('}'));
    expect(body).toContain('background-color: transparent');
  });
});

describe('4 · the toolchain is wired the way the components were generated', () => {
  it('components.json names the prefix the CSS uses', () => {
    const cfg = JSON.parse(read('components.json'));
    expect(cfg.tailwind.prefix).toBe('az');
    // `cssVariables: false` made the CLI inline raw oklch() values whose
    // spaces split into broken class names. Measured on the first attempt.
    expect(cfg.tailwind.cssVariables).toBe(true);
    expect(cfg.tailwind.config).toBe('');
  });

  it('and `cn` merges with that same prefix', () => {
    // Without it `twMerge` cannot tell `az:p-4` from `az:p-6` and silently
    // keeps both, so a variant stops being overridable.
    const util = read('src/ui/lib/utils.ts');
    expect(util).toContain("extendTailwindMerge({ prefix: 'az' })");
  });

  it('and no generated component carries an unprefixed utility', () => {
    const { readdirSync } = require('fs') as typeof import('fs');
    const dir = 'src/ui/components';
    const files = readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.tsx'));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const src = read(join(dir, f));
      for (const m of src.matchAll(/className=\{?["'`]([^"'`]+)["'`]/g)) {
        for (const tok of m[1].split(/\s+/)) {
          if (!tok || tok.includes('${') || tok.startsWith('az:')) continue;
          // A bare Tailwind name here would render nothing at all.
          expect(tok).not.toMatch(/^(flex|grid|hidden|border|rounded(-\w+)?|(p|m|px|py|gap)-\d)$/);
        }
      }
    }
  });
});
