/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN EVIDENCE FOUNDATION — Constitutional Foundation Package XIII
 *
 * Evidence is the fourth stage of the constitutional knowledge chain.
 * It accepts Investigation output and produces a constitutional Evidence
 * Collection — the only form the Knowledge stage is permitted to receive.
 *
 * ─── WHAT EVIDENCE ESTABLISHES ──────────────────────────────────────────────
 *
 *   Investigation discovers candidate knowledge.
 *   Evidence establishes what was actually found.
 *
 *   Finding information is not the same as possessing evidence.
 *   The Evidence stage bridges that gap by:
 *     — accepting the raw EvidenceBundle from Investigation
 *     — wrapping each discovered Evidence item with full constitutional lineage
 *     — preserving the canonical claim that drove the investigation
 *     — producing a structured EvidenceCollection ready for Knowledge evaluation
 *
 * ─── WHAT EVIDENCE DOES NOT DO ──────────────────────────────────────────────
 *
 *   Evidence does not re-score evidence.
 *     The confidenceScore and confidenceLevel on each Evidence item were
 *     computed by EvidenceScoringEngine during the Investigation phase.
 *     They are preserved intact — never recomputed or modified.
 *
 *   Evidence does not produce verdicts.
 *   Evidence does not declare knowledge.
 *   Evidence does not recommend actions.
 *   Evidence does not search new repositories.
 *   Evidence does not introduce Knowledge Ministries.
 *
 * ─── NO DUPLICATE EVIDENCE MODEL ────────────────────────────────────────────
 *
 *   The canonical Evidence type lives in domain/evidence.types.ts and was
 *   established in the Investigation infrastructure (Phase 9). This package
 *   does NOT re-declare it. CollectedEvidence wraps it with constitutional
 *   lineage. The evidence: Evidence field is the canonical object, unchanged.
 *
 *   See domain/evidence.types.ts for: Evidence, SovereignClaim, ConfidenceLevel,
 *   EvidenceBundle, RepositorySearchResult.
 *
 * ─── REPOSITORY ATTRIBUTION ─────────────────────────────────────────────────
 *
 *   Evidence.sourceProvider names the internal provider that yielded each
 *   evidence item (currently 'gutenberg'). This field is preserved for
 *   constitutional traceability within Al Hujjah's chain. It is never
 *   forwarded to creator-facing output — the Export stage (Package XV)
 *   is responsible for stripping provider names from creator-visible results.
 *
 *   When the Knowledge Ministries Foundation is built, sourceProvider will
 *   be replaced with a Ministry identity (e.g., 'ministry-of-human-knowledge').
 *   The attachment point for that substitution is:
 *     IRepositoryProvider (core/repository-manager.ts) → provider.providerId
 *
 * ─── THE IMMUTABLE CONSTITUTIONAL ORDER ─────────────────────────────────────
 *
 *   Reception → Understanding → Investigation → Evidence → Knowledge → Export
 *
 *   The Knowledge stage shall not read InvestigationResult directly.
 *   It shall receive only EvidenceCollection. This invariant is constitutional.
 */

import type { Evidence, SovereignClaim } from './domain/evidence.types';
import type { KnowledgeReceptionOrigin } from './reception-contracts';
import type { SovereignRequestLineage } from './understanding-contracts';

export type { Evidence, SovereignClaim } from './domain/evidence.types';
export type { ConfidenceLevel } from './domain/evidence.types';

/**
 * One discovered evidence item with full constitutional lineage.
 *
 * `evidence` is the canonical Evidence object from the Investigation phase,
 * preserved completely without modification. Its confidenceScore and
 * confidenceLevel were computed by EvidenceScoringEngine and are final.
 *
 * `investigationResultId` → `intentId` → `receptionId` forms the
 * constitutional chain back to the original request.
 *
 * `origin` identifies whether a Citizen or Sovereign request produced
 * the investigation that yielded this evidence.
 *
 * `collectedAtMs` records when the Evidence stage processed this item.
 * It is distinct from `evidence.id` (assigned during extraction) and
 * from `investigatedAtMs` (assigned during Investigation) — each stage
 * records its own constitutional timestamp.
 */
export interface CollectedEvidence {
  readonly evidence: Evidence;
  readonly investigationResultId: string;
  readonly intentId: string;
  readonly receptionId: string;
  readonly origin: KnowledgeReceptionOrigin;
  readonly collectedAtMs: number;
}

/**
 * The constitutional evidence collection produced by the Evidence stage.
 *
 * `collectionId` uniquely identifies this collection event.
 * `claim` is the SovereignClaim that drove the investigation — it anchors
 *   the collection to a specific question and domain.
 * `items` contains every CollectedEvidence item from the investigation.
 *   May be empty if the Investigation found no matching evidence.
 *   An empty collection is constitutionally valid — the Knowledge stage
 *   must handle it honestly rather than manufacturing conclusions.
 * `sovereignLineage` is null for Citizen collections and non-null for
 *   Sovereign collections. It carries the full Makman request lineage.
 * `totalSourcesScanned` is derived from the Investigation metadata,
 *   preserved for constitutional transparency about investigation scope.
 * `collectedAtMs` records when this collection was produced.
 *
 * CONSTITUTIONAL INVARIANT:
 *   The Knowledge stage shall not read InvestigationResult directly.
 *   It shall consume only EvidenceCollection. This is the only constitutional
 *   form in which raw investigation output enters the Knowledge stage.
 */
export interface EvidenceCollection {
  readonly collectionId: string;
  readonly investigationResultId: string;
  readonly intentId: string;
  readonly receptionId: string;
  readonly origin: KnowledgeReceptionOrigin;
  readonly claim: SovereignClaim;
  readonly items: readonly CollectedEvidence[];
  readonly sovereignLineage: SovereignRequestLineage | null;
  readonly totalSourcesScanned: number;
  readonly collectedAtMs: number;
}

/**
 * The outcome of the Evidence stage.
 *
 * ok=true  → EvidenceCollection is available; the Knowledge stage may proceed.
 * ok=false → the Investigation was not completed; evidence cannot be collected
 *            from an incomplete investigation. The reason is recorded.
 *
 * INVESTIGATION_NOT_COMPLETED: The rawBundle.metadata.investigationStatus
 *   was not 'completed'. This should not occur in a constitutional chain
 *   that passes through a successful conductInvestigation() call, but is
 *   enforced as a constitutional guard.
 */
export type EvidenceCollectionOutcome =
  | { readonly ok: true; readonly collection: EvidenceCollection }
  | { readonly ok: false; readonly reason: 'INVESTIGATION_NOT_COMPLETED' };
