import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { recordGeneration, listGenerationsForCreator } from '../generation-record-repository';

describe('Persistent Storage Foundation — Qiyamah generation records', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('durably records a generation and lists it back for its Creator', () => {
    recordGeneration(db, { creatorId: 'creator-1', prompt: 'a sovereign vista', style: 'cinematic', assetUrl: '/generated-assets/a.png' });
    const records = listGenerationsForCreator(db, 'creator-1');

    expect(records.length).toBe(1);
    expect(records[0].prompt).toBe('a sovereign vista');
    expect(records[0].assetUrl).toBe('/generated-assets/a.png');
  });

  it('honestly records an anonymous generation when no Creator is known yet', () => {
    const record = recordGeneration(db, { creatorId: null, prompt: 'a scene', style: null, assetUrl: '/generated-assets/b.png' });
    expect(record.creatorId).toBeNull();
  });

  it('lists a Creator\'s generations most-recent-first', () => {
    recordGeneration(db, { creatorId: 'creator-2', prompt: 'first', style: null, assetUrl: '/generated-assets/1.png' });
    recordGeneration(db, { creatorId: 'creator-2', prompt: 'second', style: null, assetUrl: '/generated-assets/2.png' });
    const records = listGenerationsForCreator(db, 'creator-2');
    expect(records.map((r) => r.prompt)).toEqual(['second', 'first']);
  });

  it('never returns another Creator\'s records', () => {
    recordGeneration(db, { creatorId: 'creator-a', prompt: 'a-only', style: null, assetUrl: '/generated-assets/a.png' });
    recordGeneration(db, { creatorId: 'creator-b', prompt: 'b-only', style: null, assetUrl: '/generated-assets/b.png' });
    expect(listGenerationsForCreator(db, 'creator-a').map((r) => r.prompt)).toEqual(['a-only']);
  });
});
