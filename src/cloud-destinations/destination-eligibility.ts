/**
 * AZMA OS — CAN *THIS* CREATOR COMPLETE *THIS* DESTINATION TODAY?
 *
 * ─── THE DEBT THIS PAYS ─────────────────────────────────────────────────────
 *
 *   مكمن الغاية decided what to offer by asking ONE question:
 *
 *       tiktok: tiktokIsConfigured() && vault
 *
 *   which means «the Empire holds a client key and a secret». It does NOT mean
 *   «TikTok will accept your subscriber». Those are two different facts, and
 *   the code held only the first, so every Creator was shown «+ اربط تيك توك»
 *   and every Creator who pressed it was refused by TikTok's own screen.
 *
 *   FOUNDER'S RULE, made executable here: a destination is offered ONLY to a
 *   Creator who can complete it today. Anyone excluded is told a true reason —
 *   never handed a door that slams.
 *
 * ─── WHY THE ANSWER CANNOT BE COMPUTED, AND MUST BE DECLARED ────────────────
 *
 *   Whether a platform admits a given account is a fact held in that
 *   platform's own developer portal — an app-review verdict and a list of
 *   enrolled accounts. No API returns it. Asking the platform by TRYING is
 *   exactly the slammed door this module exists to prevent.
 *
 *   So it is declared, per linking flow, in the server's environment:
 *
 *       AZMA_PLATFORM_ADMITS_YOUTUBE
 *       AZMA_PLATFORM_ADMITS_META
 *       AZMA_PLATFORM_ADMITS_TIKTOK
 *
 *     unset / empty  → NOBODY yet. The platform has not opened this door.
 *     `everyone`     → the review passed; any Creator may complete it.
 *     a list         → only these AZMA accounts (comma or whitespace
 *                      separated emails) — the accounts enrolled in the
 *                      platform's portal, and no others.
 *
 *   THE DEFAULT IS CLOSED, AND THAT IS THE POINT. An unset variable can only
 *   ever hide a destination; it can never show one that refuses. The old
 *   failure mode is unreachable from here.
 *
 *   A new linking flow MUST add its name to `ADMITS_ENV` below or it stays
 *   closed. That is deliberate: a flow nobody declared is a flow nobody has
 *   proven, and an undeclared destination must not be offered.
 */

import type { CloudProviderId } from './cloud-account-repository';

/**
 * The relationship between one Creator and one destination — named, so no
 * screen ever decides what to draw from a bare boolean.
 */
export type DestinationAccess =
  /** The Empire holds no application credential. Nothing to offer at all. */
  | 'NOT_CONFIGURED'
  /** The Empire is ready; the PLATFORM has not opened this door to this Creator. */
  | 'AWAITING_PLATFORM_REVIEW'
  /** This Creator can complete this destination today. */
  | 'OPEN';

export interface DestinationAccessState {
  readonly access: DestinationAccess;
  /** Why, in the Creator's own language. Empty when the door is open. */
  readonly reasonAr: string;
}

/** Which linking flow declares each platform's admitted accounts. */
const ADMITS_ENV: Readonly<Record<string, string>> = {
  youtube: 'AZMA_PLATFORM_ADMITS_YOUTUBE',
  meta: 'AZMA_PLATFORM_ADMITS_META',
  tiktok: 'AZMA_PLATFORM_ADMITS_TIKTOK',
};

/**
 * Which linking flow a stored account belongs to — or null for the providers
 * this gate does not govern.
 *
 * Drive, a Telegram bot and the Creator's own Telegram account need no
 * platform review: the Creator holds the credential, or the grant names its
 * own scope. Returning null for them keeps this gate off paths it was never
 * asked to judge — including the three standing under seal.
 */
export function offerKeyOfProvider(provider: CloudProviderId): string | null {
  switch (provider) {
    case 'youtube': return 'youtube';
    case 'facebook-page':
    case 'instagram-business': return 'meta';
    case 'tiktok': return 'tiktok';
    default: return null;
  }
}

const EVERYONE = 'everyone';

/** Does the platform behind this flow admit this Creator's account today? */
export function platformAdmits(offerKey: string, creatorEmail: string | null): boolean {
  const name = ADMITS_ENV[offerKey];
  if (!name) return false;
  const declared = (process.env[name] ?? '').trim();
  if (declared.length === 0) return false;
  if (declared.toLowerCase() === EVERYONE) return true;
  if (!creatorEmail) return false;
  const mine = creatorEmail.trim().toLowerCase();
  return declared
    .split(/[\s,;]+/)
    .some((entry) => entry.trim().toLowerCase() === mine && mine.length > 0);
}

/**
 * It must stand ALONE — it is the whole answer a route, a refused publication
 * and a refused account each return — and it must not repeat the heading the
 * Chamber draws above it. MEASURED on the live Chamber 2026-10-10: it did, and
 * the row said «قيد مراجعة المنصّة» twice.
 */
const AWAITING_AR =
  'لم تفتح المنصّة هذا الباب لحسابك بعد. يُعرَض عليك فور قبولها، ولا نعرض باباً يُردّ.';
const NOT_CONFIGURED_AR = 'غير مهيّأ في الإمبراطوريّة بعد';

/**
 * The one answer the Chamber, the linking route and the publishing door all
 * read. Three callers, one verdict — so a destination cannot be hidden in one
 * place and reachable in another.
 *
 * The Empire's own readiness is asked FIRST: a Creator told «قيد مراجعة
 * المنصّة» about a platform the Empire holds no key for would be given the
 * wrong remedy to wait for.
 */
export function destinationAccessFor(input: {
  readonly offerKey: string;
  readonly empireHoldsCredential: boolean;
  readonly creatorEmail: string | null;
}): DestinationAccessState {
  if (!input.empireHoldsCredential) {
    return { access: 'NOT_CONFIGURED', reasonAr: NOT_CONFIGURED_AR };
  }
  if (!platformAdmits(input.offerKey, input.creatorEmail)) {
    return { access: 'AWAITING_PLATFORM_REVIEW', reasonAr: AWAITING_AR };
  }
  return { access: 'OPEN', reasonAr: '' };
}
