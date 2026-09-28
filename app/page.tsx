import { cookies } from "next/headers";
import { verifySession } from "@/src/authentication";
import { getDb, getCreator } from "@/src/persistent-storage";
import { resolveRequestLocale } from "@/src/creator-language/resolve-request-locale";
import { getDictionary, t } from "@/src/creator-language";
import { resolveAvailableActions } from "@/src/button-engine";
import { ArrivalExperience } from "@/src/imperial-experience-engine";

const SESSION_COOKIE = "azma_session";

/**
 * THE FIRST CONSTITUTIONAL PACKAGE (2026-07-20): this Server Component
 * does only what it must — resolve session, locale, and available
 * actions — and hands the actual ceremony to the Arrival Experience
 * Pipeline (src/imperial-experience-engine/experiences/arrival/), built
 * directly from the Council's eight-package constitutional foundation.
 * See that component's own header for the beat-by-beat translation.
 */
export default async function SovereignGate() {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  const creator = session ? getCreator(getDb(), session.creatorId) : null;
  const knownName = creator?.displayName;

  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);

  const actions = resolveAvailableActions({
    threshold: 'gate',
    authenticated: !!session,
    role: session?.role ?? null,
  });

  // Recognition (Storyboard Beat 5) is felt through presence, never
  // demanded through a form — a stranger is given no imperative line
  // asking them to declare anything; only a returning, already-known
  // Creator sees a session-aware greeting.
  const title = session
    ? (knownName ? `${t(dict, 'gate.titleKnownDefault')}، ${knownName}` : t(dict, 'gate.titleKnownDefault'))
    : '';

  /**
   * ─── NO PRICE AT THE DOOR ─────────────────────────────────────────────────
   *
   *   The four packages were rendered here as the arrival's closing beat.
   *
   *   FOUNDER'S RULING, 2026-09-28: «لا اريد ان تكون صفحه الاشتراكات والباقات
   *   (الميزان) فى بدايه دخول الزائر للمنصه». His earlier «نهاية رحلة الزائر»
   *   was not the end of this ceremony — the ceremony is the BEGINNING of the
   *   entry, and a stranger at a door is not met with a price list.
   *
   *   They appear where the money is about to be spent, and they live at the
   *   end of the platform on ميزان القيمة. The gate carries no cost truth at
   *   all now, which also means this Server Component no longer imports the
   *   pricing module.
   */
  return <ArrivalExperience title={title} actions={actions} dict={dict} locale={locale} />;
}
