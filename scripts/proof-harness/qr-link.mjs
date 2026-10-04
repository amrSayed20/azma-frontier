/**
 * Read the live QR and emit its Telegram login LINK as text.
 *
 * MEASURED 2026-10-04: «لا يظهر لى» then «الصوره كبيره جدا» then «اصغر من
 * ذلك بكثير». A 37-module code cannot be drawn in fewer than 45 columns, so
 * the size was never going to shrink enough — the QR itself was the wrong
 * carrier. `tg://login?token=…` tapped on a phone opens Telegram directly and
 * needs no camera at all.
 *
 * The token is the Creator's own, authorizes only the browser that minted it,
 * and expires in well under a minute. It is printed once and never stored.
 */
import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';
import jsQR from 'jsqr';

const buf = readFileSync(process.argv[2] ?? 'scripts/proof-harness/tg-qr-live.png');
let off = 8, width = 0, height = 0, color = 0;
const idat = [];
while (off < buf.length) {
  const len = buf.readUInt32BE(off);
  const type = buf.toString('ascii', off + 4, off + 8);
  const data = buf.subarray(off + 8, off + 8 + len);
  if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); color = data[9]; }
  else if (type === 'IDAT') idat.push(data);
  else if (type === 'IEND') break;
  off += 12 + len;
}
const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[color];
const raw = inflateSync(Buffer.concat(idat));
const stride = width * bpp;
const px = Buffer.alloc(height * stride);
let p = 0;
for (let y = 0; y < height; y += 1) {
  const f = raw[p]; p += 1;
  for (let i = 0; i < stride; i += 1) {
    const x = raw[p + i];
    const a = i >= bpp ? px[y * stride + i - bpp] : 0;
    const b = y > 0 ? px[(y - 1) * stride + i] : 0;
    const c = (i >= bpp && y > 0) ? px[(y - 1) * stride + i - bpp] : 0;
    let v;
    if (f === 0) v = x; else if (f === 1) v = x + a; else if (f === 2) v = x + b;
    else if (f === 3) v = x + ((a + b) >> 1);
    else { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
           v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
    px[y * stride + i] = v & 0xff;
  }
  p += stride;
}
const rgba = new Uint8ClampedArray(width * height * 4);
for (let i = 0; i < width * height; i += 1) {
  const g = px[i * bpp];
  rgba[i * 4] = g; rgba[i * 4 + 1] = px[i * bpp + (bpp > 2 ? 1 : 0)];
  rgba[i * 4 + 2] = px[i * bpp + (bpp > 2 ? 2 : 0)]; rgba[i * 4 + 3] = 255;
}
const found = jsQR(rgba, width, height);
if (!found) { console.log('DECODE_FAILED'); process.exit(1); }
console.log(found.data);
