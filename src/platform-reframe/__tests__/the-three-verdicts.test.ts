/**
 * AZMA OS — the Founder's three verdicts, priced, 2026-09-29.
 *
 *   «تستبدل مقاسات الأصل الواحد قدر المستطاع، وأمّا ما لا تستطيع تغيير مقاسه
 *   لأيّ سبب فتعرض الأمر على المنشئ... يؤكّد بعد حساب التكلفة.»
 */

import { resolveTarget, reframablePlatforms } from '../platform-target';
import { reframeUnitCost } from '../reframe-plan';
import { framingFilter } from '../../orchestrator/fleet-materialization/fleet/adapters/cinematic-ffmpeg-encoder';

it('a platform name becomes the rectangle the Empire actually produces at', () => {
  // The encoder's own PROFILE_DIMENSIONS, not a second opinion about 16:9.
  expect(resolveTarget('youtube')).toMatchObject({ width: 1920, height: 1080, outputProfile: 'landscape' });
  expect(resolveTarget('tiktok')).toMatchObject({ width: 1080, height: 1920, outputProfile: 'portrait' });
  expect(resolveTarget('instagram')).toMatchObject({ width: 1080, height: 1080, outputProfile: 'square' });
});

it('a platform the Empire cannot serve resolves to null, never to a default shape', () => {
  // `getOrientation` reads an unparseable ratio as 'landscape', so a guess
  // here would tell a Creator their portrait film fits YouTube.
  expect(resolveTarget('unknown-planet-tv')).toBeNull();
  expect(reframablePlatforms().length).toBeGreaterThan(0);
});

it('the reframe costs the Founder\'s figure, read from his own table', () => {
  expect(reframeUnitCost()).toBe(20);
});

it('reframing preserves the ratio and crops — it never stretches', () => {
  // «بشرط عدم المساس بالجوده». `fill` would squeeze the picture; `cover`
  // keeps the ratio and cuts the overflow.
  const f = framingFilter(1080, 1920, 'cover');
  expect(f).toContain('force_original_aspect_ratio=increase');
  expect(f).toContain('crop=1080:1920');
  expect(framingFilter(1080, 1920, 'fill')).toBe('scale=1080:1920');
});
