import { resolveRequestLocale } from "@/src/creator-language/resolve-request-locale";
import { getDictionary } from "@/src/creator-language";
import { PUBLISHED_POLICIES } from "@/src/policies";
import { SOVEREIGN_PACKAGES } from "@/src/economy/pricing/sovereign-value-balance";
import { SovereignGateway } from "@/src/imperial-experience-engine";

/**
 * AZMA OS — azmaos.com, the first thing a stranger sees.
 *
 * ─── WHAT THIS SERVER COMPONENT IS FOR ──────────────────────────────────────
 *
 *   It reads the AUTHORITATIVE sources and hands them down. Nothing on this
 *   page is restated, and the client restates nothing either:
 *
 *     · the published policies  — `PUBLISHED_POLICIES`, which is already the
 *       list of what can genuinely be served. The five that live only in
 *       `docs/` are not in it, so the gateway cannot offer a card that opens
 *       onto a wall. That filtering is not done here; it is done once, there.
 *
 *     · the four packages — `SOVEREIGN_PACKAGES`, whose own header reads
 *       «APPROVED. DO NOT ALTER A SINGLE FIGURE.» The figures are passed
 *       through untouched, so a price cannot drift by being typed twice.
 *
 *   The gateway itself is a client component because the approach, the
 *   crossing and the policy reader are all interaction. What it is handed is
 *   plain data.
 *
 * ─── THE CEREMONY THIS REPLACED, AND WHAT BECAME OF IT ──────────────────────
 *
 *   `ArrivalExperience` stood here. It is NOT deleted — it is exported still,
 *   and it holds beats, a seal and a living companion that this gateway does
 *   not reproduce. Whether it returns somewhere, or is retired, is the
 *   Architect's ruling and not a decision to take by deleting a file.
 *
 * ─── A STANDING RULING THE ARCHITECT SHOULD SEE AGAIN ───────────────────────
 *
 *   FOUNDER, 2026-09-28: «لا اريد ان تكون صفحه الاشتراكات والباقات (الميزان)
 *   فى بدايه دخول الزائر للمنصه — انها تظهر له عند طلب اجراء عمليه انتاجيه
 *   وتوجد فى نهايه المنصه».
 *
 *   The order building this gateway places the four packages inside the
 *   introduction, at stage nine. The two are reconciled here on one reading:
 *   that ruling struck a price list standing AT THE DOOR as the arrival's
 *   closing beat. These are not at the door — they come after the chambers
 *   and after the policies, nothing can be bought from them, and the gateway
 *   says so in as many words. If that reading is wrong, the section is one
 *   block and comes out whole.
 */
export default async function SovereignGate() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);

  const policies = PUBLISHED_POLICIES.map((p) => ({
    slug: p.slug,
    titleAr: p.titleAr,
    titleEn: p.titleEn,
    version: p.version,
    language: p.language,
    body: p.body,
  }));

  const packages = SOVEREIGN_PACKAGES.map((p) => ({
    packageId: p.packageId,
    nameAr: p.nameAr,
    priceEgp: p.priceEgp,
    balanceUnits: p.balanceUnits,
  }));

  return (
    <SovereignGateway
      dict={dict}
      locale={locale}
      policies={policies}
      packages={packages}
    />
  );
}
