/**
 * AZMA OS — THE MANIFEST IS WHAT RUNS · CONTRACT TESTS, 2026-10-12
 *
 * ─── WHY THESE EXIST ────────────────────────────────────────────────────────
 *
 *   A manifest nobody enforces is a document that will be true on the day it
 *   is written and false on the next. Each `it` here binds one line of
 *   `qiyamah-provider-manifest.ts` to the code that actually executes it: an
 *   adapter constant, a fleet flag, a required-model rule, an endpoint map.
 *
 *   The one that matters most is the POOL test. Image generation has no pin —
 *   it asks the selector, and the selector chooses from whatever is
 *   `productionAuthorized && active`. On 2026-10-12 that pool held exactly one
 *   model, and the server's own logs show a DIFFERENT model dispatched on a
 *   day when it was authorized, at 150 credits instead of 100.
 *
 *   So: authorizing a model without ruling on it in the manifest does not
 *   produce a quiet change in production. It fails this file.
 */

import {
  QIYAMAH_PROVIDER_MANIFEST, manifestFor, QIYAMAH_MANIFEST_VERSION,
} from '../qiyamah-provider-manifest';
import { IMAGE_MODEL_FLEET } from '../image-model-fleet';
import { VIDEO_MODEL_FLEET, QIYAMAH_VIDEO_GENERATION_MODEL } from '../video-model-fleet';
import {
  IMAGE_EDIT_MODEL_ID, UPSCALE_SCALE_FACTOR, UPSCALE_MODE, UPSCALE_FACTORS,
} from '../../core/sovereign-ai-integration/adapters/magic-hour-image-editing';
import {
  CREATIVE_ENDPOINT, LIP_SYNC_GENERATION_MODE, TALKING_PHOTO_GENERATION_MODE,
  FACE_SWAP_STYLE_VERSION, FACE_SWAP_FACE_MODE,
} from '../../core/sovereign-ai-integration/adapters/magic-hour-creative-operations';
import { readFileSync } from 'fs';
import { join } from 'path';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

/** What the selector would really be allowed to choose from, today. */
const authorizedPool = (fleet: typeof IMAGE_MODEL_FLEET) =>
  fleet.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort();

describe('0 · the manifest covers the chamber, and nothing is missing', () => {
  it('every act a Creator can meet has an entry', () => {
    for (const op of [
      'image', 'infographic', 'video', 'edit', 'animate',
      'upscale-2x', 'upscale-4x',
      'background-removal', 'lip-sync', 'face-swap', 'talking-photo',
    ]) {
      expect(manifestFor(op)).toBeDefined();
    }
  });

  it('it carries a version, so a change to it is a change somebody made', () => {
    expect(QIYAMAH_MANIFEST_VERSION).toMatch(/^\d+\.\d+$/);
  });

  it('not one entry claims a model without naming where that is enforced', () => {
    for (const m of QIYAMAH_PROVIDER_MANIFEST) {
      expect(m.enforcedBy.length).toBeGreaterThan(10);
      expect(m.priceAuthority.length).toBeGreaterThan(10);
    }
  });
});

describe('1 · the image pool is pinned, so authorizing a model is a ruling', () => {
  it('the authorized image pool IS the manifest’s candidate set', () => {
    // If someone flips productionAuthorized on another image model, this fails
    // — which is the entire point. The pool and the ruling move together.
    expect(authorizedPool(IMAGE_MODEL_FLEET)).toEqual(manifestFor('image')!.authorizedCandidates);
  });

  it('and the act that must not be substituted is REQUIRED, not merely preferred', () => {
    expect(manifestFor('infographic')!.policy).toBe('required-model');
    expect(read('src/sovereign-model-selection/intent-builder.ts'))
      .toContain("infographic: 'nano-banana-2'");
  });
});

describe('2 · video is required, and the requirement is in the code', () => {
  it('the manifest names the model the generation service demands', () => {
    expect(manifestFor('video')!.providerModelId).toBe(QIYAMAH_VIDEO_GENERATION_MODEL);
  });

  it('and it is passed as a requirement the selector cannot substitute', () => {
    expect(read('src/qiyamah-generation/generation-service.ts'))
      .toContain('requiredModelId: QIYAMAH_VIDEO_GENERATION_MODEL');
    expect(read('src/sovereign-model-selection/sovereign-model-selector.ts'))
      .toContain('pool = authorized.filter((m) => m.modelId === intent.requiredModelId)');
  });

  it('the video pool may hold more than one, which is WHY the requirement exists', () => {
    // Two models are authorized for video. Without the requirement the winner
    // would come from array order — the fleet's own comment says so.
    expect(authorizedPool(VIDEO_MODEL_FLEET).length).toBeGreaterThanOrEqual(1);
    expect(authorizedPool(VIDEO_MODEL_FLEET)).toContain(QIYAMAH_VIDEO_GENERATION_MODEL);
  });
});

describe('3 · animation routes, and its candidate set is pinned too', () => {
  it('only models the fleet marks as image-to-video capable may be offered', () => {
    const offerable = VIDEO_MODEL_FLEET
      .filter((m) => m.productionAuthorized && m.active && m.supportsImageToVideo === true)
      .map((m) => m.modelId).sort();
    expect(offerable).toEqual(manifestFor('animate')!.authorizedCandidates);
  });

  it('and the Creator’s choice is re-filtered by the selector, never trusted', () => {
    expect(read('app/api/vault/assets/[assetId]/animate/route.ts'))
      .toContain('buildAnimationIntent(instruction, modelId, durationSeconds)');
  });
});

describe('4 · the fixed constants are the ones the manifest publishes', () => {
  it('editing', () => {
    expect(manifestFor('edit')!.providerModelId).toBe(IMAGE_EDIT_MODEL_ID);
  });

  it('upscale 2×', () => {
    const m = manifestFor('upscale-2x')!;
    expect(m.sentConfiguration.join(' ')).toContain(`scale_factor: ${UPSCALE_SCALE_FACTOR}`);
    expect(m.sentConfiguration.join(' ')).toContain(UPSCALE_MODE);
  });

  it('upscale 4× exists as its own act, and its price gate is real', () => {
    const four = UPSCALE_FACTORS.find((f) => f.factor === 4)!;
    expect(manifestFor('upscale-4x')).toBeDefined();
    expect(four.providerCredits).toBe(100);
  });

  it('lip sync, talking photo and face swap send what the manifest says', () => {
    expect(manifestFor('lip-sync')!.sentConfiguration.join(' ')).toContain(LIP_SYNC_GENERATION_MODE);
    expect(manifestFor('talking-photo')!.sentConfiguration.join(' ')).toContain(TALKING_PHOTO_GENERATION_MODE);
    const fs = manifestFor('face-swap')!.sentConfiguration.join(' ');
    expect(fs).toContain(FACE_SWAP_STYLE_VERSION);
    expect(fs).toContain(FACE_SWAP_FACE_MODE);
  });

  it('and every creative endpoint matches the adapter’s own map', () => {
    for (const op of ['background-removal', 'lip-sync', 'face-swap', 'talking-photo'] as const) {
      expect(manifestFor(op)!.endpoint).toBe(CREATIVE_ENDPOINT[op]);
    }
  });
});

describe('5 · no silent substitution survives anywhere', () => {
  it('the image binding refuses when no model was selected', () => {
    const adapter = read('src/core/sovereign-ai-integration/adapters/magic-hour-adapter.ts');
    const code = adapter.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).toContain('if (!modelToUse) throw new Error(IMAGE_MODEL_IS_REQUIRED)');
    // The model that was never in the fleet is gone from the executed code.
    expect(code).not.toContain('flux-schnell');
  });

  it('the animation binding refuses when no model was chosen', () => {
    expect(read('src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video.ts'))
      .toContain("if (!options.providerModelId) throw new ImageEditError('SUBMIT_FAILED'");
  });

  it('a model outside the fleet cannot be named by a caller', () => {
    expect(read('src/qiyamah-generation/generation-service.ts'))
      .toContain('const entry = fleet.find((m) => m.modelId === modelId);');
  });
});

describe('6 · the manifest never leaks a provider to a Creator', () => {
  it('no provider or model name appears in the chamber’s own surface', () => {
    const client = read('app/qiyamah-chamber/QiyamahChamberClient.tsx')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const forbidden of ['nano-banana', 'minimax', 'veo3', 'magic-hour', 'flux']) {
      expect(client).not.toContain(forbidden);
    }
  });

  it('and an asset’s identity is never a provider’s', () => {
    // Provenance records the binding; identity is the Vault's own id.
    expect(read('src/vault/sovereign-asset-mutation.ts')).toContain('mutationProviderId');
    expect(read('src/vault/sovereign-asset-mutation.ts')).not.toMatch(/assetId:\s*produced\.provider/);
  });
});
