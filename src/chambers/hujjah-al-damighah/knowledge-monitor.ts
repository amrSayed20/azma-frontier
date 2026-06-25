/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Monitor
 *
 * Status: V1.0
 * Sovereign Monitoring Layer
 */

import type { PipelineResult } from './knowledge-pipeline';

export interface MonitorSnapshot {
  healthy: boolean;

  success: boolean;

  timestamp: string;
}

export function monitorKnowledge(
  pipeline: PipelineResult
): MonitorSnapshot {
  return {
    healthy: true,

    success: pipeline.success,

    timestamp: new Date().toISOString(),
  };
}

export function isKnowledgeHealthy(
  snapshot: MonitorSnapshot
): boolean {
  return (
    snapshot.healthy &&
    snapshot.success
  );
}

export function getMonitorTimestamp(): string {
  return new Date().toISOString();
}