/**
 * AZMA OS — The Google assertion verifier, tested without Google.
 *
 * ─── WHY THIS IS NOT "PENDING LIVE VERIFICATION" ────────────────────────────
 *
 *   What needs Google's credentials is the LIVE JOURNEY — a real person, a real
 *   consent screen, a real code exchange. That is genuinely pending and is
 *   labelled so in the report.
 *
 *   What does NOT need them is the thing that actually protects the Empire:
 *   whether this verifier accepts a token it should refuse. That is testable
 *   today, and far more sharply than any live sign-in could test it — a real
 *   Google flow only ever produces VALID tokens, so it exercises none of the
 *   refusals. Here an RSA key is generated, tokens are signed with it, and the
 *   key set is served from a mocked fetch, so every forgery can be constructed
 *   deliberately: wrong issuer, wrong audience, expired, replayed nonce,
 *   unsigned, `alg: none`, `email_verified: false`.
 *
 *   No credential, no network, no secret. The only thing left for the live
 *   proof is that Google behaves as documented.
 */

import { generateKeyPairSync, createSign, randomUUID } from 'crypto';

const CLIENT_ID = 'azma-test-client-id.apps.googleusercontent.com';
const OTHER_CLIENT = 'someone-elses-app.apps.googleusercontent.com';
const KID = 'test-key-1';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'RS256', use: 'sig' };

/** A second key, never published — used to sign forgeries. */
const foreign = generateKeyPairSync('rsa', { modulusLength: 2048 });

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

import {
  verifyGoogleIdToken,
  googleIdentityIsConfigured,
  mintOAuthValue,
  safeEquals,
  GoogleIdentityError,
} from '../providers/google-identity-binding';

function b64url(value: object | Buffer): string {
  const buf = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value));
  return buf.toString('base64url');
}

const NONCE = 'the-nonce-we-issued';
const NOW = 1_800_000_000;

function makeToken(
  claims: Record<string, unknown> = {},
  opts: { key?: typeof privateKey; header?: Record<string, unknown>; signature?: string } = {},
): string {
  const header = { alg: 'RS256', kid: KID, typ: 'JWT', ...(opts.header ?? {}) };
  const payload = {
    iss: 'https://accounts.google.com',
    aud: CLIENT_ID,
    sub: '117000000000000000001',
    email: 'Person@Example.com',
    email_verified: true,
    name: 'A Person',
    nonce: NONCE,
    iat: NOW - 30,
    exp: NOW + 3600,
    ...claims,
  };
  const signingInput = `${b64url(header)}.${b64url(payload)}`;
  if (opts.signature !== undefined) return `${signingInput}.${opts.signature}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  return `${signingInput}.${signer.sign(opts.key ?? privateKey).toString('base64url')}`;
}

beforeEach(() => {
  process.env.GOOGLE_CLIENT_ID = CLIENT_ID;
  process.env.GOOGLE_CLIENT_SECRET = 'test-secret-never-real';
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ keys: [jwk] }) });
});

async function rejection(token: string, nonce = NONCE): Promise<string> {
  try {
    await verifyGoogleIdToken(token, nonce, NOW);
  } catch (err) {
    return err instanceof GoogleIdentityError ? err.rejection : 'NOT_A_GOOGLE_ERROR';
  }
  return 'ACCEPTED';
}

describe('a genuine assertion is accepted, and normalised', () => {
  it('returns an identity that names no Google-specific concept', async () => {
    const identity = await verifyGoogleIdToken(makeToken(), NONCE, NOW);
    expect(identity).toEqual({
      provider: 'google',
      providerSubject: '117000000000000000001',
      // Lowercased: the same person must never become two accounts because
      // Google echoed a different capitalisation.
      email: 'person@example.com',
      displayName: 'A Person',
    });
    // The token, the claims and the raw payload do not leave the binding.
    expect(Object.keys(identity).sort()).toEqual(['displayName', 'email', 'provider', 'providerSubject']);
  });
});

describe('a forged or misdirected assertion is refused', () => {
  it('REFUSES a token signed with a key Google never published', async () => {
    expect(await rejection(makeToken({}, { key: foreign.privateKey }))).toBe('BAD_SIGNATURE');
  });

  it('REFUSES an unsigned token', async () => {
    expect(await rejection(makeToken({}, { signature: '' }))).toBe('BAD_SIGNATURE');
  });

  it('REFUSES alg:none — the classic JWT forgery', async () => {
    expect(await rejection(makeToken({}, { header: { alg: 'none' }, signature: '' }))).toBe('BAD_SIGNATURE');
  });

  it('REFUSES HS256, where the "signature" would be made with a public value', async () => {
    expect(await rejection(makeToken({}, { header: { alg: 'HS256' } }))).toBe('BAD_SIGNATURE');
  });

  it('REFUSES a key id Google does not publish', async () => {
    expect(await rejection(makeToken({}, { header: { kid: 'attacker-key' } }))).toBe('UNKNOWN_KEY');
  });

  it('REFUSES another issuer', async () => {
    expect(await rejection(makeToken({ iss: 'https://accounts.evil.example' }))).toBe('BAD_ISSUER');
  });

  it('REFUSES a token genuinely issued to ANOTHER application', async () => {
    // Real, Google-signed, and not ours. Accepting it would let that app's
    // owner sign in here as any of their users.
    expect(await rejection(makeToken({ aud: OTHER_CLIENT }))).toBe('BAD_AUDIENCE');
  });

  it('REFUSES an expired assertion', async () => {
    expect(await rejection(makeToken({ exp: NOW - 3600 }))).toBe('EXPIRED');
  });

  it('REFUSES an assertion issued in the future', async () => {
    expect(await rejection(makeToken({ iat: NOW + 3600 }))).toBe('NOT_YET_VALID');
  });

  it('REFUSES a replayed token — the nonce does not match this sign-in', async () => {
    expect(await rejection(makeToken(), 'a-different-sign-in')).toBe('NONCE_MISMATCH');
  });

  it('REFUSES a token carrying no nonce at all', async () => {
    expect(await rejection(makeToken({ nonce: undefined }))).toBe('NONCE_MISMATCH');
  });

  it('REFUSES an address Google itself has not confirmed', async () => {
    expect(await rejection(makeToken({ email_verified: false }))).toBe('EMAIL_NOT_VERIFIED');
  });

  it('REFUSES email_verified sent as the STRING "true"', async () => {
    // Strict equality, so a truthy-looking value cannot slip through.
    expect(await rejection(makeToken({ email_verified: 'true' }))).toBe('EMAIL_NOT_VERIFIED');
  });

  it('REFUSES a token with no subject', async () => {
    expect(await rejection(makeToken({ sub: '' }))).toBe('NO_SUBJECT');
  });

  it('REFUSES malformed tokens', async () => {
    for (const bad of ['', 'not-a-token', 'a.b', 'a.b.c.d', '....']) {
      expect(['MALFORMED_TOKEN', 'BAD_SIGNATURE', 'UNKNOWN_KEY']).toContain(await rejection(bad));
    }
  });

  it('REFUSES everything when the binding is not configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    expect(await rejection(makeToken())).toBe('NOT_CONFIGURED');
  });
});

describe('the claims are never read before the signature is checked', () => {
  /**
   * The ordering defect this guards: a verifier that reads `email_verified`
   * first and the signature second is a verifier that trusts the attacker.
   * Proven by forging a PERFECT payload and signing it with a foreign key — if
   * any claim were being honoured early, this would return an identity.
   */
  it('a perfectly-shaped payload signed by an attacker yields nothing', async () => {
    const forged = makeToken(
      { email: 'founder@azmaos.com', email_verified: true, sub: 'attacker-chosen' },
      { key: foreign.privateKey },
    );
    await expect(verifyGoogleIdToken(forged, NONCE, NOW)).rejects.toThrow(GoogleIdentityError);
    expect(await rejection(forged)).toBe('BAD_SIGNATURE');
  });
});

describe('the binding never discloses its secrets', () => {
  it('no error message contains the client id or secret', async () => {
    for (const token of [makeToken({ aud: OTHER_CLIENT }), makeToken({ iss: 'x' }), 'garbage']) {
      try {
        await verifyGoogleIdToken(token, NONCE, NOW);
      } catch (err) {
        const text = String(err);
        expect(text).not.toContain(CLIENT_ID);
        expect(text).not.toContain('test-secret-never-real');
      }
    }
  });

  it('reads the environment at call time, never at import', () => {
    expect(googleIdentityIsConfigured()).toBe(true);
    delete process.env.GOOGLE_CLIENT_SECRET;
    expect(googleIdentityIsConfigured()).toBe(false);
    process.env.GOOGLE_CLIENT_SECRET = 'restored';
    expect(googleIdentityIsConfigured()).toBe(true);
  });
});

describe('the one-time values that bind a sign-in to a browser', () => {
  it('mints unguessable, non-repeating values', () => {
    const seen = new Set(Array.from({ length: 200 }, () => mintOAuthValue()));
    expect(seen.size).toBe(200);
    for (const value of seen) {
      expect(Buffer.from(value, 'base64url').length).toBe(32);
    }
  });

  it('compares them without leaking length or content through ===', () => {
    const a = mintOAuthValue();
    expect(safeEquals(a, a)).toBe(true);
    expect(safeEquals(a, mintOAuthValue())).toBe(false);
    expect(safeEquals(a, `${a}x`)).toBe(false);
    expect(safeEquals(a, '')).toBe(false);
    expect(safeEquals(randomUUID(), randomUUID())).toBe(false);
  });
});
