/**
 * AZMA OS — «في أكثر من حجرة»: every room asked the same question, 2026-09-28.
 *
 *   الحجّة الدامغة   59px trapped at 125%, 154px at 150%
 *   قصر الخزانة      80px trapped at FULL SIZE
 *   الخزانة          a false positive — its 50px is a glow, cut by design
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

/** Comments first: a `{` inside one derails any regex that parses blocks. */
function rule(css: string, selector: string): string {
  const out: string[] = [];
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[1]!.split(',').some((s) => s.trim() === selector)) out.push(m[2]!);
  }
  if (out.length === 0) throw new Error(`selector not found: ${selector}`);
  return out.join('\n');
}

// `position: fixed; inset: 0` pins a room to the window; content that outgrows
// it has nowhere to go, and the page cannot scroll to it either. `min-height: 0`
// is what lets the flex child shrink far enough for the overflow to engage.
it.each([
  ['الحجّة الدامغة', 'app/hujjah-al-damighah/hujjah-al-damighah.css', '.hujjah-viewport'],
  ['قصر الخزانة', 'app/sovereign-vault-palace/sovereign-vault.css', '.palace-viewport'],
])('%s scrolls inside itself', (_name, file, selector) => {
  const r = rule(read(file), selector);
  expect(r).toContain('overflow-y: auto');
  expect(r).toContain('min-height: 0');
});

// The keypad's last row sat at 428–472px at every viewport height. `min-height:
// 100vh` could not work alone: the gate still shrank to the viewport and
// `justify-content: center` pushed its own rows out of the shrunken box.
it('the Palace gate keeps its height so the room can scroll to the keypad', () => {
  expect(rule(read('app/sovereign-vault-palace/sovereign-vault.css'), '.palace-gate'))
    .toContain('flex-shrink: 0');
});

// CORRECTED THE SAME DAY: the sweep called the Vault's gate cards defective and
// I changed them. The only overflowing child is `.gate-portal-effect` — an empty
// glow hung at `bottom: -50px` for `overflow: hidden` to cut, exactly as
// designed. The card is held as it was; the sweep was corrected instead.
it('the Vault’s gate cards keep their fixed height and cut glow', () => {
  expect(rule(read('app/sovereign-vault/sovereign-vault.css'), '.gate-card'))
    .toContain('height: 160px');
  expect(read('scripts/zoom-audit-all-chambers.mjs')).toContain('inFlowOverflows');
});
