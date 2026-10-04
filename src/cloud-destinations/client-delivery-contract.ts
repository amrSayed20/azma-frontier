/**
 * AZMA OS — A DESTINATION THE SERVER CANNOT DELIVER TO
 *
 * ─── THE ONE BOUNDARY THAT GENUINELY HAD TO MOVE ────────────────────────────
 *
 *   `CloudDestination` assumes the Empire holds a credential and spends it:
 *   `refreshAccess` then `deliver`, both on the server. Google Drive works
 *   that way. The Telegram BOT works that way.
 *
 *   The Founder ruled on 2026-10-04 that a Creator's personal Telegram session
 *   must never be stored on the AZMA server. That ruling does not change where
 *   a secret is KEPT — it changes WHO PERFORMS THE DELIVERY. If the server
 *   never holds the session, the server can never make the call, and no
 *   amount of care inside `deliver` can fix that. The browser makes it.
 *
 *   So this is a second, smaller contract standing BESIDE the first, and the
 *   first is untouched. A provider is one or the other, never both.
 *
 * ─── WHAT THE SERVER STILL OWNS, AND IT IS MOST OF IT ───────────────────────
 *
 *   The Vault. The ownership boundary. Which accounts exist and which Creator
 *   they belong to. The receipt. The Constitution's rule that مكمن is the only
 *   centre of external distribution. None of that moves to the browser.
 *
 *   What moves is one act: the call to Telegram, made by the only party that
 *   holds the credential for it — its owner.
 *
 * ─── AND THE PRICE, WRITTEN DOWN RATHER THAN DISCOVERED LATER ───────────────
 *
 *   The server cannot verify what the browser reports. A message id that comes
 *   back is a CLAIM, not an observation, because verifying it would require
 *   exactly the session the Empire has agreed not to hold.
 *
 *   This is not a defect to be repaired. It is the direct, unavoidable cost of
 *   the custody model that was chosen, and the Founder accepted it in those
 *   words: PARTIAL ZERO-CUSTODY, never zero-custody. Anything written here
 *   that implies the server witnessed the publication would be false.
 */

import type { CloudProviderIdentity } from './destination-contract';

/**
 * A provider whose delivery happens in the Creator's own browser.
 *
 * It deliberately has NO `deliver`, NO `refreshAccess`, NO `exchangeCode`.
 * Not stubs that throw — absent. A method that exists is a method some caller
 * will one day reach for, and there is no server-side path to reach.
 */
export interface ClientExecutedDestination {
  readonly identity: CloudProviderIdentity;
  /**
   * Stated, not inferred. `destinationFor()` returns null for these providers,
   * and this flag is how a caller tells «no such provider» from «this provider
   * is real, and the server is not the one who delivers for it».
   */
  readonly deliveredBy: 'client';
}

/**
 * What the browser says happened, after it happened.
 *
 * Every field is a claim from a client, and the server treats it as one: the
 * asset id and the account id are CHECKED against the Creator's own records
 * before anything is written, and the message id is recorded as reported
 * because it cannot be anything else.
 */
export interface ClientPublicationClaim {
  readonly assetId: string;
  readonly accountId: string;
  /** The provider's own identifier for the message the browser says it sent. */
  readonly providerMessageId: string;
}

/**
 * Why a client-executed delivery did not happen, in the contract's own words.
 *
 * The same three the server-side contract uses, so one receipt table and one
 * set of Arabic remedies serve both kinds of destination.
 */
export type ClientDeliveryFailure = 'unauthorised' | 'rejected' | 'unreachable';
