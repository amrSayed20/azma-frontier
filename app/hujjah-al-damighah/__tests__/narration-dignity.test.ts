/**
 * The chamber never calls a narration folklore.
 *
 * ─── THE DEFECT THIS KEEPS DEAD ─────────────────────────────────────────────
 *
 *   The layer a piece of evidence is displayed at was derived entirely from its
 *   match score — how closely its wording touched the Creator's question. The
 *   bottom of that scale reads «تراث شفهي», «ادعاء منتشر», «مصدر مجهول» and
 *   «موروث وأسطورة».
 *
 *   A narration from صحيح البخاري whose words happened not to overlap a
 *   question would have been shown to a Creator under one of those labels.
 *   That is not a ranking error; in a religious question it is a false
 *   statement about the Sunnah, made by the Empire, in the Creator's name.
 *
 *   Those four labels describe a *source* the chamber cannot place. The score
 *   measures a *match*. A text the chamber can point to in a named book is
 *   documented however loosely it bears on the question, and the bearing is
 *   reported separately in words of its own.
 */

import type { EvidenceItemDTO } from '../actions';
import {
  SourceAuthority,
  resolveKnowledgeLayer,
  bucketEvidence,
  isNarration,
  isAttributed,
  sourceLineOf,
  getConstitutionalTier,
  evidenceForTaking,
} from '../_lib/evidence-utils';

function item(over: Partial<EvidenceItemDTO> = {}): EvidenceItemDTO {
  return {
    id: 'e1',
    extractedText: 'نص',
    contextWindow: 'نص',
    confidenceScore: 0.5,
    confidenceLevel: 'MODERATE',
    sourceAuthority: SourceAuthority.DOCUMENTED,
    ...over,
  };
}

/** A narration whose wording barely touched the question — the live case. */
const distantNarration = item({
  id: 'n1',
  extractedText: 'حدثنا عبد الله بن يوسف قال أخبرنا مالك ... حبسها حابس الفيل',
  confidenceScore: 0.11,
  confidenceLevel: 'LOW',
  attributionAr: 'صحيح البخاري — الحديث 2731.\nدرجة الحديث: غير متوفرة من المصدر.',
});

const gradedNarration = item({
  id: 'n2',
  extractedText: 'من صبر على البلاء رفعه الله',
  confidenceScore: 0.30,
  confidenceLevel: 'LOW',
  attributionAr:
    'سنن أبي داود — الحديث 1.\nدرجة الحديث:\nحسن صحيح — الألباني\nصحيح لغيره — شعيب الأرناؤوط\nواختلف أهل العلم في درجته، وقد عُرضت أقوالهم كما هي.',
});

const unattributed = item({ id: 'u1', confidenceScore: 0.11, confidenceLevel: 'LOW', sourceAuthority: 'UNATTRIBUTED' });

describe('recognising a narration', () => {
  it('knows one by the collection its attribution names', () => {
    expect(isNarration(distantNarration)).toBe(true);
    expect(isNarration(gradedNarration)).toBe(true);
  });

  it('does not mistake an unattributed passage for one', () => {
    expect(isNarration(unattributed)).toBe(false);
    expect(isAttributed(unattributed)).toBe(false);
  });

  it('does not mistake a verse for one', () => {
    const verse = item({ sourceAuthority: SourceAuthority.SCRIPTURE, attributionAr: 'سورة الفيل، الآية 1.' });
    expect(isNarration(verse)).toBe(false);
  });
});

describe('a narration that barely matched the question', () => {
  it('is shown as a narration, not as folklore', () => {
    const layer = resolveKnowledgeLayer(distantNarration, 'religious');
    expect(layer.labelAr).toBe('حديث نبوي');
  });

  it('carries the same words a score alone would have condemned', () => {
    // The same text and the same score, with nothing to place it by. That is
    // the label the chamber used to put on this narration.
    const asIfUnplaceable = item({
      ...distantNarration,
      attributionAr: undefined,
      sourceAuthority: 'UNATTRIBUTED',
    });
    expect(resolveKnowledgeLayer(asIfUnplaceable, 'religious').labelAr).toBe('مصدر مجهول');
  });

  it('is never given any of the four words reserved for unplaceable material', () => {
    const forbidden = ['تراث شفهي', 'ادعاء منتشر', 'مصدر مجهول', 'موروث وأسطورة'];
    for (const n of [distantNarration, gradedNarration]) {
      expect(forbidden).not.toContain(resolveKnowledgeLayer(n, 'religious').labelAr);
    }
  });

  it('stands at a constitutional tier befitting a documented text', () => {
    expect(getConstitutionalTier(resolveKnowledgeLayer(distantNarration, 'religious').tier)).toBeLessThanOrEqual(2);
  });
});

describe('any source the chamber can place', () => {
  it('is documented, however loosely it bore on the question', () => {
    const encyclopedia = item({ confidenceScore: 0.05, confidenceLevel: 'LOW', attributionAr: 'الموسوعة العربية — أبو بكر الصديق.' });
    expect(resolveKnowledgeLayer(encyclopedia, 'history').labelAr).toBe('مصدر موثَّق');
  });

  it('is documented even when its source writes no citation line', () => {
    // The live page: entries from the Arabic encyclopedia carry no citation,
    // and were shown as «مصدر مجهول» — the chamber calling an encyclopedia it
    // deliberately consulted an unknown source.
    const encyclopedia = item({
      extractedText: 'موضوع: مملكة سبأ وصف: مملكة',
      confidenceScore: 0.02,
      confidenceLevel: 'LOW',
      sourceAuthority: SourceAuthority.DOCUMENTED,
    });
    expect(isAttributed(encyclopedia)).toBe(true);
    expect(resolveKnowledgeLayer(encyclopedia, 'religious').labelAr).toBe('مصدر موثَّق');
  });

  it('leaves the unplaceable words for material the chamber truly cannot place', () => {
    const nameless = item({
      confidenceScore: 0.05,
      confidenceLevel: 'LOW',
      sourceAuthority: 'UNATTRIBUTED',
    });
    expect(resolveKnowledgeLayer(nameless, 'religious').labelAr).toBe('مصدر مجهول');
  });
});

describe('a narration is never bucketed as doubtful', () => {
  const buckets = bucketEvidence({
    success: true,
    evidence: [distantNarration, gradedNarration, unattributed],
    totalSourcesScanned: 3,
    averageEvidenceScore: 0.17,
  });

  it('stands among the supported evidence', () => {
    expect(buckets.supported.map((e) => e.id)).toEqual(expect.arrayContaining(['n1', 'n2']));
  });

  it('is absent from every bucket that feeds a word of doubt', () => {
    for (const bucket of [buckets.disputed, buckets.unverified, buckets.narratives]) {
      const ids = bucket.map((e) => e.id);
      expect(ids).not.toContain('n1');
      expect(ids).not.toContain('n2');
    }
  });

  it('does not drag an unplaceable passage up with it', () => {
    expect(buckets.unverified.map((e) => e.id)).toContain('u1');
  });
});

describe('the one line a board has room for', () => {
  it('names the collection and the number', () => {
    expect(sourceLineOf(distantNarration)).toBe('صحيح البخاري — الحديث 2731');
  });

  it('leaves the gradings for the gateway, where disagreement has room', () => {
    expect(sourceLineOf(gradedNarration)).toBe('سنن أبي داود — الحديث 1');
    expect(sourceLineOf(gradedNarration)).not.toContain('الألباني');
  });

  it('says nothing when there is nothing to say', () => {
    expect(sourceLineOf(unattributed)).toBe('');
  });
});

describe('what the Creator carries out', () => {
  const taken = evidenceForTaking(gradedNarration, 'ما ورد في فضل الصبر', 'religious');

  it('carries the collection and the number', () => {
    expect(taken).toContain('سنن أبي داود — الحديث 1');
  });

  it('carries every grade with the scholar who issued it', () => {
    expect(taken).toContain('حسن صحيح — الألباني');
    expect(taken).toContain('صحيح لغيره — شعيب الأرناؤوط');
  });

  it('carries the disagreement rather than resolving it', () => {
    expect(taken).toContain('واختلف أهل العلم');
  });

  it('never labels a narration as folklore in what leaves the chamber', () => {
    expect(taken).not.toContain('موروث وأسطورة');
    expect(taken).toContain('حديث نبوي');
  });
});
