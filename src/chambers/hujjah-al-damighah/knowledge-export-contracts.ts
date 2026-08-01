/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE EXPORT FOUNDATION — Constitutional Foundation Package XIX
 *
 * The Export layer is the constitutional exit gate of Al Hujjah Al-Damighah.
 * It is the last layer authorized to act on behalf of the Chamber before
 * knowledge passes into another constitutional domain.
 *
 * ─── WHAT THE EXPORT LAYER DOES ─────────────────────────────────────────────
 *
 *   It receives a Sovereign Knowledge Response.
 *   It marks the intended constitutional destination.
 *   It produces a Knowledge Export Record — a sealed constitutional fact
 *   that this Response has been released for delivery to this destination.
 *
 *   That is the complete scope of the Export layer's authority.
 *
 * ─── WHAT THE EXPORT LAYER DOES NOT DO ──────────────────────────────────────
 *
 *   It does not investigate.
 *   It does not interpret or enrich knowledge.
 *   It does not summarize or recommend.
 *   It does not serialize, format, or encode the response.
 *   It does not invoke any chamber (Makman, Qiyamah, Ras Al Amr).
 *   It does not expose providers, repositories, or document identifiers.
 *   It does not alter the Sovereign Knowledge Response in any way.
 *
 *   Actual inter-chamber delivery is the responsibility of future integration
 *   packages. The Export layer produces only the constitutional receipt.
 *
 * ─── EXPORT DESTINATION ──────────────────────────────────────────────────────
 *
 *   `KnowledgeExportDestination` names the constitutional consumer of this export.
 *   It is a constitutional identity, not a technical routing key.
 *
 *   CITIZEN        — a Creator who directly queried Al Hujjah
 *   MAKMAN_AL_GHAYAH — Makman Al-Ghayah, which sent a Sovereign request
 *   QIYAMAH        — the generation chamber, which may use knowledge as context
 *   RAS_AL_AMR     — the direction chamber, which may use knowledge as signal
 *
 *   No other destination is constitutionally recognized. Future chambers that
 *   consume Al Hujjah's knowledge must be added here by constitutional decree.
 *
 * ─── EXPORT RECORD ───────────────────────────────────────────────────────────
 *
 *   `KnowledgeExportRecord` is the sealed constitutional fact produced by the
 *   Export layer. It is a receipt — not a delivery, not a payload, not an event.
 *
 *   `exportId`       — unique identity for this specific export event.
 *                      Two exports of the same response to the same destination
 *                      produce different exportIds. The exportId is Al Hujjah's
 *                      constitutional seal on the departure of this knowledge.
 *
 *   `destination`    — the constitutional consumer this record is addressed to.
 *
 *   `response`       — the Sovereign Knowledge Response being released.
 *                      Carried unchanged. The Export layer has no authority to
 *                      modify what the Knowledge and Response stages declared.
 *
 *   `exportedAtMs`   — epoch milliseconds when this export was produced.
 *
 * ─── REPOSITORY AUDIT RESULT ─────────────────────────────────────────────────
 *
 *   All pre-constitutional export structures were audited and confirmed
 *   constitutionally invalid for reuse:
 *
 *   workspace/evidence-exporter.ts::EvidenceExporter
 *     — takes IntelligenceReport (pre-constitutional). NOT reused.
 *
 *   shared/contracts/bridge.types.ts::ChamberExportPayload
 *     — wraps IntelligenceReport, exposes targetChamber as string.
 *       Wrong abstraction and wrong input type. NOT reused.
 *
 *   core/chamber-integration/bridge/payload-transformer.ts::QiyamahPayloadTransformer
 *     — exposes evidence.id in supportingEvidenceIds (constitutional violation).
 *       NOT reused.
 *
 *   chambers/hujjah-al-damighah/knowledge-export-engine.ts::ExportedKnowledge
 *     — takes KnowledgeReport (pipeline execution status), serializes to
 *       JSON/markdown/text. Wrong input, wrong responsibility. NOT reused.
 *
 *   chambers/hujjah-al-damighah/dispatch-engine.ts::DispatchPayload
 *     — thin routing shim with raw string id/title. Not a constitutional
 *       export identity. NOT reused.
 *
 *   No existing export contract accepts SovereignKnowledgeResponse.
 *   This is the first constitutional export contract for the Knowledge chain.
 *
 * ─── THE COMPLETE CONSTITUTIONAL CHAIN ───────────────────────────────────────
 *
 *   Reception → Understanding → Investigation → Evidence → Knowledge
 *             → Response → Export
 *
 *   After Export, knowledge has crossed Al Hujjah's constitutional boundary.
 *   Al Hujjah has no further authority over what the consumer does with it.
 */

import type { SovereignKnowledgeResponse } from './knowledge-response-contracts';

export type { SovereignKnowledgeResponse } from './knowledge-response-contracts';

/**
 * The constitutional consumers authorized to receive Al Hujjah's knowledge.
 *
 * Each value is the constitutional identity of the destination chamber or
 * citizen — not a technical routing string. Future chambers that consume
 * Al Hujjah's knowledge must be added to this type by constitutional decree.
 */
export type KnowledgeExportDestination =
  | 'CITIZEN'
  | 'MAKMAN_AL_GHAYAH'
  | 'QIYAMAH'
  | 'RAS_AL_AMR';

/**
 * The sealed constitutional fact that a Sovereign Knowledge Response has been
 * released to a named destination.
 *
 * This record is Al Hujjah's exit receipt — it does not implement delivery,
 * invoke any chamber, or perform any network operation. It records that the
 * Export layer has completed its constitutional responsibility.
 *
 * The `response` field carries the Sovereign Knowledge Response exactly as
 * produced by the Response stage. It is not modified, summarized, or enriched.
 * The Export layer has no authority to alter what Knowledge and Response declared.
 */
export interface KnowledgeExportRecord {
  readonly exportId: string;
  readonly destination: KnowledgeExportDestination;
  readonly response: SovereignKnowledgeResponse;
  readonly exportedAtMs: number;
}
