import { IMPERIAL_VISION_DOCUMENTS } from '../vision-registry';
import { listVisionDocuments } from '../queries';
import type { ChamberId } from '@/src/chamber-identity';

const ALL_CHAMBER_IDS: readonly ChamberId[] = [
  'sovereign-vault-palace',
  'hujjah-al-damighah',
  'qiyamah-chamber',
  'ras-amr',
  'makman-al-ghayah',
];

const PROSE_FIELDS = [
  'philosophy',
  'constitutionalResponsibility',
  'personality',
  'creatorExperience',
  'entryExitTransformation',
  'uniqueValue',
] as const;

describe('Imperial Vision Documents', () => {
  it('defines a document for every real Chamber', () => {
    for (const id of ALL_CHAMBER_IDS) {
      expect(IMPERIAL_VISION_DOCUMENTS[id].chamberId).toBe(id);
    }
  });

  it('has non-empty prose for every field, every chamber', () => {
    for (const id of ALL_CHAMBER_IDS) {
      const doc = IMPERIAL_VISION_DOCUMENTS[id];
      for (const field of PROSE_FIELDS) {
        expect(doc[field].length).toBeGreaterThan(0);
      }
    }
  });

  it('only Ras Al Amr has real, named Production Modes — every other chamber is null', () => {
    expect(IMPERIAL_VISION_DOCUMENTS['ras-amr'].productionModes).toHaveLength(2);
    const others = ALL_CHAMBER_IDS.filter((id) => id !== 'ras-amr');
    for (const id of others) {
      expect(IMPERIAL_VISION_DOCUMENTS[id].productionModes).toBeNull();
    }
  });

  it('lists all five documents', () => {
    expect(listVisionDocuments()).toHaveLength(5);
  });
});
