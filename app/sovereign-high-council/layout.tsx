/**
 * AZMA OS - Sovereign High Council
 * Layout Component
 *
 * FOUNDER ACCESS FOUNDATION: server-side route protection. This is the
 * current stand-in for "The Command Bridge" (src/founder-access's own
 * COMMAND_BRIDGE_PATH) — a Creator session, or no session at all, is
 * redirected to the Founder gateway before any client content renders,
 * rather than relying solely on the page's own client-side
 * /api/sovereign/auth check.
 */

import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyFounderSession, FOUNDER_GATEWAY_PATH } from '../../src/founder-access';
import SovereignHighCouncilStyles from './SovereignHighCouncilStyles';

export const metadata: Metadata = {
  title: 'Sovereign High Council | AZMA OS',
  description: 'Platform governance and supervisory intelligence',
};

const SESSION_COOKIE = 'azma_session';

export default async function SovereignHighCouncilLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!verifyFounderSession(sessionId)) {
    redirect(FOUNDER_GATEWAY_PATH);
  }

  return (
    <div className="sovereign-high-council-layout">
      <SovereignHighCouncilStyles />
      {children}
    </div>
  );
}
