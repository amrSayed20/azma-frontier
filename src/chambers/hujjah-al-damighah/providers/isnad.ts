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
 * The matn — what was actually narrated.
 *
 * Returns the whole text when no handover can be found, because a narration
 * searched whole is merely searched loosely, while one cut in the wrong place
 * is a narration the chamber can no longer find at all.
 */
export function extractMatn(narration: string): string {
  const text = narration.trim();
  if (text.length === 0) return text;

  for (const marker of HANDOVER_MARKERS) {
    const at = text.lastIndexOf(marker);
    if (at === -1) continue;
    const matn = text.slice(at + marker.length).trim();
    // A handover near the very end leaves nothing behind it — that is a mention
    // of the Prophet ﷺ inside the chain rather than the start of the content.
    if (matn.length >= 12) return matn;
  }

  // No handover formula. If it does not even open like a chain, it is already
  // content: the Forty collections and much of the Muwatta read this way.
  if (!CHAIN_OPENERS.test(text)) return text;

  return text;
}

/** Whether a narration's chain could be told apart from its content at all. */
export function hasDistinguishableMatn(narration: string): boolean {
  return extractMatn(narration) !== narration.trim();
}
