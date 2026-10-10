/**
 * AZMA OS — القيامة: ONE PLACE WHERE AN ACT IS FOUND, 2026-10-11.
 *
 * Phase 0 measured six live-proven operations scattered across three
 * interface locations: four in the act chooser, upscaling only inside a result
 * panel, and editing twice. A Creator who had produced nothing could not learn
 * that upscaling existed.
 *
 * These tests hold the structure that fixes it — not its wording.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { qiyamahOperations } from '../../qiyamah-generation/operation-catalog';
import { QIYAMAH_OPERATION_IDS } from '../../qiyamah-generation/prompt-contract';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');
const CENTER = read('app/qiyamah-chamber/OperationsCenter.tsx');
const PAGE = read('app/qiyamah-chamber/page.tsx');
const CSS = read('app/qiyamah-chamber/qiyamah-chamber.css');

describe('1 · the centre is the chamber’s mother state', () => {
  it('no workspace can render before an act has been chosen', () => {
    expect(CLIENT).toContain('chosenOperation === null &&');
    expect(CLIENT).toContain('chosenOperation !== null &&');
  });

  it('the centre is rendered from the server’s verdict, not from markup', () => {
    expect(CLIENT).toContain('<OperationsCenter');
    expect(CLIENT).toContain('operations={operations}');
    expect(PAGE).toContain('const operations = qiyamahOperations(null);');
  });

  it('the way back exists and clears no draft', () => {
    expect(CLIENT).toContain('function returnToCenter()');
    // The drafts live in their own store; returning must not touch it.
    const fn = CLIENT.slice(CLIENT.indexOf('function returnToCenter()'));
    const body = fn.slice(0, fn.indexOf('\n  }'));
    expect(body).not.toContain('setDrafts');
  });
});

describe('2 · every act the chamber performs is discoverable in that one place', () => {
  it('all six operations reach the centre', () => {
    expect(qiyamahOperations(null).map((o) => o.id).sort())
      .toEqual([...QIYAMAH_OPERATION_IDS].sort());
  });

  it('upscaling is among them — it used to exist only after a result', () => {
    expect(qiyamahOperations(null).some((o) => o.id === 'upscale')).toBe(true);
    expect(CLIENT).toContain("chosenOperation === 'upscale' ?");
  });

  it('the contextual shortcut on a fresh result calls the SAME handler', () => {
    // Two entry points to one operation, one implementation — never two.
    const calls = CLIENT.match(/handleUpscaleAsset\(/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(3); // declaration + both doors
    expect(CLIENT.match(/async function handleUpscaleAsset\(/g)).toHaveLength(1);
  });
});

describe('3 · a card that cannot run is not a door', () => {
  it('an unrunnable card is disabled and carries its reason', () => {
    expect(CENTER).toContain('disabled={!o.runnable}');
    expect(CENTER).toContain('{o.reasonAr}');
  });

  it('the card cannot choose an operation the server did not mark runnable', () => {
    expect(CENTER).toContain('onClick={() => o.runnable && onChoose(o.id)}');
  });

  it('the awaiting capabilities are not buttons at all', () => {
    const block = CENTER.slice(CENTER.indexOf('AWAITING.map('));
    expect(block.slice(0, 400)).not.toContain('<button');
  });
});

describe('4 · the centre computes nothing it has no right to', () => {
  it('it holds no availability logic of its own', () => {
    expect(CENTER).not.toMatch(/process\.env/);
    expect(CENTER).not.toMatch(/API_KEY/);
    expect(CENTER).not.toMatch(/MAGIC_HOUR|OPENAI|ELEVENLABS/);
  });

  it('it names a cost STEP and never a rate — the financial authority is untouched', () => {
    expect(CENTER).toContain('quoteStep(step)');
    expect(CENTER).not.toMatch(/\b(markup|margin|balancePerUnit|BALANCE_UNIT)\b/);
  });

  it('no provider or model name can reach a Creator through it', () => {
    const forbidden = /magic.?hour|nano.?banana|seedance|veo3|minimax|kling|ltx-|flux-|dall-e|gpt-image/i;
    expect(CENTER).not.toMatch(forbidden);
  });
});

describe('5 · every new control paints its own surface', () => {
  // A control given geometry alone is born browser-white on this chamber's
  // near-black ground, and neither tsc nor a token sweep can see it.
  it.each(['.ops-card', '.ops-chip', '.ops-rail-back', '.brief-cap', '.edit-act-hint'])(
    '%s declares a colour',
    (sel) => {
      const i = CSS.indexOf(sel + ' {');
      expect(i).toBeGreaterThan(-1);
      const rule = CSS.slice(i, CSS.indexOf('}', i));
      expect(rule).toMatch(/(^|\s)color:/);
      expect(rule).toMatch(/background/);
    },
  );

  it('the phone gets one column and no sideways page scroll', () => {
    expect(CSS).toContain('@media (max-width: 640px)');
    const mq = CSS.slice(CSS.lastIndexOf('@media (max-width: 640px)'));
    expect(mq).toContain('.ops-cards { grid-template-columns: 1fr; }');
  });

  it('keyboard focus is visible on every new control', () => {
    for (const sel of ['.ops-card:focus-visible', '.ops-rail-back:focus-visible']) {
      expect(CSS).toContain(sel);
    }
  });
});

describe('6 · no field silently stops a hand any more', () => {
  it('not one brief field carries a hard character limit', () => {
    // `maxLength={1000}` stopped three fields at a number no provider ever
    // published, with no word to the Creator about why. The comments that
    // record that defect still name it, so the assertion is on CODE lines —
    // a grep that cannot tell a comment from an attribute proves nothing.
    const code = CLIENT
      .replace(/\/\*[\s\S]*?\*\//g, '')   // block and JSX comments
      .replace(/^\s*\/\/.*$/gm, '');      // line comments
    expect(code).not.toMatch(/maxLength=\{\d+\}/);
  });

  it('the ceiling is stated instead, from the server’s own contract', () => {
    expect(CLIENT).toContain('<BriefCapLine');
    expect(CLIENT).toContain('function briefCapOf(');
    // And it is read, never recomputed, in the browser.
    expect(CLIENT).toContain('operations.find((o) => o.id === operationId)?.brief ?? null');
  });
});
