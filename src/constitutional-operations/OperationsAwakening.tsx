/**
 * AZMA OS — CONSTITUTIONAL OPERATIONAL FOUNDATION, PACKAGE I
 * Operations Awakening — Application-Startup Activation
 *
 * Mounted once, at the platform level (app/layout.tsx), as the final
 * sibling of every other Awakening component. Renders nothing (returns
 * null): the Operational Cycle has no visual presence and no
 * Creator-facing behavior, exactly as this Package's own Out of Scope
 * requires ("No Creator-facing UI. No Dashboards. No Notifications.").
 * Its only effect is that every real constitutional signal now
 * automatically flows through Reception -> Will -> Decision -> Execution
 * -> Actuation, completing the Living Body's first fully automatic
 * operational cycle.
 */

'use client';

import { useEffect } from 'react';
import { beginConstitutionalOperationalCycle, endConstitutionalOperationalCycle } from './runtime-coordinator';

export function OperationsAwakening() {
  useEffect(() => {
    beginConstitutionalOperationalCycle();
    return () => {
      endConstitutionalOperationalCycle();
    };
  }, []);

  return null;
}
