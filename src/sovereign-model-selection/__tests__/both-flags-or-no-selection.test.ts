/**
 * AZMA OS — D-7 · AN UNAUTHORIZED OR RETIRED MODEL IS NOT SELECTABLE.
 *
 * `findProductionAuthorized` filtered on `productionAuthorized` alone until
 * 2026-10-11, while its own docstring and the selector's own refusal message
 * both said «active AND production-authorized». A model retired by setting
 * `active: false` while keeping its authorization would have stayed
 * selectable — which is exactly how the Founder's final allocation of
 * 2026-09-27 retired `seedance-2-0` and `nano-banana-pro`.
 *
 * Nothing here authorises a model. These tests only hold the door shut.
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { IMAGE_MODEL_FLEET } from '../image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../video-model-fleet';
import type { SovereignMediaModelDescriptor } from '../types';

const base = (over: Partial<SovereignMediaModelDescriptor>): SovereignMediaModelDescriptor => ({
  modelId: 'm', providerId: 'p', gatewayId: 'magic-hour', providerModelId: 'pm',
  displayName: 'D', sovereignNameAr: 'ن', sovereignNoteAr: 'و', mediaType: 'image',
  capabilities: ['text-to-image'], qualityTier: 'standard', supportedAspectRatios: ['16:9'],
  characteristicHints: [], supportedStyleIds: [],
  costCatalogKey: { gatewayId: 'magic-hour', capabilityTarget: 'image-generation' },
  verificationStatus: 'production', productionAuthorized: true, active: true,
  ...over,
} as SovereignMediaModelDescriptor);

describe('selection requires BOTH flags', () => {
  const pool = (models: readonly SovereignMediaModelDescriptor[]) => {
    const r = new SovereignModelRegistry();
    for (const m of models) r.register(m);
    return r.findProductionAuthorized('image').map((m) => m.modelId);
  };

  it('authorized and active is selectable', () => {
    expect(pool([base({ modelId: 'both' })])).toEqual(['both']);
  });

  it('a RETIRED model keeping its authorization is NOT selectable', () => {
    // The shape that had no guard at all before this fix.
    expect(pool([base({ modelId: 'retired', productionAuthorized: true, active: false })])).toEqual([]);
  });

  it('an unauthorized model left active is NOT selectable', () => {
    expect(pool([base({ modelId: 'awaiting', productionAuthorized: false, active: true })])).toEqual([]);
  });

  it('neither flag means not selectable', () => {
    expect(pool([base({ modelId: 'off', productionAuthorized: false, active: false })])).toEqual([]);
  });
});

describe('the real fleet, judged by the same rule', () => {
  const selectable = (fleet: readonly SovereignMediaModelDescriptor[], media: 'image' | 'video') => {
    const r = new SovereignModelRegistry();
    for (const m of fleet) r.register(m);
    return r.findProductionAuthorized(media);
  };

  it('every selectable model carries both flags', () => {
    for (const [fleet, media] of [[IMAGE_MODEL_FLEET, 'image'], [VIDEO_MODEL_FLEET, 'video']] as const) {
      for (const m of selectable(fleet, media)) {
        expect(m.productionAuthorized).toBe(true);
        expect(m.active).toBe(true);
      }
    }
  });

  it('the three entries whose flags disagree are excluded, and their flags are UNCHANGED', () => {
    // Their intended status is the Chief Architect's to rule. This asserts the
    // exclusion, never a value — if he rules them authorized, this test keeps
    // passing and the models become selectable by HIS edit, not by a test's.
    const awaiting = ['z-image-turbo', 'ltx-2-3', 'kling-3-0'];
    const all = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET];
    for (const id of awaiting) {
      const m = all.find((x) => x.modelId === id);
      expect(m).toBeDefined();
      if (!m!.productionAuthorized) {
        const media = m!.mediaType === 'video' ? 'video' : 'image';
        const fleet = media === 'video' ? VIDEO_MODEL_FLEET : IMAGE_MODEL_FLEET;
        expect(selectable(fleet, media).map((x) => x.modelId)).not.toContain(id);
      }
    }
  });

  it('the registry’s filter matches the sentence the selector shows a Creator', () => {
    const fs = require('fs'); const path = require('path');
    const reg: string = fs.readFileSync(
      path.join(process.cwd(), 'src/sovereign-model-selection/sovereign-model-registry.ts'), 'utf8');
    const sel: string = fs.readFileSync(
      path.join(process.cwd(), 'src/sovereign-model-selection/sovereign-model-selector.ts'), 'utf8');
    expect(reg).toContain('m.productionAuthorized && m.active');
    // The refusal the Creator may read names both; the filter must too.
    expect(sel).toContain('is not production-authorized and active');
  });
});
