/**
 * AZMA OS — an asset knows its own size, 2026-09-29.
 *
 *   `platform-adapter.ts` takes exactly one input — the master's aspect ratio
 *   — and nothing in the Empire recorded a pixel size. These are the rules
 *   that close that gap, each held to real bytes rather than to prose.
 */

import { readDimensions, detectFormat } from '../read-dimensions';
import { toAspectRatio } from '../aspect-ratio';
import { assessMasterAdaptability } from '../../sovereign-model-selection/platform-adapter';

// ── Real headers, byte for byte ───────────────────────────────────────────
function png(w: number, h: number): Uint8Array {
  const b = Buffer.alloc(24);
  // The FULL 8-byte signature. MEASURED 2026-09-29: this fixture wrote only
  // `0x89 P N G` and the old private detector accepted it — a file that is not
  // a PNG. The Vault's signature table refused it the moment this module
  // started asking the Empire's one authority instead of its own.
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
}

function jpeg(w: number, h: number): Uint8Array {
  // SOI, an APP0 to be skipped over, then SOF0 carrying height then width.
  const b = Buffer.alloc(30);
  b.writeUInt16BE(0xffd8, 0);
  b.writeUInt16BE(0xffe0, 2); b.writeUInt16BE(6, 4); // APP0, length 6
  b.writeUInt16BE(0xffc0, 10); b.writeUInt16BE(11, 12);
  b.writeUInt8(8, 14);
  b.writeUInt16BE(h, 15); b.writeUInt16BE(w, 17);
  return b;
}

function gif(w: number, h: number): Uint8Array {
  const b = Buffer.alloc(13);
  b.write('GIF89a', 0, 'ascii');
  b.writeUInt16LE(w, 6); b.writeUInt16LE(h, 8);
  return b;
}

it('reads a size out of the bytes themselves, in every format the Empire stores', () => {
  expect(readDimensions(png(1920, 1080))).toEqual({ width: 1920, height: 1080 });
  expect(readDimensions(jpeg(1080, 1350))).toEqual({ width: 1080, height: 1350 });
  expect(readDimensions(gif(600, 600))).toEqual({ width: 600, height: 600 });
});

it('a JPEG\'s size is found past the markers that are not frame headers', () => {
  // A parser that trusted the 0xC0..0xCF range alone would read a Huffman
  // table (0xC4) as a frame and return two bytes of a coefficient as a size.
  const b = Buffer.alloc(40);
  b.writeUInt16BE(0xffd8, 0);
  b.writeUInt16BE(0xffc4, 2); b.writeUInt16BE(8, 4);   // DHT — not a frame
  b.writeUInt16BE(0xffc0, 12); b.writeUInt16BE(11, 14);
  b.writeUInt8(8, 16);
  b.writeUInt16BE(720, 17); b.writeUInt16BE(1280, 19);
  expect(readDimensions(b)).toEqual({ width: 1280, height: 720 });
});

it('bytes that cannot say return null, never a guess and never zero', () => {
  expect(detectFormat(Buffer.from('not a picture at all'))).toBeNull();
  expect(readDimensions(Buffer.from('not a picture at all'))).toBeNull();
  expect(readDimensions(png(0, 1080))).toBeNull();
  expect(readDimensions(Buffer.alloc(0))).toBeNull();
});

it('a size becomes the exact word the platform adapter compares against', () => {
  // The adapter tests `masterAspectRatio === targetAspectRatio` on strings, so
  // 1920×1080 must arrive as the same characters YouTube's entry carries.
  expect(toAspectRatio({ width: 1920, height: 1080 })).toBe('16:9');
  expect(toAspectRatio({ width: 1080, height: 1920 })).toBe('9:16');
  expect(toAspectRatio({ width: 1024, height: 1024 })).toBe('1:1');
});

it('an encoder\'s rounding is still the family it plainly belongs to', () => {
  // 1918×1080 reduces to 959:540 — a true ratio and a useless word, which
  // would have offered a Creator a paid regeneration they do not need.
  expect(toAspectRatio({ width: 1918, height: 1080 })).toBe('16:9');
});

it('and a shape the Empire has no name for keeps its own true ratio', () => {
  expect(toAspectRatio({ width: 1000, height: 300 })).toBe('10:3');
  expect(toAspectRatio(null)).toBeNull();
});

it('the measured ratio drives the adapter to the Founder\'s three verdicts', () => {
  // This is the connection the whole package exists to make.
  const landscape = toAspectRatio({ width: 1920, height: 1080 })!;
  expect(assessMasterAdaptability(landscape, '16:9')).toBe('direct-reuse');
  expect(assessMasterAdaptability(landscape, '4:3')).toBe('crop-adapt');
  expect(assessMasterAdaptability(landscape, '9:16')).toBe('regenerate-required');
});
