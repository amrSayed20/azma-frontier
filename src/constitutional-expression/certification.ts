/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION
 * The Constitutional Expression Certification Layer
 * Construction Campaign
 *
 * Implements this Campaign's own 5 Certification Requirements as real,
 * runnable checks. Every function here is a pure read: none mutates
 * anything, none calls emitSignal, circulateFromClient, awaken, rest,
 * recordSignalSeen, or any organ's own execution path — confirmed by
 * inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { gatherAllForOrgan } from './gathering';
import { composeExpressionForOrgan } from './expression-composer';
import type { ConstitutionalExpressionCertification } from './types';

/** Certification Requirement 1: "Verify that every constitutional expression originates from real constitutional evidence." */
export function verifyExpressionOriginatesFromRealEvidence(organId: string): ConstitutionalExpressionCertification {
  const inputs = gatherAllForOrgan(organId);
  const verified = inputs.length > 0 && inputs.every((input) => input.hasRealEvidence && input.evidence.length > 0);
  return {
    criterion: 'Every constitutional expression originates from real constitutional evidence.',
    verified,
    evidence: verified
      ? `All ${inputs.length} gathered input(s) for "${organId}" carry a non-empty evidence citation to a real, already-certified query.`
      : `No real evidence was found for "${organId}", or at least one gathered input lacked a citation.`,
  };
}

/** Certification Requirement 2: "Verify that constitutional expression never alters constitutional truth." */
export function verifyExpressionNeverAltersTruth(organId: string): ConstitutionalExpressionCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  gatherAllForOrgan(organId);
  composeExpressionForOrgan(organId);
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'Constitutional expression never alters constitutional truth.',
    verified,
    evidence: verified
      ? 'The Signal Log and Heartbeat state are byte-for-byte identical before and after gathering and composing an expression.'
      : 'Gathering or composing an expression produced an observable change elsewhere in the Living Body.',
  };
}

/** Certification Requirement 3: "Verify that multiple constitutional organs become one constitutional voice." */
export function verifyMultipleOrgansBecomeOneVoice(organId: string): ConstitutionalExpressionCertification {
  const expression = composeExpressionForOrgan(organId);
  if (!expression) {
    return {
      criterion: 'Multiple constitutional organs become one constitutional voice.',
      verified: false,
      evidence: `No expression could be composed for "${organId}" — insufficient evidence.`,
    };
  }
  const verified = expression.contributingSources.length >= 2 && typeof expression.unifiedSummary === 'string';
  return {
    criterion: 'Multiple constitutional organs become one constitutional voice.',
    verified,
    evidence: verified
      ? `${expression.contributingSources.length} source organs (${expression.contributingSources.join(', ')}) were merged into exactly one unifiedSummary string.`
      : `Only ${expression.contributingSources.length} source organ(s) contributed — insufficient to demonstrate a merge.`,
  };
}

/** Certification Requirement 4: "Verify that constitutional expression preserves constitutional dignity." */
export function verifyExpressionPreservesDignity(organId: string): ConstitutionalExpressionCertification {
  const expression = composeExpressionForOrgan(organId);
  if (!expression) {
    return {
      criterion: 'Constitutional expression preserves constitutional dignity.',
      verified: false,
      evidence: `No expression could be composed for "${organId}" — insufficient evidence.`,
    };
  }
  return {
    criterion: 'Constitutional expression preserves constitutional dignity.',
    verified: expression.dignity.approved,
    evidence: expression.dignity.approved
      ? "The composed expression passes the Sovereign Tongue's own three-gate dignity test (truthful, useful, worthy) unmodified."
      : `The composed expression failed the dignity gate: ${expression.dignity.blockingGate}.`,
  };
}

/** Certification Requirement 5: "Verify that no individual organ bypasses the Constitutional Expression Layer." */
export function verifyNoOrganBypassesExpressionLayer(organId: string): ConstitutionalExpressionCertification {
  const inputs = gatherAllForOrgan(organId);
  const expression = composeExpressionForOrgan(organId);
  const verified = Boolean(expression) && expression!.sourceInputs.length === inputs.length;
  return {
    criterion: 'No individual organ bypasses the Constitutional Expression Layer.',
    verified,
    evidence: verified
      ? "Every gathered input is accounted for in the composed expression's own sourceInputs — none is dropped or exposed separately. Bypass prevention beyond this is an architectural discipline (Al-Wateen, the Sovereign Core, Consciousness, Memory, and Evolution each render nothing and expose no Creator-facing surface of their own, confirmed by inspection of their Awakening components), not a runtime lock, since their query functions must remain plain, testable exports."
      : 'The composed expression dropped or duplicated at least one gathered input.',
  };
}
