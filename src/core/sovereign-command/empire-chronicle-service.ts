import { randomUUID } from 'crypto';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { EmpireChronicleContract } from './sovereign-command-contract';
import type { ChronicleCategory, ChronicleEntry, ChronicleSignificance } from './sovereign-command-types';
import { createAuditTrailId } from '../constitution-runtime/wp-008-types';

const CHRONICLE_ARTICLE = 'imperial-memory-timeline' as const;

interface IndexedEntry {
  readonly entry: ChronicleEntry;
  readonly insertionIndex: number;
}

export class EmpireChronicleService implements EmpireChronicleContract {
  readonly serviceName = 'EmpireChronicleService' as const;

  private readonly indexedEntries: IndexedEntry[] = [];
  private insertionCounter = 0;

  constructor(private readonly memoryLayer: MemoryLayerContract) {}

  record(
    entry: Omit<ChronicleEntry, 'entryId' | 'timestamp'>,
  ): ChronicleEntry {
    const chronicleEntry: ChronicleEntry = {
      entryId: randomUUID(),
      timestamp: new Date(),
      ...entry,
    };
    this.indexedEntries.push({ entry: chronicleEntry, insertionIndex: this.insertionCounter++ });

    const auditId = createAuditTrailId(`chronicle-${chronicleEntry.entryId}`);
    void this.memoryLayer.constitutionalMemoryService.remember(
      `chronicle-${entry.category.toLowerCase()}`,
      CHRONICLE_ARTICLE,
      `[${entry.significance}] ${entry.title}: ${entry.narrative}`,
      auditId,
    );

    return chronicleEntry;
  }

  getChronicle(limit?: number): readonly ChronicleEntry[] {
    const sorted = [...this.indexedEntries].sort(
      (a, b) =>
        b.entry.timestamp.getTime() - a.entry.timestamp.getTime() ||
        b.insertionIndex - a.insertionIndex,
    );
    const entries = sorted.map((e) => e.entry);
    return limit !== undefined ? entries.slice(0, limit) : entries;
  }

  getByCategory(category: ChronicleCategory): readonly ChronicleEntry[] {
    return this.indexedEntries
      .filter((e) => e.entry.category === category)
      .map((e) => e.entry);
  }
}

export function makeSignificance(urgency: string): ChronicleSignificance {
  if (urgency === 'CRITICAL') return 'HISTORIC';
  if (urgency === 'HIGH') return 'NOTABLE';
  return 'ROUTINE';
}
