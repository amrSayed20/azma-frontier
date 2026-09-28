/**
 * AZMA OS — what a published policy is.
 *
 * A policy is not prose the Empire happens to hold. It is a promise a Creator
 * can be held to and can hold the Empire to, so three things about it are
 * facts and not formatting: which version they read, when it began to govern,
 * and in which tongue it was written.
 */

export type PolicyLanguage = 'ar' | 'en';

export interface PolicyDocument {
  /** The address it is served at: /policies/<slug>. */
  readonly slug: string;
  readonly titleEn: string;
  readonly titleAr: string;
  /** The tongue the BODY is written in — not the reader's chosen one. */
  readonly language: PolicyLanguage;
  readonly version: string;
  /**
   * The day it begins to govern.
   *
   * `null` means the document exists and does not yet govern. It is not a
   * formatting gap: a policy with no effective date cannot be relied on by a
   * Creator or enforced by the Empire, and a surface that shows one without
   * saying so is claiming something nobody decided.
   */
  readonly effectiveDate: string | null;
  /** The text, exactly as ratified. Never edited in transit. */
  readonly body: string;
}
