'use client';
/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * The one sanctioned way to render an internal navigational anchor.
 *
 * Wraps next/link so a rendered Chamber-to-Chamber, Gate-to-Chamber, or
 * any other internal transition stays client-side — no Chamber shall
 * assemble its own <a href> or call window.location for a route this
 * application itself serves (Architectural Decision, Package IV: "No
 * chamber shall own navigation independently. Navigation belongs to the
 * platform itself."). External links and file downloads are out of
 * scope and should keep using a plain <a>.
 *
 * `to` accepts a ChamberDestination (resolved through the Chamber
 * Directory, identity-safe) or any other internal pathname string
 * (passed through unchanged) — the second form exists for the small set
 * of non-Chamber internal routes (Gate, Member, auth pages) that have no
 * constitutional chamber identity of their own (see route-context.ts's
 * own 'universal' fallback) but must still share one navigation
 * primitive with every Chamber link, per the same Architectural
 * Decision.
 *
 * Deliberately does NOT reproduce the Imperial Experience Engine's own
 * ceremonial departure (useExperienceLifecycle's beginHandoff, Arrival-
 * page-only) — that is a richer, already-certified transition owned by
 * IXE for the Gate specifically. This component is the plain, undecorated
 * primitive every other internal link should use instead of a raw
 * anchor; it does not replace or duplicate IXE's ceremony.
 */

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { getChamberPathname, isChamberDestination } from './chamber-directory';
import type { ChamberDestination } from './types';

type ConstitutionalLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  readonly to: ChamberDestination | (string & {});
};

export function ConstitutionalLink({ to, ...rest }: ConstitutionalLinkProps) {
  const href = isChamberDestination(to) ? getChamberPathname(to) : to;
  return <Link href={href} {...rest} />;
}
