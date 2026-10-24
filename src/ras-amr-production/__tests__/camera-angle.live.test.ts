/**
 * AZMA OS — رأس الأمر: هل تُطيع العدسةُ الأمر؟ — الإثباتُ المدفوع.
 *
 * ─── THE QUESTION THIS SPENDS ON ────────────────────────────────────────────
 *
 *   The Founder, 2026-10-24: «اختيار زاوية محددة يجب أن يؤثر فعليًا في مخرجات
 *   التوليد، لا أن يكون مجرد عنصر واجهة أو نص لا يغير النتيجة.»
 *
 *   No mock can answer that, and no green build. Only pictures, looked at. So
 *   this runs the real engine on real credits, and the only thing that differs
 *   between the five calls is the clause `camera-angle.ts` contributes:
 *
 *     · the same reference image         (a standing figure, identity-bearing)
 *     · the same demand sentence         (asking explicitly for NO other change)
 *     · the same model                   (IMAGE_EDIT_MODEL_ID)
 *     · the same composer                (the chamber's own composeSceneInstruction)
 *
 *   so any difference in the result is attributable to the angle and to
 *   nothing else. The run writes every output to disk to be JUDGED BY EYE —
 *   this file deliberately asserts almost nothing about the pictures, because
 *   a byte difference is not a camera move and an assertion that cannot tell
 *   them apart would be a lie dressed as a test.
 *
 * ─── THE CEILING IS IN THE CODE ─────────────────────────────────────────────
 *
 *   The Founder authorised 500 credits and no more. At the Empire's own
 *   measured cost truth an edit is 100, so the ceiling is five calls, and
 *   `ANGLES_UNDER_TEST.length` is asserted against it before the first one is
 *   made. A budget that lives only in a sentence is not a budget.
 *
 * ─── OPT-IN, BECAUSE IT SPENDS ──────────────────────────────────────────────
 *
 *       AZMA_ALLOW_TEST_NETWORK=1 MAGIC_HOUR_LIVE=1 MAGIC_HOUR_API_KEY=… \
 *       AZMA_ANGLE_REFERENCE=<path to the reference image> \
 *       npx jest camera-angle.live
 *
 *   Skipped in full otherwise, so an ordinary run of this repository can never
 *   spend a credit by accident.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { composeSceneInstruction } from '../qiyamah-commission';
import { CAMERA_ANGLES, type CameraAngleId } from '../camera-angle';
import {
  editImageViaProvider,
  IMAGE_EDIT_MODEL_ID,
} from '../../core/sovereign-ai-integration/adapters/magic-hour-image-editing';

/** The Empire's own measured charge for one edit, and the Founder's ceiling. */
const CREDITS_PER_EDIT = 100;
const AUTHORISED_CREDITS = 500;

/** The five the Founder named. «دون تحديد» is not among them: it spends nothing. */
const ANGLES_UNDER_TEST: readonly CameraAngleId[] = ['front', 'side', 'three-quarter', 'high', 'low'];

/**
 * One sentence for all five, asking for no change but the camera. Anything
 * this sentence varies would be a second variable, and the run would prove
 * nothing about the first.
 */
const HELD_DEMAND_AR =
  'الشخصيةُ نفسُها واقفةً كما هي، بالملابسِ نفسِها والدرعِ نفسِه والتاجِ نفسِه والسيفِ نفسِه، '
  + 'على الخلفيّةِ البيضاءِ نفسِها، بالإضاءةِ نفسِها. لا تُغيَّر هيئتُها ولا تفاصيلُها.';

const live = process.env.MAGIC_HOUR_LIVE === '1'
  && Boolean(process.env.MAGIC_HOUR_API_KEY)
  && Boolean(process.env.AZMA_ANGLE_REFERENCE);
const describeLive = live ? describe : describe.skip;

jest.setTimeout(900_000);

async function accountCredits(): Promise<number | null> {
  const res = await fetch('https://api.magichour.ai/v1/account', {
    headers: { Authorization: `Bearer ${process.env.MAGIC_HOUR_API_KEY}` },
  });
  if (!res.ok) return null;
  return ((await res.json()) as { credits?: number }).credits ?? null;
}

describeLive('زاوية الكاميرا — إثباتٌ بالصور', () => {
  const outDir = process.env.AZMA_ANGLE_OUT ?? join(process.cwd(), '.angle-proof');
  const referencePath = process.env.AZMA_ANGLE_REFERENCE as string;

  it('spends no more than the Founder authorised', () => {
    expect(ANGLES_UNDER_TEST.length * CREDITS_PER_EDIT).toBeLessThanOrEqual(AUTHORISED_CREDITS);
  });

  it('moves the lens five times on one reference, and records what each cost', async () => {
    if (!existsSync(referencePath)) throw new Error(`reference not found: ${referencePath}`);
    mkdirSync(outDir, { recursive: true });

    const source = readFileSync(referencePath);
    const extension = extname(referencePath) || '.png';
    const before = await accountCredits();

    const ledger: Record<string, unknown>[] = [];
    let spent = 0;

    for (const angle of ANGLES_UNDER_TEST) {
      // The ceiling is enforced per call, not only in aggregate: a retry, a
      // changed list or a mistake cannot walk past it.
      if (spent + CREDITS_PER_EDIT > AUTHORISED_CREDITS) break;

      const instruction = composeSceneInstruction({ demandAr: HELD_DEMAND_AR, cameraAngle: angle });
      const started = Date.now();
      let result: Awaited<ReturnType<typeof editImageViaProvider>> | null = null;
      let failure: string | null = null;
      try {
        result = await editImageViaProvider(source, extension, instruction, { model: IMAGE_EDIT_MODEL_ID });
      } catch (err) {
        failure = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      }
      spent += CREDITS_PER_EDIT;

      if (result) {
        writeFileSync(join(outDir, `angle-${angle}.png`), result.bytes);
      }
      ledger.push({
        angle,
        label: CAMERA_ANGLES.find((a) => a.id === angle)?.labelAr,
        instruction,
        jobId: result?.providerJobId ?? null,
        model: result?.providerModelId ?? IMAGE_EDIT_MODEL_ID,
        creditsCharged: result?.creditsCharged ?? null,
        bytes: result?.bytes.length ?? null,
        seconds: Math.round((Date.now() - started) / 1000),
        failure,
      });
    }

    const after = await accountCredits();
    writeFileSync(
      join(outDir, 'ledger.json'),
      JSON.stringify({ reference: referencePath, heldDemandAr: HELD_DEMAND_AR, before, after, ledger }, null, 2),
    );

    // The only claims made here are the ones a machine can honestly make: the
    // calls were attempted, each carried its OWN angle clause and the same
    // everything else, and the spend did not exceed what was authorised. What
    // the pictures SHOW is judged by eye, in the report.
    expect(ledger).toHaveLength(ANGLES_UNDER_TEST.length);
    expect(spent).toBeLessThanOrEqual(AUTHORISED_CREDITS);
    const instructions = ledger.map((row) => row.instruction as string);
    expect(new Set(instructions).size).toBe(instructions.length);
    for (const row of ledger) expect(row.instruction).toContain(HELD_DEMAND_AR);
  });
});
