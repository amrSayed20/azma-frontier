/**
 * Redraw the live QR image as TEXT — no browser, no dependency.
 *
 * MEASURED 2026-10-04: «لا يظهر لى». The image reached the Creator and
 * rendered nowhere, and a second attempt that drove a headless browser to read
 * the pixels simply hung. A proof that cannot deliver its own QR is not a
 * proof, so the PNG is decoded here with node's own zlib.
 *
 * It does NOT decode the QR payload — it re-renders the same modules as
 * characters. No token is read, printed or stored.
 */
import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';

const buf = readFileSync(process.argv[2] ?? 'scripts/proof-harness/tg-qr-live.png');
let off = 8, width = 0, height = 0, depth = 0, color = 0;
const idat = [];
while (off < buf.length) {
  const len = buf.readUInt32BE(off);
  const type = buf.toString('ascii', off + 4, off + 8);
  const data = buf.subarray(off + 8, off + 8 + len);
  if (type === 'IHDR') {
    width = data.readUInt32BE(0); height = data.readUInt32BE(4);
    depth = data[8]; color = data[9];
  } else if (type === 'IDAT') idat.push(data);
  else if (type === 'IEND') break;
  off += 12 + len;
}
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color];
if (!CHANNELS || depth !== 8) { console.log(`UNSUPPORTED depth=${depth} color=${color}`); process.exit(1); }

const raw = inflateSync(Buffer.concat(idat));
const bpp = CHANNELS;
const stride = width * bpp;
const px = Buffer.alloc(height * stride);
let p = 0;
for (let y = 0; y < height; y += 1) {
  const filter = raw[p]; p += 1;
  for (let i = 0; i < stride; i += 1) {
    const x = raw[p + i];
    const a = i >= bpp ? px[y * stride + i - bpp] : 0;
    const b = y > 0 ? px[(y - 1) * stride + i] : 0;
    const c = (i >= bpp && y > 0) ? px[(y - 1) * stride + i - bpp] : 0;
    let v;
    if (filter === 0) v = x;
    else if (filter === 1) v = x + a;
    else if (filter === 2) v = x + b;
    else if (filter === 3) v = x + ((a + b) >> 1);
    else {
      const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
      v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
    }
    px[y * stride + i] = v & 0xff;
  }
  p += stride;
}
const dark = (x, y) => px[y * stride + x * bpp] < 128;

// ── THE GRID, RECOVERED FROM THE FINDER ROW ITSELF ──────────────────────
//   The first attempt anchored the scan to the image's global dark bounding
//   box, and that box's left edge came from an artefact row elsewhere in the
//   screenshot — so the scan began on a light pixel, the run measured zero,
//   and the module size divided to Infinity. The anchor must be the first
//   dark pixel OF THE FINDER ROW, not of the image.
let fy = -1, fx = -1, run = 0, lastDark = -1;
for (let y = 0; y < height && fy < 0; y += 1) {
  let x = 0;
  while (x < width && !dark(x, y)) x += 1;
  if (x >= width) continue;
  let r = 0;
  while (x + r < width && dark(x + r, y)) r += 1;
  if (r < 5) continue;                 // a stray pixel, not a finder bar
  let last = width - 1;
  while (last > x && !dark(last, y)) last -= 1;
  fy = y; fx = x; run = r; lastDark = last;
}
if (fy < 0) { console.log('FINDER_NOT_FOUND'); process.exit(1); }
const mod = run / 7;                   // the finder's outer bar is 7 modules
const n = Math.round((lastDark - fx + 1) / mod);
if (!Number.isFinite(mod) || mod <= 0 || n < 21) { console.log('GRID_NOT_RECOVERED'); process.exit(1); }
const x0 = fx, y0 = fy;

// ── PRINTED COMPACT, FOR A SCREEN THAT MUST NOT WRAP IT ─────────────────
//   MEASURED 2026-10-04: «الصوره كبيره جدا». Two characters per module made
//   the code 90 columns wide, and a QR that wraps is a QR that cannot be
//   scanned. Half-block characters carry TWO module rows in one text row, and
//   one module per column — so each cell is about as wide as it is tall, and
//   the whole code is 45 columns instead of 90.
//
//   Drawn for a DARK screen: the foreground block is a LIGHT module.
const Q = 4;
const total = n + Q * 2;
const at = (col, row) => {
  if (col < Q || row < Q || col >= n + Q || row >= n + Q) return false;   // quiet zone
  return dark(Math.round(x0 + (col - Q + 0.5) * mod), Math.round(y0 + (row - Q + 0.5) * mod));
};
const lines = [];
for (let row = 0; row < total; row += 2) {
  let s = '';
  for (let col = 0; col < total; col += 1) {
    const top = !at(col, row);                       // true = light
    const bot = row + 1 < total ? !at(col, row + 1) : true;
    s += top && bot ? '█' : top ? '▀' : bot ? '▄' : ' ';
  }
  lines.push(s);
}
console.error(`IHDR ${width}x${height} color=${color} | MODULES=${n} MODULE_PX=${mod.toFixed(2)} | ${total}x${lines.length} chars`);
console.log(lines.join(String.fromCharCode(10)));
