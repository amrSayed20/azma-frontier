/**
 * THE STORYBOARD WORLD HAS ONE ENGINE — the Founder's directive, 2026-11-09.
 *
 *   «MoneyPrinterTurbo هو محرك الإنتاج الوحيد لهذا العالم … افصل PixelLab
 *    نهائيًا عن هذا العالم … لا تترك PixelLab كمصدر احتياطي خفي أو مسار بديل.»
 *
 * MEASURED BEFORE WRITING ANY OF THIS: PixelLab had no adapter, no route, no
 * import and no call anywhere in the repository. What existed was a CLAIM —
 * an economic authority and three documents asserting a «PixelLab/storyboard
 * binding» that had never been built. A pricing authority that names the
 * wrong provider for a capability is a defect even when no code runs it,
 * because the next reader prices against it.
 *
 * So these guards hold two different things, and the distinction matters:
 *   · the production path may not GAIN a PixelLab binding (it never had one)
 *   · the economic authority may not CLAIM one (it did, and no longer does)
 *
 * A mention of the name inside the record of its own severance is not a
 * residue, so the guards below look for bindings and claims, never for the
 * bare string.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** Every file that decides what a storyboard scene's visual is made of. */
const STORYBOARD_PRODUCTION_PATH = [
  'app/api/ras-amr/storyboard/[storyboardId]/produce/route.ts',
  'app/api/ras-amr/scene/produce/route.ts',
  'src/ras-amr-production/storyboard-operation-lifecycle.ts',
  'src/ras-amr-production/qiyamah-commission.ts',
  'src/external-providers/moneyprinterturbo/moneyprinterturbo-adapter.ts',
  'src/external-providers/moneyprinterturbo/moneyprinterturbo-vault-deposit.ts',
];

describe('the Storyboard world has one production engine', () => {
  it('no file on the production path imports, calls or configures PixelLab', () => {
    for (const file of STORYBOARD_PRODUCTION_PATH) {
      expect(read(file)).not.toMatch(/pixel[-_ ]?lab/i);
    }
  });

  it('and the isolated provider is the engine that path actually reaches', () => {
    // The severance would be empty if it left no engine behind. This names
    // the one that remains, so a future deletion cannot quietly leave none.
    const route = read('app/api/ras-amr/storyboard/[storyboardId]/produce/route.ts');
    expect(route).toContain('MoneyPrinterTurboAdapter');
    expect(route).toContain('isMoneyPrinterTurboConfigured');
  });

  it('the economic authority no longer claims a PixelLab binding', () => {
    // THE DEFECT ITSELF: the STORYBOARD row's note asserted a binding that
    // was never built. A reader pricing the capability would have priced a
    // provider this Empire has never called.
    const costTruth = read('src/economy/cost-engine/qiyamah-cost-truth.ts');
    expect(costTruth).not.toContain('PixelLab/storyboard binding');
  });

  it('and no document still assigns the Storyboard world to PixelLab', () => {
    // The decided allocation the Founder overturned, in his own pricing
    // constitution. Its replacement must not re-appear by a later edit.
    expect(read('docs/SOVEREIGN_COST_AND_PRICING_CONSTITUTION.md'))
      .not.toContain('الاستوري بورد ← مُشغِّلٌ مفتوحُ المصدر عبر');
  });
});
