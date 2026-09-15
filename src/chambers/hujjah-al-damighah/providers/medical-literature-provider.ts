/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Medical Literature Provider.
 *
 * ─── WHY ────────────────────────────────────────────────────────────────────
 *
 *   The medical domain had two sources, both general encyclopedias. A doctor
 *   explaining an operation was answered from the same place as someone asking
 *   about a singer. The Founder's ruling: it must not depend on general
 *   encyclopedias alone.
 *
 *   No ninth Ministry. A source layer inside the engine that exists, with its
 *   own taxonomy and its own safety rules.
 *
 * ─── THE HIERARCHY IS READ, NOT INFERRED ────────────────────────────────────
 *
 *   Measured from the production host: the literature service returns
 *   `pubTypeList` on the record itself — «['Systematic Review', 'Journal
 *   Article']» — with the publication date, the journal and the DOI. For
 *   cholecystectomy alone it holds 169 records typed as guidelines, 1,578 as
 *   systematic reviews, 1,113 as meta-analyses.
 *
 *   So a guideline is a guideline because its publisher said so. Nothing here
 *   decides that a paper is strong evidence by reading it, which would be this
 *   chamber practising medicine.
 *
 * ─── WHAT IT WILL NOT DO ────────────────────────────────────────────────────
 *
 *   It retrieves what is published. It does not diagnose, does not prescribe,
 *   does not decide anything about a person. Every passage it returns carries
 *   its kind, its age and its citation, so a clinician can check it and a
 *   Creator can see what they are holding.
 *
 * ─── SECRECY ────────────────────────────────────────────────────────────────
 *
 *   No service is named to a Creator. What is named is the journal, the year
 *   and the DOI — the identity of the evidence, which a clinician needs in
 *   order to look it up, and which is not the name of a vendor.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';
import { SourceAuthority } from '../domain/evidence-authority';
import {
  MedicalEvidenceKind,
  medicalKindLabelAr,
  medicalRank,
  recencyOf,
  recencyLabelAr,
} from '../medical/medical-evidence-contracts';

const ENDPOINT = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

/** Measured: 220ms for a search. Generous many times over. */
const FETCH_TIMEOUT_MS = 6_000;

/**
 * The publication types the service states, mapped to the hierarchy.
 *
 * Longest and most specific first: a record typed both «Systematic Review» and
 * «Journal Article» is a systematic review, and matching in the other order
 * would flatten every review into an ordinary paper.
 */
const TYPE_MAP: readonly { readonly match: RegExp; readonly kind: MedicalEvidenceKind }[] = [
  { match: /practice guideline|^guideline|consensus development/i, kind: MedicalEvidenceKind.GUIDELINE },
  { match: /systematic review|meta-analysis/i, kind: MedicalEvidenceKind.SYSTEMATIC_REVIEW },
  { match: /randomized controlled trial|randomised controlled trial|^clinical trial, phase/i, kind: MedicalEvidenceKind.RANDOMISED_TRIAL },
  { match: /clinical trial|observational study|comparative study|multicenter study|case reports/i, kind: MedicalEvidenceKind.CLINICAL_STUDY },
  { match: /review|editorial|comment|lecture/i, kind: MedicalEvidenceKind.EXPERT_NARRATIVE },
];

/**
 * The kind of evidence a record is, from the types its publisher declared.
 *
 * Where several apply, the strongest wins — a paper that is both a guideline
 * and a review is a guideline. Where none applies, it is a clinical study
 * rather than something stronger: the safe direction for an unknown is down.
 */
export function kindFromStatedTypes(types: readonly string[]): MedicalEvidenceKind {
  let kind: MedicalEvidenceKind | null = null;
  for (const stated of types) {
    for (const { match, kind: candidate } of TYPE_MAP) {
      if (!match.test(stated)) continue;
      if (kind === null || medicalRank(candidate) < medicalRank(kind)) kind = candidate;
    }
  }
  return kind ?? MedicalEvidenceKind.CLINICAL_STUDY;
}

interface RawResult {
  readonly id?: string;
  readonly source?: string;
  readonly pmid?: string;
  readonly doi?: string;
  readonly title?: string;
  readonly abstractText?: string;
  readonly pubYear?: string;
  readonly firstPublicationDate?: string;
  readonly pubTypeList?: { readonly pubType?: readonly string[] };
  readonly journalInfo?: { readonly journal?: { readonly title?: string } };
  readonly isOpenAccess?: string;
}

function documentIdFor(source: string, id: string): string {
  return `med-${source}-${id}`;
}

export function parseMedicalId(documentId: string): { source: string; id: string } | null {
  const raw = documentId.startsWith('med-') ? documentId.slice(4) : documentId;
  const at = raw.indexOf('-');
  if (at <= 0) return null;
  return { source: raw.slice(0, at), id: raw.slice(at + 1) };
}

async function query(term: string, limit: number): Promise<RawResult[]> {
  const url = new URL(ENDPOINT);
  // `core` carries the abstract, the publication types and the journal — the
  // fields the hierarchy and the citation are both read from.
  url.searchParams.set('query', term);
  url.searchParams.set('format', 'json');
  url.searchParams.set('resultType', 'core');
  url.searchParams.set('pageSize', String(Math.min(limit * 3, 25)));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) return [];
    const data = await response.json() as { resultList?: { result?: RawResult[] } };
    return data.resultList?.result ?? [];
  } catch {
    // An unreachable service contributes nothing and fabricates nothing.
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export class MedicalLiteratureProvider implements IRepositoryProvider {
  public readonly providerId: string = 'medical-literature';

  /**
   * Search the medical literature, strongest kind of evidence first.
   *
   * The literature is in English, so the rendered query is the right one to
   * use here — this is one of the catalogues the language bridge exists for.
   * What comes back crosses back into Arabic before a Creator sees or hears it.
   */
  public async search(
    queryText: string,
    limit: number,
    _nativeQuery?: string,
    domain?: string,
  ): Promise<RepositorySearchResult[]> {
    // Registered for the medical and scientific domains only. A religious or
    // historical question has no business in a clinical database.
    if (domain && domain !== 'medical' && domain !== 'scientific') return [];

    const results = await query(queryText, limit);
    if (results.length === 0) return [];

    return results
      .map((r) => {
        const statedTypes = r.pubTypeList?.pubType ?? [];
        const kind = kindFromStatedTypes(statedTypes);
        const id = r.id ?? r.pmid ?? '';
        if (!id || !r.title) return null;

        return {
          id: documentIdFor(r.source ?? 'MED', id),
          provider: this.providerId,
          title: r.title.slice(0, 160),
          snippet: (r.abstractText ?? r.title).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 200),
          // Ranked by the kind of evidence, not by how the words matched. A
          // guideline outranks a case report on a question about a procedure
          // however closely the case report's wording happens to fit.
          relevanceScore: Math.max(0.5, 0.95 - (medicalRank(kind) - 1) * 0.05),
        };
      })
      .filter((r): r is RepositorySearchResult => r !== null)
      .slice(0, limit);
  }

  /**
   * Retrieve one paper with everything a clinician needs to check it.
   *
   * The citation is not decoration here. A Creator handed a claim about an
   * operation must be able to put the DOI in front of a doctor, and a doctor
   * must be able to see the year — medicine changes, and a guideline from
   * fifteen years ago may have been withdrawn.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const parsed = parseMedicalId(documentId);
    if (!parsed) throw new Error(`[MedicalLiteratureProvider] Invalid reference: '${documentId}'`);

    const results = await query(`EXT_ID:${parsed.id} AND SRC:${parsed.source}`, 1);
    const r = results[0];
    if (!r || !r.title) {
      throw new Error(`[MedicalLiteratureProvider] Cannot retrieve '${documentId}'.`);
    }

    const statedTypes = r.pubTypeList?.pubType ?? [];
    const kind = kindFromStatedTypes(statedTypes);
    const year = r.pubYear ? parseInt(r.pubYear, 10) : null;
    const recency = recencyOf(Number.isNaN(year as number) ? null : year, new Date().getFullYear());

    const abstract = (r.abstractText ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    const attribution = [
      `${medicalKindLabelAr(kind)} — ${recencyLabelAr(recency, year)}.`,
      r.journalInfo?.journal?.title ? `المنشور فيه: ${r.journalInfo.journal.title}.` : null,
      r.doi ? `المعرّف: ${r.doi}` : (r.pmid ? `المعرّف: PMID ${r.pmid}` : null),
      statedTypes.length ? `نوعه كما صنّفه ناشره: ${statedTypes.join('، ')}.` : null,
    ].filter(Boolean).join('\n');

    return {
      id: documentId,
      provider: this.providerId,
      content: abstract ? `${r.title}\n\n${abstract}` : r.title,
      authority: SourceAuthority.DOCUMENTED,
      attributionAr: attribution,
    };
  }
}
