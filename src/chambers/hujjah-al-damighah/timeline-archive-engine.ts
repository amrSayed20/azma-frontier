/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Timeline Archive Engine
 *
 * Status: V1.0
 * Historical Timeline Layer
 */

export interface TimelineRecord {
  id: string;

  title: string;

  description: string;

  timestamp: string;
}

export interface TimelineArchive {
  records: TimelineRecord[];
}

export function createTimelineArchive(): TimelineArchive {
  return {
    records: [],
  };
}

export function addTimelineRecord(
  archive: TimelineArchive,
  record: TimelineRecord
): TimelineArchive {
  return {
    ...archive,
    records: [...archive.records, record],
  };
}

export function findTimelineRecord(
  archive: TimelineArchive,
  id: string
): TimelineRecord | undefined {
  return archive.records.find(
    (record) => record.id === id
  );
}

export function removeTimelineRecord(
  archive: TimelineArchive,
  id: string
): TimelineArchive {
  return {
    ...archive,
    records: archive.records.filter(
      (record) => record.id !== id
    ),
  };
}