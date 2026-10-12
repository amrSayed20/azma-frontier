'use client';

/**
 * AZMA OS — حجرة القيامة · LAYER A: THE UNIFIED CREATION OPERATIONS CENTER
 *
 * ─── WHAT THIS FIXES ────────────────────────────────────────────────────────
 *
 *   The chamber's six acts were discoverable in THREE places: four in a media
 *   type chooser, upscaling only inside a result panel, and editing twice —
 *   once as an act and again as a per-asset panel in the gallery. A Creator
 *   who had produced nothing could not learn that upscaling existed at all.
 *
 *   One card per operation, once, grouped by what the Creator already has.
 *
 * ─── IT DECIDES NOTHING ─────────────────────────────────────────────────────
 *
 *   Every state it draws was computed on the server by `qiyamahOperations()`
 *   from the fleet's authorisation and the gateway's configuration. This
 *   component holds no availability logic, no provider name, and no price: it
 *   renders a verdict and asks the existing estimator for the cost of a named
 *   step. A screen that could decide availability for itself is a second
 *   authority, and the defect this package closes was exactly that.
 */

import { useEffect, useState } from 'react';

/** Mirrors `OperationState` in src/qiyamah-generation/operation-catalog.ts. */
export interface OperationStateView {
  readonly id: string;
  readonly group: string;
  readonly nameAr: string;
  readonly outcomeAr: string;
  readonly glyph: string;
  readonly inputs: readonly string[];
  readonly costStep: string;
  readonly historicallyProven: boolean;
  readonly availability:
    | 'AVAILABLE' | 'NOT_AUTHORIZED' | 'NO_CREDENTIAL' | 'NO_DESIGNATED_MODEL'
    // Authorized 2026-10-11: a reachable route whose cost nobody measured,
    // and one whose policy nobody ruled. Neither is an availability.
    | 'COST_NOT_VERIFIED' | 'POLICY_BLOCKED';
  readonly runnable: boolean;
  readonly reasonAr: string;
  readonly detailEn: string;
  readonly takesBrief: boolean;
  readonly scaffolds: boolean;
  /**
   * Whether the Creator must make an explicit declaration before this act
   * runs. Server-declared: a screen does not get to decide that a policy
   * question has been answered.
   */
  readonly requiresAcknowledgment: boolean;
  readonly acknowledgmentVersion: string | null;
  /** Every sentence that must be shown, complete, in the order shown. */
  readonly acknowledgmentStatementsAr: readonly string[];
  /** The seconds this act may be asked for, and who set that limit. */
  readonly durationBound: {
    readonly seconds: number;
    readonly source: 'provider-documented' | 'empire-guard';
  } | null;
  readonly brief: {
    readonly effectiveCap: number;
    readonly scaffoldCharacters: number;
    readonly submittedCap: number;
    readonly boundSource: 'provider-documented' | 'empire-guard';
    readonly capNoticeAr: string;
  };
}

export interface OperationGroupView {
  readonly id: string;
  readonly titleAr: string;
  readonly noteAr: string;
}

/**
 * ── A SHUT CARD THAT MAY STILL BE OPENED TO BE READ ─────────────────────────
 *
 *   The Chief Architect, 2026-10-12: «make the complete Arabic acknowledgment
 *   accessible through the actual creator-facing interface, even while Face
 *   Swap execution remains blocked».
 *
 *   So two different things stop being one thing: being able to OPEN an act,
 *   and being able to RUN it. A Creator may read what an act needs, and read
 *   the declaration it will ask of them, without the Empire pretending the act
 *   can be completed today.
 *
 *   It is not a crack in «never offer what the platform blocks». That rule
 *   forbids offering a DESTINATION a Creator cannot reach; this offers a
 *   READING, says so on the card, and the run button inside stays dark with
 *   the catalog's own reason beside it.
 *
 *   And only for the two states that are about the WORLD — a cost nobody
 *   measured, a ruling nobody made. An act shut because the Empire holds no
 *   credential, or designates no model, has nothing for a Creator to read:
 *   that is our fault to fix, not their page to visit.
 */
export function operationIsInspectable(o: {
  readonly runnable: boolean;
  readonly availability: string;
}): boolean {
  if (o.runnable) return false;
  return o.availability === 'COST_NOT_VERIFIED' || o.availability === 'POLICY_BLOCKED';
}

/** What each required input is called on a Creator's screen. */
const INPUT_AR: Readonly<Record<string, string>> = {
  brief: 'تعليمة',
  asset: 'أصل من خزانتك',
  style: 'نمط',
  aspect: 'امتداد',
  duration: 'مدّة',
  'motion-model': 'نوع الحركة',
  // A second asset of a different family. One chip for both would hide half
  // of what the operation actually requires.
  'audio-asset': 'صوتٌ من خزانتك',
  'video-asset': 'مقطعٌ من خزانتك',
  'face-asset': 'وجهٌ مصدر',
};

/**
 * ── THE HAND-WRITTEN «قريباً» LIST IS GONE ──────────────────────────────────
 *
 *   Four capabilities were listed here by hand, with their names, their
 *   outcomes and their reasons typed into this component. That made this file
 *   a SECOND authority on what the Empire can do — and the whole point of
 *   Layer A is that there is one.
 *
 *   All four are real operations in the catalog now, carrying their own
 *   availability verdict from the server. A card that cannot run still cannot
 *   be pressed and still states a true reason; what changed is that the reason
 *   is no longer invented here.
 */

/** The estimator's own answer. Never a price computed here. */
interface StepQuote {
  readonly priced: boolean;
  readonly workAr: string;
  readonly estimatedAzmaUnits: number | null;
  readonly unitNameAr?: string;
}

export function OperationsCenter({
  operations,
  groups,
  onChoose,
  quoteStep,
  creatorPresent,
}: {
  readonly operations: readonly OperationStateView[];
  readonly groups: readonly OperationGroupView[];
  readonly onChoose: (operationId: string) => void;
  /** The existing `/api/sovereign/economy/estimate` door, handed in. */
  readonly quoteStep: (step: string) => Promise<StepQuote | null>;
  readonly creatorPresent: boolean;
}) {
  const [quotes, setQuotes] = useState<Readonly<Record<string, StepQuote>>>({});

  // One quote per distinct step, asked once. Never before the chamber knows
  // who is asking — the estimator judges sufficiency against a real balance.
  useEffect(() => {
    if (!creatorPresent) return;
    let abandoned = false;
    const steps = Array.from(new Set(operations.filter((o) => o.runnable).map((o) => o.costStep)));
    void (async () => {
      const got: Record<string, StepQuote> = {};
      for (const step of steps) {
        const q = await quoteStep(step);
        if (q) got[step] = q;
      }
      if (!abandoned) setQuotes(got);
    })();
    return () => { abandoned = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorPresent, operations.length]);

  return (
    <section className="ops-center" data-testid="qiyamah-operations-center">
      <p className="ops-center-lede">
        اختر ما تصنع. وما لا يُكتمِل اليوم مكتوبٌ بحالته وسببه — ولا يُعرَض عليك بابٌ يُردّ.
      </p>

      {groups.map((g) => {
        // Within a group, what can run comes first. An operation that cannot
        // is still shown — the Creator is owed the knowledge that it exists
        // and the reason it is shut — but it does not sit above a working one.
        const mine = operations
          .filter((o) => o.group === g.id)
          .slice()
          .sort((a, b) => Number(b.runnable) - Number(a.runnable));
        if (mine.length === 0) return null;
        return (
          <div className="ops-group" key={g.id}>
            <div className="ops-group-head">
              <span className="ops-group-title">{g.titleAr}</span>
              <span className="ops-group-note">{g.noteAr}</span>
            </div>
            <div className="ops-cards">
              {mine.map((o) => {
                const quote = quotes[o.costStep];
                const readable = operationIsInspectable(o);
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`ops-card${o.runnable ? '' : ' ops-card--shut'}${readable ? ' ops-card--readable' : ''}`}
                    data-testid={`qiyamah-op-${o.id}`}
                    data-availability={o.availability}
                    data-readable={readable ? 'true' : undefined}
                    // A card is pressable when it can RUN, or when it can be
                    // READ. Nothing else opens, because nothing else has
                    // anything a Creator could read.
                    disabled={!o.runnable && !readable}
                    aria-describedby={o.runnable ? undefined : `ops-why-${o.id}`}
                    onClick={() => { if (o.runnable || readable) onChoose(o.id); }}
                  >
                    <span className="ops-card-glyph" aria-hidden="true">{o.glyph}</span>
                    <span className="ops-card-name">{o.nameAr}</span>
                    <span className="ops-card-outcome">{o.outcomeAr}</span>
                    <span className="ops-card-inputs">
                      {o.inputs.map((i) => (
                        <span className="ops-chip" key={i}>{INPUT_AR[i] ?? i}</span>
                      ))}
                    </span>
                    <span className="ops-card-foot">
                      {o.runnable ? (
                        <>
                          <span className="ops-state ops-state--open">● متاحة</span>
                          {/* The estimator's own words. This component computes
                              no price and knows no rate. */}
                          {quote?.priced && quote.estimatedAzmaUnits !== null && (
                            <span className="ops-cost">
                              {quote.estimatedAzmaUnits.toLocaleString('en-US')} وحدة · {quote.workAr}
                            </span>
                          )}
                        </>
                      ) : (
                        /* ── §4 · AVAILABLE · BLOCKED · NOT VERIFIED ──────
                           One badge for all three said «غير متاحة» and told a
                           Creator nothing about which. A capability waiting on
                           a ruling and one waiting on a measurement are not
                           the same fact, and neither is a missing credential. */
                        <span className={`ops-state ops-state--${
                          o.availability === 'POLICY_BLOCKED' ? 'blocked' : 'unverified'}`}>
                          {o.availability === 'POLICY_BLOCKED' ? '⊘ موقوفةٌ بحكم'
                            : o.availability === 'COST_NOT_VERIFIED' ? '◌ لم تُقَس كلفتُها'
                            : '◌ غير مهيّأةٍ بعد'}
                        </span>
                      )}
                    </span>
                    {!o.runnable && (
                      <span className="ops-card-why" id={`ops-why-${o.id}`}>
                        {o.reasonAr}
                        {/* Said on the card, so pressing it is never a
                            surprise: what opens is a reading, not a run. */}
                        {readable ? (
                          <span className="ops-card-readable">
                            {o.requiresAcknowledgment
                              ? ' — اضغط لتقرأ ما تَطلبه، وإقرارَها، قبل أن تُفتَح.'
                              : ' — اضغط لتقرأ ما تَطلبه قبل أن تُفتَح.'}
                          </span>
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

    </section>
  );
}
