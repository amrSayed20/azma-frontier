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

/**
 * An MP4's `tkhd`, built the way the standard lays it out — because this is
 * the one format the suite had no fixture for, and the one whose offset was
 * wrong. A crafted fixture can only encode its author's own reading, so the
 * real proof stands beside it: `cinematic-real-render.test.ts` asks this same
 * function for the size of four films this Empire actually encoded and
 * compares the answer with ffprobe's.
 *
 * `rotate` writes the quarter-turn matrix a phone camera writes: a=d=0, so the
 * stored landscape box is presented portrait and the axes must be swapped.
 */
function mp4(w: number, h: number, opts: { rotate?: boolean; version?: 0 | 1 } = {}): Uint8Array {
  const version = opts.version ?? 0;
  const timesLen = version === 1 ? 32 : 20;           // times + track_ID + reserved + duration
  const tkhdLen = 4 + timesLen + 16 + 36 + 8;         // + layer/group/volume + matrix + w/h
  const parts: Buffer[] = [];
  const box = (type: string, payload: Buffer) => {
    const b = Buffer.alloc(8 + payload.length);
    b.writeUInt32BE(8 + payload.length, 0);
    b.write(type, 4, 'ascii');
    payload.copy(b, 8);
    return b;
  };

  const tkhd = Buffer.alloc(tkhdLen);
  tkhd.writeUInt8(version, 0);                        // version, then 3 flag bytes
  const matrixAt = 4 + timesLen + 16;
  const unity = 0x00010000;
  if (opts.rotate) {
    tkhd.writeUInt32BE(0, matrixAt);                  // a = 0
    tkhd.writeUInt32BE(unity, matrixAt + 4);          // b = 1
    tkhd.writeInt32BE(-unity, matrixAt + 12);         // c = -1
    tkhd.writeUInt32BE(0, matrixAt + 16);             // d = 0
  } else {
    tkhd.writeUInt32BE(unity, matrixAt);              // a = 1
    tkhd.writeUInt32BE(unity, matrixAt + 16);         // d = 1
  }
  tkhd.writeUInt32BE(0x40000000, matrixAt + 32);      // the fixed last entry
  tkhd.writeUInt32BE(w * 65536, matrixAt + 36);
  tkhd.writeUInt32BE(h * 65536, matrixAt + 40);

  // An audio track first, with a zero-sized tkhd, exactly as a real film has.
  const silentTkhd = Buffer.alloc(tkhdLen);
  silentTkhd.writeUInt8(version, 0);
  const moov = box('moov', Buffer.concat([
    box('trak', box('tkhd', silentTkhd)),
    box('trak', box('tkhd', tkhd)),
  ]));
  const ftyp = box('ftyp', Buffer.from('isomiso2avc1mp41', 'ascii'));
  parts.push(ftyp, moov);
  return Buffer.concat(parts);
}

it("a film's own box says its size — the format whose offset was four bytes early", () => {
  // MEASURED before this test existed: the Vault held 1080x16384 for a
  // 1080x1350 film and 1920x16384 for a 1920x1080 one. 16384 is 0x40000000 in
  // 2.30 — the matrix's last entry, read where `width` should have been.
  expect(readDimensions(mp4(1920, 1080))).toEqual({ width: 1920, height: 1080 });
  expect(readDimensions(mp4(1080, 1920))).toEqual({ width: 1080, height: 1920 });
  expect(readDimensions(mp4(1080, 1350))).toEqual({ width: 1080, height: 1350 });
  expect(readDimensions(mp4(1080, 1080))).toEqual({ width: 1080, height: 1080 });
});

it('a version 1 box is read at its own wider offsets', () => {
  expect(readDimensions(mp4(1080, 1350, { version: 1 }))).toEqual({ width: 1080, height: 1350 });
});

it('a quarter-turn matrix still swaps the axes — the rule that was firing on every film', () => {
  // The swap itself is right and must survive: a phone stores a portrait
  // recording as a landscape box with a rotating matrix. What was wrong was
  // that two zeroed words made EVERY film look rotated.
  expect(readDimensions(mp4(1920, 1080, { rotate: true }))).toEqual({ width: 1080, height: 1920 });
  expect(readDimensions(mp4(1080, 1350))).toEqual({ width: 1080, height: 1350 });
});

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
