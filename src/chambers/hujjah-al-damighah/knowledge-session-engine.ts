/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Session Engine
 *
 * Status: V1.0
 * Sovereign Session Layer
 */

export interface KnowledgeSession {
  id: string;

  title: string;

  startedAt: string;

  updatedAt: string;

  isActive: boolean;
}

export function createKnowledgeSession(
  id: string,
  title: string
): KnowledgeSession {
  const now = new Date().toISOString();

  return {
    id,
    title,
    startedAt: now,
    updatedAt: now,
    isActive: true,
  };
}

export function updateKnowledgeSession(
  session: KnowledgeSession
): KnowledgeSession {
  return {
    ...session,
    updatedAt: new Date().toISOString(),
  };
}

export function closeKnowledgeSession(
  session: KnowledgeSession
): KnowledgeSession {
  return {
    ...session,
    isActive: false,
    updatedAt: new Date().toISOString(),
  };
}

export function reopenKnowledgeSession(
  session: KnowledgeSession
): KnowledgeSession {
  return {
    ...session,
    isActive: true,
    updatedAt: new Date().toISOString(),
  };
}