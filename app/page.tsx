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

  return <ArrivalExperience title={title} actions={actions} dict={dict} locale={locale} />;
}
