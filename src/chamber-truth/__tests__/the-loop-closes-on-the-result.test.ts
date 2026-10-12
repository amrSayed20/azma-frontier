/**
 * AZMA OS — القيامة: raising an asset, and closing the loop on a result.
 *
 * Two things the Founder approved on 2026-09-26.
 *
 * ─── upscale-asset ──────────────────────────────────────────────────────────
 *   Four of its five parts were already built and unreachable: the provider
 *   route PROBED LIVE (400 for a missing scale_factor), the cost catalog
 *   pricing it as `image-upscaling`, a full benchmark with golden assets in
 *   `src/benchmark/specs/image-upscaling-specs.ts`, and the editor's own
 *   provider client to extend. Two choices inside it are held here because
 *   both were made on measured grounds and both are easy to «tidy» away:
 *   `preserve` mode (the Empire's own benchmark demands hallucination:none,
 *   AND it is the 1× credit option — nothing is traded), and 2× only (the
 *   provider documents 4× as tier-gated, and this Empire's tier is unproven;
 *   offering a Creator a choice the account may refuse is offering a refusal).
 *
 * ─── the loop ───────────────────────────────────────────────────────────────
 *   The Chamber showed a Creator the asset it had just made and did not know
 *   WHICH asset it was — the id came back and was discarded. So every act on
 *   a fresh result meant scrolling to the gallery to find it again by eye.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { CHAMBER_TRUTH } from '../truth-registry';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');
const ROUTE = read('app/api/vault/assets/[assetId]/upscale/route.ts');
const ADAPTER = read('src/core/sovereign-ai-integration/adapters/magic-hour-image-editing.ts');

describe('1 · upscale-asset is declared once, and belongs to القيامة', () => {
  it('exactly one chamber declares it', () => {
    const where = Object.values(CHAMBER_TRUTH).flatMap((t) =>
      t.capabilities.filter((c) => c.id === 'upscale-asset').map(() => t.chamberId));
    expect(where).toEqual(['qiyamah-chamber']);
  });

  it('it needs an asset, because it refines one rather than making one', () => {
    const cap = CHAMBER_TRUTH['qiyamah-chamber'].capabilities.find((c) => c.id === 'upscale-asset');
    expect(cap?.requiresExistingAsset).toBe(true);
  });

  it('it is not confused with the edit — they are separate capabilities', () => {
    const ids = CHAMBER_TRUTH['qiyamah-chamber'].capabilities.map((c) => c.id);
    expect(ids).toContain('edit-inside-asset');
    expect(ids).toContain('upscale-asset');
  });
});

describe('2 · the two measured choices inside it', () => {
  it('runs in the mode that invents nothing, which is also the 1× one', () => {
    expect(ADAPTER).toContain("export const UPSCALE_MODE = 'preserve' as const;");
    expect(ADAPTER).toContain('style: { mode: UPSCALE_MODE }');
    expect(ADAPTER).not.toContain("mode: 'creative'");
    expect(ADAPTER).not.toContain("mode: 'balanced'");
  });

  /**
   * RESTATED 2026-10-12. The test asserted that 2× was the only factor in the
   * adapter, because the account's tier was unverified. The tier is now READ
   * LIVE (`GET /v1/account` → `"tier":"creator"`) and the provider documents
   * 4× for that tier, so the capability is no longer the open question.
   *
   * The open question is the PRICE, and that is where the refusal now lives:
   * 2× keeps its default and its Creator price; 4× exists, carries no price,
   * and the route refuses to execute it. The rule the old assertion protected
   * — never offer a factor the Empire cannot stand behind — is unchanged.
   */
  it('defaults to the factor that is proven AND priced', () => {
    expect(ADAPTER).toContain('export const UPSCALE_SCALE_FACTOR = 2 as const;');
    expect(ADAPTER).toContain('const scaleFactor = options.scaleFactor ?? UPSCALE_SCALE_FACTOR;');
    expect(ADAPTER).toContain('scale_factor: scaleFactor');
  });

  it('and 4× cannot be executed, because no Creator price exists for it', () => {
    const route = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    expect(route).toContain("reason: 'not-priced'");
    expect(route).toContain('!factorRecord?.creatorPriceExists');
  });

  it('reuses one provider client rather than opening a second', () => {
    expect(ADAPTER).toContain('const headers = authHeaders();');
    expect(ADAPTER).toContain('const filePath = await uploadSource(');
    expect(ADAPTER).toContain('/v1/ai-image-upscaler');
  });
});

describe('3 · the route keeps every guard the edit route keeps', () => {
  it('reads the uploads directory at call time, never into a module constant', () => {
    expect(ROUTE).toContain('function uploadsDir()');
    expect(ROUTE).not.toMatch(/^const\s+UPLOADS_DIR\s*=/m);
  });

  it('answers absent and not-yours alike, so ownership cannot be probed', () => {
    expect(ROUTE).toContain('!parent || parent.subscriberTenantId !== session.creatorId');
  });

  it('refuses a legacy parent with the act that lifts it', () => {
    expect(ROUTE).toContain("reason: 'requires-adoption'");
  });

  it('leaves no orphaned bytes when the derivation is refused', () => {
    expect(ROUTE).toContain('await unlink(join(uploadsDir(), basename(persisted.assetUrl)))');
  });

  it('records the operation truthfully in the lineage', () => {
    expect(ROUTE).toContain('derivation: DerivationKind.MODIFIED');
    // It named the CONSTANT until 2026-10-12, when the factor became a choice.
    // A lineage that says «2×» about a 4× job is the same class of untruth the
    // constant was there to prevent — so it names what actually ran.
    expect(ROUTE).toContain('instructionAr: `رفع الدقّة ${scaleFactor}×');
  });

  it('names no provider to the Creator', () => {
    const spoken = [...ROUTE.matchAll(/message: '([^']+)'/g)].map((m) => m[1]).join(' ').toLowerCase();
    expect(spoken.length).toBeGreaterThan(0);
    for (const w of ['magic', 'banana', 'veo', 'openai', 'seedance', 'upscaler']) {
      expect(spoken).not.toContain(w);
    }
  });
});

describe('4 · the loop closes on the result', () => {
  it('the result knows its own name, from both the sync and the async path', () => {
    expect(CLIENT).toContain('setGeneratedAssetId(result.asset.assetId ?? null);');
    expect(CLIENT).toContain('setGeneratedAssetId(op.assetId ?? null);');
  });

  it('and lets it go when the journey restarts', () => {
    expect(CLIENT).toContain('setGeneratedAssetId(null);');
  });

  it('every next act is offered on the result itself', () => {
    const start = CLIENT.indexOf('<div className="next-acts"');
    expect(start).toBeGreaterThan(-1);
    const panel = CLIENT.slice(start, start + 2600);
    expect(panel).toContain('acceptAsset(generatedAssetId)');
    expect(panel).toContain("setMediaType('edit')");
    expect(panel).toContain("setVideoSource('asset')");
    expect(panel).toContain('handleUpscaleAsset(generatedAssetId)');
  });

  it('a video is offered only what can be done to a video', () => {
    const start = CLIENT.indexOf('<div className="next-acts"');
    const panel = CLIENT.slice(start, start + 2600);
    // accept is outside the guard; edit, animate and upscale are inside it
    expect(panel).toContain("{generatedAssetType !== 'video' && (");
    expect(panel.indexOf('acceptAsset(generatedAssetId)'))
      .toBeLessThan(panel.indexOf("{generatedAssetType !== 'video' && ("));
  });

  it('an empty gallery list never hides an asset already in hand', () => {
    // Arriving from the result, the asset is chosen while the gallery re-read
    // may not have landed. Guarding on the LIST alone hid the instruction
    // field and stranded a Creator who had already picked their asset.
    expect(CLIENT).toContain('editableAssets.length === 0 && !animateAssetId ? (');
    expect(CLIENT).toContain('editableAssets.length === 0 && !editingAssetId ? (');
  });

  it('it reuses the existing acts and regenerates nothing', () => {
    const start = CLIENT.indexOf('<div className="next-acts"');
    const panel = CLIENT.slice(start, start + 2600);
    expect(panel).not.toContain('/api/qiyamah/generate');
    expect(panel).not.toContain('handleBuildScene');
  });
});

/**
 * ─── 2026-10-12 · TWO FACTORS, AND ONE OF THEM IS NOT FOR SALE ─────────────
 *
 *   The Architect asked for 4× as an explicit option with its cost disclosed
 *   before execution. The capability is measured (endpoint + tier) and the
 *   price is not — so the surface shows both and sells one, which is the same
 *   honesty the shut cards carry.
 */
describe('6 · the Creator sees both factors, and is told which one is sold', () => {
  const CSS = read('app/qiyamah-chamber/qiyamah-chamber.css');

  it('both factors are on the screen, in the Creator’s own words', () => {
    expect(CLIENT).toContain('ضِعفان');
    expect(CLIENT).toContain('أربعةُ أضعاف');
  });

  it('BOTH factors can now be pressed, because both are priced', () => {
    // 4× was shown-and-dark while it had no price. A real paid job measured
    // its cost (100 credits) and the Architect's uplift priced it (170 units),
    // so the dark button became a priced choice rather than a locked one.
    expect(CLIENT).toContain('onClick={() => setUpscaleFactor(4)}');
    expect(CLIENT).not.toContain('upscale-factor--unpriced');
  });

  it('and the charge is stated before the press, for the chosen factor', () => {
    expect(CLIENT).toContain('وتُخصَم ١٧٠ وحدةً من رصيدك');
  });

  it('the chosen factor travels with the request', () => {
    expect(CLIENT).toContain('JSON.stringify({ scaleFactor: upscaleFactor })');
  });

  it('and the screen starts on the factor that is proven AND priced', () => {
    expect(CLIENT).toContain("useState<2 | 4>(2)");
  });

  it('every new control paints its own surface', () => {
    // The lesson of 2026-09-26: geometry without a background and a colour
    // inherits the browser's white, and no test but an eye ever sees it.
    for (const sel of ['.upscale-factor {', '.upscale-factor--on {', '.upscale-factor-why {']) {
      const i = CSS.indexOf(sel);
      expect(i).toBeGreaterThan(-1);
      const rule = CSS.slice(i, CSS.indexOf('}', i));
      expect(rule).toMatch(/background|color/);
    }
  });
});
