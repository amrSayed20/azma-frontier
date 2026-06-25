/**
 * Timeline capture for orchestration phases.
 */

import { TimelineEntry } from '../types/orchestration-contracts';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';

export class ExecutionTimeline {
  private readonly byRequest = new Map<string, TimelineEntry[]>();

  public record(
    requestId: string,
    phase: string,
    details: Readonly<Record<string, unknown>> = {}
  ): TimelineEntry {
    const entry: TimelineEntry = {
      entryId: buildId('timeline'),
      requestId,
      phase,
      timestamp: now(),
      details
    };

    const entries = this.byRequest.get(requestId) ?? [];
    this.byRequest.set(requestId, [...entries, entry]);
    return entry;
  }

  public list(requestId: string): readonly TimelineEntry[] {
    return this.byRequest.get(requestId) ?? [];
  }
}
