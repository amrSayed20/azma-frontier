/**
 * A TEMPLATE FILLED WITH THE CREATOR'S OWN WORK.
 *
 * «املأ هذه القوالب بأصولٍ حقيقيّةٍ من الخزانة» — the Founder, 2026-11-09.
 *
 * The live preview already had the hard parts: real slot durations, real
 * roles, a real crossfade, a real clock. What it showed was the same drawn
 * placeholder to every Creator — which tells them the SHAPE of a template and
 * nothing about what THEIR film will look like.
 *
 * These guards hold the three rules that make a filled preview honest: only
 * their own work, never a lie about an empty slot, and never a change to the
 * template's own timing.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { fillTemplateSlots, filledSlotCount, canFillVisualSlot } from '../template-fill';
import { AssetFamily } from '../../../vault/sovereign-vault-types';
import type { VaultAsset } from '../../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';

const asset = (id: string, capability: CapabilityTarget, family = AssetFamily.MEDIA): VaultAsset => ({
  assetId: id,
  subscriberTenantId: 'creator-1',
  originatingOperationId: 'op-1',
  capabilityTarget: capability,
  assetFamily: family,
  secureStorageUri: `/generated-assets/${id}.png`,
  metadata: {} as VaultAsset['metadata'],
  createdAt: 1,
  updatedAt: 1,
} as VaultAsset);

const PICTURE = asset('pic-1', CapabilityTarget.VISUAL);
const CLIP = asset('clip-1', CapabilityTarget.MOTION);
const NARRATION = asset('voice-1', CapabilityTarget.AUDIO);

describe('a template filled with the Creator’s own work', () => {
  it('a narration never takes a picture slot', () => {
    // An empty frame wearing a filename is worse than a placeholder: it looks
    // like the template is broken rather than like the slot is waiting.
    expect(canFillVisualSlot(PICTURE)).toBe(true);
    expect(canFillVisualSlot(CLIP)).toBe(true);
    expect(canFillVisualSlot(NARRATION)).toBe(false);
  });

  it('a document is not a picture, whatever it is named', () => {
    expect(canFillVisualSlot(asset('doc-1', CapabilityTarget.VISUAL, AssetFamily.STRUCTURAL)))
      .toBe(false);
  });

  it('an empty Vault leaves every slot a DECLARED placeholder', () => {
    // Never a lie: a Creator must not be shown their own work where there is
    // none, and the preview must be able to say which is which.
    const slots = fillTemplateSlots(5, [NARRATION]);
    expect(slots).toHaveLength(5);
    expect(slots.every((s) => s.isPlaceholder && s.asset === null)).toBe(true);
    expect(filledSlotCount(slots)).toBe(0);
  });

  it('one picture fills a five-slot template rather than leaving four blanks', () => {
    // A Creator with one picture should see the RHYTHM of the template, not
    // one frame followed by four empty ones.
    const slots = fillTemplateSlots(5, [PICTURE]);
    expect(filledSlotCount(slots)).toBe(5);
    expect(slots.every((s) => s.asset?.assetId === 'pic-1')).toBe(true);
  });

  it('it never changes how many slots the template has', () => {
    // Durations, roles and transitions belong to the template. This chooses
    // pictures and nothing else.
    for (const count of [1, 3, 7]) {
      expect(fillTemplateSlots(count, [PICTURE, CLIP])).toHaveLength(count);
    }
    expect(fillTemplateSlots(0, [PICTURE])).toHaveLength(0);
  });

  it('and the live preview actually reads the Creator’s Vault', () => {
    // A fill nothing renders is a fill nobody has.
    const chamber = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'page.tsx'), 'utf8');
    expect(chamber).toContain('buildDemoFrames(selectedTemplate, vaultAssets)');
    expect(chamber).toContain('src={frame.vaultUri ?? frame.svgDataUri}');
    // A clip is PLAYED, not shown: a still frame of a clip is a lie about it.
    expect(chamber).toContain('frame.vaultUri && frame.vaultIsMotion');
    // And the Creator is told which slots are theirs.
    expect(chamber).toContain('مواضعَ من خزانتك أنت');
  });

  it('the fill note paints its own surface', () => {
    const css = readFileSync(
      join(__dirname, '..', '..', '..', '..', 'app', 'ras-amr', 'ras-amr.css'), 'utf8');
    const rule = css.slice(css.indexOf('.ras-tp-fill-note {'));
    expect(rule.slice(0, rule.indexOf('}'))).toMatch(/background/);
    expect(rule.slice(0, rule.indexOf('}'))).toMatch(/color/);
  });
});
