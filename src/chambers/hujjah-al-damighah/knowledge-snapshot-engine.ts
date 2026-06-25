/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Snapshot Engine
 *
 * Status: V1.0
 * Sovereign Snapshot Layer
 */

import type { PipelineResult } from './knowledge-pipeline';

export interface KnowledgeSnapshot {
  id: string;

  success: boolean;

  capturedAt: string;

  payload: PipelineResult;
}

export function createKnowledgeSnapshot(
  pipeline: PipelineResult
): KnowledgeSnapshot {
  return {
    id: crypto.randomUUID(),

    success: pipeline.success,

    capturedAt: new Date().toISOString(),

    payload: pipeline,
  };
}

export function restoreKnowledgeSnapshot(
  snapshot: KnowledgeSnapshot
): PipelineResult {
  return snapshot.payload;
}

export function isSnapshotValid(
  snapshot: KnowledgeSnapshot
): boolean {
  return snapshot.success;
}