/**
 * AZMA OS — WHICH DESTINATION ANSWERS FOR A PROVIDER NAME
 *
 * ─── THIS IS DISPATCH, NOT A FRAMEWORK ─────────────────────────────────────
 *
 *   Before this file, the upload door named `googleDriveDestination` directly.
 *   That was correct while one provider existed and false the moment a second
 *   did: an account row says `provider`, and the door was free to ignore it.
 *
 *   The whole of the fix is a lookup from the name already stored in the row
 *   to the implementation of the contract it belongs to. No registration step,
 *   no plugin loading, no configuration — a provider that is not in this map
 *   returns null, and a caller that gets null refuses rather than guesses.
 *
 *   `dropbox` is deliberately absent. It is a NAME in `CloudProviderId` with
 *   no implementation behind it, and mapping it to anything — least of all to
 *   Google's destination — would turn an honest gap into a silent wrong
 *   delivery. A Creator cannot link one today, so nothing can ask for one.
 *
 *   `telegram-user` is absent for the OPPOSITE reason, and the difference
 *   matters: it is fully implemented, and the server is simply not the one who
 *   delivers for it. The Empire holds no session for that provider — by the
 *   Founder's ruling of 2026-10-04 — so there is nothing here that could make
 *   the call. `serverCanDeliver()` says so in words, because a future engineer
 *   finding a working provider missing from this map will otherwise «fix» it,
 *   and the fix would be the breach.
 */

import type { CloudProviderId } from './cloud-account-repository';
import type { CloudDestination } from './destination-contract';
import { googleDriveDestination } from './google-drive-destination';
import { telegramDestination } from './telegram-destination';
import { youtubeDestination } from './youtube-destination';
import { facebookPageDestination, instagramBusinessDestination } from './meta-destination';
import { tiktokDestination } from './tiktok-destination';

const BY_PROVIDER: Partial<Record<CloudProviderId, CloudDestination>> = {
  'google-drive': googleDriveDestination,
  telegram: telegramDestination,
  youtube: youtubeDestination,
  'facebook-page': facebookPageDestination,
  'instagram-business': instagramBusinessDestination,
  tiktok: tiktokDestination,
};

/** The destination that can actually deliver for this provider, or null. */
export function destinationFor(provider: CloudProviderId): CloudDestination | null {
  return BY_PROVIDER[provider] ?? null;
}

/** The providers a Creator can link right now — those with a real binding. */
export function implementedProviders(): readonly CloudProviderId[] {
  return Object.keys(BY_PROVIDER) as readonly CloudProviderId[];
}

/**
 * Whether the SERVER is the party that delivers for this provider.
 *
 * False for `telegram-user`: real, reachable, and delivered by the Creator's
 * own browser. A caller that gets false must refuse rather than look for
 * another way — there is no other way, and inventing one means holding a
 * session this Empire has agreed never to hold.
 */
export function serverCanDeliver(provider: CloudProviderId): boolean {
  return BY_PROVIDER[provider] !== undefined;
}
