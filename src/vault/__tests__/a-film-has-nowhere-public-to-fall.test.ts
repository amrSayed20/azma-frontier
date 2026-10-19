/**
 * AZMA OS — BLOCKER C: A FILM HAS NOWHERE PUBLIC TO FALL
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   Anything under `public/` is served by Next.js's own static handler, which
 *   runs BEFORE any route — so the authorisation gate at `app/renders/[...path]`
 *   cannot reach a file sitting there. Measured on production before the gate
 *   existed: 25 finished films belonging to 7 Creators, each downloadable with
 *   no session, and a proxy told to cache them for an hour.
 *
 *   `UPLOADS_DIR` is what keeps films out of that directory. The old code read
 *   its ABSENCE as permission to fall back INTO `public/renders`, so one
 *   forgotten environment variable silently reopened the hole with nothing to
 *   say so. MEASURED on this machine 2026-10-18: a local acceptance walk
 *   produced three real films and every one of them landed in `public/renders`,
 *   which the repository's own gate test forbids — and that test went red.
 *
 *   A boundary that depends on remembering a variable is not a boundary. These
 *   tests pin the asymmetry that replaced it: WRITING fails closed, READING
 *   stays backward compatible.
 */

import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';
import {
  PUBLIC_RENDER_OUTPUT_OPT_IN,
  RenderStorageNotConfiguredError,
  publicRenderOutputAllowed,
  renderOutputDir,
  resolveAssetPath,
} from '../asset-bytes';

const saved = {
  UPLOADS_DIR: process.env.UPLOADS_DIR,
  optIn: process.env[PUBLIC_RENDER_OUTPUT_OPT_IN],
};
let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'azma-storage-'));
  delete process.env.UPLOADS_DIR;
  delete process.env[PUBLIC_RENDER_OUTPUT_OPT_IN];
});
afterEach(() => {
  if (saved.UPLOADS_DIR === undefined) delete process.env.UPLOADS_DIR;
  else process.env.UPLOADS_DIR = saved.UPLOADS_DIR;
  if (saved.optIn === undefined) delete process.env[PUBLIC_RENDER_OUTPUT_OPT_IN];
  else process.env[PUBLIC_RENDER_OUTPUT_OPT_IN] = saved.optIn;
  try { rmSync(root, { recursive: true, force: true }); } catch { /* reclaimed */ }
});

const slash = (p: string) => p.split(sep).join('/');

describe('BLOCKER C — writing a film', () => {
  it('refuses to name a destination when no private root is configured', () => {
    // The whole defect, in one assertion: absence used to mean `public/`.
    expect(() => renderOutputDir()).toThrow(RenderStorageNotConfiguredError);
  });

  it('says what to do, and names no secret', () => {
    let message = '';
    try { renderOutputDir(); } catch (e) { message = (e as Error).message; }
    expect(message).toContain('UPLOADS_DIR');
    expect(message).toContain(PUBLIC_RENDER_OUTPUT_OPT_IN);
    expect(message).not.toMatch(/password|token|secret|key=/i);
  });

  it('writes beneath the configured private root', () => {
    process.env.UPLOADS_DIR = root;
    expect(slash(renderOutputDir())).toBe(slash(join(root, 'renders')));
    expect(slash(renderOutputDir())).not.toContain('/public/');
  });

  it('serves a public destination ONLY when a host has said so explicitly', () => {
    expect(publicRenderOutputAllowed()).toBe(false);
    process.env[PUBLIC_RENDER_OUTPUT_OPT_IN] = '1';
    expect(publicRenderOutputAllowed()).toBe(true);
    expect(slash(renderOutputDir())).toContain('/public/renders');
  });

  it('prefers the private root even when the public mode is also on', () => {
    // Belt and braces: an opt-in left over from local work must never divert a
    // configured production host into public serving.
    process.env.UPLOADS_DIR = root;
    process.env[PUBLIC_RENDER_OUTPUT_OPT_IN] = '1';
    expect(slash(renderOutputDir())).toBe(slash(join(root, 'renders')));
  });
});

describe('BLOCKER C — reading a film is NOT symmetric', () => {
  it('resolves the protected copy when the film is where it belongs', () => {
    process.env.UPLOADS_DIR = root;
    mkdirSync(join(root, 'renders'), { recursive: true });
    writeFileSync(join(root, 'renders', 'f.mp4'), 'x');
    expect(slash(resolveAssetPath('/renders/f.mp4'))).toBe(slash(join(root, 'renders', 'f.mp4')));
  });

  it('still finds a film a legacy deployment left under public/', () => {
    // The 28 films already on production, and anything older. Refusing to READ
    // them would destroy access to real Creators' work in the name of
    // protecting it — and the gate still stands in front of every read.
    //
    // `process.cwd()` is redirected rather than writing into the repository's
    // own public/: a test that creates that directory races every test —
    // including the render gate's — that asserts its absence. It did, and both
    // went red at once.
    process.env.UPLOADS_DIR = root;
    const fakeCwd = join(root, 'app-root');
    const legacy = join(fakeCwd, 'public', 'renders');
    mkdirSync(legacy, { recursive: true });
    writeFileSync(join(legacy, 'old.mp4'), 'x');
    const cwd = jest.spyOn(process, 'cwd').mockReturnValue(fakeCwd);
    try {
      expect(slash(resolveAssetPath('/renders/old.mp4'))).toBe(slash(join(legacy, 'old.mp4')));
    } finally {
      cwd.mockRestore();
    }
  });

  it('names the protected path for a film that does not exist yet', () => {
    // So a caller about to create one is never pointed at public/.
    process.env.UPLOADS_DIR = root;
    expect(slash(resolveAssetPath('/renders/not-yet.mp4')))
      .toBe(slash(join(root, 'renders', 'not-yet.mp4')));
  });

  it('leaves uploads and generated assets resolving exactly as before', () => {
    process.env.UPLOADS_DIR = root;
    expect(slash(resolveAssetPath('/uploads/a.png'))).toBe(slash(join(root, 'a.png')));
    expect(slash(resolveAssetPath('/generated-assets/b.mp4')))
      .toBe(slash(join(root, 'generated-assets', 'b.mp4')));
  });
});

describe('BLOCKER C — the repository itself', () => {
  it('ships no film directory under public/', () => {
    // The same condition the render gate asserts, kept here too because this
    // is the module that decides where a film goes.
    expect(existsSync(join(process.cwd(), 'public', 'renders'))).toBe(false);
  });
});
