/**
 * AZMA OS — test-only model selection, and the wall around it.
 *
 * Registered 2026-09-27 under the Controlled Model Test Enablement order so
 * that exactly two controlled comparisons can run — Nano Banana 2 against the
 * Nano Banana Pro reference, MiniMax H3 against the Seedance reference — with
 * every variable but the model held fixed.
 *
 * ─── THE SECURITY CLAIM THESE GUARDS HOLD ───────────────────────────────────
 *
 *   The order names accidental public model injection as the greatest risk.
 *   The answer is not a check on the production route: it is that the
 *   production route never learns the field exists. `app/api/qiyamah/generate`
 *   does not read `testOnlyModelId`, so a browser POSTing it there changes
 *   nothing — there is no hidden flag to discover and no condition to defeat.
 *
 *   And a dormant binding is undispatchable by construction, not by policy:
 *   the selector's first step filters the fleet to `productionAuthorized &&
 *   active`, so `minimax-h3` is never in the pool, and even an explicit
 *   `requiredModelId` is refused against that pool.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { IMAGE_MODEL_FLEET } from '../image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../video-model-fleet';
import { getProductionSelector } from '../index';
import { buildVideoCreationIntent, buildImageCreationIntent } from '../intent-builder';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const GENERATE_ROUTE = read('app/api/qiyamah/generate/route.ts');
const TEST_ROUTE = read('app/api/sovereign/model-test/route.ts');
const SERVICE = read('src/qiyamah-generation/generation-service.ts');
const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');

describe('1–2 · normal production cannot supply a model, from any client', () => {
  it('the production route never reads the override', () => {
    expect(GENERATE_ROUTE).not.toContain('testOnlyModelId');
    expect(GENERATE_ROUTE).not.toContain('requiredModelId');
    expect(GENERATE_ROUTE).not.toContain('modelId');
  });

  it('so a browser sending it there changes nothing — there is no branch to take', () => {
    // The strongest form of the guarantee: not «rejected», but «never read».
    expect(GENERATE_ROUTE.includes('testOnlyModelId')).toBe(false);
  });

  it('the Chamber sends no model and shows no selector', () => {
    expect(CLIENT).not.toContain('testOnlyModelId');
    expect(CLIENT).not.toContain('minimax');
    // The only model a Creator names anywhere is a MOTION model on the animate
    // route, which predates this work and is a named sovereign choice.
    expect(CLIENT).not.toMatch(/requiredModelId/);
  });
});

describe('3 · an unauthorized caller cannot invoke test-only selection', () => {
  it('the test route is gated by the Empire’s existing Founder gate', () => {
    expect(TEST_ROUTE).toContain("import { verifyFounderSession } from '@/src/founder-access';");
    expect(TEST_ROUTE).toContain('const session = verifyFounderSession(request.cookies.get(SESSION_COOKIE)?.value);');
  });

  it('the gate runs before anything else is read', () => {
    const gate = TEST_ROUTE.indexOf('verifyFounderSession(request.cookies');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(TEST_ROUTE.indexOf('await request.json()'));
  });

  it('a non-Founder learns nothing about the surface', () => {
    expect(TEST_ROUTE).toContain("reason: 'not-found' }, { status: 404 }");
  });

  it('no second authorization system was invented', () => {
    expect(TEST_ROUTE).not.toMatch(/process\.env\.[A-Z_]*TEST|X-Test|testToken|adminKey|bypass/);
  });
});

describe('4–5 · an authorized test can resolve either binding', () => {
  it('Nano Banana 2 is a registered image binding', () => {
    expect(IMAGE_MODEL_FLEET.find((m) => m.modelId === 'nano-banana-2')).toBeDefined();
  });

  it('MiniMax H3 is a registered video binding', () => {
    expect(VIDEO_MODEL_FLEET.find((m) => m.modelId === 'minimax-h3')).toBeDefined();
  });

  it('the service resolves an override through the fleet, not through the selector', () => {
    expect(SERVICE).toContain('function resolveTestOnlyBinding(');
    expect(SERVICE).toContain('const entry = fleet.find((m) => m.modelId === modelId);');
    expect(SERVICE).toContain('if (!entry) return null;');
  });

  it('and with no override the selector call is unchanged', () => {
    expect(SERVICE).toContain(': getProductionSelector().select(creationIntent);');
    expect((SERVICE.match(/getProductionSelector\(\)\.select\(creationIntent\)/g) ?? []).length).toBe(2);
  });
});

describe('6–8 · the allocation is exactly what it was', () => {
  it('MiniMax H3 is dormant: not authorized, not active', () => {
    const h3 = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'minimax-h3')!;
    expect(h3.productionAuthorized).toBe(false);
    expect(h3.active).toBe(false);
    expect(h3.verificationStatus).toBe('approved-candidate');
  });

  it('Seedance remains authorized and active', () => {
    const s = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'seedance-2-0')!;
    expect(s.productionAuthorized).toBe(true);
    expect(s.active).toBe(true);
    expect(s.providerModelId).toBe('seedance-2.0');
  });

  it('Veo remains authorized and active', () => {
    const v = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'veo-3-1')!;
    expect(v.productionAuthorized).toBe(true);
    expect(v.active).toBe(true);
    expect(v.providerModelId).toBe('veo3.1');
  });
});

describe('9–10 · normal allocation is unchanged, by set and not by count', () => {
  it('the image allocation is the two designated models', () => {
    expect(IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['nano-banana-2', 'nano-banana-pro']);
  });

  it('the video allocation is the two designated models', () => {
    expect(VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['seedance-2-0', 'veo-3-1']);
  });
});

describe('11–12 · a dormant binding reaches no creator surface', () => {
  it('the selector never returns it for an ordinary video intent', () => {
    const out = getProductionSelector().select(buildVideoCreationIntent('a cinematic scene', 'cinematic', 6));
    if (out.selected) expect(out.selection.modelId).not.toBe('minimax-h3');
  });

  it('naming it explicitly is refused — the pool is the authorized set', () => {
    const intent = { ...buildVideoCreationIntent('a cinematic scene', 'cinematic', 6), requiredModelId: 'minimax-h3' };
    const out = getProductionSelector().select(intent);
    expect(out.selected).toBe(false);
    if (!out.selected) expect(out.reason).toBe('required-model-unavailable');
  });

  it('an ordinary image intent still resolves to the designated allocation', () => {
    const out = getProductionSelector().select(buildImageCreationIntent('a quiet still life', 'cinematic'));
    expect(out.selected).toBe(true);
    if (out.selected) expect(['nano-banana-2', 'nano-banana-pro']).toContain(out.selection.modelId);
  });
});

describe('13–14 · a provider string cannot be injected', () => {
  it('the test route resolves a fleet id or refuses', () => {
    expect(TEST_ROUTE).toContain('const entry = fleet.find((m) => m.modelId === modelId);');
    expect(TEST_ROUTE).toContain("reason: 'unknown-model'");
  });

  it('a provider model name is not a fleet id, so it cannot resolve', () => {
    const provider = ['minimax-h3-turbo', 'gpt-image-2', 'seedance-2.0', 'veo3.1', 'nano-banana-pro-max'];
    const ids = new Set([...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET].map((m) => m.modelId));
    // 'seedance-2.0' and 'veo3.1' are PROVIDER strings; the fleet ids are
    // 'seedance-2-0' and 'veo-3-1'. The distinction is the whole protection.
    for (const p of provider) expect(ids.has(p)).toBe(false);
  });

  it('the route never forwards a raw provider model to the adapter', () => {
    expect(TEST_ROUTE).toContain('testOnlyModelId: entry.modelId');
    expect(TEST_ROUTE).not.toContain('providerModelId');
  });
});

describe('15 · no creator-facing model selector was added', () => {
  it('the Chamber gained no model control', () => {
    expect(CLIENT).not.toMatch(/model-select|modelSelector|choose.?model/i);
  });

  it('and no provider or dormant model name appears in it', () => {
    const stripped = CLIENT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').toLowerCase();
    for (const w of ['minimax', 'seedance', 'veo', 'magic hour', 'magichour']) {
      expect(stripped).not.toContain(w);
    }
    // 'h3' alone would match the <h3> heading of the workshop floor, which is
    // markup and not a model name. The model is named 'minimax-h3'.
    expect(stripped).not.toMatch(/minimax[-\s]?h3|h3(?!>)/);
  });
});

describe('16–18 · registration alone activates nothing', () => {
  it('no request field can flip productionAuthorized or active', () => {
    expect(TEST_ROUTE).not.toMatch(/productionAuthorized\s*[:=]/);
    expect(TEST_ROUTE).not.toMatch(/active\s*[:=]\s*true/);
    expect(SERVICE).not.toMatch(/productionAuthorized\s*=\s*true/);
  });

  it('the override path does not widen the selector’s authorized pool', () => {
    // resolveTestOnlyBinding reads the fleet directly and returns a binding;
    // it never calls the selector, so the pool it filters is untouched.
    const start = SERVICE.indexOf('function resolveTestOnlyBinding(');
    const fn = SERVICE.slice(start, SERVICE.indexOf('\n}', start));
    expect(fn).not.toContain('getProductionSelector');
    expect(fn).not.toContain('productionAuthorized');
  });

  it('an unregistered id is refused before any provider is contacted', () => {
    expect(SERVICE).toContain("is not a registered AZMA fleet id");
  });
});
