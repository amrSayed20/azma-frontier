/**
 * AZMA OS — Sovereign Member (Redirected)
 *
 * This route previously hosted a decorative login/register form that
 * bypassed authentication entirely (forceNavigateToVault ignored all
 * input). Per the "Remove-not-cover" constitutional rule (2026-07-25
 * audit, debt item #10): the fake form is removed. The real Creator
 * authentication lives at the Arrival experience (/). Any bookmarks or
 * links that pointed here are redirected to the constitutional entry.
 */

import { redirect } from 'next/navigation';

export default function SovereignMemberRedirect() {
  redirect('/');
}
