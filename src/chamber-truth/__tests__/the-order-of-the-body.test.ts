/**
 * AZMA OS — A COMPONENT BODY RUNS TOP TO BOTTOM, 2026-10-12.
 *
 * ─── THE DEFECT THIS FILE EXISTS FOR ────────────────────────────────────────
 *
 *   On the live release, pressing ANY operation card took the chamber down:
 *   «This page couldn't load», and in the browser's own words «Cannot access
 *   'ad' before initialization».
 *
 *   The cause was one dead line:
 *
 *       const activeLifecycle = chosenOperation ? lifecycleFor(chosenOperation) : 'READY';
 *
 *   Nothing read it. It CALLED `lifecycleFor` during render, far above the
 *   seven `useState` declarations that function reads. While no card had been
 *   pressed `chosenOperation` was null, the call never happened, and every
 *   test and every page view looked perfect. The first click ran it, hit the
 *   temporal dead zone, and crashed the page.
 *
 *   No unit test could see it. The function was right, the lifecycle module
 *   was right, the panel rendered right on a server. Only a browser pressing a
 *   real button could — and a browser is not always at hand.
 *
 *   So this holds the one structural fact that makes it impossible: a helper
 *   that reads state is DECLARED BELOW the state it reads. Then calling it
 *   early is a TypeScript error rather than a live crash.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const CLIENT = readFileSync(
  join(process.cwd(), 'app/qiyamah-chamber/QiyamahChamberClient.tsx'), 'utf8');

/** Where a declaration sits in the body, ignoring the prose that explains it. */
const at = (needle: string): number => {
  const i = CLIENT.indexOf(needle);
  expect(i).toBeGreaterThan(-1);
  return i;
};

describe('the lifecycle reader is declared below everything it reads', () => {
  const READS = [
    'const [stage,',
    'const [generatedAssetId,',
    'const [upscaleState,',
    'const [animateState,',
    'const [animatedResult,',
    'const [editState,',
    'const [acceptedAssetIds,',
    'const [editedAssetId,',
  ];

  it.each(READS)('`lifecycleFor` comes after %s', (decl) => {
    expect(at('const lifecycleFor =')).toBeGreaterThan(at(decl));
  });

  it('and `producedBy` does too, since the reader calls it', () => {
    expect(at('const producedBy =')).toBeGreaterThan(at('const [editedAssetId,'));
  });

  it('the dead binding that crashed the chamber is gone', () => {
    // It may be QUOTED in the comment that records the defect; it must not be
    // declared. One is a record, the other is the crash.
    const code = CLIENT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toContain('const activeLifecycle');
  });

  it('nothing calls the reader before the state exists', () => {
    // The comment above the declaration QUOTES the crashing line, so the
    // search runs over code with its prose stripped — an instrument that
    // matches the record of a defect is measuring itself.
    const code = CLIENT.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
    const declaredAt = code.indexOf('const lifecycleFor =');
    expect(declaredAt).toBeGreaterThan(-1);
    expect(code.indexOf('lifecycleFor(')).toBeGreaterThan(declaredAt);
  });
});
