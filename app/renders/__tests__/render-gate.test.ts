/**
 * AZMA OS — PHASE E REGRESSION: the finished film has a gate.
 *
 * ─── THE DEFECT THIS HOLDS SHUT ─────────────────────────────────────────────
 *
 *   `/renders/` served 25 finished films belonging to 7 Creators to anyone who
 *   asked, with no session, and told every proxy in between to keep a copy.
 *   Measured on production before the fix:
 *
 *       GET /renders/op_render_1788000362601_0iusk3w8.mp4
 *       → 200 · 239,231 bytes · sha256 identical to the file on disk
 *
 *   Two separate things had to be true for the fix to work, and only one of
 *   them is a line of code:
 *
 *     1. the gate must refuse correctly — that is what this file holds;
 *     2. the gate must RUN AT ALL — and with the films under `public/`, it did
 *        not. Next.js's static handler answered first. The test at the bottom
 *        of this file holds that second condition, because it is the one that
 *        would fail silently and look exactly like success.
 */

import { GET } from '../[...path]/route';
import { GET as PUBLIC_GET } from '../../w/[token]/route';
import { POST as PUBLISH, DELETE as REVOKE } from '../../api/renders/[operationId]/publish/route';
import { NextRequest } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';

const OWNER = 'creator-owner';
const STRANGER = 'creator-stranger';
const FILM = 'op_render_1788000362601_0iusk3w8';

const sessionMock = jest.fn();
jest.mock('@/src/authentication', () => ({
  verifySession: (...args: unknown[]) => sessionMock(...args),
}));

import { getDb, resetDbSingletonForTests } from '@/src/persistent-storage';
import { resolveRenderOwner } from '@/src/persistent-storage/render-ownership';

function request(file: string, opts: { session?: boolean } = {}) {
  return GET(
    new NextRequest(`http://localhost/renders/${file}`, opts.session ? { headers: { Cookie: 'azma_session=s1' } } : {}),
    { params: Promise.resolve({ path: [file] }) },
  );
}

/** The published door — a token in the PATH, because the CDN strips query strings. */
function publicRequest(token: string) {
  return PUBLIC_GET(
    new NextRequest(`http://localhost/w/${token}`),
    { params: Promise.resolve({ token }) },
  );
}

/** Pull the token out of a publish response's /w/<token> URL. */
function tokenOf(publicUrl: string): string {
  return publicUrl.split('/w/')[1];
}

/** Seed one film into operation_ledger, the way a real encode records itself. */
function seedViaOperationLedger(operationId: string, ownerId: string) {
  const now = Date.now();
  getDb().prepare(
    `INSERT INTO operation_ledger
      (operation_id, subscriber_tenant_id, capability_target, current_state,
       source_intent_json, estimated_resource_cost, created_at, updated_at)
     VALUES (?, ?, 'MOTION', 'DEPOSITED', '{}', 0, ?, ?)`,
  ).run(operationId, ownerId, now, now);
}

/** Seed one film into cinematic_ledger ONLY — 12 of the 25 on production are like this. */
function seedViaCinematicLedgerOnly(operationId: string, ownerId: string) {
  const now = Date.now();
  getDb().prepare(
    `INSERT INTO cinematic_ledger
      (publication_id, publisher_tenant_id, source_canvas_id, source_compilation_id,
       operation_id, canvas_type, title, description, render_status, created_at, updated_at)
     VALUES (?, ?, 'c1', 'comp1', ?, 'NARRATIVE', 'ت', 'ت', 'COMPLETE', ?, ?)`,
  ).run(`pub-${operationId}`, ownerId, operationId, now, now);
}

async function publish(operationId: string) {
  const response = await PUBLISH(
    new NextRequest(`http://localhost/api/renders/${operationId}/publish`, {
      method: 'POST', headers: { Cookie: 'azma_session=s1' },
    }),
    { params: Promise.resolve({ operationId }) },
  );
  return response.json();
}

async function revoke(operationId: string) {
  const response = await REVOKE(
    new NextRequest(`http://localhost/api/renders/${operationId}/publish`, {
      method: 'DELETE', headers: { Cookie: 'azma_session=s1' },
    }),
    { params: Promise.resolve({ operationId }) },
  );
  return response.json();
}

beforeEach(() => {
  process.env.AZMA_DB_PATH = ':memory:';
  resetDbSingletonForTests();
  sessionMock.mockReset();
  sessionMock.mockReturnValue({ creatorId: OWNER });
  seedViaOperationLedger(FILM, OWNER);
});

afterEach(() => { resetDbSingletonForTests(); });

describe('the finished film is not public', () => {
  it('DENIES an anonymous request — the exact defect measured on production', async () => {
    sessionMock.mockReturnValue(null);
    const response = await request(`${FILM}.mp4`);
    expect(response.status).toBe(404);
    expect(response.headers.get('X-Accel-Redirect')).toBeNull();
  });

  it('DENIES a signed-in stranger', async () => {
    sessionMock.mockReturnValue({ creatorId: STRANGER });
    const response = await request(`${FILM}.mp4`, { session: true });
    expect(response.status).toBe(404);
    expect(response.headers.get('X-Accel-Redirect')).toBeNull();
  });

  it('ALLOWS the owner, and hands the sending back to nginx', async () => {
    const response = await request(`${FILM}.mp4`, { session: true });
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Accel-Redirect')).toBe(`/protected-renders/${FILM}.mp4`);
    // Never a shared cache: an edge copy would outlive a revocation.
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('DENIES a film whose owner cannot be established — never a guess', async () => {
    const response = await request('op_render_nobody_owns_this.mp4', { session: true });
    expect(response.status).toBe(404);
  });

  it('refuses path traversal and nested paths', async () => {
    for (const bad of ['..', '../../etc/passwd', 'a/b.mp4', '', '.mp4']) {
      const response = await GET(
        new NextRequest('http://localhost/renders/x', { headers: { Cookie: 'azma_session=s1' } }),
        { params: Promise.resolve({ path: bad.split('/') }) },
      );
      expect(response.status).toBe(404);
    }
  });
});

describe('the owner may publish, and may withdraw', () => {
  it('a published link opens the film for someone with NO session', async () => {
    const link = await publish(FILM);
    expect(link.status).toBe('succeeded');

    sessionMock.mockReturnValue(null);
    const response = await publicRequest(tokenOf(link.publicUrl));
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Accel-Redirect')).toBe(`/protected-renders/${FILM}.mp4`);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  /**
   * The defect that every other test in this file would have missed. The first
   * build put the token in `?t=` and passed everything here, while the CDN
   * stripped it before the request ever reached the Empire — measured in the
   * nginx access log, with no `?t=` in the request line at all.
   */
  it('the published URL carries its token in the PATH, never the query string', async () => {
    const link = await publish(FILM);
    expect(link.publicUrl).toMatch(/^\/w\/[A-Za-z0-9_-]+$/);
    expect(link.publicUrl).not.toContain('?');
  });

  it('a REVOKED link opens nothing — Article 9.3', async () => {
    const link = await publish(FILM);
    const token = tokenOf(link.publicUrl);

    const withdrawal = await revoke(FILM);
    expect(withdrawal.status).toBe('succeeded');
    expect(withdrawal.revoked).toBe(1);

    sessionMock.mockReturnValue(null);
    expect((await publicRequest(token)).status).toBe(404);
  });

  it('a token opens ONLY the film it was minted for', async () => {
    const other = 'op_render_1788003786797_08yy3tm9';
    seedViaOperationLedger(other, OWNER);

    const link = await publish(FILM);
    sessionMock.mockReturnValue(null);

    // The token names its own film; it cannot be pointed at a different one.
    const served = await publicRequest(tokenOf(link.publicUrl));
    expect(served.headers.get('X-Accel-Redirect')).toBe(`/protected-renders/${FILM}.mp4`);
    expect(served.headers.get('X-Accel-Redirect')).not.toContain(other);
  });

  it('a made-up token opens nothing', async () => {
    sessionMock.mockReturnValue(null);
    for (const bad of ['x', 'a'.repeat(43), '../../etc/passwd', '']) {
      expect((await publicRequest(bad)).status).toBe(404);
    }
  });

  it('a stranger cannot publish another Creator’s film', async () => {
    sessionMock.mockReturnValue({ creatorId: STRANGER });
    const result = await publish(FILM);
    expect(result.status).toBe('failed');
    expect(result.reason).toBe('not-found');
  });

  it('publishing twice yields ONE live link, so one revocation truly withdraws', async () => {
    const first = await publish(FILM);
    const second = await publish(FILM);
    expect(second.alreadyPublished).toBe(true);
    expect(second.linkId).toBe(first.linkId);

    await revoke(FILM);
    sessionMock.mockReturnValue(null);
    expect((await publicRequest(tokenOf(first.publicUrl))).status).toBe(404);
  });

  it('the minted token is not guessable — 32 bytes, base64url', async () => {
    const link = await publish(FILM);
    const token = tokenOf(link.publicUrl);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(Buffer.from(token, 'base64url').length).toBe(32);
  });
});

describe('ownership resolves through BOTH ledgers', () => {
  /**
   * The finding that mattered most in this phase. 12 of the 25 films on
   * production have NO operation_ledger row; building the gate on that single
   * lookup would have locked 12 Creators out of their own work and looked
   * exactly like the fix working.
   */
  it('resolves a film recorded only in cinematic_ledger', async () => {
    const cinematicOnly = 'op_render_1788502426521_1ri2huzb';
    seedViaCinematicLedgerOnly(cinematicOnly, OWNER);

    const ownership = resolveRenderOwner(getDb(), cinematicOnly);
    expect(ownership).not.toBeNull();
    expect(ownership!.ownerId).toBe(OWNER);
    expect(ownership!.source).toBe('cinematic-ledger');

    const response = await request(`${cinematicOnly}.mp4`, { session: true });
    expect(response.status).toBe(200);
  });

  it('prefers operation_ledger when both records exist', () => {
    seedViaCinematicLedgerOnly(FILM, OWNER);
    expect(resolveRenderOwner(getDb(), FILM)!.source).toBe('operation-ledger');
  });
});

describe('the gate is REACHABLE — the condition that fails silently', () => {
  /**
   * Next.js serves `public/` before any route. While the films lived there the
   * gate above was unreachable code and every test in this file passed anyway.
   * Measured then: GET /renders/<planted>.mp4 → 200 · raw bytes.
   *
   * So this asserts the one fact no request-level test can: nothing this
   * repository writes puts a film back under public/.
   */
  it('no film directory exists under public/, where static serving would shadow the gate', () => {
    expect(existsSync(join(process.cwd(), 'public', 'renders'))).toBe(false);
  });

  it('the encoder writes beneath UPLOADS_DIR, not beneath public/', async () => {
    jest.resetModules();
    process.env.UPLOADS_DIR = join('/', 'var', 'www', 'azma-uploads');
    const { getOutputPath } = await import(
      '@/src/orchestrator/fleet-materialization/fleet/adapters/cinematic-ffmpeg-encoder'
    );
    const path = getOutputPath(FILM).replace(/\\/g, '/');
    expect(path).toContain('azma-uploads/renders');
    expect(path).not.toContain('/public/');
  });
});
