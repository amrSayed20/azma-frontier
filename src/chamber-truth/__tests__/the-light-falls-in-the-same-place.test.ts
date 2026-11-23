/**
 * THE LIGHT FALLS IN THE SAME PLACE IN BOTH TONGUES.
 *
 * ═══ THE DEFECT THIS EXISTS TO PREVENT ══════════════════════════════════════
 *
 *   MEASURED on 2026-11-23 at 1440px, on all three public surfaces:
 *
 *                              English          Arabic
 *     landing  violet light    centre 720 ✓     centre −680
 *     landing  mashrabiya      centre 720 ✓     centre −780  (fully off-screen)
 *     signup   the one light   centre 720 ✓     centre −700
 *     signup   mashrabiya      centre 720 ✓     centre −780
 *
 *   In Arabic the single light and the mashrabiya — the two elements the
 *   whole visual identity rests on — were pushed off the left edge of the
 *   screen. The Founder's complaint of 2026-11-21, «الألوان … باهتة وليس بها
 *   أي انطباع بالحيوية واللمعان والعمق», was made while looking at a page
 *   whose light had been removed.
 *
 * ═══ WHY NOTHING CAUGHT IT ═════════════════════════════════════════════════
 *
 *       inset-inline-start: 50%;
 *       transform: translateX(-50%);
 *
 *   centres in LTR and does NOT centre in RTL: `inset-inline-start` resolves
 *   to `right`, so the box's RIGHT edge lands at the centre and the transform
 *   then pushes it a further half-width toward the start. For a 1400px box in
 *   a 1440px viewport it leaves the frame entirely.
 *
 *   These are CORRECT logical properties used incorrectly, so the standing
 *   «no physical properties» guard passed, `tsc` passed, every test passed,
 *   and an English screenshot looked perfect.
 *
 * ═══ AND THE SECOND-ORDER ERROR, ALSO MEASURED ═════════════════════════════
 *
 *   `inset-inline: 0; margin-inline: auto` centres a box that FITS and pins a
 *   box that does not, so an over-wide layer still landed 30px off at 1440px
 *   and ~120px off on a phone. Every centred decorative layer is therefore
 *   capped at `100%` of its container as well.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every stylesheet in the platform. */
function allStylesheets(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(join(ROOT, dir))) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
      const rel = join(dir, entry);
      if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
      else if (entry.endsWith('.css')) found.push(rel);
    }
  };
  walk('app');
  walk('src');
  return found;
}

const PUBLIC_SURFACES = [
  'src/imperial-experience-engine/experiences/landing/landing.css',
  'src/imperial-experience-engine/experiences/signup/signup-experience.css',
  'src/imperial-experience-engine/experiences/login/login-experience.css',
];

describe('١ · لا عنصرَ يُوسَّط بقاعدةٍ تَعمَل في لسانٍ دونَ الآخر', () => {
  it.each(PUBLIC_SURFACES)('%s pairs no inset-inline-start:50% with translateX(-50%)', (file) => {
    const css = strip(read(file));
    // The exact pairing that broke. Either half alone is legitimate — an
    // element genuinely anchored to the start, or shifted on its own axis —
    // so the guard condemns the COMBINATION, which can never be right.
    const blocks = css.split('}');
    for (const block of blocks) {
      if (!/inset-inline-start:\s*50%/.test(block)) continue;
      expect(block).not.toMatch(/transform:\s*translateX\(-50%\)/);
    }
  });

  it.each(PUBLIC_SURFACES)('%s centres with inset-inline + margin-inline instead', (file) => {
    const css = strip(read(file));
    expect(css).toContain('inset-inline: 0;');
    expect(css).toContain('margin-inline: auto;');
  });

  it.each(PUBLIC_SURFACES)('%s never lets a centred layer outgrow its container', (file) => {
    // `margin-inline: auto` centres a box that FITS and pins one that does
    // not, so the overflow of an over-wide layer lands entirely on one side —
    // and which side depends on the direction. Measured at 30px on a desk and
    // ~120px on a phone before this cap.
    const css = strip(read(file));
    const blocks = css.split('}');
    for (const block of blocks) {
      if (!/margin-inline:\s*auto/.test(block)) continue;
      // A standalone `inline-size`, never `max-inline-size` or
      // `min-inline-size`: a CAP can by definition not outgrow its container,
      // and reading one as a width is how this instrument first condemned a
      // text column that was never a decorative layer.
      const size = block.match(/(?:^|[;{\s])inline-size:\s*([^;]+);/);
      if (!size) continue;
      const value = size[1]!.trim();
      // Either it is already relative, or it is capped at the container.
      const safe = value === '100%' || /min\([^)]*100%\s*\)/.test(value) || /^auto$/.test(value);
      expect(`${file} :: inline-size: ${value}`).toBe(safe ? `${file} :: inline-size: ${value}` : 'capped at 100%');
    }
  });
});

describe('٢ · والقاعدةُ تَسري على المنصّةِ كلِّها، لا على الثلاثةِ وحدَها', () => {
  it('no stylesheet anywhere pairs the two halves of the broken centring', () => {
    // THE MEASUREMENT, not the assurance — re-run over every stylesheet on
    // every commit, so the next surface cannot reintroduce it.
    const offenders: string[] = [];
    for (const file of allStylesheets()) {
      for (const block of strip(read(file)).split('}')) {
        if (/inset-inline-start:\s*50%/.test(block) && /transform:\s*translateX\(-50%\)/.test(block)) {
          offenders.push(file);
          break;
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('and the instrument really looked at the platform', () => {
    expect(allStylesheets().length).toBeGreaterThan(20);
  });
});
