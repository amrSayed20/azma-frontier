/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * «الدستور نصّ على أن المستخدم يرى الدليل والحجة ولا يرى المصدر.»
 *
 * These tests hold that line at the one place it was actually crossed: the
 * failure channel. `result.error` is printed to the Creator's screen unaltered,
 * and what reached it was a machine constant, an internal stage name, and — in
 * the catch-all — the exception's own words, which carry the provider's name and
 * the document's identifier.
 *
 * What is asserted is not that the code is written a certain way, but that no
 * text a Creator can be shown is text the machine wrote for itself.
 */

import {
  InvestigationFailure,
  failureSpokenAr,
  isMachineText,
} from '../_lib/investigation-failure';

/** Every way the chamber can fail. A new one must be named before it is shown. */
const ALL = Object.values(InvestigationFailure);

describe('Al Hujjah — what the Creator is told when the search fails', () => {
  it('names every failure in the Creator’s tongue', () => {
    for (const failure of ALL) {
      const spoken = failureSpokenAr(failure);
      expect(typeof spoken).toBe('string');
      expect(spoken.trim().length).toBeGreaterThan(20);
      // Arabic letters, not a constant dressed up as a sentence.
      expect(/[؀-ۿ]/.test(spoken)).toBe(true);
    }
  });

  it('never shows the Creator a provider, a document, or a stage of the machine', () => {
    for (const failure of ALL) {
      expect(isMachineText(failureSpokenAr(failure))).toBe(false);
    }
  });

  it('gives each failure its own words — a Creator can tell them apart', () => {
    const spoken = ALL.map(failureSpokenAr);
    expect(new Set(spoken).size).toBe(ALL.length);
  });

  /**
   * The strings below were on the Creator's screen in the shipped chamber. The
   * detector must recognise each one, or it would not have caught them.
   */
  describe('the detector against what actually leaked', () => {
    const LEAKED = [
      'AUTH_REQUIRED',
      'Query rejected at the reception boundary.',
      'Query could not be understood.',
      'Investigation could not be conducted.',
      'Evidence collection failed.',
      "Error: [SovereignLibraryProvider] Cannot read 'book-1513': HTTP 403",
      "[MedicalLiteratureProvider] Invalid reference: 'med-MED-31234567'",
      '[TafsirProvider] Cannot retrieve tafsir-ar.qurtubi-2583.',
      '[GutenbergProvider] Gutendex search failed: HTTP 403',
    ];

    for (const leak of LEAKED) {
      it(`recognises as machine text: ${leak.slice(0, 44)}`, () => {
        expect(isMachineText(leak)).toBe(true);
      });
    }
  });

  it('does not mistake the Creator’s own evidence for machine text', () => {
    // A citation is the proof itself, not the Empire's supplier. The Founder's
    // own rulings require these to be shown: the collection, the chapter and
    // the hadith number for a narration; the journal and the DOI for a paper.
    const EVIDENCE = [
      'صحيح البخاري — كتاب بدء الوحي، الحديث رقم ١.\nدرجة الحديث: صحيح.',
      'سورة الصافات، الآية 139.',
      'تفسير القرطبي — أبو عبد الله القرطبي، عند سورة يونس، الآية 98.',
      'مراجعة منهجية — حديثة (2023).\nالمنشور فيه: مجلة الجراحة.',
    ];
    for (const text of EVIDENCE) {
      expect(isMachineText(text)).toBe(false);
    }
  });
});
