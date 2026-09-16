/**
 * AZMA OS — SECURITY REGRESSION: an upload is what its bytes say it is.
 *
 * Every case below is the shape of the attack the audit traced, or a real file
 * a Creator would legitimately send. The chain that was open ran:
 *
 *   open signup → upload arbitrary bytes labelled image/avif → served publicly
 *   → unauthenticated /_next/image → sharp/libheif decodes attacker bytes
 *
 * These tests hold the second link shut. If a future edit goes back to reading
 * `file.type`, the mismatch cases below fail.
 */

import {
  validateUploadContent,
  rejectionSpokenAr,
  extensionOf,
  MAX_UPLOAD_BYTES,
} from '../upload-content-validation';

/** Real leading bytes of each container. */
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const GIF = Buffer.from([...Buffer.from('GIF89a'), 0x01, 0x00, 0x01, 0x00]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x1a, 0, 0, 0]), Buffer.from('WEBP'), Buffer.from('VP8 ')]);
const WAV = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x1a, 0, 0, 0]), Buffer.from('WAVE'), Buffer.from('fmt ')]);
const MP3 = Buffer.from([...Buffer.from('ID3'), 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const WEBM = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00]);

/** ISO-BMFF container with a chosen brand at byte 8. */
function isoBmff(brand: string): Buffer {
  return Buffer.concat([
    Buffer.from([0, 0, 0, 0x20]),
    Buffer.from('ftyp'),
    Buffer.from(brand.padEnd(4, ' ').slice(0, 4)),
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('mdat'),
  ]);
}

const AVIF = isoBmff('avif');
const HEIC = isoBmff('heic');
const MP4 = isoBmff('isom');
const MOV = isoBmff('qt  ');

describe('upload content validation — the format is read, never declared', () => {
  describe('legitimate files a Creator really sends', () => {
    const accepted: Array<[string, Buffer, string, string, string]> = [
      ['PNG',  PNG,  'image/png',  'photo.png',  'image/png'],
      ['JPEG', JPEG, 'image/jpeg', 'photo.jpg',  'image/jpeg'],
      ['JPEG (.jpeg spelling)', JPEG, 'image/jpeg', 'photo.jpeg', 'image/jpeg'],
      ['GIF',  GIF,  'image/gif',  'loop.gif',   'image/gif'],
      ['WebP', WEBP, 'image/webp', 'art.webp',   'image/webp'],
      ['WAV',  WAV,  'audio/wav',  'voice.wav',  'audio/wav'],
      ['MP3',  MP3,  'audio/mpeg', 'voice.mp3',  'audio/mpeg'],
      ['MP4',  MP4,  'video/mp4',  'clip.mp4',   'video/mp4'],
      ['MOV',  MOV,  'video/quicktime', 'clip.mov', 'video/quicktime'],
      ['WebM', WEBM, 'video/webm', 'clip.webm',  'video/webm'],
    ];

    for (const [label, bytes, declared, name, expected] of accepted) {
      it(`accepts a real ${label}`, () => {
        const outcome = validateUploadContent(bytes, declared, name);
        expect(outcome.ok).toBe(true);
        if (outcome.ok) expect(outcome.identity.mimeType).toBe(expected);
      });
    }

    it('accepts a file with no extension and supplies the right one', () => {
      const outcome = validateUploadContent(PNG, 'image/png', 'screenshot');
      expect(outcome.ok).toBe(true);
      if (outcome.ok) expect(outcome.identity.extension).toBe('.png');
    });

    it('accepts real UTF-8 text, including Arabic', () => {
      const outcome = validateUploadContent(
        Buffer.from('السؤال: قصة صاحب الحوت\n\nنصٌّ محفوظ.', 'utf-8'),
        'text/plain',
        'evidence.txt',
      );
      expect(outcome.ok).toBe(true);
      if (outcome.ok) expect(outcome.identity.mimeType).toBe('text/plain');
    });
  });

  describe('THE ATTACK — bytes that lie about themselves', () => {
    it('refuses arbitrary bytes declared as an image (the exact audited case)', () => {
      const payload = Buffer.from('\x00\x01\x02NOT-AN-IMAGE-AT-ALL\xff\xfe', 'binary');
      const outcome = validateUploadContent(payload, 'image/avif', 'evil.avif');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).not.toBe('extension-mismatch');
    });

    it('refuses an executable renamed to .png and declared image/png', () => {
      // MZ — a Windows executable header.
      const outcome = validateUploadContent(Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03]), 'image/png', 'harmless.png');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('unrecognised-content');
    });

    it('refuses a real PNG declared as a video — families must agree', () => {
      const outcome = validateUploadContent(PNG, 'video/mp4', 'movie.mp4');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('declared-type-mismatch');
    });

    it('refuses a real PNG named .jpg — the name must agree too', () => {
      const outcome = validateUploadContent(PNG, 'image/png', 'photo.jpg');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('extension-mismatch');
    });

    it('refuses a script disguised as text/plain by its control bytes', () => {
      const outcome = validateUploadContent(Buffer.from([0x00, 0x01, 0x02, 0x03]), 'text/plain', 'notes.txt');
      expect(outcome.ok).toBe(false);
    });
  });

  describe('decoders the Empire refuses to expose', () => {
    it('refuses AVIF — the format that reaches libheif', () => {
      const outcome = validateUploadContent(AVIF, 'image/avif', 'photo.avif');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('unsupported-format');
    });

    it('refuses HEIC for the same reason', () => {
      const outcome = validateUploadContent(HEIC, 'image/heic', 'photo.heic');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('unsupported-format');
    });

    it('refuses AVIF even when it lies about being an MP4', () => {
      // The brand is what separates them; a liar cannot hide behind the name.
      const outcome = validateUploadContent(AVIF, 'video/mp4', 'clip.mp4');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('unsupported-format');
    });

    it('refuses SVG — a document that executes, not a picture', () => {
      const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'utf-8');
      const outcome = validateUploadContent(svg, 'image/svg+xml', 'logo.svg');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('unsupported-format');
    });

    it('refuses SVG hidden behind an XML declaration', () => {
      const svg = Buffer.from('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'utf-8');
      const outcome = validateUploadContent(svg, 'image/svg+xml', 'logo.svg');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('unsupported-format');
    });
  });

  describe('boundaries', () => {
    it('refuses an empty file', () => {
      const outcome = validateUploadContent(Buffer.alloc(0), 'image/png', 'empty.png');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('empty-file');
    });

    it('refuses a file over the ceiling before reading it as anything', () => {
      const huge = Buffer.concat([PNG, Buffer.alloc(MAX_UPLOAD_BYTES + 1)]);
      const outcome = validateUploadContent(huge, 'image/png', 'huge.png');
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) expect(outcome.rejection).toBe('file-too-large');
    });

    it('refuses bytes too short to identify', () => {
      const outcome = validateUploadContent(Buffer.from([0x89]), 'image/png', 'tiny.png');
      expect(outcome.ok).toBe(false);
    });

    it('reads extensions case-insensitively', () => {
      expect(extensionOf('PHOTO.PNG')).toBe('.png');
      const outcome = validateUploadContent(PNG, 'image/png', 'PHOTO.PNG');
      expect(outcome.ok).toBe(true);
    });
  });

  describe('what the Creator is told', () => {
    const rejections = [
      'empty-file', 'file-too-large', 'unrecognised-content',
      'unsupported-format', 'declared-type-mismatch', 'extension-mismatch',
    ] as const;

    for (const rejection of rejections) {
      it(`speaks '${rejection}' in the Creator's tongue, naming no machinery`, () => {
        const spoken = rejectionSpokenAr(rejection);
        expect(/[؀-ۿ]/.test(spoken)).toBe(true);
        // No decoder, library, advisory or signature table is ever named.
        expect(spoken).not.toMatch(/sharp|libheif|libvips|GHSA|CVE|magic|signature/i);
      });
    }
  });
});
