/**
 * AZMA OS — رأس الأمر split into two worlds, 2026-09-28.
 *
 *   «رأس الأمر منقسمة إلى قسمين» — عالَم الستوري بورد, from an idea to scenes,
 *   and المونتاج, from assets to one film. It replaces «المونتاج» و«الإنتاج»,
 *   two names that both ended in an mp4.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PAGE = readFileSync(join(process.cwd(), 'app/ras-amr/page.tsx'), 'utf8');

it('the room has two worlds, and «الإنتاج» is no longer one of them', () => {
  expect(PAGE).toContain("useState<'storyboard' | 'montage'>");
  expect(PAGE).toContain("'✦ عالَم الستوري بورد'");
  expect(PAGE).not.toContain("'✦ الإنتاج'");
});

it('the scenes panel is in the storyboard world, not behind a montage tab', () => {
  // It used to render only under `montage + direction`, where a Creator had
  // to already know to look for it.
  const at = PAGE.indexOf("workMode === 'storyboard'");
  expect(at).toBeGreaterThan(-1);
  expect(PAGE.indexOf('data-testid="rasamr-storyboard"')).toBeGreaterThan(at);
});

it('the Director is one field over one state, rendered in both worlds', () => {
  // Two fields with two states would leave a Creator wondering which of their
  // instructions the Director obeyed.
  expect(PAGE.match(/const directorIntentField =/g)).toHaveLength(1);
  expect(PAGE).toContain("directorIntentField('storyboard')");
  expect(PAGE).toContain("directorIntentField('montage')");
});

it('a template proposes a direction and never erases one', () => {
  expect(PAGE).toContain('directorIntentPreset && !creatorDirectorIntent.trim()');
});
