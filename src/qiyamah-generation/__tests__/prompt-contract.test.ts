/**
 * AZMA OS — THE PROMPT CONTRACT, 2026-10-11.
 *
 * The nine cases the construction directive names, each at its narrowest. The
 * defect being guarded: three unreconciled ceilings — 500, 2 000, 1 000 — with
 * the widest in the middle, so a brief accepted at one door was refused at the
 * next, and the refusal arrived after the promise.
 */

import {
  briefContractFor, validateBrief, validateSubmittedPrompt,
  buildScaffoldedPrompt, scaffoldLength, MAX_SCAFFOLD_LENGTH,
  designatedBindingFor, STYLE_SCAFFOLD, operationFromStyle,
  QIYAMAH_OPERATION_IDS, type QiyamahOperationId,
} from '../prompt-contract';

const BRIEF_OPS: readonly QiyamahOperationId[] = ['image', 'infographic', 'video', 'edit', 'animate'];

describe('1 · the cap is the provider’s, and it says whose it is', () => {
  it('every operation that takes a brief carries a bound and names its source', () => {
    for (const id of BRIEF_OPS) {
      const c = briefContractFor(id, null);
      expect(c.effectiveCap).toBeGreaterThan(0);
      expect(['provider-documented', 'empire-guard']).toContain(c.boundSource);
    }
  });

  it('no operation is bounded by the three numbers that were removed', () => {
    for (const id of BRIEF_OPS) {
      expect([500, 1000, 2000]).not.toContain(briefContractFor(id, null).effectiveCap);
    }
  });

  it('the bound is derived from the operation’s own designated gateway', () => {
    // If the fleet re-designates, the contract must follow without an edit here.
    expect(designatedBindingFor('image').gatewayId).toBe(
      briefContractFor('image', null).submittedCap === 32000 ? 'openai' : 'magic-hour',
    );
  });
});

describe('2 · the scaffold is reserved inside the cap, never charged on top', () => {
  it('the cap plus the scaffold is exactly what the provider receives', () => {
    const c = briefContractFor('image', 'cinematic');
    expect(c.effectiveCap + c.scaffoldCharacters).toBe(c.submittedCap);
  });

  it('the widest scaffold leaves the least room, and it is the infographic’s', () => {
    const info = briefContractFor('infographic', 'infographic');
    const doc = briefContractFor('image', 'documentary');
    expect(info.scaffoldCharacters).toBe(MAX_SCAFFOLD_LENGTH);
    expect(info.effectiveCap).toBeLessThan(doc.effectiveCap);
  });

  it('an act on an owned asset is not wrapped in a scene description', () => {
    expect(briefContractFor('edit', 'cinematic').scaffoldCharacters).toBe(0);
    expect(briefContractFor('animate', 'cinematic').scaffoldCharacters).toBe(0);
  });
});

describe('3 · below, at, and past the limit', () => {
  const style = 'cinematic';
  const cap = briefContractFor('image', style).effectiveCap;

  it('below the limit passes', () => {
    expect(validateBrief('image', style, 'x'.repeat(cap - 1)).ok).toBe(true);
  });

  it('exactly at the limit passes — an off-by-one here is a refusal nobody can explain', () => {
    expect(validateBrief('image', style, 'x'.repeat(cap)).ok).toBe(true);
  });

  it('one past the limit is refused, and told by how much', () => {
    const v = validateBrief('image', style, 'x'.repeat(cap + 1));
    expect(v.ok).toBe(false);
    if (!v.ok) { expect(v.reason).toBe('too-long'); expect(v.overBy).toBe(1); }
  });
});

describe('4 · what passes one door cannot be refused by the next', () => {
  it('a brief at the cap survives scaffolding and the submitted gate', () => {
    for (const styleId of Object.keys(STYLE_SCAFFOLD)) {
      const op: QiyamahOperationId = styleId === 'infographic' ? 'infographic' : 'image';
      const cap = briefContractFor(op, styleId).effectiveCap;
      const at = 'ب'.repeat(cap);
      expect(validateBrief(op, styleId, at).ok).toBe(true);
      const submitted = buildScaffoldedPrompt(at, styleId);
      expect(validateSubmittedPrompt(op, submitted).ok).toBe(true);
    }
  });

  it('the scaffold the builder adds is the length the cap reserved', () => {
    for (const styleId of Object.keys(STYLE_SCAFFOLD)) {
      expect(buildScaffoldedPrompt('x', styleId).length).toBe(scaffoldLength(styleId) + 1);
    }
  });
});

describe('5 · a long multi-paragraph brief is production input, not an error', () => {
  const brief = Array.from(
    { length: 14 },
    (_, i) => `فقرة ${i + 1}: ${'وصفٌ مفصّل للمشهد وللإضاءة وللحركة. '.repeat(5)}`,
  ).join('\n\n');

  it('it is longer than every ceiling that was removed', () => {
    expect(brief.length).toBeGreaterThan(2000);
  });

  it('it is accepted', () => {
    expect(validateBrief('image', 'cinematic', brief).ok).toBe(true);
  });

  it('its paragraph breaks survive — only the ends are trimmed', () => {
    const wrapped = buildScaffoldedPrompt(`  ${brief}  `, 'cinematic');
    expect(wrapped).toContain('\n\n');
    expect(wrapped.split('\n\n').length).toBe(14);
  });
});

describe('6 · Arabic and non-Latin text is measured as the Creator wrote it', () => {
  it('an Arabic brief at the cap is accepted, and one character past it is not', () => {
    const cap = briefContractFor('image', 'cinematic').effectiveCap;
    expect(validateBrief('image', 'cinematic', 'م'.repeat(cap)).ok).toBe(true);
    expect(validateBrief('image', 'cinematic', 'م'.repeat(cap + 1)).ok).toBe(false);
  });

  it('the refusal is written in the Creator’s language, not a provider’s', () => {
    const cap = briefContractFor('image', 'cinematic').effectiveCap;
    const v = validateBrief('image', 'cinematic', 'م'.repeat(cap + 5));
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.messageAr).toMatch(/[؀-ۿ]/);
      expect(v.messageAr).not.toMatch(/[A-Za-z]{4,}/);
    }
  });
});

describe('7 · nothing is ever silently truncated', () => {
  it('the builder returns every character it was given', () => {
    const text = 'أ'.repeat(5000);
    expect(buildScaffoldedPrompt(text, 'cinematic')).toContain(text);
  });

  it('an over-long brief is refused, never shortened to fit', () => {
    const cap = briefContractFor('image', 'cinematic').effectiveCap;
    const over = 'ج'.repeat(cap + 300);
    const v = validateBrief('image', 'cinematic', over);
    expect(v.ok).toBe(false);
    // The validator returns a verdict and no text: there is no path by which
    // it could hand a caller a shortened brief to send instead.
    expect(Object.keys(v)).not.toContain('text');
  });

  it('no prompt-bearing module slices a prompt', () => {
    const fs = require('fs'); const path = require('path');
    const files = [
      'src/qiyamah-generation/prompt-contract.ts',
      'src/qiyamah-generation/generation-service.ts',
      'app/api/qiyamah/expand/route.ts',
    ];
    for (const f of files) {
      const src: string = fs.readFileSync(path.join(process.cwd(), f), 'utf8');
      expect(src).not.toMatch(/prompt[A-Za-z]*\.(slice|substring|substr)\(/);
      expect(src).not.toMatch(/(brief|idea|externalPrompt)[A-Za-z]*\.(slice|substring|substr)\(/);
    }
  });
});

describe('8 · the server refuses, and says so', () => {
  it('an empty brief is refused before any provider is named', () => {
    const v = validateBrief('image', 'cinematic', '   \n  ');
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe('empty');
  });

  it('an operation that takes no brief refuses one rather than ignoring it', () => {
    const v = validateBrief('upscale', null, 'ارفع دقّته كثيراً');
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe('operation-takes-no-brief');
  });

  it('the detail kept for a log carries no Arabic and no secret', () => {
    const cap = briefContractFor('image', 'cinematic').effectiveCap;
    const v = validateBrief('image', 'cinematic', 'x'.repeat(cap + 1));
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.detailEn).not.toMatch(/[؀-ۿ]/);
      expect(v.detailEn).not.toMatch(/sk-|Bearer|api[_-]?key/i);
    }
  });
});

describe('9 · the interface and the server read the same function', () => {
  it('the contract is a pure function of operation and style', () => {
    const a = briefContractFor('video', 'scifi');
    const b = briefContractFor('video', 'scifi');
    expect(a).toEqual(b);
  });

  it('every operation the chamber performs has a contract', () => {
    for (const id of QIYAMAH_OPERATION_IDS) {
      expect(briefContractFor(id, null).operation).toBe(id);
    }
  });

  it('a generation request’s operation is derived, not assumed', () => {
    expect(operationFromStyle('infographic', 'image')).toBe('infographic');
    expect(operationFromStyle('cinematic', 'image')).toBe('image');
    expect(operationFromStyle('cinematic', 'video')).toBe('video');
  });
});
