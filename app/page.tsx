import { cookies } from "next/headers";
import { verifySession } from "@/src/authentication";
import { getDb, getCreator } from "@/src/persistent-storage";
import { resolveRequestLocale } from "@/src/creator-language/resolve-request-locale";
import { getDictionary, t } from "@/src/creator-language";
import { resolveAvailableActions } from "@/src/button-engine";
import { ArrivalExperience } from "@/src/imperial-experience-engine";
import {
  creatorFacingPackages,
  GIFT_BALANCE,
  SOVEREIGN_VALUE_BALANCE,
} from "@/src/economy/pricing/sovereign-value-balance";

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
   * ─── WHAT THE VISIT COSTS, SAID AT THE END OF THE VISIT ───────────────────
   *
   *   The Founder, 2026-09-27: «وتعرض الباقات فى نهايه رحله الزائر وليس بعد
   *   تسجيل الدخول وتخبر المستخدم ان هناك وحدات هديه ممكن ان تمنحها
   *   الامبراطوريه لمشتركين».
   *
   *   So the prices are the closing beat of the arrival, reached after the
   *   ceremony has finished speaking — not a paywall sprung on someone who has
   *   just registered. A visitor learns what the Empire's power costs while
   *   they are still free to walk away, which is the only moment the telling
   *   is worth anything.
   *
   *   This is read HERE, on the server, and passed down already reduced to
   *   what a Creator may see. The pricing module carries the Empire's cost
   *   truth — provider rates, the dollar acquisition cost, the FX rate — and a
   *   client component that imported it would publish all of it in a bundle.
   */
  return (
    <ArrivalExperience
      title={title}
      actions={actions}
      dict={dict}
      locale={locale}
      packages={creatorFacingPackages()}
      unitNameAr={SOVEREIGN_VALUE_BALANCE.nameAr}
      giftNoticeAr={GIFT_BALANCE.noticeAr}
    />
  );
}
