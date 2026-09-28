/**
 * AZMA OS — the idea board, walked by hand on production, 2026-09-28.
 *
 *   Three unrelated ideas — Arabic and English — were typed into «اكتب فكرتك»
 *   and «✦ أنشئ المشاهد» was pressed. Every one came back accusing the
 *   Creator's own words. These are the two defects that made that possible.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const BRIDGE = readFileSync(
  join(process.cwd(), 'src/chambers/hujjah-al-damighah/sovereign-language-bridge.ts'),
  'utf8',
);
// The code, not the prose about it: the record of what this repaired quotes
// the old sentence, and a guard that reads comments would judge the record.
const ACTIONS = readFileSync(join(process.cwd(), 'app/ras-amr/actions.ts'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
const PAGE = readFileSync(join(process.cwd(), 'app/ras-amr/page.tsx'), 'utf8');

it('a refusal by the provider is not reported as a fault in the Creator\'s wording', () => {
  expect(ACTIONS).not.toContain('رُفضت صياغة الفكرة كما كُتبت');
});

it('an allowance spent before the first word is its own failure, not an empty answer', () => {
  expect(BRIDGE).toContain("finishReason === 'MAX_TOKENS'");
  expect(BRIDGE).toContain("'EXHAUSTED'");
});

it('composing scenes carries its own allowance, not the translation\'s', () => {
  expect(BRIDGE).toContain('STRUCTURE_MAX_TOKENS');
  expect(BRIDGE).not.toContain('SYNTHESIS_TIMEOUT_MS, 1_200');
});

it('scenes that arrive are shown in the world that holds them', () => {
  // `setActiveWorkspaceTab('direction')` sent the Creator to a montage tab
  // while their new scenes lived in the storyboard world.
  const at = PAGE.indexOf('data-testid="rasamr-brief-compose"');
  const compose = PAGE.slice(at, at + 3000);
  expect(compose).toContain("setWorkMode('storyboard')");
});
