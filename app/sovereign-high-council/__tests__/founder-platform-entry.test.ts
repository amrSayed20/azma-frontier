/**
 * AZMA OS — The Founder's entrance from the Council into the platform.
 *
 * ─── WHAT WAS MEASURED (2026-09-22) ─────────────────────────────────────────
 *
 *   A Founder who signs in is sent to /sovereign-high-council (LoginForm),
 *   and the Council's only outbound links were its own two reports —
 *   /consumption and /health. The Empire's platform entrance, /imperial-foyer,
 *   was reachable by every Creator at login and by the Founder from nowhere.
 *   The Council had become a destination without a door.
 *
 * ─── WHAT THIS HOLDS SHUT ───────────────────────────────────────────────────
 *
 *   The door exists, it leads to the PLATFORM and not to a chamber, it goes
 *   through the navigation authority rather than around it, and it opens no
 *   second identity: same session, same cookie, no second login, no bypass
 *   for anyone who is not already the Founder.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { CHAMBER_DIRECTORY } from '@/src/constitutional-navigation';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const strip = (f: string) => read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const COUNCIL = strip('app/sovereign-high-council/page.tsx');
const COUNCIL_LAYOUT = strip('app/sovereign-high-council/layout.tsx');
const LOGIN = strip('app/login/LoginForm.tsx');
const FOYER = strip('app/imperial-foyer/page.tsx');
const FOYER_LAYOUT = strip('app/imperial-foyer/layout.tsx');

describe('1–2 · the Founder authenticates and arrives at the Council', () => {
  it('login sends a founder to the Council and every other Creator to the platform entrance', () => {
    expect(LOGIN).toMatch(/result\.role === 'founder' \? '\/sovereign-high-council' : '\/imperial-foyer'/);
  });

  it('the Council admits the Founder and nobody else — its gate is unchanged', () => {
    expect(COUNCIL_LAYOUT).toMatch(/verifyFounderSession\(sessionId\)/);
    expect(COUNCIL_LAYOUT).toMatch(/redirect\(FOUNDER_GATEWAY_PATH\)/);
  });
});

describe('3–5 · the Council exposes one legitimate entrance, to the platform', () => {
  it('the entrance exists and says what it does — enter AZMA OS', () => {
    expect(COUNCIL).toContain('data-testid="council-enter-platform"');
    expect(COUNCIL).toContain('ادخل أزما أو إس');
  });

  it('it goes through the navigation authority, not around it', () => {
    expect(COUNCIL).toMatch(/import \{ ConstitutionalLink \} from '@\/src\/constitutional-navigation'/);
    expect(COUNCIL).toMatch(/<ConstitutionalLink\s+to="\/imperial-foyer"/);
    // No raw window.location / router.push was introduced for this entrance.
    expect(COUNCIL).not.toMatch(/location\.assign\(['"]\/imperial-foyer/);
    expect(COUNCIL).not.toMatch(/router\.push\(['"]\/imperial-foyer/);
  });

  it('it leads to the platform entrance, never to a chamber', () => {
    const entrance = COUNCIL.slice(COUNCIL.indexOf('council-enter-platform') - 200, COUNCIL.indexOf('council-enter-platform') + 400);
    expect(entrance).toContain('/imperial-foyer');
    for (const chamber of CHAMBER_DIRECTORY) {
      expect(entrance).not.toContain(chamber.pathname);
    }
    // And it is not dressed as settings, billing, a subscription or a feature.
    expect(entrance).not.toMatch(/billing|subscri|settings|قيامة|فيديو|إعدادات|اشتراك/i);
  });
});

describe('6–8 · the platform entrance leads to the five chambers', () => {
  it('the Foyer routes to all five — four cards and the Vault', () => {
    for (const chamber of CHAMBER_DIRECTORY) {
      expect(FOYER).toContain(chamber.pathname);
    }
    expect(CHAMBER_DIRECTORY).toHaveLength(5);
  });

  it('the Foyer launches a chamber through the Interaction Kernel — the existing authority', () => {
    // MEASURED: launchChamber prepares a Kernel session, writes it for the
    // chamber to consume, then hands over with a hard navigation — chosen
    // deliberately in this file ("avoids RSC/Cloudflare failure"). The
    // authority is the Kernel; the assign is its transport.
    expect(FOYER).toMatch(/prepareInteractionSession\(/);
    expect(FOYER).toMatch(/azma\.kernel\.session/);
    expect(FOYER).toMatch(/window\.location\.assign\(route\)/);
  });

  it('Qiyamah is one of them, reached as a chamber and not as a special route', () => {
    expect(FOYER).toContain('/qiyamah-chamber');
    expect(COUNCIL).not.toContain('/qiyamah-chamber');
  });
});

describe('9–11 · one identity, no bypass', () => {
  it('the entrance creates no second session and no second authentication', () => {
    const council = COUNCIL;
    expect(council).not.toMatch(/\/api\/auth\/login/);
    expect(council).not.toMatch(/signIn|createSession|new session/i);
    // A same-origin link carries the existing azma_session cookie; nothing is minted.
    expect(council).not.toContain('azma_session');
  });

  it('no anonymous access was introduced — both gates are server-side and untouched', () => {
    // MEASURED: the Foyer's gate is its layout, not its page — an unauthenticated
    // visitor is redirected to /login before the page renders (live: 307).
    expect(COUNCIL_LAYOUT).toMatch(/verifyFounderSession\(sessionId\)/);
    expect(FOYER_LAYOUT).toMatch(/verifySession\(sessionId\)/);
    expect(FOYER_LAYOUT).toMatch(/if \(!session\) redirect\('\/login'\)/);
  });

  it('no Founder-only platform control was added to the platform itself', () => {
    // The entrance lives in the Council, which is already Founder-gated. The
    // Foyer gained nothing by this package: it is the same platform entrance
    // every Creator already reaches at login. (The Foyer does read `role`
    // from /api/auth/me — pre-existing, to greet by name, not to gate.)
    expect(FOYER).not.toContain('council-enter-platform');
    expect(FOYER).not.toMatch(/founder.*only|only.*founder/i);
  });
});

describe('12–14 · nothing else moved', () => {
  it('the chambers themselves were not touched by this entrance', () => {
    for (const f of ['app/qiyamah-chamber/QiyamahChamberClient.tsx', 'app/imperial-foyer/page.tsx']) {
      expect(strip(f)).not.toContain('council-enter-platform');
    }
  });

  it('the navigation authority remains the single mechanism — no parallel registry appeared', () => {
    const nav = strip('src/constitutional-navigation/index.ts');
    expect(nav).toMatch(/CHAMBER_DIRECTORY/);
    expect(nav).toMatch(/ConstitutionalLink/);
    // The Council writes no chamber list of its own.
    for (const chamber of CHAMBER_DIRECTORY) expect(COUNCIL).not.toContain(`'${chamber.chamber}'`);
  });

  it('generate-video entitlement was not touched by this package', () => {
    const route = strip('app/api/qiyamah/generate/route.ts');
    expect(route).toContain('hasActiveEntitlement(session.creatorId, session.role)');
    expect(route).toContain("reason: 'not-entitled'");
  });
});
