/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Transmitted Corpus Provider — what «الإسرائيليات» was drawn from.
 *
 * ─── WHAT IT IS, STATED EXACTLY ─────────────────────────────────────────────
 *
 *   Seven public-domain volumes of Jewish traditional narrative: Ginzberg's
 *   *Legends of the Jews* in four volumes and three companions. 5,435 passages,
 *   held by the Empire, searched as rows.
 *
 *   The Founder asked for this by name — «ابحث في المكتبة التي أعطيتك الرابط
 *   الخاص بها عن الإسرائيليات وأضفها» — and it was searched for before it was
 *   built. Twice.
 *
 *   In the tafsirs: «الإسرائيليات» appears in ZERO of 507 verses of al-Qurtubi
 *   and al-Baghawi across al-Baqara, al-Kahf and Yusuf.
 *   In the library: ZERO of 79,381 volumes carry that word in a title or
 *   subject. These seven carry the material those reports came from.
 *
 * ─── PROVENANCE IS NOT CLASSIFICATION ───────────────────────────────────────
 *
 *   This provider states where a passage is from, which it can verify. It
 *   refuses to state whether the passage is «موافق» or «مخالف» or
 *   «يُتوقَّف فيه», which it cannot: that is a ruling Muslim scholars issue
 *   about reports that entered Islamic exegesis, and Ginzberg was compiling
 *   Jewish tradition, not classifying what crossed over.
 *
 *   Every passage therefore carries «تصنيفه غير متاح للإمبراطورية» — the exact
 *   condition the Founder set for an unclassifiable report. Inferring a ruling
 *   by reading would be this chamber issuing a religious judgement, which it is
 *   forbidden and unfit to do.
 *
 * ─── AND IT IS NEVER SILENT ─────────────────────────────────────────────────
 *
 *   Every passage arrives carrying the warning and its provenance in its
 *   attribution, which travels into the evidence board, the gateway, the
 *   composed answer and anything a Creator carries out. A label that survives
 *   only until the first composition is not a label.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';
import { SourceAuthority } from '../domain/evidence-authority';
import {
  ISRAILIYYAT_WARNING_AR,
  CLASSIFICATION_UNAVAILABLE_AR,
  IsrailiyyatStatus,
  statusLabelAr,
} from '../israiliyyat/israiliyyat-contracts';
import {
  searchTransmitted,
  findTransmitted,
  hasTransmitted,
  transmittedCounts,
} from '@/src/persistent-storage/transmitted-repository';

const LATIN_WORD = /[A-Za-z]{3,}/;

function documentIdFor(reportId: string): string {
  return `transmitted-${reportId}`;
}

export function parseTransmittedId(documentId: string): string | null {
  if (!documentId.startsWith('transmitted-')) return null;
  const id = documentId.slice(12);
  return id.length > 0 ? id : null;
}

/** The chamber's own account of the corpus it holds. */
export function transmittedHolding(): { held: boolean; total: number; classified: number; byWork: Record<string, number> } {
  try {
    const counts = transmittedCounts();
    return { held: counts.total > 0, ...counts };
  } catch {
    return { held: false, total: 0, classified: 0, byWork: {} };
  }
}

export class TransmittedProvider implements IRepositoryProvider {
  public readonly providerId: string = 'transmitted-corpus';

  /**
   * Search the transmitted corpus.
   *
   * These works are in English, so the rendered query is what reaches them —
   * this is one of the catalogues the language bridge exists for. What comes
   * back crosses into Arabic before a Creator sees or hears it.
   *
   * Religious questions only. A medical or technical question has no business
   * being answered from Jewish traditional narrative, and a historical one
   * would invite exactly the confusion between transmitted story and
   * established history that the Founder forbade.
   */
  public async search(
    queryText: string,
    limit: number,
    _nativeQuery?: string,
    domain?: string,
  ): Promise<RepositorySearchResult[]> {
    if (domain && domain !== 'religious') return [];

    const words = queryText
      .split(/\s+/)
      .filter((w) => LATIN_WORD.test(w))
      .map((w) => w.replace(/[^A-Za-z]/g, ''))
      .filter((w) => w.length >= 3);
    if (words.length === 0) return [];

    try {
      if (!hasTransmitted()) return [];
      const reports = searchTransmitted(words, limit);
      return reports.map((r, index) => ({
        id: documentIdFor(r.reportId),
        provider: this.providerId,
        title: `${r.workTitle} — ${r.location}`,
        snippet: r.textEn.slice(0, 200),
        // Deliberately the lowest band any source in this chamber occupies.
        // An unclassifiable report is not weak evidence — it is evidence of
        // nothing until a scholar rules on it, and it ranks accordingly.
        relevanceScore: Math.max(0.3, 0.45 - index * 0.01),
      }));
    } catch {
      return [];
    }
  }

  /** Retrieve one passage, with its provenance and its warning attached. */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const reportId = parseTransmittedId(documentId);
    if (!reportId) {
      throw new Error(`[TransmittedProvider] Invalid reference: '${documentId}'`);
    }

    const report = findTransmitted(reportId);
    if (!report) {
      throw new Error(`[TransmittedProvider] Passage '${documentId}' is not held.`);
    }

    // The warning and the missing classification ride in the attribution, which
    // no window truncates and which travels into every downstream output.
    const attribution = [
      `${report.provenanceAr} — ${report.workTitle}، ${report.location}.`,
      report.compiler ? `جامعه: ${report.compiler}.` : null,
      statusLabelAr(
        report.status === IsrailiyyatStatus.UNCLASSIFIED
          ? IsrailiyyatStatus.UNCLASSIFIED
          : (report.status as IsrailiyyatStatus),
      ) + '.',
      report.scholarlyNoteAr,
      ISRAILIYYAT_WARNING_AR,
      report.status === IsrailiyyatStatus.UNCLASSIFIED ? CLASSIFICATION_UNAVAILABLE_AR : null,
    ].filter(Boolean).join('\n');

    return {
      id: documentId,
      provider: this.providerId,
      content: report.textEn,
      authority: SourceAuthority.UNATTRIBUTED,
      attributionAr: attribution,
    };
  }
}
