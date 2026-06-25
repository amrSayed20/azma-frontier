/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Audit Engine
 *
 * Status: V1.0
 * Sovereign Audit Layer
 */

export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'verified'
  | 'dispatched';

export interface AuditRecord {
  id: string;

  knowledgeId: string;

  action: AuditAction;

  actor: string;

  timestamp: string;

  notes?: string;
}

export interface KnowledgeAuditLog {
  records: AuditRecord[];
}

export function createKnowledgeAuditLog(): KnowledgeAuditLog {
  return {
    records: [],
  };
}

export function addAuditRecord(
  log: KnowledgeAuditLog,
  record: AuditRecord
): KnowledgeAuditLog {
  return {
    ...log,
    records: [...log.records, record],
  };
}

export function findAuditRecords(
  log: KnowledgeAuditLog,
  knowledgeId: string
): AuditRecord[] {
  return log.records.filter(
    (record) => record.knowledgeId === knowledgeId
  );
}

export function removeAuditRecord(
  log: KnowledgeAuditLog,
  id: string
): KnowledgeAuditLog {
  return {
    ...log,
    records: log.records.filter(
      (record) => record.id !== id
    ),
  };
}