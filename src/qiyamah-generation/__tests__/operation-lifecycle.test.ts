/**
 * AZMA OS — LAYER C · ONE LIFECYCLE FOR THE SIX ACTS, 2026-10-11.
 *
 * Four vocabularies described one idea, and `ready` meant «not started» in two
 * of them and «finished» in a third. None could express the state this Empire
 * cares most about: bytes exist and nobody owns them yet.
 */

import {
  lifecycleOf, lifecycleOfGeneration, lifecycleOfMutation, lifecycleOfUpscale,
  lifecycleSentenceAr, isInFlight, hasOutput, mayRetry, nextActions,
  outcomeContract, type OperationLifecycle,
} from '../operation-lifecycle';
import { QIYAMAH_OPERATION_IDS, type QiyamahOperationId } from '../prompt-contract';

const ALL: readonly OperationLifecycle[] = [
  'READY', 'SUBMITTED', 'PROCESSING', 'DEPOSITED', 'ACCEPTED', 'FAILED', 'CANCELLED', 'UNKNOWN',
];

describe('1 · all six acts report the one vocabulary', () => {
  it('every operation resolves to a lifecycle value', () => {
    for (const op of QIYAMAH_OPERATION_IDS) {
      expect(ALL).toContain(lifecycleOf({ operation: op }));
    }
  });

  it('an unstarted act is READY in all six, whatever its own word was', () => {
    // `editState`/`animateState` start at 'ready' and `upscaleState` at 'idle'.
    for (const op of QIYAMAH_OPERATION_IDS) {
      expect(lifecycleOf({
        operation: op, generationStage: 'idea', mutationState: 'ready', upscaleState: 'idle',
      })).toBe('READY');
    }
  });

  it('a running act is PROCESSING in all six', () => {
    for (const op of QIYAMAH_OPERATION_IDS) {
      expect(lifecycleOf({
        operation: op, generationStage: 'generating', mutationState: 'running', upscaleState: 'running',
      })).toBe('PROCESSING');
    }
  });

  it('a failed act is FAILED in all six', () => {
    for (const op of QIYAMAH_OPERATION_IDS) {
      expect(lifecycleOf({
        operation: op, generationStage: 'error', mutationState: 'failed', upscaleState: 'failed',
      })).toBe('FAILED');
    }
  });

  it('every lifecycle has its own Arabic sentence, and no two are the same', () => {
    const said = ALL.map(lifecycleSentenceAr);
    expect(new Set(said).size).toBe(ALL.length);
    for (const s of said) expect(s).toMatch(/[؀-ۿ]/);
  });
});

describe('2 · the acceptance boundary is unreachable from a provider reply', () => {
  it('a produced output is DEPOSITED, never ACCEPTED, until acceptance', () => {
    expect(lifecycleOfGeneration('result', false)).toBe('DEPOSITED');
    expect(lifecycleOfMutation('ready', 'asset_1', false)).toBe('DEPOSITED');
    expect(lifecycleOfUpscale('ready', 'asset_1', false)).toBe('DEPOSITED');
  });

  it('only acceptance reaches ACCEPTED', () => {
    expect(lifecycleOfGeneration('result', true)).toBe('ACCEPTED');
    expect(lifecycleOfMutation('ready', 'asset_1', true)).toBe('ACCEPTED');
    expect(lifecycleOfUpscale('ready', 'asset_1', true)).toBe('ACCEPTED');
  });

  it('no provider concept appears anywhere in the module', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/qiyamah-generation/operation-lifecycle.ts'), 'utf8');
    expect(src).not.toMatch(/finishReason|providerFileId|magic.?hour|openai|credits_charged/i);
  });

  it('an asset id cannot be carried by a state that has no output', () => {
    for (const lc of ALL) {
      const c = outcomeContract({ operation: 'image', lifecycle: lc, assetId: 'asset_x', assetUri: '/u/x.png' });
      expect(c.assetId === null).toBe(!hasOutput(lc));
      expect(c.assetUri === null).toBe(!hasOutput(lc));
    }
  });
});

describe('3 · an unknown outcome is not a failure, and must not be retried', () => {
  it('a lost connection mid-production is UNKNOWN, not FAILED', () => {
    expect(lifecycleOfGeneration('generating', false, true)).toBe('UNKNOWN');
  });

  it('UNKNOWN offers asking, never retrying — a retry there pays twice', () => {
    expect(mayRetry('UNKNOWN')).toBe(false);
    expect(nextActions('UNKNOWN')).toEqual(['ask']);
  });

  it('only FAILED and CANCELLED may be retried', () => {
    for (const lc of ALL) {
      expect(mayRetry(lc)).toBe(lc === 'FAILED' || lc === 'CANCELLED');
    }
  });

  it('cancellation outranks every other reading of the state', () => {
    expect(lifecycleOf({ operation: 'video', generationStage: 'generating', cancelled: true })).toBe('CANCELLED');
  });
});

describe('4 · in-flight is one answer, so six screens cannot disagree', () => {
  it('exactly SUBMITTED and PROCESSING are in flight', () => {
    for (const lc of ALL) {
      expect(isInFlight(lc)).toBe(lc === 'SUBMITTED' || lc === 'PROCESSING');
    }
  });

  it('exactly DEPOSITED and ACCEPTED have an output', () => {
    for (const lc of ALL) {
      expect(hasOutput(lc)).toBe(lc === 'DEPOSITED' || lc === 'ACCEPTED');
    }
  });
});

describe('5 · the result contract is the same shape for every act', () => {
  const keys = (op: QiyamahOperationId) =>
    Object.keys(outcomeContract({ operation: op, lifecycle: 'DEPOSITED' })).sort();

  it('six acts, one shape', () => {
    const first = keys('image');
    for (const op of QIYAMAH_OPERATION_IDS) expect(keys(op)).toEqual(first);
  });

  it('a balance outcome is carried only where a failure happened', () => {
    for (const lc of ALL) {
      const c = outcomeContract({ operation: 'edit', lifecycle: lc, balanceOutcome: 'released' });
      expect(c.balanceOutcome === null).toBe(lc !== 'FAILED');
    }
  });

  it('a failure with no stated balance outcome does not claim one was released', () => {
    // 'none' means «nothing was reserved», which is true of edit, animate and
    // upscale — they reserve nothing. It is never 'released', which would
    // assert a return that never happened.
    expect(outcomeContract({ operation: 'upscale', lifecycle: 'FAILED' }).balanceOutcome).toBe('none');
  });

  it('a message is always present, and falls back to the lifecycle’s own words', () => {
    for (const lc of ALL) {
      expect(outcomeContract({ operation: 'video', lifecycle: lc, messageAr: '  ' }).messageAr)
        .toBe(lifecycleSentenceAr(lc));
    }
  });

  it('the intent key is carried for every act, not only for video', () => {
    for (const op of QIYAMAH_OPERATION_IDS) {
      expect(outcomeContract({ operation: op, lifecycle: 'SUBMITTED', intentKey: 'k-1' }).intentKey).toBe('k-1');
    }
  });
});

describe('6 · what a Creator may do next is named once', () => {
  it('a deposited output offers acceptance before anything else', () => {
    expect(nextActions('DEPOSITED')[0]).toBe('accept');
  });

  it('an accepted asset offers reuse, and never acceptance again', () => {
    expect(nextActions('ACCEPTED')).not.toContain('accept');
    expect(nextActions('ACCEPTED')).toContain('reuse');
  });

  it('an act in flight offers nothing — there is nothing truthful to offer', () => {
    expect(nextActions('PROCESSING')).toEqual([]);
    expect(nextActions('SUBMITTED')).toEqual([]);
  });
});

/**
 * An authority with no consumer is a connection debt, not a layer. These hold
 * the wiring: the chamber must READ this vocabulary, and the three ad-hoc
 * status paragraphs it replaced must be gone.
 */
describe('7 · the chamber speaks through it', () => {
  const read = (f: string) =>
    require('fs').readFileSync(require('path').join(process.cwd(), f), 'utf8') as string;
  const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');
  const CSS = read('app/qiyamah-chamber/qiyamah-chamber.css');

  it('the chamber derives the lifecycle from this module', () => {
    expect(CLIENT).toContain("from '@/src/qiyamah-generation/operation-lifecycle'");
    expect(CLIENT).toContain('const lifecycleFor = (op: string): OperationLifecycle => lifecycleOf({');
  });

  it('every act renders the one status line', () => {
    for (const op of ['animate', 'upscale', 'edit']) {
      expect(CLIENT).toContain(`<OperationStatusLine lifecycle={lifecycleFor('${op}')}`);
    }
  });

  it('the ad-hoc status paragraphs it replaced are gone', () => {
    const code = CLIENT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toContain('الحركة قيد البعث… لا تغلق الصفحة.');
    expect(code).not.toContain('الدقّة تُرفَع… لا تغلق الصفحة.');
    expect(code).not.toContain('التعديل قيد التنفيذ… لا تغلق الصفحة.');
  });

  it('each lifecycle that a Creator can see paints its own surface', () => {
    for (const lc of ['deposited', 'accepted', 'failed', 'unknown', 'cancelled']) {
      const i = CSS.indexOf(`.op-status--${lc} {`);
      expect(i).toBeGreaterThan(-1);
      const rule = CSS.slice(i, CSS.indexOf('}', i));
      expect(rule).toMatch(/background/);
      expect(rule).toMatch(/(^|\s)color:/);
    }
  });

  it('the status line never invents a seventh state', () => {
    const i = CLIENT.indexOf('function OperationStatusLine(');
    expect(i).toBeGreaterThan(-1);
    // A fixed window. Scanning for the next `\n}` stops 52 characters in, at
    // the destructuring pattern's own closing brace, and proves nothing — an
    // instrument that lies is worse than no instrument.
    const body = CLIENT.slice(i, i + 1400);
    // Its only source of words is the module's own sentence function.
    expect(body).toContain('lifecycleSentenceAr(lifecycle)');
  });
});
