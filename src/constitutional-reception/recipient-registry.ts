/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * The Constitutional Recipient Registry
 * Construction Campaign
 *
 * Every entry's `connected: false` is deliberate and honest: per this
 * Campaign's own Out of Scope ("No UI. No rendering. No notifications.
 * No Creator-facing presentation."), no real, live consumer exists for
 * either recipient yet. `authorized` records that the vision itself
 * anticipates this recipient; `connected` records whether any actual
 * code reads from it today. The same "Constitutionally Undefined, not
 * filled in and not permanent" discipline already applied to
 * CHAMBER_SCORES (SIO-001) and CONSTITUTIONAL_ORGAN_STATUS (SIO-009).
 */

import type { RecipientDescriptor } from './types';

export const CONSTITUTIONAL_RECIPIENTS: readonly RecipientDescriptor[] = [
  {
    recipientId: 'constitutional-council',
    authorized: true,
    connected: false,
    evidenceNote:
      'The Constitutional Council (Chief Architect) reviews every Engineering Review this campaign produces — a real, human recipient, but not a live code consumer of this module\'s own Reception Queue.',
  },
  {
    recipientId: 'sovereign-creator',
    authorized: true,
    connected: false,
    evidenceNote:
      'Named throughout the Sovereign Body vision as the eventual audience of the Living Body\'s voice. No dashboard, API route, or UI component reads from this module today — confirmed absent, not merely unbuilt.',
  },
] as const;

export function isAuthorizedRecipient(recipientId: string): boolean {
  return CONSTITUTIONAL_RECIPIENTS.some((recipient) => recipient.recipientId === recipientId && recipient.authorized);
}
