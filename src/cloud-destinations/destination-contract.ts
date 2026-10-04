/**
 * AZMA OS — WHAT A CLOUD DESTINATION IS, BEFORE ANY PROVIDER IS NAMED
 *
 * ─── PROVIDER NEUTRALITY IS A CHARTER ARTICLE, NOT A PREFERENCE ─────────────
 *
 *   The Founder named three in one breath — «جوجل درايف أو دروبوكس أو أي كلاود
 *   للآيفون وهكذا» — and «وهكذا» is the whole instruction: the Empire must be
 *   able to add the fourth without reopening the Chamber.
 *
 *   So مكمن الغاية never learns a provider's name beyond a label it shows the
 *   Creator. It asks a `CloudDestination` to take a file, and the destination
 *   knows which API it is talking to.
 *
 * ─── AND WHAT NO DESTINATION MAY DO ─────────────────────────────────────────
 *
 *   Return a token, log one, or put one in an error. `deliver` is handed an
 *   access token by the caller that opened the seal, uses it, and forgets it.
 */

import type { CloudProviderId } from './cloud-account-repository';

/** What a Creator is asked to grant, said in their own language. */
export interface CloudProviderIdentity {
  readonly id: CloudProviderId;
  readonly labelAr: string;
  /** Whether the Empire presently holds the credentials to offer this at all. */
  readonly configured: boolean;
}

export interface DeliveryRequest {
  /** The bytes to deliver — read from the Vault by the caller, never here. */
  readonly bytes: Uint8Array;
  /** What the file should be called in the Creator's own drive. */
  readonly fileName: string;
  readonly mimeType: string;
  /**
   * WHERE INSIDE THE PROVIDER, when the provider has an inside.
   *
   * ─── WHY THIS FIELD EXISTS, AND WHY IT IS OPTIONAL ────────────────────────
   *
   *   A Drive grant names its own place: the Creator's own Drive, and
   *   `drive.file` can reach nowhere else. One grant, one destination.
   *
   *   A Telegram bot token names no place at all. The same bot may be admin of
   *   a channel, a member of a group, and in conversation with one person, and
   *   a token alone cannot say which of them the Creator meant. The routing is
   *   NOT a secret — it is a chat id or an `@name` — and so it is carried here
   *   in the open rather than sealed into the grant beside the token.
   *
   *   Providers that have no inside ignore it. It is never a token, never a
   *   credential, and never a substitute for one: a destination that is handed
   *   a target but no valid access still fails.
   */
  readonly providerTarget?: string;
}

export type DeliveryOutcome =
  | { readonly ok: true; readonly providerFileId: string }
  | {
      readonly ok: false;
      /**
       * `unauthorised` — the grant no longer works; the Creator must relink.
       * `rejected`     — the provider refused this file (quota, size, policy).
       * `unreachable`  — the provider did not answer.
       */
      readonly reason: 'unauthorised' | 'rejected' | 'unreachable';
      /** For an engineer's log. Never a token, and never shown to a Creator. */
      readonly detail: string;
    };

/**
 * One provider the Empire can deliver to.
 *
 * `exchangeCode` and `refreshAccess` are the two halves of a grant's life: the
 * first turns the Creator's consent into a lasting permission, the second
 * turns that permission into an hour of access when a file must move.
 */
export interface CloudDestination {
  readonly identity: CloudProviderIdentity;

  /**
   * Where the Creator is sent to grant permission.
   *
   * `state` binds the callback to a request this browser started; `nonce`
   * binds the identity token to it. Both are minted per link and held in
   * httpOnly cookies — a value the page can read is a value an injected
   * script can read.
   */
  authorizationUrl(input: { redirectUri: string; state: string; nonce: string }): string;

  /** The Creator consented; turn the one-time code into a lasting grant. */
  exchangeCode(code: string, redirectUri: string, nonce: string): Promise<{
    refreshToken: string;
    accountId: string;
    accountLabel: string | null;
    scopes: readonly string[];
  }>;

  /** Turn a lasting grant into an hour of access. */
  refreshAccess(refreshToken: string): Promise<string | null>;

  /** Put the file in the Creator's own storage. */
  deliver(accessToken: string, request: DeliveryRequest): Promise<DeliveryOutcome>;
}
