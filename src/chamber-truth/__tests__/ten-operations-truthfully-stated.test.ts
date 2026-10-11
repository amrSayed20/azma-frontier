/**
 * AZMA OS — TEN ACTS, EACH STATED TRUTHFULLY, 2026-10-11.
 *
 * Four operations were authorized as one construction package. A visible card
 * is not evidence of a functioning capability, so these hold the distinction
 * the directive demands: AVAILABLE · BLOCKED · NOT VERIFIED.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  qiyamahOperations, stateOfOperation, operationDescriptor, OPERATION_GROUPS,
} from '../../qiyamah-generation/operation-catalog';
import { QIYAMAH_OPERATION_IDS, briefContractFor } from '../../qiyamah-generation/prompt-contract';
import { CREATIVE_READINESS } from '../../core/sovereign-ai-integration/adapters/magic-hour-creative-operations';
import { LIKENESS_POLICY_VERSION } from '../../vault/likeness-acknowledgment';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const CENTER = read('app/qiyamah-chamber/OperationsCenter.tsx');
const CSS = read('app/qiyamah-chamber/qiyamah-chamber.css');

const NEW_FOUR = ['background-removal', 'lip-sync', 'face-swap', 'talking-photo'] as const;
const OLD_SIX = ['image', 'infographic', 'video', 'edit', 'animate', 'upscale'] as const;

describe('1 · all ten acts reach the centre', () => {
  it('the catalog carries ten', () => {
    expect(QIYAMAH_OPERATION_IDS).toHaveLength(10);
    expect(qiyamahOperations(null)).toHaveLength(10);
  });

  it('each of the four new acts has a card, a name and an outcome in Arabic', () => {
    for (const id of NEW_FOUR) {
      const d = operationDescriptor(id);
      expect(d.nameAr).toMatch(/[؀-ۿ]/);
      expect(d.outcomeAr).toMatch(/[؀-ۿ]/);
      expect(d.glyph.length).toBeGreaterThan(0);
    }
  });

  it('each belongs to a declared group', () => {
    const groups = new Set(OPERATION_GROUPS.map((g) => g.id));
    for (const id of NEW_FOUR) expect(groups.has(operationDescriptor(id).group)).toBe(true);
  });

  it('each states its required inputs, and the two-asset acts say so', () => {
    expect(operationDescriptor('background-removal').inputs).toEqual(['asset']);
    expect(operationDescriptor('talking-photo').inputs).toEqual(['asset', 'audio-asset']);
    expect(operationDescriptor('lip-sync').inputs).toEqual(['video-asset', 'audio-asset']);
    expect(operationDescriptor('face-swap').inputs).toEqual(['video-asset', 'face-asset']);
  });

  it('every input kind a card can carry has an Arabic word on the screen', () => {
    // `INPUT_AR` quotes only its hyphenated keys, so the instrument must accept
    // both spellings — a grep that knows one form proves nothing about the other.
    for (const id of QIYAMAH_OPERATION_IDS) {
      for (const i of operationDescriptor(id).inputs) {
        // Plain string search in both spellings. A hand-built regex is one
        // more thing that can be wrong about the thing it is measuring.
        expect(CENTER.includes(`'${i}':`) || CENTER.includes(`\n  ${i}:`)).toBe(true);
      }
    }
  });
});

describe('2 · a visible card is not a functioning capability', () => {
  const states = qiyamahOperations(null);

  it('not one of the four is runnable', () => {
    for (const id of NEW_FOUR) {
      expect(states.find((s) => s.id === id)!.runnable).toBe(false);
    }
  });

  it('face swap demands the Creator’s declaration, and the card carries it', () => {
    // It asserted POLICY_BLOCKED until 2026-10-11, when the Chief Architect
    // ordered the safeguard. The policy gap he had to rule on is closed; the
    // declaration is now a standing requirement the surface must render.
    const s = states.find((x) => x.id === 'face-swap')!;
    expect(s.requiresAcknowledgment).toBe(true);
    expect(s.acknowledgmentVersion).toBe(LIKENESS_POLICY_VERSION);
    expect(s.acknowledgmentStatementsAr).toHaveLength(4);
  });

  it('and it is still shut, on the cost nobody has measured', () => {
    expect(states.find((x) => x.id === 'face-swap')!.availability).toBe('COST_NOT_VERIFIED');
  });

  it('no other operation demands a declaration', () => {
    for (const s of states) {
      if (s.id === 'face-swap') continue;
      expect(s.requiresAcknowledgment).toBe(false);
      expect(s.acknowledgmentStatementsAr).toEqual([]);
    }
  });

  it('the other three are NOT VERIFIED on cost, and say the door stays shut', () => {
    for (const id of ['background-removal', 'lip-sync', 'talking-photo'] as const) {
      const s = states.find((x) => x.id === id)!;
      expect(s.availability).toBe('COST_NOT_VERIFIED');
      expect(s.reasonAr).toMatch(/كلفت/);
    }
  });

  it('none of the four claims historical production', () => {
    for (const id of NEW_FOUR) {
      expect(operationDescriptor(id).historicallyProven).toBe(false);
    }
  });

  it('the cost gate cannot be passed by a credential alone', () => {
    // Even with every gateway configured, a cost that was never measured
    // keeps the operation shut.
    for (const id of NEW_FOUR) {
      expect(stateOfOperation(id, ['magic-hour'], null).runnable).toBe(false);
    }
  });

  it('and the gate is the readiness record, not a hard-coded list', () => {
    // Each of the four is shut by at least ONE gate: an unmeasured cost, or a
    // policy nobody ruled. If both ever open, the operation opens with them —
    // which is the point: the verdict follows the record, not a list.
    for (const id of NEW_FOUR) {
      const r = CREATIVE_READINESS.find((x) => x.operation === id)!;
      expect(!r.costBasisVerified || r.policyBlocked).toBe(true);
    }
  });
});

describe('3 · the three shut states are told apart on the card', () => {
  it('the centre renders a different badge for each', () => {
    expect(CENTER).toContain("'POLICY_BLOCKED' ? '⊘ موقوفةٌ بحكم'");
    expect(CENTER).toContain("'COST_NOT_VERIFIED' ? '◌ لم تُقَس كلفتُها'");
  });

  it('a shut card cannot be pressed, whichever reason shut it', () => {
    expect(CENTER).toContain('disabled={!o.runnable}');
    expect(CENTER).toContain('onClick={() => o.runnable && onChoose(o.id)}');
  });

  it('each shut state paints its own surface', () => {
    for (const sel of ['.ops-state--unverified', '.ops-state--blocked']) {
      const i = CSS.indexOf(`${sel} {`);
      expect(i).toBeGreaterThan(-1);
      expect(CSS.slice(i, CSS.indexOf('}', i))).toMatch(/(^|\s)color:/);
    }
  });

  it('no cost is shown for an operation whose cost is not verified', () => {
    // The quote is asked only for runnable operations, and none of the four is.
    expect(CENTER).toContain('operations.filter((o) => o.runnable).map((o) => o.costStep)');
  });
});

describe('4 · the hand-written list is gone — one authority, not two', () => {
  it('the centre no longer declares capabilities of its own', () => {
    const code = CENTER.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toContain('AWAITING');
    expect(code).not.toMatch(/قريباً/);
  });

  it('and it still names no provider', () => {
    expect(CENTER).not.toMatch(/magic.?hour|nano.?banana|seedance|veo3|minimax|kling|ltx-|flux-|gpt-image/i);
  });
});

describe('5 · the four take no creative brief, because none is read', () => {
  it('each reports takesBrief false', () => {
    for (const id of NEW_FOUR) {
      expect(briefContractFor(id, null).takesBrief).toBe(false);
    }
  });

  it('and so the only acts with a brief are the five that always had one', () => {
    const withBrief = QIYAMAH_OPERATION_IDS.filter((id) => briefContractFor(id, null).takesBrief);
    expect([...withBrief].sort()).toEqual(['animate', 'edit', 'image', 'infographic', 'video']);
  });
});

describe('6 · REGRESSION · the six existing acts are untouched', () => {
  const states = qiyamahOperations(null);

  it('all six are still present with their original names and groups', () => {
    const expected: Record<string, [string, string]> = {
      image: ['صورة', 'from-idea'],
      infographic: ['إنفوغرافيك', 'from-idea'],
      video: ['فيديو', 'from-idea'],
      edit: ['تعديل', 'on-my-asset'],
      animate: ['تحريك', 'on-my-asset'],
      upscale: ['رفع الدقّة', 'on-my-asset'],
    };
    for (const [id, [nameAr, group]] of Object.entries(expected)) {
      const d = operationDescriptor(id as never);
      expect(d.nameAr).toBe(nameAr);
      expect(d.group).toBe(group);
    }
  });

  it('all six still carry their original cost step', () => {
    const steps: Record<string, string> = {
      image: 'IMAGE_GENERATION', infographic: 'INFOGRAPHIC', video: 'VIDEO_GENERATION',
      edit: 'IMAGE_EDIT', animate: 'MOTION', upscale: 'UPSCALE_2X',
    };
    for (const [id, step] of Object.entries(steps)) {
      expect(operationDescriptor(id as never).costStep).toBe(step);
    }
  });

  it('all six still report historical production', () => {
    for (const id of OLD_SIX) expect(operationDescriptor(id).historicallyProven).toBe(true);
  });

  it('all six are still AVAILABLE when their gateway is reachable', () => {
    for (const id of OLD_SIX) {
      expect(stateOfOperation(id, ['magic-hour'], null).runnable).toBe(true);
    }
  });

  it('and the four new cards did not take their place in the order', () => {
    // Within a group the runnable ones sort first, so a Creator still meets a
    // working act before a shut one.
    expect(CENTER).toContain('Number(b.runnable) - Number(a.runnable)');
  });

  it('the five briefs keep the cap the prompt contract already established', () => {
    for (const id of ['image', 'infographic', 'video', 'edit', 'animate'] as const) {
      const c = briefContractFor(id, null);
      expect(c.effectiveCap).toBeGreaterThan(1000);
      expect([500, 1000, 2000]).not.toContain(c.effectiveCap);
    }
  });
});
