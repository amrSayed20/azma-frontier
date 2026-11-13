/**
 * MAKMAN SAYS WHAT IT MEANS.
 *
 * Three defects the Founder asked to be found by reading the chamber as a
 * Creator meets it, and each one is a different kind of untruth.
 *
 *   1. A FOREIGN WORD. «الوصف (Description)» — the rule is absolute: no
 *      foreign text reaches a Creator, not even in a parenthesis.
 *
 *   2. THE EMPIRE'S BOOKKEEPING ON A CREATOR'S SCREEN. A compilationId, a
 *      goalId and a publicationId were printed beside Arabic sentences. A
 *      Creator is owed WHAT HAPPENED; the number is ours to keep.
 *
 *   3. A LABEL THAT PROMISED THE WRONG THING. «تفضيل الإيقاع» and «تفضيل
 *      الانتقال» sit beside a film that ALREADY arrived rendered from رأس
 *      الأمر. MEASURED before judging: they are NOT dead controls — they are
 *      written onto the Goal. So the mechanism stayed and the label was
 *      repaired, because a Creator reading «pacing» above a finished MP4
 *      reasonably expects it to re-cut the film.
 *
 * The guard reads what is RENDERED, never the comments that explain it.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const RAW = readFileSync(
  join(__dirname, '..', '..', '..', 'app', 'makman-al-ghayah', 'page.tsx'), 'utf8');
const CHAMBER = RAW.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('Makman says what it means', () => {
  it('no foreign word reaches a Creator', () => {
    expect(CHAMBER).not.toContain('(Description)');
  });

  it('the Empire’s own identifiers stay off a Creator’s screen', () => {
    // Printed beside Arabic sentences, a UUID tells a Creator nothing and
    // shows them machinery they were never meant to meet.
    expect(CHAMBER).not.toContain('{compiledGraph.compilationId}');
    expect(CHAMBER).not.toContain('publication.publicationId}');
  });

  it('and what replaced them says what actually happened', () => {
    // Removing a number and leaving a gap would be a different defect.
    expect(CHAMBER).toContain('جاهزٌ للتسجيل والتوزيع');
    expect(CHAMBER).toContain('سُجِّل هدفُك وانطلق التوزيع');
  });

  it('the pacing and transition labels no longer promise a re-cut', () => {
    // The controls are real and write onto the Goal — so they stay. What
    // was wrong was the promise their names made next to a finished film.
    const labels = CHAMBER.match(/<label>[^<]*(?:إيقاعُ|انتقالُ) هذا الهدف[^<]*<\/label>/g) ?? [];
    expect(labels).toHaveLength(2);
    for (const l of labels) expect(l).toContain('ولا يُعيد قصَّ فيلمٍ جاهز');
  });

  it('every destination wears its OWN mark, in the Empire’s colour', () => {
    // «بالروز الخاصه بها ولكن بهويه المنصه». The shape carries recognition;
    // the colour carries ownership. A generic ◈ beside a ❖ is a mark that
    // has to be read, which is not a mark.
    const mark = readFileSync(
      join(__dirname, '..', '..', '..', 'app', 'makman-al-ghayah', 'DestinationMark.tsx'), 'utf8');
    // A hyphenated key is quoted and a plain one is not — the guard reads
    // the key, not its spelling, because the first draft assumed quotes and
    // failed on the unquoted ones.
    for (const p of ['youtube', 'facebook-page', 'instagram-business', 'tiktok', 'telegram', 'google-drive']) {
      expect(mark.includes(`'${p}':`) || mark.includes(`${p}:`)).toBe(true);
    }
    // THE WHOLE POINT: never a brand colour. Drawn in the inherited one.
    expect(mark).toContain('fill="currentColor"');
    expect(mark).not.toMatch(/fill="#[0-9a-fA-F]{3,6}"/);
  });

  it('and the chamber draws them instead of the old glyphs', () => {
    expect((CHAMBER.match(/<DestinationMark /g) ?? []).length).toBe(3);
    // The old glyph map is gone entirely, not merely unused: a table of
    // borrowed symbols with no reader is prose, and prose goes.
    expect(CHAMBER).not.toContain('PROVIDER_MARK');
  });

  it('a film and a narration are no longer blank squares', () => {
    // MEASURED: the Vault list IS loaded and the filter IS right — every
    // asset was simply drawn through one `<img>`, so a Creator with a full
    // Vault saw an empty room.
    expect(CHAMBER).toContain("a.kind === 'MOTION'");
    expect(CHAMBER).toContain("carried.kind === 'MOTION'");
    expect((CHAMBER.match(/makman-thumb-sound/g) ?? []).length).toBe(2);
  });

  it('and the asset says what it is, so a surface can draw it', () => {
    const actions = readFileSync(
      join(__dirname, '..', '..', '..', 'app', 'makman-al-ghayah', 'cloud-actions.ts'), 'utf8');
    expect(actions).toContain('kind: asset.capabilityTarget,');
  });

  it('the sound mark paints its own ground', () => {
    // A span with no background is a hole where a picture should be.
    const css = readFileSync(
      join(__dirname, '..', '..', '..', 'app', 'makman-al-ghayah', 'makman-al-ghayah.css'), 'utf8');
    const rule = css.slice(css.indexOf('.makman-thumb-sound {'));
    expect(rule.slice(0, rule.indexOf('}'))).toMatch(/background/);
  });

  it('a Creator meets their PURPOSE before any account plumbing', () => {
    // MEASURED: this chamber gave purpose 53 lines and account plumbing 507,
    // and 480 of those sat BETWEEN the status and the purpose. The status
    // kept its place; only the management moved.
    const purposeAt = CHAMBER.indexOf('makman-purpose-section');
    const manageAt = CHAMBER.indexOf('makman-cloud-manage');
    expect(manageAt).toBeGreaterThan(purposeAt);
  });

  it('and the carrier travelled with it, to the work that uses it', () => {
    // «FROM THE VAULT, INTO THE DISTRIBUTION» by its own heading — so it
    // belongs beside distribution, not between a Creator and their purpose.
    expect(CHAMBER.indexOf('makman-carrier'))
      .toBeGreaterThan(CHAMBER.indexOf('makman-distribution-section'));
  });

  it('the moved section paints the same surface its children came from', () => {
    // Geometry without the layout its children were written for is a silent
    // re-flow — invisible to tsc and to every test but this one.
    const css = readFileSync(
      join(__dirname, '..', '..', '..', 'app', 'makman-al-ghayah', 'makman-al-ghayah.css'), 'utf8');
    expect(css).toContain('.makman-cloud-manage');
    // Extended, never copied: both names share one rule.
    expect(css).toMatch(/\.makman-cloud-panel,\s*\.makman-cloud-manage/);
  });

  it('and the connection status still greets the Creator first, as it was built to', () => {
    // NOT A REPAIR — A GUARD ON A DECISION THIS SESSION ALMOST REVERSED.
    // The cloud panel is first on purpose, recorded in its own comment: a
    // Creator should meet the condition of their destinations before
    // anything is asked of them. Reading the panel confirmed it still opens
    // with one status line per provider, so the proposal to move it was
    // withdrawn. This holds that order against a future tidy-up.
    const cloudAt = CHAMBER.indexOf('makman-cloud-panel');
    const purposeAt = CHAMBER.indexOf('makman-purpose-section');
    expect(cloudAt).toBeGreaterThan(-1);
    expect(cloudAt).toBeLessThan(purposeAt);
    expect(CHAMBER).toContain('makman-cloud-state');
  });
});
