/**
 * AZMA OS — THE WORKSPACE OF THE FOUR CREATIVE ACTS, AND THE DECLARATION
 *
 * ─── WHY ONE PANEL AND NOT FOUR ─────────────────────────────────────────────
 *
 *   Background removal · lip sync · face swap · talking photo differ in
 *   exactly two visible things: which asset families they ask for, and whether
 *   they need a duration. Everything else is one screen — pick what you own,
 *   read what it will do, press once, read the truth back.
 *
 *   The server already declares both differences (`inputs` on the operation
 *   state), so this panel READS them rather than restating them. Four panels
 *   would have been four places for the same question to drift, which is the
 *   fault the runner's own header records being paid for twice.
 *
 * ─── AND WHY THE DECLARATION LIVES HERE ─────────────────────────────────────
 *
 *   Face swap requires the Creator's own likeness declaration. The server is
 *   the authority on that — `requiresAcknowledgment` and the four sentences
 *   arrive from it — and this panel's job is to show them COMPLETE, let the
 *   Creator affirm them deliberately, and send what they affirmed.
 *
 *   Four rules it obeys, each one a separate failure if broken:
 *
 *     1. The full text, every sentence, with nothing folded away.
 *     2. Never pre-checked. The state starts `false` and no prop can set it.
 *     3. The act cannot be submitted until it is affirmed.
 *     4. The declaration travels with THIS request — its version and the
 *        moment it was made — and the server verifies it again. A refusal
 *        here is a courtesy; the gate is below, in the runner.
 *
 *   What it never says: that AZMA checked anything. It cannot, and the
 *   sentences the server sends say so in the Creator's own language.
 */

'use client';

import { useState } from 'react';
import {
  lifecycleOf, type OperationLifecycle,
} from '@/src/qiyamah-generation/operation-lifecycle';
import { OperationStatusLine } from './_lib/operation-status-line';
import type { OperationStateView } from './OperationsCenter';

/** The acts this panel serves. Read by the client to route a chosen card. */
export const CREATIVE_ACT_IDS: readonly string[] = [
  'background-removal', 'lip-sync', 'face-swap', 'talking-photo',
];

/** One of the Creator's own assets, as the chamber already lists them. */
export interface CreativeAssetChoice {
  readonly assetId: string;
  readonly url: string;
  readonly label: string;
}

export interface CreativeRunPayload {
  readonly operation: string;
  readonly targetAssetId: string;
  readonly secondAssetId?: string;
  readonly durationSeconds?: number;
  /**
   * Present ONLY when the Creator affirmed the declaration. Absent is absent:
   * this field is never filled in with a default, and the server refuses a
   * request that needs it and does not carry it.
   */
  readonly likenessAcknowledgment?: { readonly acknowledged: true; readonly acknowledgedVersion: string };
}

/** What each act calls its two inputs, in the Creator's words. */
const TARGET_QUESTION_AR: Readonly<Record<string, string>> = {
  'background-removal': 'أيّ صورةٍ تُزيل خلفيّتها؟',
  'lip-sync': 'أيّ مقطعٍ تُزامن شفاهه؟',
  'face-swap': 'أيّ مقطعٍ تُبدّل الوجه فيه؟',
  'talking-photo': 'أيّ صورةٍ تُنطِقها؟',
};

const SECOND_QUESTION_AR: Readonly<Record<string, string>> = {
  'lip-sync': 'وأيّ صوتٍ يَنطق به؟',
  'face-swap': 'وأيّ وجهٍ يَحِلّ مكانه؟',
  'talking-photo': 'وأيّ صوتٍ تَنطق به؟',
};

const RUN_LABEL_AR: Readonly<Record<string, string>> = {
  'background-removal': '⬚ أزِل الخلفيّة',
  'lip-sync': '◐ زامِن الشفاه',
  'face-swap': '◉ بدّل الوجه',
  'talking-photo': '◍ أنطِقها',
};

/** Which acts read a second asset, and which read a duration. Server-declared. */
const takesSecond = (op: OperationStateView) =>
  op.inputs.some((i) => i === 'audio-asset' || i === 'face-asset');
const takesDuration = (op: string) => op !== 'background-removal';

/** What is still missing before this act may be submitted — or nothing. */
export type CreativeRunBlock = 'target' | 'second' | 'duration' | 'declaration' | null;

/**
 * THE ONE PREDICATE, and three consumers of it.
 *
 * The dark button, the sentence beside it that says why, and the guard inside
 * `run()` all read this. Written three times instead, they would have drifted
 * — and the drift that matters is the one where the button lights up while
 * the declaration is unmade.
 *
 * Exported because it is also the only part a test can reach without a
 * browser: the panel's own selections are internal state by design.
 */
export function creativeRunBlock(input: {
  readonly targetChosen: boolean;
  readonly needsSecond: boolean;
  readonly secondChosen: boolean;
  readonly needsDuration: boolean;
  readonly durationSeconds: number;
  readonly maxSeconds: number | null;
  readonly needsDeclaration: boolean;
  readonly declared: boolean;
}): CreativeRunBlock {
  if (!input.targetChosen) return 'target';
  if (input.needsSecond && !input.secondChosen) return 'second';
  if (input.needsDuration) {
    if (!(input.durationSeconds > 0)) return 'duration';
    if (input.maxSeconds !== null && input.durationSeconds > input.maxSeconds) return 'duration';
  }
  // LAST, and never optional: an act that demands a declaration is blocked by
  // its absence no matter what else is in order.
  if (input.needsDeclaration && !input.declared) return 'declaration';
  return null;
}

/** What the Creator reads about what is still missing. */
export const CREATIVE_BLOCK_AR: Readonly<Record<Exclude<CreativeRunBlock, null>, string>> = {
  target: 'اختر أصلك أوّلاً.',
  second: 'ويَبقى المَدخل الثاني.',
  duration: 'المدّةُ خارج ما يُقبَل.',
  declaration: 'تبديلُ الوجه لا يَبدأ قبل إقرارٍ صريحٍ منك — ولن نُقِرّ نيابةً عنك.',
};

export function CreativeActPanel({
  operation, targets, seconds, onBack, onRun,
}: {
  readonly operation: OperationStateView;
  /** The assets whose family this act's TARGET must be. */
  readonly targets: readonly CreativeAssetChoice[];
  /** The assets whose family its SECOND input must be, when it takes one. */
  readonly seconds: readonly CreativeAssetChoice[];
  readonly onBack: () => void;
  readonly onRun: (payload: CreativeRunPayload) => Promise<{ ok: boolean; messageAr?: string }>;
}) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [secondId, setSecondId] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  /**
   * THE DECLARATION'S OWN STATE — and it starts false, always.
   *
   * There is no prop that can start it true and no effect that sets it. An
   * affirmation the Creator did not make is not an affirmation, and a screen
   * that arrived pre-ticked would be making it for them.
   */
  const [declared, setDeclared] = useState(false);
  const [state, setState] = useState<'ready' | 'running' | 'failed'>('ready');
  const [errorAr, setErrorAr] = useState<string | null>(null);
  const [producedAssetId, setProducedAssetId] = useState<string | null>(null);

  /**
   * THE BOUND COMES FROM THE SERVER'S VERDICT, with its source.
   *
   * No ladder is offered, and that is deliberate: this chamber has already
   * paid for a hand-written list of durations standing beside a model that
   * accepted far more. And it is read off `operation` rather than imported,
   * because importing it would have carried a provider's name into a file the
   * Creator's browser runs — a standing test forbids that, and it is right.
   */
  const durationBound = operation.durationBound;
  const needsSecond = takesSecond(operation);
  const needsDuration = takesDuration(operation.id);
  const maxSeconds = durationBound?.seconds ?? null;
  const needsDeclaration = operation.requiresAcknowledgment;
  const block = creativeRunBlock({
    targetChosen: Boolean(targetId), needsSecond, secondChosen: Boolean(secondId),
    needsDuration, durationSeconds, maxSeconds, needsDeclaration, declared,
  });
  const missingAr = block === null ? null : CREATIVE_BLOCK_AR[block];

  const lifecycle: OperationLifecycle = lifecycleOf({
    operation: operation.id as never,
    mutationState: state,
    producedAssetId,
    accepted: false,
  });

  async function run() {
    // The same predicate the button is disabled by, asserted again here: a
    // click that arrives by keyboard, by script or by a stale render must not
    // send an undeclared request.
    if (block !== null || !targetId) return;
    setState('running');
    setErrorAr(null);
    const answer = await onRun({
      operation: operation.id,
      targetAssetId: targetId,
      secondAssetId: needsSecond ? (secondId ?? undefined) : undefined,
      durationSeconds: needsDuration ? durationSeconds : undefined,
      // Only when it was actually affirmed, and carrying the version of the
      // words that were shown — so a declaration can always be read back
      // against the text the Creator read.
      ...(needsDeclaration && declared
        ? {
            likenessAcknowledgment: {
              acknowledged: true as const,
              acknowledgedVersion: operation.acknowledgmentVersion ?? '',
            },
          }
        : {}),
    });
    if (answer.ok) {
      setState('ready');
      setProducedAssetId('deposited');
    } else {
      setState('failed');
      setErrorAr(answer.messageAr ?? 'لم تُتِمّ هذه العمليّةُ.');
    }
  }

  const picker = (
    items: readonly CreativeAssetChoice[],
    chosen: string | null,
    choose: (id: string) => void,
    emptyAr: string,
  ) => (
    items.length === 0
      ? <p className="creative-act-empty">{emptyAr}</p>
      : (
        <div className="creative-act-assets">
          {items.map((a) => (
            <button
              key={a.assetId}
              type="button"
              className={`creative-act-asset${chosen === a.assetId ? ' creative-act-asset--on' : ''}`}
              onClick={() => choose(a.assetId)}
              disabled={state === 'running'}
              title={a.label}
              aria-pressed={chosen === a.assetId}
            >
              <span className="creative-act-asset-label">{a.label}</span>
            </button>
          ))}
        </div>
      )
  );

  return (
    <div className="creative-act" role="group" aria-label={operation.nameAr}>
      <nav className="ops-rail" aria-label="موضعك">
        <button type="button" className="ops-rail-back" onClick={onBack}>‹ مركزُ العمليّات</button>
        <span className="ops-rail-sep" aria-hidden="true">›</span>
        <span className="ops-rail-here">{operation.nameAr}</span>
      </nav>

      <p className="creative-act-outcome">{operation.outcomeAr}</p>

      {/* The act's own verdict, said before anything is chosen. A Creator must
          not configure an act the Empire will refuse. */}
      {!operation.runnable && operation.reasonAr ? (
        <p className="creative-act-shut" role="status">{operation.reasonAr}</p>
      ) : null}

      <p className="creative-act-label">{TARGET_QUESTION_AR[operation.id] ?? 'أيّ أصل؟'}</p>
      {picker(targets, targetId, setTargetId, 'لا أصولَ من هذا النوع في خزانتك بعد.')}

      {needsSecond ? (
        <>
          <p className="creative-act-label">{SECOND_QUESTION_AR[operation.id] ?? 'والمَدخل الثاني؟'}</p>
          {picker(seconds, secondId, setSecondId, 'لا أصولَ من هذا النوع في خزانتك بعد.')}
        </>
      ) : null}

      {needsDuration ? (
        <div className="creative-act-duration" role="group" aria-label="المدّة">
          <label className="creative-act-label" htmlFor="creative-act-seconds">كم ثانيةً؟</label>
          <input
            id="creative-act-seconds"
            className="creative-act-seconds"
            type="number"
            min={1}
            max={maxSeconds ?? undefined}
            step={1}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            disabled={state === 'running'}
          />
          {maxSeconds !== null ? (
            <p className="creative-act-bound">
              {durationBound?.source === 'provider-documented'
                ? `حتّى ${maxSeconds} ثانية — حدُّ المحرّك المنشور.`
                : `حتّى ${maxSeconds} ثانية — حدُّنا نحن، لا حدُّ المحرّك: لم نَقِس له حدّاً بعد.`}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* ── THE CREATOR'S OWN DECLARATION ────────────────────────────────────
          Every sentence the server sends, in order, with nothing folded away
          behind a «read more». A declaration nobody read is not a
          declaration. */}
      {needsDeclaration ? (
        <section className="likeness-ack" aria-labelledby="likeness-ack-heading">
          <h3 className="likeness-ack-heading" id="likeness-ack-heading">إقرارٌ قبل تبديل الوجه</h3>
          <ol className="likeness-ack-list">
            {operation.acknowledgmentStatementsAr.map((line) => (
              <li className="likeness-ack-item" key={line}>{line}</li>
            ))}
          </ol>
          <label className="likeness-ack-affirm" htmlFor="likeness-ack-input">
            <input
              id="likeness-ack-input"
              type="checkbox"
              className="likeness-ack-input"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              disabled={state === 'running'}
            />
            <span className="likeness-ack-affirm-text">أُقِرّ بما تَقدّم</span>
          </label>
        </section>
      ) : null}

      <OperationStatusLine lifecycle={lifecycle} errorAr={errorAr} />

      {/* Why the button is dark, said beside it rather than left to be
          guessed. It is not an error: nothing has been attempted yet. */}
      {missingAr ? <p className="creative-act-missing" role="status">{missingAr}</p> : null}

      <button
        type="button"
        className="creative-act-run"
        disabled={state === 'running' || block !== null}
        onClick={() => { void run(); }}
      >
        {state === 'running' ? '⏳ جارٍ…' : (RUN_LABEL_AR[operation.id] ?? 'نفّذ')}
      </button>
    </div>
  );
}
