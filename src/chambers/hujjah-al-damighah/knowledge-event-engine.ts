/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Event Engine
 *
 * Status: V1.0
 * Sovereign Event Layer
 */

export type KnowledgeEventType =
  | 'created'
  | 'updated'
  | 'verified'
  | 'archived'
  | 'deleted'
  | 'dispatched';

export interface KnowledgeEvent {
  id: string;

  knowledgeId: string;

  type: KnowledgeEventType;

  timestamp: string;

  payload?: Record<string, unknown>;
}

export interface KnowledgeEventStore {
  events: KnowledgeEvent[];
}

export function createKnowledgeEventStore(): KnowledgeEventStore {
  return {
    events: [],
  };
}

export function addKnowledgeEvent(
  store: KnowledgeEventStore,
  event: KnowledgeEvent
): KnowledgeEventStore {
  return {
    ...store,
    events: [...store.events, event],
  };
}

export function getKnowledgeEvents(
  store: KnowledgeEventStore,
  knowledgeId: string
): KnowledgeEvent[] {
  return store.events.filter(
    (event) => event.knowledgeId === knowledgeId
  );
}

export function clearKnowledgeEvents(): KnowledgeEventStore {
  return {
    events: [],
  };
}