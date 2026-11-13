/**
 * NO ONE FRAMES THIS EMPIRE.
 *
 * ─── MEASURED ON THE LIVE SITE, 2026-11-13 ──────────────────────────────────
 *
 *   `curl -I https://azmaos.com/` returned exactly two security headers, both
 *   from the edge: `Strict-Transport-Security` and `X-Content-Type-Options`.
 *   It said NOTHING about framing.
 *
 *   So any site on the internet could put azmaos.com in an iframe and lay
 *   invisible controls over the Creator's own buttons. The buttons underneath
 *   include the one that spends their balance, and the whole balance and
 *   payment surface. On a platform that holds money that is a commercial
 *   risk, not a hardening nicety.
 *
 * ─── WHY THE REPOSITORY DECLARES THEM, NOT ONLY THE EDGE ────────────────────
 *
 *   A header the repository states travels with every deployment and can be
 *   read in a diff. A header that lives only in a dashboard is true until
 *   someone changes a dashboard, and nothing in this codebase would notice.
 *
 * ─── WHAT THIS GUARD DOES NOT CLAIM ─────────────────────────────────────────
 *
 *   That the live site sends them. It reads the configuration. The live
 *   measurement is taken after the deployment, with curl, against the
 *   running release — and recorded there, not here.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const CONFIG = readFileSync(join(__dirname, '..', '..', '..', 'next.config.ts'), 'utf8');

describe('no one frames this Empire', () => {
  it('framing is refused, in both the modern rule and the old one', () => {
    // A Creator's browser is not ours to choose, so both are sent.
    expect(CONFIG).toContain("{ key: 'X-Frame-Options', value: 'DENY' }");
    expect(CONFIG).toContain("frame-ancestors 'none'");
  });

  it('a page URL does not travel to another origin', () => {
    expect(CONFIG).toContain("'Referrer-Policy', value: 'strict-origin-when-cross-origin'");
  });

  it('the camera and the Creator’s location are refused outright', () => {
    // The chamber records voice when asked, so the microphone is allowed to
    // THIS origin. Nothing in this platform asks for a camera or a location.
    const policy = (CONFIG.match(/'Permissions-Policy', value: '([^']+)'/) ?? [])[1] ?? '';
    expect(policy).toContain('camera=()');
    expect(policy).toContain('geolocation=()');
    expect(policy).toContain('microphone=(self)');
  });

  it('and they are sent on every path, not only on pages', () => {
    // A script or a font is as framable as a page.
    expect(CONFIG).toContain("source: '/:path*',");
    expect(CONFIG).toContain('headers: SECURITY_HEADERS,');
  });
});
