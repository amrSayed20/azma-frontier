/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Tafsir Provider — six Arabic commentaries on the Qur'an.
 *
 * ─── WHY IT EXISTS, AND WHY LATE ────────────────────────────────────────────
 *
 *   The Founder asked why an Arabic library would be needed. The honest answer
 *   is that it is not: Arabic sources were already reachable and I had left them
 *   unused. These six were measured a few hours earlier, while searching for
 *   Isra'iliyyat, and then not connected — a measurement taken and abandoned,
 *   which is its own kind of waste.
 *
 *   al-Qurtubi alone is exegesis, history and jurisprudence together, in
 *   Arabic, for the whole Qur'an. The chamber was answering questions about the
 *   stories of the Prophets from an English encyclopedia while this sat
 *   reachable and unasked.
 *
 * ─── WHAT A COMMENTARY IS, AND IS NOT ───────────────────────────────────────
 *
 *   Tafsir is a scholar's reading of a verse. It is not the verse, and the
 *   Founder's rule is absolute: the Qur'an is the sole decisive text and
 *   «التفسير مرجعه أهله». So a commentary arrives as DOCUMENTED — named,
 *   located, attributable — and never as SCRIPTURE, and its attribution says
 *   whose reading it is so that a Creator quotes al-Qurtubi as al-Qurtubi.
 *
 *   The chamber does not weigh one commentary against another. Where two
 *   differ, both are shown: «الرأي والرأي الآخر».
 *
 * ─── HOW IT IS SEARCHED ─────────────────────────────────────────────────────
 *
 *   A commentary is indexed by verse, not by subject, so it cannot be asked
 *   «قصة يوسف» directly. What it can be asked is a verse — and the chamber
 *   already has a provider that finds the verses on a subject. So this provider
 *   takes the subject to the Qur'an first, and then brings back what the
 *   commentators said about the verses it found. The Qur'an leads; the
 *   commentary follows it.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';
import { SourceAuthority } from '../domain/evidence-authority';
import { scriptureSearchCandidates } from './sovereign-scripture-provider';

const SEARCH_ENDPOINT = 'https://api.alquran.cloud/v1/search';
const AYAH_ENDPOINT = 'https://api.alquran.cloud/v1/ayah';
const UTHMANI = 'quran-uthmani';

/** Measured: a verse with its commentary answers in ~240ms. */
const FETCH_TIMEOUT_MS = 3_000;
const TOTAL_BUDGET_MS = 4_000;

/**
 * The commentaries, by the names they are known by.
 *
 * Ordered as the chamber offers them: the plainest reading first, then the
 * fuller ones. None outranks another — a Creator choosing between al-Qurtubi
 * and al-Baghawi is choosing between scholars, which is not the chamber's
 * business to decide.
 */
const COMMENTARIES: readonly { readonly edition: string; readonly titleAr: string; readonly authorAr: string }[] = [
  { edition: 'ar.muyassar', titleAr: 'التفسير الميسّر', authorAr: 'مجمع الملك فهد' },
  { edition: 'ar.jalalayn', titleAr: 'تفسير الجلالين', authorAr: 'المحلّي والسيوطي' },
  { edition: 'ar.qurtubi', titleAr: 'تفسير القرطبي', authorAr: 'أبو عبد الله القرطبي' },
  { edition: 'ar.baghawi', titleAr: 'تفسير البغوي', authorAr: 'أبو محمد البغوي' },
  { edition: 'ar.waseet', titleAr: 'التفسير الوسيط', authorAr: 'محمد سيد طنطاوي' },
  { edition: 'ar.miqbas', titleAr: 'تنوير المقباس', authorAr: 'منسوب لابن عباس' },
];

const BY_EDITION = new Map(COMMENTARIES.map((c) => [c.edition, c]));
const ARABIC_LETTER = /[؀-ۿ]/;

interface Match {
  readonly number: number;
  readonly surah?: { readonly name?: string };
  readonly numberInSurah?: number;
}

async function getJson(url: string, budgetMs: number): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, Math.min(FETCH_TIMEOUT_MS, budgetMs)));
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function documentIdFor(edition: string, ayah: number): string {
  return `tafsir-${edition}-${ayah}`;
}

export function parseTafsirId(documentId: string): { edition: string; ayah: number } | null {
  const raw = documentId.startsWith('tafsir-') ? documentId.slice(7) : documentId;
  const at = raw.lastIndexOf('-');
  if (at <= 0) return null;
  const edition = raw.slice(0, at);
  const ayah = parseInt(raw.slice(at + 1), 10);
  if (!BY_EDITION.has(edition) || Number.isNaN(ayah) || ayah <= 0) return null;
  return { edition, ayah };
}

export class TafsirProvider implements IRepositoryProvider {
  public readonly providerId: string = 'tafsir';

  /**
   * Find the verses a subject appears in, then offer what was said about them.
   *
   * Religious questions only. A commentary on a verse is not evidence about a
   * surgical procedure, and offering it as such would blur exactly the line
   * between domains the Founder drew.
   */
  public async search(
    query: string,
    limit: number,
    nativeQuery?: string,
    domain?: string,
  ): Promise<RepositorySearchResult[]> {
    if (domain && domain !== 'religious') return [];

    const asked = nativeQuery && ARABIC_LETTER.test(nativeQuery) ? nativeQuery : query;
    if (!ARABIC_LETTER.test(asked)) return [];

    const candidates = scriptureSearchCandidates(asked);
    if (candidates.length === 0) return [];

    const deadline = Date.now() + TOTAL_BUDGET_MS;
    let matches: readonly Match[] = [];
    for (const candidate of candidates) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      const payload = (await getJson(
        `${SEARCH_ENDPOINT}/${encodeURIComponent(candidate)}/all/${UTHMANI}`,
        remaining,
      )) as { data?: { matches?: readonly Match[] } } | null;
      if (payload?.data?.matches?.length) { matches = payload.data.matches; break; }
    }
    if (matches.length === 0) return [];

    // Two commentaries per verse, so a Creator sees more than one reading —
    // and a handful of verses rather than one, so a story is not reduced to a
    // single ayah.
    const results: RepositorySearchResult[] = [];
    for (const match of matches.slice(0, Math.max(2, Math.ceil(limit / 2)))) {
      const place = match.surah?.name && match.numberInSurah
        ? `${match.surah.name} — ${match.numberInSurah}`
        : 'آية';
      for (const commentary of COMMENTARIES.slice(0, 2)) {
        results.push({
          id: documentIdFor(commentary.edition, match.number),
          provider: this.providerId,
          title: `${commentary.titleAr} — ${place}`,
          snippet: `قول ${commentary.authorAr} في ${place}`,
          // Below the verse itself and below a narration: a reading of a text
          // is not the text, and the Qur'an leads.
          relevanceScore: Math.max(0.5, 0.78 - results.length * 0.02),
        });
        if (results.length >= limit) return results;
      }
    }
    return results;
  }

  /** Retrieve one commentary on one verse, named to its author. */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const parsed = parseTafsirId(documentId);
    if (!parsed) throw new Error(`[TafsirProvider] Invalid reference: '${documentId}'`);

    const commentary = BY_EDITION.get(parsed.edition)!;
    const payload = (await getJson(
      `${AYAH_ENDPOINT}/${parsed.ayah}/editions/${UTHMANI},${parsed.edition}`,
      FETCH_TIMEOUT_MS,
    )) as { data?: readonly { text?: string; surah?: { name?: string }; numberInSurah?: number }[] } | null;

    const editions = payload?.data;
    if (!editions || editions.length < 2 || !editions[1]?.text) {
      throw new Error(`[TafsirProvider] Cannot retrieve '${documentId}'.`);
    }

    const verse = editions[0];
    const place = verse?.surah?.name && verse.numberInSurah
      ? `${verse.surah.name}، الآية ${verse.numberInSurah}`
      : 'آية';

    return {
      id: documentId,
      provider: this.providerId,
      content: editions[1].text as string,
      // A reading of a text is not the text. Never SCRIPTURE.
      authority: SourceAuthority.DOCUMENTED,
      attributionAr: [
        `${commentary.titleAr} — ${commentary.authorAr}، عند ${place}.`,
        'هذا قولُ مفسّرٍ في الآية، لا نصُّ الآية — والتفسير مرجعه أهله.',
      ].join('\n'),
    };
  }
}
