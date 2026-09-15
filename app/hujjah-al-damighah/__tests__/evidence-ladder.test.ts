/**
 * The Ladder of Evidence — a rung reports, it never decides.
 *
 * ─── THE FOUNDER'S PROPOSAL ─────────────────────────────────────────────────
 *
 *   «هذا الدليل من القرآن وهو دليل قاطع، وهذا الدليل من السنة وهو صحيح، وهذا
 *    دليل آخر من السنة وهو حسن، وهذا دليل من العامة، وهذا من الإسرائيليات...»
 *
 *   Offered as a suggestion and taken, because it is where every separation
 *   this chamber has made belongs: a source's standing is not its grade, and
 *   neither is how closely it touched the question.
 *
 * ─── THE LINE THESE TESTS HOLD ──────────────────────────────────────────────
 *
 *   A narration reaches the صحيح rung because a named scholar said so and the
 *   chamber stored his words. Never because a collection's title is famous.
 *   Never because the chamber formed a view. And where the scholars disagreed,
 *   the narration goes to the rung that says they disagreed — resolving that is
 *   their work, not this file's.
 */

import type { EvidenceItemDTO, InvestigationDTO } from '../actions';
import { SourceAuthority } from '../_lib/evidence-utils';
import {
  buildLadder,
  rungOf,
  narrationRung,
  ladderSummaryAr,
  hasDecisiveRung,
} from '../_lib/evidence-ladder';

function item(over: Partial<EvidenceItemDTO> = {}): EvidenceItemDTO {
  return {
    id: Math.random().toString(36).slice(2),
    extractedText: 'نص',
    contextWindow: 'نص',
    confidenceScore: 0.5,
    confidenceLevel: 'MODERATE',
    sourceAuthority: SourceAuthority.DOCUMENTED,
    ...over,
  };
}

const verse = item({
  id: 'q1',
  sourceAuthority: SourceAuthority.SCRIPTURE,
  attributionAr: 'سورة الفيل، الآية 1.',
  confidenceScore: 0.9,
});

/** al-Bukhari carries no grading field at all. Measured from the source. */
const ungraded = item({
  id: 'h-ungraded',
  attributionAr: 'صحيح البخاري — الحديث 2731.\nدرجة الحديث: غير متوفرة من المصدر.',
});

const sahih = item({
  id: 'h-sahih',
  attributionAr: 'سنن النسائي — الحديث 5.\nدرجة الحديث:\nصحيح — الألباني',
});

const hasan = item({
  id: 'h-hasan',
  attributionAr: 'جامع الترمذي — الحديث 9.\nدرجة الحديث:\nحسن — الألباني',
});

const daif = item({
  id: 'h-daif',
  attributionAr: 'سنن ابن ماجه — الحديث 7.\nدرجة الحديث:\nضعيف — الألباني',
});

/** Abu Dawud's first narration: four scholars, and they do not agree. */
const disputed = item({
  id: 'h-disputed',
  attributionAr:
    'سنن أبي داود — الحديث 1.\nدرجة الحديث:\nحسن صحيح — الألباني\nصحيح لغيره — شعيب الأرناؤوط\n' +
    'واختلف أهل العلم في درجته، وقد عُرضت أقوالهم كما هي.',
});

const encyclopedia = item({ id: 'ref', extractedText: 'موضوع: مكة المكرمة' });

function dtoOf(...evidence: EvidenceItemDTO[]): InvestigationDTO {
  return { success: true, evidence, totalSourcesScanned: evidence.length, averageEvidenceScore: 0.5 };
}

describe('placing a narration by what the scholars said', () => {
  it('reads صحيح from a stated grade', () => {
    expect(narrationRung(sahih)).toBe('sunnah-sahih');
  });

  it('reads حسن from a stated grade', () => {
    expect(narrationRung(hasan)).toBe('sunnah-hasan');
  });

  it('shows a weak narration as weak rather than hiding it', () => {
    expect(narrationRung(daif)).toBe('sunnah-daif');
  });

  it('reports a disagreement instead of resolving it', () => {
    expect(narrationRung(disputed)).toBe('sunnah-disputed');
  });

  it('never borrows a grade from a collection’s reputation', () => {
    // al-Bukhari, ungraded at source. The famous title supplies nothing.
    expect(narrationRung(ungraded)).toBe('sunnah-ungraded');
    expect(narrationRung(ungraded)).not.toBe('sunnah-sahih');
  });

  it('treats a grade with no scholar named as no grade at all', () => {
    const nameless = item({ attributionAr: 'صحيح مسلم — الحديث 3.\nدرجة الحديث:\nصحيح' });
    expect(narrationRung(nameless)).toBe('sunnah-ungraded');
  });

  it('sends conflicting grades to the disputed rung even without the notice line', () => {
    const conflicting = item({
      attributionAr: 'سنن النسائي — 4.\nدرجة الحديث:\nصحيح — الألباني\nضعيف — شعيب الأرناؤوط',
    });
    expect(narrationRung(conflicting)).toBe('sunnah-disputed');
  });
});

describe('placing everything else', () => {
  it('puts the Qur’an on the decisive rung', () => {
    expect(rungOf(verse, 'religious')).toBe('quran');
  });

  it('puts a general reference where it belongs, not among the Sunnah', () => {
    expect(rungOf(encyclopedia, 'religious')).toBe('reference');
  });

  it('puts documented material on the history rung for a historical question', () => {
    expect(rungOf(encyclopedia, 'history')).toBe('history');
  });

  it('carries the ladder into the scientific domain', () => {
    expect(rungOf(encyclopedia, 'scientific')).toBe('scientific-consensus');
  });

  it('carries it into the medical domain, where the rung names its own limit', () => {
    const ladder = buildLadder(dtoOf(encyclopedia), 'medical');
    expect(ladder[0]!.id).toBe('clinical-guidance');
    expect(ladder[0]!.meaningAr).toContain('لطبيبك المعالج');
  });

  it('keeps standing above domain: a verse is a verse in a medical question', () => {
    expect(rungOf(verse, 'medical')).toBe('quran');
    expect(rungOf(sahih, 'scientific')).toBe('sunnah-sahih');
  });

  it('assigns no rung the chamber cannot actually tell apart', () => {
    // Primary record, contested account and single study are real categories
    // the Empire holds no source able to identify. They are named, never
    // guessed at.
    const everywhere = ['religious', 'history', 'medical', 'scientific', 'culture']
      .flatMap((d) => buildLadder(dtoOf(encyclopedia, verse, sahih), d).map((r) => r.id));
    for (const unfillable of ['israiliyyat', 'primary-record', 'contested-account', 'study']) {
      expect(everywhere).not.toContain(unfillable);
    }
  });

  it('places nothing on الإسرائيليات, because nothing marks a report as such', () => {
    const ladder = buildLadder(dtoOf(verse, sahih, encyclopedia), 'religious');
    expect(ladder.some((r) => r.id === 'israiliyyat')).toBe(false);
  });
});

describe('the ladder as a whole', () => {
  const ladder = buildLadder(dtoOf(encyclopedia, daif, verse, sahih, disputed, ungraded), 'religious');

  it('puts the Qur’an first, whatever order the evidence arrived in', () => {
    expect(ladder[0]!.id).toBe('quran');
  });

  it('ranks the Sunnah above general references', () => {
    const ids = ladder.map((r) => r.id);
    expect(ids.indexOf('sunnah-sahih')).toBeLessThan(ids.indexOf('reference'));
  });

  it('orders the rungs by standing, not by how much each holds', () => {
    const ids = ladder.map((r) => r.id);
    expect(ids.indexOf('sunnah-sahih')).toBeLessThan(ids.indexOf('sunnah-daif'));
    expect(ids.indexOf('sunnah-daif')).toBeLessThan(ids.indexOf('reference'));
  });

  it('shows no empty rung', () => {
    for (const rung of ladder) expect(rung.items.length).toBeGreaterThan(0);
  });

  it('tells the Creator what each rung means, not merely its name', () => {
    for (const rung of ladder) expect(rung.meaningAr.length).toBeGreaterThan(20);
  });

  it('says of the Qur’an that interpretation belongs to its people', () => {
    expect(ladder[0]!.meaningAr).toContain('التفسير مرجعه أهله');
  });

  it('says of an ungraded narration that no grade is inferred from the book', () => {
    const rung = ladder.find((r) => r.id === 'sunnah-ungraded')!;
    expect(rung.meaningAr).toContain('لا تُستنتج الدرجة من اسم الكتاب');
  });

  it('names no provider anywhere a Creator can read', () => {
    const words = ladder.map((r) => `${r.titleAr} ${r.meaningAr}`).join(' ');
    expect(words).not.toMatch(/gutenberg|wikipedia|gemini|jsdelivr|api|cdn/i);
  });
});

describe('what the ladder says in one line', () => {
  it('counts what was found without judging it', () => {
    const summary = ladderSummaryAr(buildLadder(dtoOf(verse, sahih), 'religious'));
    expect(summary).toContain('من القرآن الكريم (1)');
    expect(summary).toContain('من السنّة — صحيح (1)');
  });

  it('says plainly when nothing was found', () => {
    expect(ladderSummaryAr([])).toContain('لم يُعثر على دليل');
  });

  it('knows the Qur’an is the only decisive rung', () => {
    expect(hasDecisiveRung(buildLadder(dtoOf(verse), 'religious'))).toBe(true);
    expect(hasDecisiveRung(buildLadder(dtoOf(sahih, disputed), 'religious'))).toBe(false);
  });
});

describe('inside a rung', () => {
  it('puts the passage that bears most closely on the question first', () => {
    const near = item({ id: 'near', sourceAuthority: SourceAuthority.SCRIPTURE, confidenceScore: 0.9, attributionAr: 'سورة الفيل، الآية 1.' });
    const far = item({ id: 'far', sourceAuthority: SourceAuthority.SCRIPTURE, confidenceScore: 0.1, attributionAr: 'سورة البقرة، الآية 45.' });
    const ladder = buildLadder(dtoOf(far, near), 'religious');
    expect(ladder[0]!.items.map((i) => i.id)).toEqual(['near', 'far']);
  });
});
