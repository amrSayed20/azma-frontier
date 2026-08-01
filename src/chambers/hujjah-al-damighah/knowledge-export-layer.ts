/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE EXPORT FOUNDATION — Constitutional Foundation Package XIX
 *
 * The Export Layer.
 *
 * `exportKnowledgeResponse()` is the constitutional exit gate of Al Hujjah.
 * It is the final function authorized to act within the Chamber before knowledge
 * passes into another constitutional domain.
 *
 * It accepts a Sovereign Knowledge Response and a destination. It produces a
 * Knowledge Export Record — the sealed constitutional receipt of that departure.
 *
 * This function is pure and synchronous. It performs no I/O, no inference,
 * no enrichment, and no serialization. The response is carried unchanged.
 * Each call produces a distinct exportId — that is the only thing the Export
 * layer creates. Everything else is preservation.
 */

import type { SovereignKnowledgeResponse } from './knowledge-response-contracts';
import type {
  KnowledgeExportDestination,
  KnowledgeExportRecord,
} from './knowledge-export-contracts';

/**
 * Release a Sovereign Knowledge Response to a named constitutional destination.
 *
 * Produces a `KnowledgeExportRecord` — the sealed exit receipt that Al Hujjah
 * issues when knowledge crosses its constitutional boundary.
 *
 * The `response` is preserved exactly. The Export layer neither modifies it
 * nor inspects its internal fields for routing decisions. The caller names
 * the destination; the Export layer records that choice.
 *
 * Two exports of the same response to the same destination produce different
 * `exportId` values — each delivery event is a distinct constitutional fact.
 */
export function exportKnowledgeResponse(
  response: SovereignKnowledgeResponse,
  destination: KnowledgeExportDestination,
): KnowledgeExportRecord {
  return {
    exportId: crypto.randomUUID(),
    destination,
    response,
    exportedAtMs: Date.now(),
  };
}
