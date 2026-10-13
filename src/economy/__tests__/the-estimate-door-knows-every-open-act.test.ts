/**
 * AZMA OS — THE PRICE DOOR KNOWS EVERY ACT THAT CAN RUN · 2026-10-12
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   On the release that OPENED the four measured acts, every visit to the
 *   chamber produced fifteen of these, on desktop and on a phone alike:
 *
 *       400 POST /api/sovereign/economy/estimate
 *
 *   The Operations Center asks that door for the price of every act a Creator
 *   may RUN. Those acts had been shut since they were built, so nobody had
 *   ever asked — and the door's step table had never been taught their names.
 *
 *   The Creator was not shown a wrong price. They were shown NO price, on four
 *   of the ten cards, while the acts sat open and pressable. A capability that
 *   can take units from a balance without naming them first is the one thing
 *   this chamber's cost law exists to forbid.
 *
 * ─── THE RULE, NOT THE FILE ─────────────────────────────────────────────────
 *
 *   So the rule asserted here is not «the table contains these five strings».
 *   It is: EVERY act the catalog says is runnable must be an act the price
 *   door accepts. Add an eleventh act tomorrow and open it without pricing it,
 *   and this fails — which is the only way the next one gets caught.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { qiyamahOperations } from '../../qiyamah-generation/operation-catalog';
import { MEASURED_COSTS } from '../pricing/new-capability-pricing';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const ROUTE = read('app/api/sovereign/economy/estimate/route.ts');

/** Every step name the door will accept, read from its own two tables. */
const acceptedSteps = (): readonly string[] => {
  const steps: string[] = [];
  for (const table of ['CHAMBER_STEPS', 'MEASURED_STEPS']) {
    const block = ROUTE.split(`const ${table}`)[1]?.split('};')[0] ?? '';
    for (const m of block.matchAll(/^\s{2}([A-Z][A-Z0-9_]+):/gm)) steps.push(m[1]!);
  }
  return steps;
};

describe('every act a Creator can run has a price this door can state', () => {
  it('no operation in the catalog names a step the estimator would refuse', () => {
    const accepted = acceptedSteps();
    const orphans = qiyamahOperations()
      .map((d) => d.costStep)
      .filter((s) => accepted.indexOf(s) < 0);
    expect(orphans).toEqual([]);
  });

  it('and each measured capability is priced by its one authority, not restated here', () => {
    // The door must READ new-capability-pricing. A literal number for any of
    // these five in the route would be a second authority on the same price.
    expect(ROUTE).toContain('creatorEstimate');
    for (const rule of MEASURED_COSTS) {
      expect(ROUTE).not.toContain(`${rule.capability}: ${rule.providerCreditsPerUnit}`);
    }
  });

  it('an act billed per frame is told as a basis, never as unavailable', () => {
    // «unavailable» and «its price depends on your own clip» were one sentence
    // before this repair, and only one of them was true.
    expect(ROUTE).toContain('priceDependsAr');
    expect(ROUTE).toContain('كلفةُ هذا العمل تُقرأ بعد اختيارك أصلَك.');
  });

  it('and the card shows that basis where the figure would have been', () => {
    // A card that shows nothing lets a Creator believe an act is free.
    expect(read('app/qiyamah-chamber/OperationsCenter.tsx')).toContain('priceDependsAr');
  });
});
