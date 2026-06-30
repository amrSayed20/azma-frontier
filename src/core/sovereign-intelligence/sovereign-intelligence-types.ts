/**
 * Sovereign Intelligence Layer — Type Contracts
 *
 * All public interfaces and discriminated unions for the MVP Sovereign
 * Intelligence Layer. These types form the boundary between the OS Runtime
 * (L3/L4) and the Hujjah Al-Damighah Intelligence Chamber.
 */

import type { EvidenceBundle } from '../../chambers/hujjah-al-damighah/domain/evidence.types';

// ── Domain classification ─────────────────────────────────────────────────────

export type KnowledgeDomain =
  | 'cinematic'
  | 'research'
  | 'article'
  | 'podcast'
  | 'general';

// ── Search workflow routing ───────────────────────────────────────────────────

export type SearchWorkflow =
  | 'deep-investigation'
  | 'surface-scan'
  | 'general-query';

// ── Knowledge source registry ─────────────────────────────────────────────────

export interface IKnowledgeSource {
  readonly sourceId: string;
  readonly sourceName: string;
  readonly sourceType: 'external' | 'internal';
  isAvailable(): boolean;
}

// ── Verified evidence ─────────────────────────────────────────────────────────

export interface VerifiedEvidenceItem {
  readonly evidenceId: string;
  readonly sourceId: string;
  readonly sourceProvider: string;
  readonly extractedText: string;
  readonly confidenceScore: number;
  readonly rank: number;
}

// ── Knowledge summary ─────────────────────────────────────────────────────────

export interface KnowledgeSummary {
  readonly domain: KnowledgeDomain;
  readonly topicStatement: string;
  readonly keyFindings: readonly string[];
  readonly totalSources: number;
  readonly averageConfidence: number;
  readonly generatedAtMs: number;
}

// ── Knowledge Package (output consumed by Qiyamah Chamber) ───────────────────

export interface KnowledgePackage {
  readonly packageId: string;
  readonly query: string;
  readonly domain: KnowledgeDomain;
  readonly workflow: SearchWorkflow;
  readonly verifiedEvidence: readonly VerifiedEvidenceItem[];
  readonly summary: KnowledgeSummary;
  readonly rawBundle: EvidenceBundle;
  readonly generatedAtMs: number;
}
