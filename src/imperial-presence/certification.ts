/**
 * AZMA OS — THE CONSTITUTIONAL IDENTITY
 * The Certification Layer
 * Construction Phase VI
 *
 * Implements this phase's own 6 Certification Requirements as real,
 * runnable checks over the already-existing Sovereign Identity Layer and
 * Sovereign Tongue — never as new engines, never as prose assertions.
 * Every function here is a pure read: none mutates anything, none calls
 * the Sovereign Core (Out of Scope: "No activation of the Sovereign
 * Core"), none touches the Nervous System, Circulation, or Heart.
 */

// Imported directly from their specific files, not the sovereign-identity
// barrel: the barrel also re-exports DirectorStage, whose CSS import Jest
// cannot parse outside Next's build pipeline — the identical coupling bug
// found and fixed this same way in Construction Phase III.
import { getSovereignIdentity } from '../sovereign-identity/orchestrator';
import type { ChamberContext } from '../sovereign-identity/orchestrator';
import { resolveChamberContext } from '../sovereign-identity/director-stage/route-context';
import { CONTEXT_ROLES, getToneProfile } from '../core/tongue';
import { KNOWN_APPLICATION_ROUTES } from './presence-registry';
import type { ConstitutionalIdentityCertification, ChamberIdentityCoverage } from './types';

function allChamberContexts(): readonly ChamberContext[] {
  return Object.keys(CONTEXT_ROLES) as ChamberContext[];
}

/** Certification Requirement 1: "Verify that one Constitutional Face exists." */
export function verifyOneConstitutionalFaceExists(): ConstitutionalIdentityCertification {
  const contexts = allChamberContexts();
  const bundles = contexts.map((context) => getSovereignIdentity(context));
  const oneShared = bundles.every((bundle) => bundle.constitutional === bundles[0].constitutional);
  return {
    criterion: 'One Constitutional Face exists.',
    verified: oneShared,
    evidence: oneShared
      ? `All ${contexts.length} chamber contexts resolve to the identical (referentially equal) SovereignConstitutionalConstants object — one Face, not ${contexts.length} forks.`
      : 'At least one chamber context received a different constitutional constants object than the others.',
  };
}

/** Certification Requirement 2: "Verify that one Constitutional Voice exists." */
export function verifyOneConstitutionalVoiceExists(): ConstitutionalIdentityCertification {
  const contexts = allChamberContexts();
  const missing = contexts.filter((context) => !getToneProfile(context));
  return {
    criterion: 'One Constitutional Voice exists.',
    verified: missing.length === 0,
    evidence:
      missing.length === 0
        ? `getToneProfile() returns a defined ToneProfile for all ${contexts.length} chamber contexts from the single TONE_PROFILES registry — one Voice, no undefined chamber.`
        : `No ToneProfile defined for: ${missing.join(', ')}.`,
  };
}

/** Certification Requirement 3: "Verify that one Constitutional Tongue exists." */
export function verifyOneConstitutionalTongueExists(): ConstitutionalIdentityCertification {
  // The Tongue IS the Voice's own module (see objective-registry.ts) — its
  // oneness is proven by the same evidence as the Voice check, read from
  // the same single module rather than re-derived independently.
  const voiceCertification = verifyOneConstitutionalVoiceExists();
  return {
    criterion: 'One Constitutional Tongue exists.',
    verified: voiceCertification.verified,
    evidence: `The Tongue is the whole src/core/tongue/ module; Voice (voice.ts) is one part of it, not a separate organ. ${voiceCertification.evidence}`,
  };
}

/** Certification Requirement 4: "Verify that every chamber inherits one Constitutional Identity." */
export function verifyEveryChamberInheritsOneConstitutionalIdentity(): ConstitutionalIdentityCertification {
  const contexts = allChamberContexts();
  const incomplete = contexts.filter((context) => {
    const bundle = getSovereignIdentity(context);
    return !bundle.constitutional || !bundle.tone;
  });
  return {
    criterion: 'Every chamber inherits one Constitutional Identity.',
    verified: incomplete.length === 0,
    evidence:
      incomplete.length === 0
        ? `All ${contexts.length} chamber contexts produce a complete SovereignIdentityBundle (constitutional constants + tone) via the single getSovereignIdentity() resolver.`
        : `Incomplete identity bundle for: ${incomplete.join(', ')}.`,
  };
}

/** Certification Requirement 5: "Verify that motion, lighting, typography, color, and cinematic direction remain constitutionally unified." */
export function verifyAuthoritiesRemainUnified(): ConstitutionalIdentityCertification {
  const contexts = allChamberContexts();
  const bundles = contexts.map((context) => getSovereignIdentity(context));
  const first = bundles[0].constitutional;
  const unified = bundles.every(
    (bundle) =>
      bundle.constitutional.motion === first.motion &&
      bundle.constitutional.illumination === first.illumination &&
      bundle.constitutional.typography === first.typography &&
      bundle.constitutional.palette === first.palette &&
      bundle.constitutional.invisibleDirector === first.invisibleDirector,
  );
  return {
    criterion: 'Motion, Lighting, Typography, Color, and Cinematic Direction remain constitutionally unified.',
    verified: unified,
    evidence: unified
      ? 'Every chamber context resolves to the identical (referentially equal) motion, illumination, typography, palette, and invisibleDirector objects — no chamber has forked its own authority.'
      : 'At least one chamber context resolved to a different authority object than the others.',
  };
}

/** Certification Requirement 6: "Verify that the Creator experiences one uninterrupted Imperial Presence." */
export function verifyOneUninterruptedImperialPresence(): ConstitutionalIdentityCertification {
  const coverage: ChamberIdentityCoverage[] = KNOWN_APPLICATION_ROUTES.map((pathname) => {
    const resolvedContext = resolveChamberContext(pathname);
    const bundle = getSovereignIdentity(resolvedContext);
    return {
      pathname,
      resolvedContext,
      hasCompleteIdentity: Boolean(bundle.constitutional && bundle.tone),
    };
  });
  const uncovered = coverage.filter((entry) => !entry.hasCompleteIdentity);
  return {
    criterion: 'The Creator experiences one uninterrupted Imperial Presence.',
    verified: uncovered.length === 0,
    evidence:
      uncovered.length === 0
        ? `Every one of ${KNOWN_APPLICATION_ROUTES.length} known application routes resolves (via the single, live-mounted DirectorStage's own route-context resolver) to a complete constitutional identity — no route falls through to an undefined presence.`
        : `Routes with incomplete presence: ${uncovered.map((entry) => entry.pathname).join(', ')}.`,
  };
}
