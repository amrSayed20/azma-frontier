/**
 * AZMA OS - Sovereign High Council
 * Layout Component
 */

import React from 'react';
import type { Metadata } from 'next';
import SovereignHighCouncilStyles from './SovereignHighCouncilStyles';

export const metadata: Metadata = {
  title: 'Sovereign High Council | AZMA OS',
  description: 'Platform governance and supervisory intelligence',
};

export default function SovereignHighCouncilLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="sovereign-high-council-layout">
      <SovereignHighCouncilStyles />
      {children}
    </div>
  );
}
