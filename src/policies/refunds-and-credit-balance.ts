/**
 * AZMA OS — POLICY: REFUNDS & CREDIT BALANCE.
 *
 * ─── THE FOUNDER'S OWN TEXT, 2026-09-28, VERBATIM ───────────────────────────
 *
 *   Delivered finished, carrying a company identity the repository had never
 *   held: Topline Design, Nasr City Cairo, with a phone and an address. That
 *   makes it an instrument, not a draft, and an instrument is transcribed and
 *   not edited. Two things in it are therefore REPORTED and left untouched:
 *
 *     · §4 reads «remains محفوظًا in the account» — one Arabic word inside an
 *       English sentence.
 *     · The effective date is «[To be added]», so the document does not yet
 *       say when it begins to govern.
 *
 *   Both are the Founder's to correct. Changing a legal text on his behalf is
 *   a larger fault than shipping his own words as he wrote them.
 *
 * ─── AND WHY THE TEXT LIVES IN TYPESCRIPT ───────────────────────────────────
 *
 *   MEASURED 2026-09-28: the release artifact is `tar … .next package.json
 *   package-lock.json`. `docs/` NEVER REACHES THE SERVER. So the seven policy
 *   documents written in September exist on a laptop and in git, and not one
 *   of them can be served to anyone — while XPay requires public policy URLs
 *   before it will take a pound. A policy that cannot be read is not a policy.
 *
 *   Text compiled into the build travels with it. That is the whole reason
 *   this is a `.ts` file and not another `.md`.
 */

import type { PolicyDocument } from './types';

/**
 * ─── ONE QUESTION THIS DOCUMENT DELIBERATELY DOES NOT ANSWER ────────────────
 *
 *   LEGAL REVIEW REQUIRED (reviewer-facing, and kept OUT of the published body
 *   by `policies-a-reviewer-can-open.test.ts` — a page a Creator opens must
 *   not carry our internal markers):
 *
 *   Does a third-party processing provider charge AZMA for a job that failed
 *   after partially rendering? The provider documents that credits apply to
 *   «frames that actually render», which implies a partial charge on a partial
 *   failure. NOT measured against a real failure as of 2026-10-12.
 *
 *   So §6 promises the Creator nothing about OUR cost, and says only what it
 *   has always said about THEIR balance.
 */
export const REFUNDS_AND_CREDIT_BALANCE: PolicyDocument = {
  slug: 'refunds-and-credit-balance',
  titleEn: 'Refunds & Credit Balance',
  titleAr: 'الاسترداد ورصيد الوحدات',
  language: 'en',
  version: '1.1',
  /** «[To be added]» in the Founder's text. Until it is a date, it is null. */
  effectiveDate: null,
  body: `POLICY: REFUNDS & CREDIT BALANCE
AZMA OS

Effective Date: [To be added]
Policy Version: 1.1

1. PURPOSE

This policy explains the rules governing purchases of credits within AZMA OS, the treatment of unused credit balances, production-related failures, and requests for refunds.

AZMA OS is operated by:

Topline Design

Website:
azmaos.com

Address:
Nasr City, Cairo

Phone:
01069269456

Email:
azma.os27@gmail.com


2. CREDIT BALANCE

Credits purchased or otherwise legitimately added to an AZMA OS account constitute a digital balance associated with that account.

The credit balance is used to access eligible production and creative capabilities available within AZMA OS according to the applicable service rules.

The balance shown in the user's account represents the user's available AZMA OS credit balance.


3. NO CASH REFUNDS

All purchases of AZMA OS credits are final and are not refundable in cash.

Unused credits are not exchangeable for cash and cannot be withdrawn, transferred into a bank account, or converted into another monetary payment method.

This policy applies whether the user has used part of the purchased balance or has not yet used it.

Nothing in this policy excludes any refund or consumer right that cannot legally be excluded under applicable law.


4. CREDIT BALANCE DOES NOT EXPIRE

Paid credits purchased by the user do not expire merely because time has passed.

The expiration, cancellation, or non-renewal of a subscription does not by itself cancel or remove the user's previously purchased credit balance.

The user's purchased balance remains محفوظًا in the account and does not lapse merely because the user stops using the platform for a period of time.

Where an account remains subject to applicable platform, security, legal, or ownership requirements, the balance remains associated with that account.


5. SUBSCRIPTION AND CREDIT BALANCE ARE SEPARATE

An AZMA OS subscription and the user's credit balance are separate matters.

Cancellation or non-renewal of a subscription does not automatically mean that the user's previously purchased credits are refunded or removed.

Likewise, purchasing credits does not necessarily constitute a subscription unless the applicable purchase explicitly states otherwise.


6. FAILED PRODUCTION

If an eligible production operation fails before AZMA OS successfully delivers the intended production result, AZMA OS may restore or return the credits consumed by that failed operation according to the platform's production and accounting rules.

This treatment concerns the restoration of platform credits associated with a failed production operation.

It does not constitute a cash refund for the original purchase of credits.

Where a production operation has successfully completed and the resulting asset has been delivered to the user's account, the operation is considered a completed production operation.

CAPABILITIES NOT YET PRICED

Some creative capabilities are present in AZMA OS but are not yet offered for execution because their cost has not been established by a completed, billed production job. These capabilities consume no credit balance, because they cannot be executed. As of Policy Version 1.1 these are: background removal, talking photo, lip sync, and face swap.

Where such a capability is later opened for execution, its applicable cost is disclosed before the operation is initiated.


7. SUCCESSFUL PRODUCTION

Once a production operation has successfully completed and the resulting asset has been delivered, credits consumed by that operation are considered used.

A user may not request a cash refund solely because the resulting creative output does not meet the user's subjective creative preference.

Users are encouraged to review available production settings, capabilities, and applicable costs before initiating a production operation.


8. ACCOUNT CLOSURE

Closing, abandoning, or ceasing to use an AZMA OS account does not create an automatic right to a cash refund for previously purchased credits.

Where applicable law, a verified account issue, or a documented platform error requires a different treatment, the matter will be handled according to the applicable legal or platform requirements.


9. ACCOUNT SECURITY AND OWNERSHIP

Credits are associated with the AZMA OS account through which they were legitimately purchased or acquired.

Users are responsible for maintaining the security of their account and for protecting their authentication credentials.

AZMA OS may take reasonable measures where there is evidence of fraud, unauthorized access, abuse, or violation of the platform's terms.


10. TRANSPARENCY

AZMA OS will seek to present the applicable credit cost before a production operation is initiated where the platform has sufficient information to determine that cost.

The user should review the displayed production cost and available balance before confirming a paid operation.

AZMA OS does not represent an estimated cost as a guaranteed final provider cost where the actual production cost cannot yet be determined.


11. POLICY CHANGES

AZMA OS may update this policy when necessary to reflect changes in the platform, its services, applicable legal requirements, or operational practices.

The current version of the policy will be made available through the AZMA OS Policies section.

Where appropriate, the effective date and version number will be displayed with the policy.


12. CONTACT

For questions concerning credits, account balances, production charges, or this policy, users may contact:

Topline Design

Website:
azmaos.com

Address:
Nasr City, Cairo

Phone:
01069269456

Email:
azma.os27@gmail.com


13. IMPORTANT DISTINCTION

For clarity:

• Credit restoration after an eligible failed production operation is not the same as a cash refund.

• Purchased credits do not expire merely because time has passed.

• Subscription cancellation does not automatically cancel previously purchased credits.

• Successfully consumed production credits are not converted back into cash merely because the user is dissatisfied with the creative result.

• Any rights that cannot legally be excluded under applicable law remain unaffected.


END OF POLICY`,
};
