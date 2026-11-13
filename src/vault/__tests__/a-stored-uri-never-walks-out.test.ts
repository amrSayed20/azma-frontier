/**
 * A STORED URI NEVER WALKS OUT OF THE UPLOADS ROOT.
 *
 * ─── WHAT THE SCAN FOUND, AND WHAT READING IT FOUND ─────────────────────────
 *
 *   A static scan flagged 48 filesystem paths built from variables. Forty-seven
 *   were fine. The forty-eighth was the generation DELETE road, which joined
 *   the WHOLE stored URL:
 *
 *       const filePath = path.join(uploadsDir(), record.assetUrl);
 *
 *   under a comment reasoning that «Node.js joins, not resolves». That
 *   reasoning is wrong — `path.join` NORMALISES, so `..` inside the stored
 *   value walks out of the root, and the next call is `unlink`.
 *
 *   NOTHING CAN REACH IT TODAY: `assetUrl` is minted by this Empire, never by
 *   a Creator, and the record is read scoped to its owner. It is a confinement
 *   gap, not a live hole — and it is recorded as exactly that rather than as
 *   a breach, because overstating a finding is its own kind of false report.
 *
 *   What makes it worth closing is consistency: FOUR other roads turn a stored
 *   URI into a path and all four take the leaf first. One road that trusts the
 *   string is the one a reader cannot audit by reading.
 *
 * ─── WHY THE GUARD READS SOURCE ─────────────────────────────────────────────
 *
 *   The rule is «never hand a filesystem call a stored string whole». That is
 *   a property of how the code is WRITTEN — no runtime test can observe it
 *   without a hostile row in the database, which this Empire will not create
 *   to prove a point.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/**
 * What RUNS, not what is explained. The first draft of this guard failed on
 * the repair's own comment, which quotes the shape it removed — a guard that
 * cannot tell a quotation from a call would force every fix to go
 * undocumented in order to stay green.
 */
const code = (p: string) =>
  read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Every road that turns a stored URI into a path on this host. */
const ROADS = [
  'app/api/qiyamah/generations/[recordId]/route.ts',
  'app/api/vault/assets/[assetId]/route.ts',
  'app/api/vault/assets/[assetId]/animate/route.ts',
  'app/api/vault/assets/[assetId]/upscale/route.ts',
  'src/qiyamah-generation/image-edit-service.ts',
];

describe('a stored URI never walks out of the uploads root', () => {
  it('no road joins a whole stored URL onto the uploads root', () => {
    // The exact shape that was there. `join` normalises, so this walks.
    for (const road of ROADS) {
      expect(code(road)).not.toMatch(/join\(\s*uploadsDir\(\)\s*,\s*(record|asset|deleted)\.\w*[Uu]r[il]\s*\)/);
    }
  });

  it('every one of them takes the leaf first', () => {
    for (const road of ROADS) {
      expect(code(road)).toMatch(/basename\(/);
    }
  });

  it('and the delete road still reaches a generated asset, not a stray leaf', () => {
    // A BARE basename would have been the wrong repair: it drops the
    // `generated-assets` directory, unlinks a path that does not exist, and
    // leaves the file behind while the record says it is gone.
    const road = code('app/api/qiyamah/generations/[recordId]/route.ts');
    expect(road).toContain("startsWith('/generated-assets/')");
    expect(road).toContain("join(uploadsDir(), 'generated-assets', leaf)");
  });
});
