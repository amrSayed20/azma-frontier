import { createAuditTrailId } from '../constitution-runtime/wp-008-types';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { JourneyRecord } from './sovereign-journey-types';

const JOURNEY_ARTICLE = 'sovereign-journey-engine' as const;

const PERSISTED_PHASES = new Set([
  'WELCOMED',
  'JOURNEY_PAUSED',
  'JOURNEY_COMPLETE',
  'JOURNEY_SKIPPED',
]);

export class JourneyProgressService {
  private readonly sessions = new Map<string, JourneyRecord[]>();
  private readonly activeRecords = new Map<string, JourneyRecord>();

  constructor(private readonly memoryLayer: MemoryLayerContract) {}

  save(record: JourneyRecord): void {
    const sessionRecords = this.sessions.get(record.sessionId) ?? [];
    const idx = sessionRecords.findIndex((r) => r.journeyId === record.journeyId);
    if (idx >= 0) {
      sessionRecords[idx] = record;
    } else {
      sessionRecords.push(record);
    }
    this.sessions.set(record.sessionId, sessionRecords);

    const isTerminal =
      record.phase === 'JOURNEY_COMPLETE' || record.phase === 'JOURNEY_SKIPPED';
    if (isTerminal) {
      this.activeRecords.delete(record.sessionId);
    } else {
      this.activeRecords.set(record.sessionId, record);
    }

    if (PERSISTED_PHASES.has(record.phase)) {
      const auditId = createAuditTrailId(`journey-${record.journeyId}-${record.phase}`);
      void this.memoryLayer.constitutionalMemoryService.remember(
        `journey-${record.journeyId}`,
        JOURNEY_ARTICLE,
        `[${record.journeyTypeId}] ${record.phase}: session=${record.sessionId}`,
        auditId,
      );
    }
  }

  getActive(sessionId: string): JourneyRecord | null {
    return this.activeRecords.get(sessionId) ?? null;
  }

  getAll(sessionId: string): readonly JourneyRecord[] {
    return this.sessions.get(sessionId) ?? [];
  }

  getCompleted(sessionId: string): readonly JourneyRecord[] {
    return this.getAll(sessionId).filter((r) => r.phase === 'JOURNEY_COMPLETE');
  }
}
