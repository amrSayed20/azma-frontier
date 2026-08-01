/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE INVESTIGATION FOUNDATION — Constitutional Foundation Package XII
 *
 * Investigation is the first stage authorized to invoke the production
 * IntelligenceEngine. It accepts an InvestigationIntent (Package XI) and
 * produces a raw InvestigationResult — candidate knowledge awaiting
 * constitutional evaluation.
 *
 * ─── WHAT INVESTIGATION PRODUCES ────────────────────────────────────────────
 *
 *   An InvestigationResult wraps the EvidenceBundle returned by the
 *   IntelligenceEngine, adding constitutional identity and lineage:
 *     — resultId: unique identity for this investigation event
 *     — intentId: the InvestigationIntent that authorised the investigation
 *     — receptionId: the KnowledgeReception that authorised the intent
 *     — origin: CITIZEN or SOVEREIGN (preserved from the intent)
 *     — rawBundle: the unmodified EvidenceBundle from IntelligenceEngine
 *     — sovereignLineage: preserved intact from the InvestigationIntent
 *     — investigatedAtMs: when the investigation completed
 *
 * ─── WHAT INVESTIGATION DOES NOT PRODUCE ────────────────────────────────────
 *
 *   Investigation does not score evidence.
 *   Investigation does not produce verdicts.
 *   Investigation does not declare knowledge.
 *   Investigation does not recommend actions.
 *   Investigation does not communicate with Makman.
 *
 *   These responsibilities belong to the Evidence and Knowledge stages.
 *
 * ─── THE KNOWLEDGE MINISTRIES ATTACHMENT POINT ──────────────────────────────
 *
 *   The constitutional extension point for future Knowledge Ministries is:
 *
 *     IRepositoryProvider    (core/repository-manager.ts)
 *       → the interface each Ministry provider must implement
 *
 *     RepositoryManager.registerProvider()
 *       → where new Ministry providers attach at bootstrap time
 *
 *     IntelligenceCompositionFactory.getEngine()
 *       → where providers are registered (the bootstrap boundary)
 *
 *   Future Ministries (Human Knowledge, Public Knowledge, Scientific Knowledge,
 *   Market Intelligence, Community Intelligence, Technology, Business Intelligence,
 *   Media Intelligence, Sovereign Knowledge) will implement IRepositoryProvider
 *   and be registered via RepositoryManager at bootstrap time.
 *
 *   The Investigation Engine's internal routing (currently hardcoded to fetch
 *   only from 'gutenberg' — see intelligence-engine.ts:36) must be updated
 *   in the Sovereign Knowledge Sources Foundation package to route by provider
 *   rather than by hardcoded name. This package does not fix that debt.
 *
 * ─── THE IMMUTABLE CONSTITUTIONAL ORDER ─────────────────────────────────────
 *
 *   Reception → Understanding → Investigation → Evidence → Knowledge → Export
 *
 *   No future stage may absorb Investigation's responsibility.
 *   No investigation may bypass Reception and Understanding.
 *   No stage after Investigation may invoke IntelligenceEngine directly.
 */

import type { EvidenceBundle } from './domain/evidence.types';
import type { KnowledgeReceptionOrigin } from './reception-contracts';
import type { SovereignRequestLineage } from './understanding-contracts';

export type { EvidenceBundle } from './domain/evidence.types';

/**
 * The raw result of one constitutional investigation.
 *
 * `rawBundle` is the unmodified EvidenceBundle returned by IntelligenceEngine.
 * It contains candidate knowledge — not evaluated evidence, not declared
 * knowledge. The Evidence stage (Package XIII) is the first stage authorised
 * to evaluate what the bundle contains.
 *
 * `sovereignLineage` is null for Citizen investigations and non-null for
 * Sovereign investigations. It carries the goalId, criterionId, gapClass,
 * and all other constitutional origin fields from Makman's request.
 *
 * The `rawBundle.evidence[].sourceProvider` field names the internal provider
 * that yielded each evidence item (e.g. 'gutenberg'). This field is internal
 * to Al Hujjah's constitutional machinery and must never be forwarded to
 * user-facing output — the Empire protects its own mechanisms.
 */
export interface InvestigationResult {
  readonly resultId: string;
  readonly intentId: string;
  readonly receptionId: string;
  readonly origin: KnowledgeReceptionOrigin;
  readonly rawBundle: EvidenceBundle;
  readonly sovereignLineage: SovereignRequestLineage | null;
  readonly investigatedAtMs: number;
}

/**
 * The reason an investigation could not be completed.
 *
 * QUERY_TOO_SHORT:      The normalized query contains fewer than 3 characters.
 *                       This is a defensive guard — the Understanding stage
 *                       should have produced a valid normalizedQuery. This
 *                       reason should not appear in a constitutional chain
 *                       that passes through Reception and Understanding.
 *
 * INVESTIGATION_FAILED: The IntelligenceEngine threw an unexpected error.
 *                       This may occur due to provider failures, network issues
 *                       (when real providers are integrated), or internal errors.
 *                       The Empire reports the failure honestly.
 */
export type InvestigationFailureReason = 'QUERY_TOO_SHORT' | 'INVESTIGATION_FAILED';

/**
 * The outcome of a constitutional investigation.
 *
 * ok=true  → InvestigationResult is available; the Evidence stage may proceed.
 * ok=false → investigation could not be completed; `reason` identifies why.
 *
 * A successful investigation does not mean the question was answered.
 * It means candidate knowledge was gathered. The Evidence stage determines
 * what the candidate knowledge actually supports.
 */
export type InvestigationOutcome =
  | { readonly ok: true; readonly result: InvestigationResult }
  | {
      readonly ok: false;
      readonly reason: InvestigationFailureReason;
      readonly error?: string;
    };
