/**
 * AZMA OS — SECURITY REGRESSION: the Palace shows nobody another Creator's work.
 *
 * ─── WHAT WAS REPORTED, AND WHAT IT ACTUALLY WAS ────────────────────────────
 *
 *   The Founder signed into a brand-new Google account and said:
 *   «وجدت داخل الخزانه اصلان لا ينتميان الى هذا الحساب».
 *
 *   The server was not wrong. MEASURED at the same moment:
 *
 *       GET /api/vault/assets  (new account's real session)  ->  0 assets
 *       vault_assets ownership: 44 / 8 to the two older accounts,
 *                               0 to both Google accounts,
 *                               0 rows owned by nobody
 *
 *   The leak was entirely inside the browser. `azma.palace.treasures` was keyed
 *   by vaultId and by NOTHING ELSE, so whatever any Creator had carried through
 *   the Hujjah transfer ceremony on that device stayed there, and the Palace
 *   merged it into whatever the next person saw.
 *
 *   No server-side test could have found this, which is the lesson worth
 *   keeping: a tenant boundary that holds in the database can still be crossed
 *   on the device, and to the Creator the two are indistinguishable — the
 *   Empire simply handed them somebody else's work.
 *
 * ─── WHY THIS TEST READS THE SOURCE ─────────────────────────────────────────
 *
 *   The functions are module-private to a client component. What must never
 *   return is the un-owned KEY, so the key is what is asserted on.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE = readFileSync(join(process.cwd(), 'app/sovereign-vault-palace/page.tsx'), 'utf8');
/** Comments explain the defect by name; they are not the code. */
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('the Palace store belongs to one Creator', () => {
  it('never reads or writes an un-owned key', () => {
    // The literal that leaked. It may appear only as the prefix constant and
    // in the purge that removes the old store.
    const bareKeyUses = CODE.match(/localStorage\.(get|set)Item\(\s*['"]azma\.palace\.treasures['"]/g) ?? [];
    expect(bareKeyUses).toHaveLength(0);
  });

  it('composes the key from the creator id', () => {
    expect(CODE).toMatch(/\$\{PALACE_KEY_PREFIX\}\.\$\{creatorId\}/);
  });

  it('reads NOTHING when the identity is not yet known', () => {
    // palaceKey returns null without a creatorId, and both accessors return
    // early on null — so an unidentified visitor inherits nothing.
    expect(CODE).toMatch(/function palaceKey\(creatorId: string \| null\)[\s\S]{0,120}creatorId \?/);
    expect(CODE).toMatch(/function readPalace\([\s\S]{0,200}if \(!key\) return \{\};/);
    expect(CODE).toMatch(/function writePalace\([\s\S]{0,200}if \(!key\) return;/);
  });

  it('asks the server who is here — never a client-held identity', () => {
    expect(CODE).toContain("fetch('/api/auth/me')");
  });

  it('purges the old un-owned store', () => {
    expect(CODE).toMatch(/localStorage\.removeItem\(PALACE_KEY_PREFIX\)/);
    expect(CODE).toContain('purgeUnownedPalace();');
  });

  it('does not paint the store before the identity arrives', () => {
    // The original did `setTreasures(readPalace())` synchronously, so a new
    // Creator saw the previous one's treasures before any fetch resolved.
    expect(CODE).not.toMatch(/setTreasures\(\s*stored\s*\)/);
    expect(CODE).toMatch(/identityPromise\.then\(\(id\) => \{[\s\S]{0,160}setTreasures\(readPalace\(id\)\)/);
  });

  it('every remaining call site carries an owner', () => {
    const calls = CODE.match(/(readPalace|writePalace|depositToVault)\(/g) ?? [];
    expect(calls.length).toBeGreaterThan(0);
    // No call may be made with an empty argument list.
    expect(CODE).not.toMatch(/(readPalace|writePalace|depositToVault)\(\s*\)/);
  });
});

describe('the Palace remembers one Creator at a time', () => {
  /**
   * ─── THE HALF THE FIRST REPAIR LEFT BEHIND ────────────────────────────────
   *
   *   `azma.palace.memory` was the same defect and survived the treasures fix:
   *   localStorage, keyed by nothing, read at mount. It holds {visits, firstAt,
   *   lastAt}, and those three decide the greeting — «هذا مكانك» for a first
   *   arrival, a returning Creator's welcome otherwise — and `palace-returned`,
   *   which dresses the Palace for someone coming back after three days.
   *
   *   So on a shared device a Creator who had never been here was told the
   *   Empire remembered them. No sovereign work crossed, which is exactly why
   *   it was missed: the leak was a claim about the Creator's own history, and
   *   a false claim is what this Empire treats as the graver defect.
   */
  it('never reads or writes the un-owned memory key', () => {
    const bareKeyUses = CODE.match(/localStorage\.(get|set)Item\(\s*['"]azma\.palace\.memory['"]/g) ?? [];
    expect(bareKeyUses).toHaveLength(0);
  });

  it('composes the memory key from the creator id', () => {
    expect(CODE).toMatch(/\$\{PALACE_MEMORY_PREFIX\}\.\$\{creatorId\}/);
  });

  it('an unidentified visitor reads no history and writes none', () => {
    expect(CODE).toMatch(/function palaceMemoryKey\(creatorId: string \| null\)[\s\S]{0,120}creatorId \?/);
    expect(CODE).toMatch(/function readPalaceMemory\([\s\S]{0,220}if \(!key\) return NO_MEMORY;/);
    // The write refuses too: a visit by nobody must not be recorded on the
    // device for the next person to inherit.
    expect(CODE).toMatch(/function recordPalaceVisit\([\s\S]{0,300}if \(!key\) return updated;/);
  });

  it('does not read the memory before the identity arrives', () => {
    // The original called readPalaceMemory() twice in useState initializers,
    // at mount, with no owner and no argument.
    expect(CODE).not.toMatch(/readPalaceMemory\(\s*\)/);
    expect(CODE).toMatch(/identityPromise\.then\(\(id\) => \{[\s\S]{0,600}readPalaceMemory\(id\)/);
  });

  it('the returning-Creator dressing is decided on this Creator’s own memory', () => {
    // `returnClass` was a useState initializer reading the shared key; it must
    // now be set from the memory that arrived with the identity.
    expect(CODE).toMatch(/setReturnClass\('palace-returned'\)/);
    expect(CODE).not.toMatch(/const \[returnClass\]\s*=\s*useState<string>\(\(\) =>/);
  });

  it('purges the old un-owned memory', () => {
    expect(CODE).toMatch(/localStorage\.removeItem\(PALACE_MEMORY_PREFIX\)/);
    expect(CODE).toContain('purgeUnownedPalaceMemory();');
  });

  it('every remaining memory call site carries an owner', () => {
    expect(CODE).not.toMatch(/(readPalaceMemory|recordPalaceVisit)\(\s*\)/);
    // recordPalaceVisit(prev) — the old single-argument form — must be gone.
    expect(CODE).not.toMatch(/recordPalaceVisit\(\s*prev\s*\)/);
  });
});
