'use client';

/**
 * AZMA OS — what a Chamber does, shown before a Creator has to guess.
 *
 * ─── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 *   The Founder entered الحُجّة الدامغة and could not work it: there was no
 *   submit control, no name on the output shaper, no microphone, and nothing
 *   anywhere that said what the Chamber is for or what a Creator leaves it
 *   holding. Every Chamber opens the same way — straight into its instruments,
 *   with no word about them.
 *
 *   An interface that must be guessed is not sovereign. A Chamber states what
 *   it does, what it will not do, and what the Creator walks out with.
 *
 * ─── WHY IT READS THE TRUTH REGISTRY AND NOTHING ELSE ────────────────────────
 *
 *   src/chamber-truth is the single authority for what a Chamber can perform.
 *   A guide written from a second, hand-kept list would drift the first time a
 *   capability was added or withdrawn, and a guide that drifts is worse than
 *   none: it promises what the Empire no longer does. So every line below
 *   comes from the registry — the capabilities from `capabilities`, their
 *   wording from `performsAr`, the precondition from `requiresExistingAsset`,
 *   and what the Chamber will NOT do from `deferred`.
 *
 *   The registry's own comments anticipated this reader. On
 *   `requiresExistingAsset`: «The distinction a Chamber guide needs most: a
 *   Creator with an empty Vault can generate, and cannot edit. Telling them
 *   otherwise is the first lie an interface tells.» On `deferred`: «the honest
 *   guide for a Chamber is shaped as much by what it cannot do as by what it
 *   can.» This is that guide.
 *
 *   One component serves all five Chambers. Written five times it would drift
 *   five ways.
 */

import React, { useEffect, useState } from 'react';
import { CHAMBER_TRUTH } from '../chamber-truth';
import type { ChamberId } from '../chamber-identity/types';
import './chamber-demonstration.css';

interface Props {
  readonly chamberId: ChamberId;
  /** The Chamber's own declaration of purpose, in Arabic. */
  readonly philosophyAr?: string | null;
  /** What the Creator leaves this Chamber carrying. */
  readonly outcomeAr: string;
  /** The order of work, in the Creator's words. Three to five steps. */
  readonly stepsAr: readonly string[];
}

const SEEN_KEY = 'azma.demonstration.seen';

/** Per-device, per-Chamber. A convenience only: losing it costs one panel. */
function hasSeen(chamberId: string): boolean {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw !== null && (JSON.parse(raw) as string[]).includes(chamberId);
  } catch {
    return false;
  }
}

function markSeen(chamberId: string): void {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const seen = raw === null ? [] : (JSON.parse(raw) as string[]);
    if (!seen.includes(chamberId)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, chamberId]));
    }
  } catch { /* the panel simply opens again next time */ }
}

export function ChamberDemonstration({ chamberId, philosophyAr, outcomeAr, stepsAr }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Opened after mount, never during render: on a first visit the Chamber
  // explains itself; afterwards it waits to be asked.
  useEffect(() => {
    const timer = setTimeout(() => { if (!hasSeen(chamberId)) setIsOpen(true); }, 400);
    return () => clearTimeout(timer);
  }, [chamberId]);

  const truth = CHAMBER_TRUTH[chamberId];
  if (!truth) return null;

  const close = () => { markSeen(chamberId); setIsOpen(false); };

  // What a Creator can do now, and what waits on them owning something first.
  const readyNow = truth.capabilities.filter((c) => !c.requiresExistingAsset);
  const needsAsset = truth.capabilities.filter((c) => c.requiresExistingAsset);

  return (
    <>
      <button
        type="button"
        className="demo-open-btn"
        onClick={() => setIsOpen(true)}
        data-testid="chamber-demo-open"
        aria-label="كيف تعمل هذه الحجرة"
      >
        <span aria-hidden="true">؟</span> كيف تعمل هذه الحجرة
      </button>

      {isOpen && (
        <div className="demo-veil" role="dialog" aria-modal="true" aria-label="كيف تعمل هذه الحجرة">
          <div className="demo-panel" data-testid="chamber-demo">
            <header className="demo-head">
              <span className="demo-eyebrow">كيف تعمل هذه الحجرة</span>
              <button type="button" className="demo-close" onClick={close} aria-label="إغلاق">✕</button>
            </header>

            {philosophyAr && <p className="demo-philosophy">{philosophyAr}</p>}

            <section className="demo-section">
              <h3 className="demo-h">ماذا تخرج به</h3>
              <p className="demo-outcome">{outcomeAr}</p>
            </section>

            <section className="demo-section">
              <h3 className="demo-h">كيف تسير فيها</h3>
              <ol className="demo-steps">
                {stepsAr.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </section>

            <section className="demo-section">
              <h3 className="demo-h">ما تستطيعه الآن</h3>
              <ul className="demo-caps">
                {readyNow.map((c) => <li key={c.id}>{c.performsAr}</li>)}
              </ul>
            </section>

            {needsAsset.length > 0 && (
              <section className="demo-section">
                <h3 className="demo-h">ما يحتاج أصلاً تملكه أوّلاً</h3>
                <ul className="demo-caps demo-caps-gated">
                  {needsAsset.map((c) => <li key={c.id}>{c.performsAr}</li>)}
                </ul>
                <p className="demo-note">
                  هذه تعمل على شيءٍ موجود. من خزانته فارغة يُنشئ ولا يُعدّل — وقولُ غير ذلك أوّلُ كذبةٍ تقولها واجهة.
                </p>
              </section>
            )}

            {truth.deferred.length > 0 && (
              <section className="demo-section">
                <h3 className="demo-h">ما لا تفعله هذه الحجرة بعد</h3>
                <ul className="demo-caps demo-caps-absent">
                  {truth.deferred.map((d) => <li key={d.responsibilityAr}>{d.responsibilityAr}</li>)}
                </ul>
                <p className="demo-note">
                  مذكورٌ لا مسكوتٌ عنه. ما لم يُبنَ بعد يُقال، فلا يُكتشف مفاجأةً.
                </p>
              </section>
            )}

            <button type="button" className="demo-enter" onClick={close}>
              فهمت — ادخل الحجرة
            </button>
          </div>
        </div>
      )}
    </>
  );
}
