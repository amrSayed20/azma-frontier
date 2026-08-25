import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { recordGeneration, listGenerationsForCreator, getGenerationRecord, deleteGenerationRecord } from '../generation-record-repository';

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

  // ── D: originalIdea ─────────────────────────────────────────────────────────

  it('D: stores the original Creator idea separately from the engineered production prompt', () => {
    const constructedPrompt = 'مشهد سينمائي بكاميرا 35mm، سيارة في القاهرة ليلًا، إضاءة درامية سينمائية';
    const originalIdea = 'سيارة في القاهرة ليلًا';
    const record = recordGeneration(db, {
      creatorId: 'creator-d',
      prompt: constructedPrompt,
      style: 'cinematic',
      assetUrl: '/generated-assets/d.png',
      originalIdea,
    });
    expect(record.originalIdea).toBe(originalIdea);
    expect(record.prompt).toBe(constructedPrompt);
    expect(record.prompt).not.toBe(record.originalIdea);
  });

  // ── E: gallery shows originalIdea ───────────────────────────────────────────

  it('E: gallery listing returns originalIdea so Creators see their own words, not the engineered prompt', () => {
    recordGeneration(db, {
      creatorId: 'creator-e',
      prompt: 'مشهد سينمائي بكاميرا 35mm، فكرة بسيطة، إضاءة درامية سينمائية',
      style: 'cinematic',
      assetUrl: '/generated-assets/e.png',
      originalIdea: 'فكرة بسيطة',
    });
    const records = listGenerationsForCreator(db, 'creator-e');
    expect(records[0].originalIdea).toBe('فكرة بسيطة');
    expect(records[0].prompt).not.toBe(records[0].originalIdea);
  });

  // ── getGenerationRecord ──────────────────────────────────────────────────────

  it('getGenerationRecord returns the record when both recordId and creatorId match', () => {
    const created = recordGeneration(db, { creatorId: 'creator-get', prompt: 'test', style: 'cinematic', assetUrl: '/a.png' });
    const found = getGenerationRecord(db, created.recordId, 'creator-get');
    expect(found).not.toBeNull();
    expect(found?.recordId).toBe(created.recordId);
    expect(found?.prompt).toBe('test');
  });

  it('getGenerationRecord returns null when the recordId exists but belongs to another Creator', () => {
    const created = recordGeneration(db, { creatorId: 'owner', prompt: 'private', style: null, assetUrl: '/p.png' });
    const result = getGenerationRecord(db, created.recordId, 'intruder');
    expect(result).toBeNull();
  });

  it('getGenerationRecord returns null for a non-existent recordId', () => {
    expect(getGenerationRecord(db, 'no-such-id', 'creator-x')).toBeNull();
  });

  // ── deleteGenerationRecord ───────────────────────────────────────────────────

  it('deleteGenerationRecord removes the record from the database', () => {
    const created = recordGeneration(db, { creatorId: 'creator-del', prompt: 'to delete', style: null, assetUrl: '/del.png' });
    deleteGenerationRecord(db, created.recordId, 'creator-del');
    const after = listGenerationsForCreator(db, 'creator-del');
    expect(after).toHaveLength(0);
  });

  it('deleteGenerationRecord with wrong creatorId does not delete the record — ownership enforced in SQL', () => {
    const created = recordGeneration(db, { creatorId: 'real-owner', prompt: 'protected', style: null, assetUrl: '/prot.png' });
    deleteGenerationRecord(db, created.recordId, 'wrong-creator');
    const after = listGenerationsForCreator(db, 'real-owner');
    expect(after).toHaveLength(1);
  });

  it('deleteGenerationRecord is idempotent — deleting a non-existent record does not throw', () => {
    expect(() => deleteGenerationRecord(db, 'ghost-id', 'creator-x')).not.toThrow();
  });

  it('historical records with null originalIdea remain fully readable — backward-compatible migration', () => {
    // Simulate a pre-migration row: direct SQL without original_idea column
    db.prepare(
      'INSERT INTO generation_records (record_id, creator_id, prompt, style, asset_url, generated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).run('legacy-id', 'creator-legacy', 'legacy engineering prompt', null, '/generated-assets/legacy.png', Date.now());
    const records = listGenerationsForCreator(db, 'creator-legacy');
    expect(records.length).toBe(1);
    expect(records[0].originalIdea).toBeNull();
    expect(records[0].prompt).toBe('legacy engineering prompt');
  });
});
