import { manifest } from '../manifest';
import type { ManifestationPlan } from '@/src/manifestation-plan';

describe('The Imperial Manifestation Engine — manifest', () => {
  it('shapes a Manifestation Plan into button specs, ids only', () => {
    const plan: ManifestationPlan = {
      availableCapabilities: [{ id: 'enter-as-member' }, { id: 'enter-as-explorer' }],
    };
    expect(manifest(plan, 'button')).toEqual([{ id: 'enter-as-member' }, { id: 'enter-as-explorer' }]);
  });

  it('returns an empty spec list for an empty Plan', () => {
    const plan: ManifestationPlan = { availableCapabilities: [] };
    expect(manifest(plan, 'button')).toEqual([]);
  });

  it('never adds a label, style, or href — that remains the Presentation Consumer\'s own responsibility', () => {
    const plan: ManifestationPlan = { availableCapabilities: [{ id: 'subscribe' }] };
    for (const spec of manifest(plan, 'button')) {
      expect(Object.keys(spec)).toEqual(['id']);
    }
  });
});
