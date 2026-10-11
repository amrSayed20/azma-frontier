/**
 * AZMA OS — ONE STATUS SENTENCE, FOR EVERY ACT THAT HAS A STATE
 *
 * It stood inside `QiyamahChamberClient` and was reachable only from there.
 * The creative acts need the same sentence, and a second copy of it would be
 * the fifth vocabulary this chamber spent a package removing — so it moved
 * here and both surfaces import it. Nothing about it changed.
 */

'use client';

import {
  lifecycleSentenceAr, isInFlight, type OperationLifecycle,
} from '@/src/qiyamah-generation/operation-lifecycle';

export function OperationStatusLine({
  lifecycle, errorAr,
}: {
  readonly lifecycle: OperationLifecycle;
  readonly errorAr?: string | null;
}) {
  if (lifecycle === 'READY') return null;
  const flying = isInFlight(lifecycle);
  return (
    <p
      className={`op-status op-status--${lifecycle.toLowerCase()}`}
      role={lifecycle === 'FAILED' ? 'alert' : 'status'}
      data-lifecycle={lifecycle}
    >
      <span className="op-status-state">{lifecycleSentenceAr(lifecycle)}</span>
      {/* The handler's own words, kept — a reason belongs to its operation. */}
      {lifecycle === 'FAILED' && errorAr ? <span className="op-status-why">{errorAr}</span> : null}
      {flying ? <span className="op-status-hold" aria-hidden="true">…</span> : null}
    </p>
  );
}
