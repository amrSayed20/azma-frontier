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
  readonly availability: 'AVAILABLE' | 'NOT_AUTHORIZED' | 'NO_CREDENTIAL' | 'NO_DESIGNATED_MODEL';
  readonly runnable: boolean;
  readonly reasonAr: string;
  readonly detailEn: string;
  readonly takesBrief: boolean;
  readonly scaffolds: boolean;
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

/** What each required input is called on a Creator's screen. */
const INPUT_AR: Readonly<Record<string, string>> = {
  brief: 'تعليمة',
  asset: 'أصل من خزانتك',
  style: 'نمط',
  aspect: 'امتداد',
  duration: 'مدّة',
  'motion-model': 'نوع الحركة',
};

/**
 * The capabilities the Empire has NOT authorised, shown with their own reason.
 *
 * FOUNDER'S RULE, made executable in مكمن الغاية and carried here: a door is
 * offered only to someone who can complete it today, and anyone excluded is
 * told a true reason rather than handed a control that cannot work. These are
 * not marked available, are not clickable, and name no provider.
 */
const AWAITING: readonly { nameAr: string; glyph: string; outcomeAr: string; reasonAr: string }[] = [
  {
    nameAr: 'إزالة الخلفيّة', glyph: '◌', outcomeAr: 'أصلٌ بخلفيّةٍ شفّافة',
    reasonAr: 'المحرّكُ يَقبلها، ولم تُبنَ لها بعد طريقٌ في الإمبراطوريّة.',
  },
  {
    nameAr: 'صورةٌ ناطقة', glyph: '☻', outcomeAr: 'صورتُك تتكلّم بصوتٍ لك',
    reasonAr: 'قدرةٌ مُقترَحةٌ — تنتظر إثباتَ إنتاجٍ واحدٍ وسعراً في الدستور.',
  },
  {
    nameAr: 'مزامنة الشفاه', glyph: '♪', outcomeAr: 'مقطعٌ تنطق شفاهُه نصَّك',
    reasonAr: 'قدرةٌ مُقترَحةٌ — تنتظر إثباتَ إنتاجٍ واحدٍ وسعراً في الدستور.',
  },
  {
    nameAr: 'تبديل الوجه', glyph: '⬒', outcomeAr: 'وجهٌ في مكانِ وجه',
    reasonAr: 'موقوفةٌ حتى يُحكَم في الشبيه والموافقة — حكمٌ قبل بناء.',
  },
];

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
        const mine = operations.filter((o) => o.group === g.id);
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
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`ops-card${o.runnable ? '' : ' ops-card--shut'}`}
                    data-testid={`qiyamah-op-${o.id}`}
                    data-availability={o.availability}
                    disabled={!o.runnable}
                    aria-describedby={o.runnable ? undefined : `ops-why-${o.id}`}
                    onClick={() => o.runnable && onChoose(o.id)}
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
                        <span className="ops-state ops-state--shut">◌ غير متاحة الآن</span>
                      )}
                    </span>
                    {!o.runnable && (
                      <span className="ops-card-why" id={`ops-why-${o.id}`}>{o.reasonAr}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="ops-group">
        <div className="ops-group-head">
          <span className="ops-group-title">◈ قريباً</span>
          <span className="ops-group-note">قدراتٌ موقوفةٌ — ولكلٍّ سببُها</span>
        </div>
        <div className="ops-cards">
          {AWAITING.map((a) => (
            <div className="ops-card ops-card--shut ops-card--awaiting" key={a.nameAr}>
              <span className="ops-card-glyph" aria-hidden="true">{a.glyph}</span>
              <span className="ops-card-name">{a.nameAr}</span>
              <span className="ops-card-outcome">{a.outcomeAr}</span>
              <span className="ops-card-foot">
                <span className="ops-state ops-state--shut">◌ موقوفة</span>
              </span>
              <span className="ops-card-why">{a.reasonAr}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
