/**
 * AZMA OS — مئةُ وحدةٍ لكلِّ ثانيةٍ من الفيلمِ النهائيّ، لا من مدّةٍ يُرسِلُها العميل.
 *
 * ─── WHAT THESE PROVE ───────────────────────────────────────────────────────
 *
 *   RULED 2026-11-02, decision 2:
 *
 *     «١٠٠ وحدة من رصيد المبدع لكل ثانية من ملف MP4 النهائي … يُحسب الخصم
 *     وفق مدة الفيديو النهائي الفعلية بالثواني، وليس وفق مدة تخمينية
 *     يرسلها العميل … يجب فصل العمليتين ماليًا وتقنيًا، ومنع الخصم المكرر
 *     للعملية نفسها.»
 *
 *   Each `it` below holds ONE sentence of that ruling. The end-to-end proof —
 *   a real MP4, measured by a real ffprobe, charged against a real ledger —
 *   lives in `app/api/ras-amr/render/__tests__/ras-amr-render-route.test.ts`;
 *   these are the rules that road obeys, asserted where they are written.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  MP4_UNITS_PER_SECOND,
  MP4_ROUNDING,
  priceMp4Export,
} from '../pricing/local-export-pricing';
import { MP4_EXPORT_CAPABILITY, sovereignPriceFor } from '../pricing/sovereign-price-authority';
import { OPERATION_CONSUMPTION } from '../pricing/sovereign-value-balance';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

describe('the final export is priced by the film', () => {
  it('charges the Founder’s own four examples exactly', () => {
    // 10s → 1,000 · 15s → 1,500 · 30s → 3,000 · 60s → 6,000, as he wrote them.
    expect(priceMp4Export(10)).toMatchObject({ ok: true, chargedUnits: 1_000 });
    expect(priceMp4Export(15)).toMatchObject({ ok: true, chargedUnits: 1_500 });
    expect(priceMp4Export(30)).toMatchObject({ ok: true, chargedUnits: 3_000 });
    expect(priceMp4Export(60)).toMatchObject({ ok: true, chargedUnits: 6_000 });
  });

  it('rounds a fraction of a second UP, once, over the whole film', () => {
    const film = priceMp4Export(10.2);
    expect(film).toMatchObject({ ok: true, chargedSeconds: 11, chargedUnits: 1_100 });
    // Once, at the level of the job — not 10.2 × 100 rounded somewhere inside.
    expect(MP4_ROUNDING.id).toBe('CEIL_AT_JOB_LEVEL');
    // Never below the approved price for the seconds the Creator received.
    expect((film as { chargedUnits: number }).chargedUnits)
      .toBeGreaterThanOrEqual(10.2 * MP4_UNITS_PER_SECOND);
  });

  it('refuses rather than exporting for nothing when the length is unknown', () => {
    for (const absent of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY, 0, -4]) {
      expect(priceMp4Export(absent as number).ok).toBe(false);
    }
    // The decisive assertion: an absence is never answered with a zero charge.
    expect(priceMp4Export(null)).not.toMatchObject({ chargedUnits: 0 });
  });

  it('is counted per FINAL second, and never reaches the superseded entry', () => {
    const price = sovereignPriceFor(MP4_EXPORT_CAPABILITY);
    expect(price.unitsPerQuantity).toBe(MP4_UNITS_PER_SECOND);
    expect(price.quantity).toBe('per-final-second');

    // `MP4_PRODUCTION` is the 2026-09-27 entry the ruling replaced, in both
    // its figure and its basis. It still exists as the record of what was
    // signed before, and the export must never be priced from it.
    const superseded = OPERATION_CONSUMPTION.find((r) => r.capability === 'MP4_PRODUCTION');
    expect(superseded?.balancePerUnit).toBe(70);
    expect(price.unitsPerQuantity).not.toBe(superseded?.balancePerUnit);
    expect(price.quantity).not.toBe(superseded?.quantity);
  });

  it('takes its hold from the compiled graph, never from the request body', () => {
    const road = read('src/sovereign-entry/ras-al-amr-render.ts');

    // The one number the price may be computed from: the FILM's own length.
    //
    //   MEASURED: `estimatedDurationSeconds` spans audio nodes too, and the
    //   encoder stops at the last picture. Holding on the timeline reserved
    //   6,000 units for a 10-second film under a minute of music, and refused
    //   a Creator holding 3,000 who could afford the 1,000 it really costs.
    expect(road).toContain('priceMp4Export(compiled.metadata.filmDurationSeconds)');
    expect(road).not.toContain('priceMp4Export(compiled.metadata.estimatedDurationSeconds)');

    // And the body is not a source of duration anywhere on this road. The
    // route hands over a canvas and a tenant; a client-stated duration has no
    // path to the charge.
    expect(road).not.toMatch(/priceMp4Export\(\s*(request|body|canvas|params)\b/);
  });

  it('settles on the measured file, and the hold is the ceiling', () => {
    const road = read('src/sovereign-entry/ras-al-amr-render.ts');

    // Measured, by the instrument that reads the file itself.
    expect(road).toContain('probeDurationSeconds(');
    expect(road).toContain('Math.min(finalPrice.chargedUnits, attempt.unitsHeld)');

    // A film whose duration cannot be measured is settled at what was held —
    // the Creator has their film, and a failed instrument is not a refund.
    expect(road).toContain('held-amount-unmeasured');
  });

  it('is separate money from generating what the film is made of', () => {
    const road = read('src/sovereign-entry/ras-al-amr-render.ts');
    const authority = read('src/economy/pricing/sovereign-price-authority.ts');

    // The export road prices the export and nothing else: it names no
    // creative capability, so no generation can be charged through it.
    expect(road).toContain('sovereignCapability: MP4_EXPORT_CAPABILITY');
    for (const creative of ['IMAGE_GENERATION', 'IMAGE_EDIT', 'MOTION', 'RAS_AMR_SCENE']) {
      expect(road).not.toContain(`sovereignCapability: '${creative}'`);
    }

    // And the export's own classification exists in the authority, so the two
    // can never be answered by the same entry.
    expect(authority).toContain("MP4_EXPORT_CAPABILITY = 'MP4_EXPORT'");
  });

  it('quotes the Creator the same seconds it holds against', () => {
    // The quote and the hold must be the same arithmetic, or the sentence
    // shown before the press is not the charge taken after it. Both are the
    // film's own length: the compiler computes it once, the server holds on
    // it, and the chamber shows it.
    const chamber = read('app/ras-amr/page.tsx');
    expect(chamber).toContain('Math.ceil(r.durationSeconds) * MP4_UNITS_PER_SECOND');
    // And never the sound's end, which is not in the file.
    expect(chamber).not.toContain('Math.max(r.durationSeconds, r.soundEndSeconds)');

    // `durationSeconds` in the chamber is the pictures alone — the same rule
    // the compiler applies to produce `filmDurationSeconds`.
    expect(chamber).toContain('durationSeconds: Math.max(0, ...visual.map(');
    expect(read('src/chambers/ras-al-amr/pre-publishing-boundary.ts'))
      .toContain('node.runtimeAsset.capabilityTarget !== CapabilityTarget.AUDIO');
  });

  it('does not forget the press’s key while the Empire has decided nothing', () => {
    const road = read('src/sovereign-entry/ras-al-amr-render.ts');

    // `operation-in-flight` is not a verdict, and the browser's own key
    // lifecycle reads exactly that string to keep the key instead of minting
    // a new one. Answering `cost-unavailable` here made the next press take a
    // SECOND hold and dispatch a SECOND encode of the same film.
    //
    //   IT MEASURES THE THROW, not a mention. The first version of this line
    //   asserted that the file CONTAINED the string — and it still did after
    //   the defect was put back, because the reason's own type union names it.
    //   A guard whose instrument answers a different question from its claim
    //   is one that gets silenced for being wrong.
    const twinRefusal = road.slice(road.indexOf("claim.kind === 'in-flight'"));
    expect(twinRefusal.slice(0, 300)).toContain("'operation-in-flight',");
    expect(read('src/economy/client-operation-key.ts'))
      .toContain("if (answer?.reason === 'operation-in-flight') return;");

    // And a retry after a failure is a retry, not a duplicate: `claimAttempt`
    // has already issued a fresh key for it.
    expect(road).toContain("claim.kind === 'in-flight' || claim.kind === 'already-succeeded'");
    expect(road).not.toContain("if (claim.kind !== 'claimed') {");
  });

  it('states the charge to the Creator before the press, from this one source', () => {
    // Both doors that export a film read the figure from the module that
    // holds it. A hand-typed 100 in a chamber could drift from the ruling.
    for (const door of ['app/ras-amr/page.tsx', 'app/ras-amr/storyboard/StoryboardWorld.tsx']) {
      const chamber = read(door);
      expect(chamber).toContain("import { MP4_UNITS_PER_SECOND } from '@/src/economy/pricing/local-export-pricing'");
      expect(chamber).toContain('MP4_UNITS_PER_SECOND');
      // And the sentence that said the opposite is gone from both.
      expect(chamber).not.toContain('الإخراج لا يستهلك وحدات AZMA');
    }
  });

  it('cannot be started by any caller that says nothing about money', () => {
    const road = read('src/sovereign-entry/ras-al-amr-render.ts');

    // The parameter is REQUIRED. An optional one is a free export waiting for
    // a caller to forget it, and the type checker is the only guard that
    // reaches a caller written months from now.
    expect(road).toContain('money: RasAlAmrRenderMoney,');
    expect(road).not.toContain('money?: RasAlAmrRenderMoney');

    // And the hold is unconditional once the film compiles.
    expect(road).toContain('const charge = holdForExport(operationId, tenantId, money, compiled);');
  });

  it('pays once for one press: both doors carry the press’s own key', () => {
    for (const door of ['app/ras-amr/page.tsx', 'app/ras-amr/storyboard/StoryboardWorld.tsx']) {
      const chamber = read(door);
      expect(chamber).toContain("paidOperationHeaders('ras-amr:mp4-export')");
      expect(chamber).toContain("operationConcluded('ras-amr:mp4-export'");
    }
  });
});
