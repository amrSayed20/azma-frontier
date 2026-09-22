/**
 * AZMA OS — animate-asset: one truthful sovereign boundary.
 *
 * animate-asset Truth Boundary order, 2026-09-22. «AZMA can animate an
 * existing visual asset.» These tests hold the boundary as declared: once,
 * Qiyamah's, distinct from edit-inside-asset, derived into the Manifest,
 * ANIMATED in lineage, the source never replaced, the Diwan absent, the
 * provider identifiers the verified ones, and no interface offering it
 * before its production proof.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { CHAMBER_TRUTH } from '../truth-registry';
import { getChamberManifest } from '@/src/sovereign-chamber-manifest';
import { DerivationKind } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';
import { buildAnimationIntent } from '@/src/sovereign-model-selection';
import { SovereignModelRegistry } from '@/src/sovereign-model-selection/sovereign-model-registry';
import { SovereignModelSelector } from '@/src/sovereign-model-selection/sovereign-model-selector';

const ROOT = process.cwd();
const strip = (f: string) => readFileSync(join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const ALL_CAPS = Object.values(CHAMBER_TRUTH).flatMap((t) => t.capabilities.map((c) => ({ chamber: t.chamberId, ...c })));

describe('1–3 · the capability exists once, belongs to Qiyamah, and is not an edit', () => {
  it('animate-asset exists in Truth exactly once', () => {
    expect(ALL_CAPS.filter((c) => c.id === 'animate-asset')).toHaveLength(1);
  });

  it('it belongs to Qiyamah — inside the asset — and to no other Chamber', () => {
    const owner = ALL_CAPS.find((c) => c.id === 'animate-asset')!;
    expect(owner.chamber).toBe('qiyamah-chamber');
    expect(CHAMBER_TRUTH['ras-amr'].capabilities.some((c) => /animat/i.test(c.id))).toBe(false);
  });

  it('its boundary is its own, distinct from edit-inside-asset, and requires an existing asset', () => {
    const animate = ALL_CAPS.find((c) => c.id === 'animate-asset')!;
    const edit = ALL_CAPS.find((c) => c.id === 'edit-inside-asset')!;
    expect(animate.boundary.at).toBe('app/api/vault/assets/[assetId]/animate');
    expect(animate.boundary.at).not.toBe(edit.boundary.at);
    expect(animate.boundary.methods).toEqual(['POST']);
    expect(animate.requiresExistingAsset).toBe(true);
    expect(animate.performs).toMatch(/video/i);
    expect(animate.performs).toMatch(/ANIMATED/);
    expect(edit.performs).not.toMatch(/video/i);
  });

  it('13 · no other motion-named capability was invented beside it', () => {
    const motionish = ALL_CAPS.filter((c) => /motion|animat|video/i.test(c.id));
    expect(motionish.map((c) => c.id)).toEqual(['animate-asset']);
  });
});

describe('4–5 · the Manifest derives it; nothing defines it by hand', () => {
  it('the Qiyamah Manifest carries animate-asset with Truth\'s purpose', () => {
    const manifest = getChamberManifest('qiyamah-chamber')!;
    const truth = CHAMBER_TRUTH['qiyamah-chamber'].capabilities.find((c) => c.id === 'animate-asset')!;
    const derived = manifest.capabilities.filter((c) => c.capabilityId === 'animate-asset');
    expect(derived).toHaveLength(1);
    expect(derived[0].purpose).toBe(truth.performs);
    expect(derived[0].preconditions).toHaveLength(1);
  });

  it('no hand-written animate-asset identity exists in the Manifest source', () => {
    expect(strip('src/sovereign-chamber-manifest/manifests.ts')).not.toContain('animate-asset');
  });
});

describe('6–7 · lineage semantics: ANIMATED, MOTION, the source untouched', () => {
  const route = strip('app/api/vault/assets/[assetId]/animate/route.ts');

  it('the boundary derives with DerivationKind.ANIMATED and CapabilityTarget.MOTION', () => {
    expect(DerivationKind.ANIMATED).toBe('ANIMATED');
    expect(route).toMatch(/derivation:\s*DerivationKind\.ANIMATED/);
    expect(route).toMatch(/outputCapabilityTarget:\s*CapabilityTarget\.MOTION/);
    expect(CapabilityTarget.MOTION).toBe('MOTION');
  });

  it('the parent is the source and the output goes through deriveAsset — never a new root, never an overwrite', () => {
    expect(route).toMatch(/parentAssetId:\s*parent\.assetId/);
    expect(route).toMatch(/await deriveAsset\(/);
    // The source is only ever READ.
    expect(route).toMatch(/readFile\(diskPath\)/);
    expect(route).not.toMatch(/writeFile\(/);
    // A refused derivation removes only the produced file, never the parent's.
    expect(route).toMatch(/unlink\(join\(uploadsDir\(\), 'generated-assets', basename\(persisted\.assetUrl\)\)\)/);
  });

  it('the generation record describes the animation, and no default model is ever assumed', () => {
    expect(route).toMatch(/style:\s*'animate-asset'/);
    expect(route).toMatch(/mediaType:\s*'video'/);
    expect(route).toMatch(/'model-required'/);
  });
});

describe('8 · the Diwan is not involved', () => {
  it('neither the route, the binding, nor the intent touch src/sovereign-capability', () => {
    for (const f of [
      'app/api/vault/assets/[assetId]/animate/route.ts',
      'src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video.ts',
      'src/sovereign-model-selection/intent-builder.ts',
    ]) {
      expect(strip(f)).not.toContain('sovereign-capability');
    }
  });
});

describe('9–10 · the provider identifiers are the verified ones', () => {
  it('no stale veo-3.1 remains in any executable path', () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.next' || name === '__tests__') continue;
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full, out);
        else if (/\.tsx?$/.test(name)) out.push(full);
      }
      return out;
    };
    const offenders = [...walk(join(ROOT, 'src')), ...walk(join(ROOT, 'app'))]
      .filter((f) => /['"]veo-3\.1['"]/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')))
      .map((f) => f.replace(ROOT, '').replace(/\\/g, '/'));
    expect(offenders).toEqual([]);
  });

  it('the fleet carries veo3.1 and seedance-2.0 exactly as the provider names them, hosted by Magic Hour, verified for image-to-video', () => {
    const veo = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'veo-3-1')!;
    const seedance = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'seedance-2-0')!;
    expect(veo.providerModelId).toBe('veo3.1');
    expect(veo.gatewayId).toBe('magic-hour');
    expect(veo.supportsImageToVideo).toBe(true);
    expect(seedance.providerModelId).toBe('seedance-2.0');
    expect(seedance.supportsImageToVideo).toBe(true);
    // No Grok, anywhere in the fleet.
    expect(VIDEO_MODEL_FLEET.some((m) => /grok/i.test(m.modelId) || /grok/i.test(m.providerModelId))).toBe(false);
  });

  it('an animation intent requires its model and an image-taking model; the selector refuses an inactive one rather than substituting', () => {
    const registry = new SovereignModelRegistry();
    for (const m of VIDEO_MODEL_FLEET) registry.register(m);
    const selector = new SovereignModelSelector(registry, () => null);
    const seedance = selector.select(buildAnimationIntent('slow push in', 'seedance-2-0', 5));
    expect(seedance.selected).toBe(true);
    if (seedance.selected) expect(seedance.selection.providerModelId).toBe('seedance-2.0');
    // Veo is dispatchable but not yet active — its activation is the Veo proof step.
    const veo = selector.select(buildAnimationIntent('slow push in', 'veo-3-1', 5));
    expect(veo.selected).toBe(false);
    if (!veo.selected) expect(veo.reason).toBe('required-model-unavailable');
    // A model that cannot take an image is refused even if active.
    const ltx = selector.select(buildAnimationIntent('slow push in', 'ltx-2-3', 5));
    expect(ltx.selected).toBe(false);
    if (!ltx.selected) expect(ltx.reason).toBe('capability-unavailable');
  });
});

describe('11 · no interface exposes the capability before its production proof', () => {
  it('no page or client component calls the animate boundary or names the capability', () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.next' || name === '__tests__' || name === 'api') continue;
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full, out);
        else if (/\.tsx$/.test(name)) out.push(full);
      }
      return out;
    };
    const ui = [...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'src'))];
    const offenders = ui.filter((f) => {
      const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      return /\/animate['"`]/.test(code) || code.includes('animate-asset');
    }).map((f) => f.replace(ROOT, '').replace(/\\/g, '/'));
    expect(offenders).toEqual([]);
  });
});
