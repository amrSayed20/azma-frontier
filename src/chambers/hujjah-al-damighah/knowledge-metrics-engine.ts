/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Metrics Engine
 *
 * Status: V1.0
 * Sovereign Metrics Layer
 */

export interface KnowledgeMetrics {
  totalKnowledge: number;

  totalSources: number;

  totalReferences: number;

  totalTimelineRecords: number;

  averageConfidence: number;

  lastUpdated: string;
}

export function createKnowledgeMetrics(): KnowledgeMetrics {
  return {
    totalKnowledge: 0,

    totalSources: 0,

    totalReferences: 0,

    totalTimelineRecords: 0,

    averageConfidence: 0,

    lastUpdated: new Date().toISOString(),
  };
}

export function updateKnowledgeMetrics(
  metrics: KnowledgeMetrics,
  partial: Partial<KnowledgeMetrics>
): KnowledgeMetrics {
  return {
    ...metrics,

    ...partial,

    lastUpdated: new Date().toISOString(),
  };
}

export function incrementKnowledgeCount(
  metrics: KnowledgeMetrics
): KnowledgeMetrics {
  return {
    ...metrics,

    totalKnowledge: metrics.totalKnowledge + 1,

    lastUpdated: new Date().toISOString(),
  };
}

export function incrementSourceCount(
  metrics: KnowledgeMetrics
): KnowledgeMetrics {
  return {
    ...metrics,

    totalSources: metrics.totalSources + 1,

    lastUpdated: new Date().toISOString(),
  };
}