/**
 * AZMA OS — A FILM THE EMPIRE RENDERED IS AN ASSET LIKE ANY OTHER, 2026-10-12.
 *
 * FOUND ON PRODUCTION, by the acceptance campaign's first lip-sync job: the
 * resolver knew `/uploads/` and `/generated-assets/` and not `/renders/`, so
 * every finished film fell through to a path nothing ever wrote to. The
 * Creator was told «an input's bytes are not on the server» about a file that
 * was on the server — and no creative act, edit, upscale or animation could
 * touch a film this Empire produced.
 *
 * One `it` per claim, and each one is about the WRITERS' rule, not about this
 * module's own prose.
 */

import { resolveAssetPath } from '../asset-bytes';

/** Windows gives back backslashes; the rule under test is the FOLDER. */
const SEP = String.fromCharCode(92);

const saved = process.env.UPLOADS_DIR;
afterEach(() => {
  if (saved === undefined) delete process.env.UPLOADS_DIR;
  else process.env.UPLOADS_DIR = saved;
});

describe('every address the Empire writes, the Vault can read back', () => {
  beforeEach(() => { process.env.UPLOADS_DIR = '/var/www/azma-uploads'; });

  it('an upload resolves beside the other uploads', () => {
    expect(resolveAssetPath('/uploads/a.png').split(SEP).join('/'))
      .toBe('/var/www/azma-uploads/a.png');
  });

  it('a generated asset resolves into its own folder', () => {
    expect(resolveAssetPath('/generated-assets/b.mp4').split(SEP).join('/'))
      .toBe('/var/www/azma-uploads/generated-assets/b.mp4');
  });

  it('A RENDERED FILM RESOLVES WHERE THE ENCODER PUT IT', () => {
    // `cinematic-ffmpeg-encoder.ts` → rendersDir() → $UPLOADS_DIR/renders
    expect(resolveAssetPath('/renders/op_render_1790587866650_b0sd94fm.mp4').split(SEP).join('/'))
      .toBe('/var/www/azma-uploads/renders/op_render_1790587866650_b0sd94fm.mp4');
  });

  it('and it does NOT fall through to the legacy public path', () => {
    expect(resolveAssetPath('/renders/x.mp4')).not.toMatch(/public/);
  });

  it('with no UPLOADS_DIR, renders follow the same local convention as the rest', () => {
    delete process.env.UPLOADS_DIR;
    const p = resolveAssetPath('/renders/x.mp4').split(SEP).join('/');
    expect(p.endsWith('public/renders/x.mp4')).toBe(true);
  });

  it('an address the Empire never writes still has a last resort', () => {
    expect(resolveAssetPath('/something-else/x.bin')).toMatch(/something-else/);
  });
});
