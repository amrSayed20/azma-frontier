/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * Separating the chain of transmission from what was transmitted.
 *
 * ─── WHY ────────────────────────────────────────────────────────────────────
 *
 *   A narration is two things joined. The isnad names who carried it — «حدثنا
 *   عبد الله بن يوسف قال أخبرنا مالك عن ابن شهاب» — and the matn is what was
 *   actually said. The isnad is often longer than the matn, and it is entirely
 *   made of names.
 *
 *   Searching a narration whole therefore searches a roll of names. The Founder
 *   asked the chamber for the story of Yunus and received the verse, and then
 *   every narration carrying a transmitter named Yunus: «فجاءت بنص قرآني ثم أتت
 *   بكل ما يسمى يونس سواء كان راوٍ أو أي شخص اسمه يونس».
 *
 *   Those narrations are not about Yunus. His name appears in them the way a
 *   postman's name appears on a letter.
 *
 *   So a subject is searched in the matn. The isnad is kept — it is displayed,
 *   it is part of the narration, and it is what makes the narration checkable —
 *   but it is provenance, and provenance is not subject matter.
 *
 * ─── IT OPERATES ON NORMALISED TEXT, AND THAT IS NOT INCIDENTAL ─────────────
 *
 *   The collections are written with full diacritics: «قَالَ رَسُولُ اللَّهِ
 *   صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ». The first version of this file matched
 *   undiacritised markers against that, and separated the chain from the
 *   narration in exactly zero of 36,064 narrations. The tests passed, because I
 *   had written the fixtures without diacritics — a test built on data the
 *   Empire does not actually hold, which is worse than no test: it reports
 *   success and buys nothing.
 *
 *   Callers pass text that has already been normalised, and the markers here
 *   are normalised to match. What is stored for searching is the normalised
 *   matn; the whole narration, diacritics and all, is stored separately and is
 *   what a Creator reads.
 *
 * ─── WHAT THIS IS, HONESTLY ─────────────────────────────────────────────────
 *
 *   A heuristic over the conventional wording of the collections, not a parse
 *   of the science of isnad. It cuts at the last of the formulae that mark the
 *   handover from chain to content. Where it finds none it keeps the whole
 *   narration, which is the safe failure: searching too much text finds extra
 *   narrations, while cutting wrongly would lose real ones.
 */

/**
 * The formulae that hand over from the chain to what was said.
 *
 * Ordered from most explicit to least. The cut is made at the LAST occurrence
 * of the earliest-matching marker, because a chain can carry several links that
 * each use the same word.
 */
const HANDOVER_MARKERS: readonly string[] = [
  'قال رسول الله صلى الله عليه وسلم',
  'قال النبي صلى الله عليه وسلم',
  'أن رسول الله صلى الله عليه وسلم',
  'ان رسول الله صلى الله عليه وسلم',
  'عن رسول الله صلى الله عليه وسلم',
  'عن النبي صلى الله عليه وسلم',
  'سمعت رسول الله صلى الله عليه وسلم',
  'أن النبي صلى الله عليه وسلم',
  'ان النبي صلى الله عليه وسلم',
  'رسول الله صلى الله عليه وسلم',
  'النبي صلى الله عليه وسلم',
];

/** How a chain announces itself, when no handover formula is present at all. */
const CHAIN_OPENERS = /^(?:حدثنا|حدثني|أخبرنا|اخبرنا|أخبرني|اخبرني|أنبأنا|انبأنا|ثنا)\b/;

/**
 * Strips the diacritics and letterform variants, so a marker written one way
 * finds a narration written another. Kept in step with the normalisation used
 * when the Sunnah was stored and when a question is scored.
 */
function bare(text: string): string {
  return text
    .replace(/[ً-ْٰۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

const BARE_MARKERS = HANDOVER_MARKERS.map(bare);

/**
 * The matn — what was actually narrated.
 *
 * Works on the bare form of the text, because the collections carry full
 * diacritics and an undiacritised marker matches none of them. Returns the
 * whole text when no handover can be found: a narration searched whole is
 * merely searched loosely, while one cut in the wrong place is a narration the
 * chamber can no longer find at all.
 */
export function extractMatn(narration: string): string {
  const text = bare(narration);
  if (text.length === 0) return text;

  for (const marker of BARE_MARKERS) {
    const at = text.lastIndexOf(marker);
    if (at === -1) continue;
    const matn = text.slice(at + marker.length).trim();
    // A handover near the very end leaves nothing behind it — that is a mention
    // of the Prophet ﷺ inside the chain rather than the start of the content.
    if (matn.length >= 12) return matn;
  }

  // No handover formula. The Forty collections and much of the Muwatta read as
  // content from their first word, and a narration that does not even open like
  // a chain is already its own matn.
  return text;
}

/**
 * Whether a narration's chain could be told apart from its content at all.
 *
 * Compares the bare forms, because extractMatn returns bare text — comparing it
 * against the diacritised original would report every narration as separated,
 * including the ones where nothing was found.
 */
export function hasDistinguishableMatn(narration: string): boolean {
  return extractMatn(narration) !== bare(narration);
}
