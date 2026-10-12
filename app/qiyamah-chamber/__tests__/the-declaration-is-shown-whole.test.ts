/**
 * AZMA OS — THE DECLARATION, AS A CREATOR ACTUALLY MEETS IT · 2026-10-11
 *
 * The panel is RENDERED here, not read as text: `renderToStaticMarkup` gives
 * the real first frame a Creator sees, which is the only frame in which
 * «unchecked by default» can be false. A grep over the source could not tell
 * `checked={declared}` from `checked`, and that difference is the whole
 * safeguard.
 *
 * The gating predicate is tested directly, because the panel's selections are
 * internal state by design and no browser runs in this suite.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import {
  CreativeActPanel, creativeRunBlock, CREATIVE_BLOCK_AR, CREATIVE_ACT_IDS,
} from '../CreativeActPanel';
import {
  LIKENESS_STATEMENTS_AR, LIKENESS_POLICY_VERSION,
} from '@/src/vault/likeness-acknowledgment';
import { operationIsInspectable } from '../OperationsCenter';

const faceSwapState = (over: Record<string, unknown> = {}) => ({
  id: 'face-swap', group: 'on-my-asset', nameAr: 'تبديل الوجه',
  outcomeAr: 'وجهٌ يَحِلّ مكانَ وجه', glyph: '◉',
  inputs: ['video-asset', 'face-asset'], costStep: 'FACE_SWAP',
  historicallyProven: false, availability: 'AVAILABLE', runnable: true,
  reasonAr: '', detailEn: '', takesBrief: false, scaffolds: false,
  requiresAcknowledgment: true,
  acknowledgmentVersion: LIKENESS_POLICY_VERSION,
  acknowledgmentStatementsAr: LIKENESS_STATEMENTS_AR,
  durationBound: { seconds: 60, source: 'empire-guard' },
  brief: {
    effectiveCap: 0, scaffoldCharacters: 0, submittedCap: 0,
    boundSource: 'empire-guard', capNoticeAr: '',
  },
  ...over,
});

const render = (operation: Record<string, unknown>) => renderToStaticMarkup(
  createElement(CreativeActPanel, {
    operation,
    targets: [{ assetId: 'a1', url: '/u/a.mp4', label: 'مقطعٌ في خزانتك' }],
    seconds: [{ assetId: 'a2', url: '/u/b.png', label: 'صورةٌ في خزانتك' }],
    onBack: () => {},
    onRun: async () => ({ ok: true }),
  } as never),
);

describe('1 · the Creator reads all of it, before anything is sent', () => {
  const html = render(faceSwapState());

  it('every sentence of the declaration is present, whole', () => {
    for (const line of LIKENESS_STATEMENTS_AR) expect(html).toContain(line);
  });

  it('nothing is folded away behind a «read more»', () => {
    expect(html).not.toMatch(/<details|aria-expanded="false"|المزيد/);
  });

  it('the affirmation is labelled in the Creator’s own words', () => {
    expect(html).toContain('أُقِرّ بما تَقدّم');
  });

  it('and the heading names the act it belongs to', () => {
    expect(html).toContain('إقرارٌ قبل تبديل الوجه');
  });
});

describe('2 · it is never pre-checked, and it blocks the act', () => {
  const html = render(faceSwapState());

  it('the box is rendered unchecked in the very first frame', () => {
    expect(html).toContain('type="checkbox"');
    // React renders `checked` into the attribute only when it is true. This is
    // the assertion a source grep could not make.
    expect(html).not.toMatch(/type="checkbox"[^>]*checked/);
  });

  it('the submit button starts disabled', () => {
    expect(html).toMatch(/class="creative-act-run"[^>]*disabled/);
  });

  it('and the Creator is told why, without being told it failed', () => {
    expect(html).toContain(CREATIVE_BLOCK_AR.target);
    expect(html).not.toMatch(/role="alert"/);
  });
});

describe('3 · an act that demands no declaration is shown none', () => {
  const html = render(faceSwapState({
    id: 'background-removal', nameAr: 'إزالة الخلفيّة', inputs: ['asset'],
    requiresAcknowledgment: false, acknowledgmentVersion: null,
    acknowledgmentStatementsAr: [],
  }));

  it('no checkbox, and no likeness sentence', () => {
    expect(html).not.toContain('type="checkbox"');
    expect(html).not.toContain(LIKENESS_STATEMENTS_AR[0]);
  });

  it('and it asks for no duration either — the provider asks for none', () => {
    expect(html).not.toContain('creative-act-seconds');
  });
});

describe('4 · the one predicate that darkens the button', () => {
  const ready = {
    runnable: true,
    targetChosen: true, needsSecond: true, secondChosen: true,
    needsDuration: true, durationSeconds: 5, maxSeconds: 60,
    needsDeclaration: true, declared: true,
  };

  it('an undeclared face swap is blocked even when everything else is in order', () => {
    expect(creativeRunBlock({ ...ready, declared: false })).toBe('declaration');
  });

  it('a declared one with every input is not blocked', () => {
    expect(creativeRunBlock(ready)).toBeNull();
  });

  it('a duration past the bound is blocked', () => {
    expect(creativeRunBlock({ ...ready, durationSeconds: 61 })).toBe('duration');
  });

  it('a zero duration is blocked, so «0 seconds» never reaches a provider', () => {
    expect(creativeRunBlock({ ...ready, durationSeconds: 0 })).toBe('duration');
  });

  it('the missing target is named first — a Creator fixes one thing at a time', () => {
    expect(creativeRunBlock({ ...ready, targetChosen: false, declared: false })).toBe('target');
  });

  it('a shut act is blocked before any input is even considered', () => {
    // The card may be opened to be READ while the act is shut. So a Creator
    // who fills in everything correctly must still find the button dark.
    expect(creativeRunBlock({ ...ready, runnable: false })).toBe('unavailable');
  });

  it('every block has a sentence, so none is ever silent', () => {
    for (const b of ['unavailable', 'target', 'second', 'duration', 'declaration'] as const) {
      expect(CREATIVE_BLOCK_AR[b].length).toBeGreaterThan(0);
    }
  });
});

describe('5 · the panel claims nothing on the Empire’s behalf', () => {
  const html = render(faceSwapState());

  it('it never says AZMA verified a consent', () => {
    expect(html).not.toMatch(/تحقّقنا|تأكّدنا|موافقةٌ موثّقة/);
  });

  it('it carries no provider name and no model name', () => {
    expect(html).not.toMatch(/magic.?hour|openai|veo|seedance|minimax/i);
  });

  it('and the four acts it serves are the four the server authorized', () => {
    expect([...CREATIVE_ACT_IDS].sort())
      .toEqual(['background-removal', 'face-swap', 'lip-sync', 'talking-photo']);
  });
});

describe('6 · the declaration is readable WHILE the act is shut', () => {
  // §1 of the directive, 2026-10-12: the complete acknowledgment must be
  // reachable through the real interface even though face swap cannot run.
  // This is that state exactly — the catalog's verdict, not a pretend one.
  const shut = faceSwapState({
    availability: 'COST_NOT_VERIFIED',
    runnable: false,
    reasonAr: 'المحرّكُ يَقبلها، ولم تُقَس كلفتُها بعد.',
  });
  const html = render(shut);

  it('all four sentences are still shown', () => {
    for (const line of LIKENESS_STATEMENTS_AR) expect(html).toContain(line);
  });

  it('the box is still unchecked, and still a real control', () => {
    expect(html).toContain('type="checkbox"');
    expect(html).not.toMatch(/type="checkbox"[^>]*checked/);
  });

  it('the run button is dark, and the reason is the CATALOG’s sentence', () => {
    expect(html).toMatch(/class="creative-act-run"[^>]*disabled/);
    expect(html).toContain('ولم تُقَس كلفتُها بعد');
  });

  it('no input is ever enough to light it while the act is shut', () => {
    expect(creativeRunBlock({
      runnable: false, targetChosen: true, needsSecond: true, secondChosen: true,
      needsDuration: true, durationSeconds: 5, maxSeconds: 60,
      needsDeclaration: true, declared: true,
    })).toBe('unavailable');
  });

  it('and the duration bound on the screen says WHOSE limit it is', () => {
    expect(html).toContain('حدُّنا نحن، لا حدُّ المحرّك');
  });
});

describe('7 · which shut cards may be opened at all', () => {
  it('a cost that was never measured, and a ruling nobody made — those two', () => {
    for (const availability of ['COST_NOT_VERIFIED', 'POLICY_BLOCKED']) {
      expect(operationIsInspectable({ runnable: false, availability })).toBe(true);
    }
  });

  it('but never a missing credential or an undesignated model — those are OURS to fix', () => {
    for (const availability of ['NO_CREDENTIAL', 'NO_DESIGNATED_MODEL', 'NOT_AUTHORIZED']) {
      expect(operationIsInspectable({ runnable: false, availability })).toBe(false);
    }
  });

  it('and a runnable act is not «inspectable» — it is simply open', () => {
    expect(operationIsInspectable({ runnable: true, availability: 'AVAILABLE' })).toBe(false);
  });
});
