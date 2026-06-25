/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Version Engine
 *
 * Status: V1.0
 * Sovereign Version Layer
 */

export interface KnowledgeVersion {
  version: number;

  content: string;

  createdAt: string;

  author: string;
}

export interface KnowledgeVersionHistory {
  knowledgeId: string;

  versions: KnowledgeVersion[];
}

export function createKnowledgeVersionHistory(
  knowledgeId: string
): KnowledgeVersionHistory {
  return {
    knowledgeId,
    versions: [],
  };
}

export function addKnowledgeVersion(
  history: KnowledgeVersionHistory,
  content: string,
  author: string
): KnowledgeVersionHistory {
  const version: KnowledgeVersion = {
    version: history.versions.length + 1,
    content,
    author,
    createdAt: new Date().toISOString(),
  };

  return {
    ...history,
    versions: [...history.versions, version],
  };
}

export function getLatestVersion(
  history: KnowledgeVersionHistory
): KnowledgeVersion | undefined {
  return history.versions.at(-1);
}

export function getVersionByNumber(
  history: KnowledgeVersionHistory,
  versionNumber: number
): KnowledgeVersion | undefined {
  return history.versions.find(
    (version) => version.version === versionNumber
  );
}