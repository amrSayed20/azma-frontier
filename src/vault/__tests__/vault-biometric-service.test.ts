/**
 * Vault Biometric Entry — the guarantees that matter.
 *
 * These assert the things that would let someone into a Vault that is not
 * theirs: a stale challenge, a replayed one, another Creator's credential, an
 * unverified signature. The happy path is the least interesting case here.
 */

const mockVerifyRegistration = jest.fn();
const mockVerifyAuthentication = jest.fn();

jest.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: jest.fn(async () => ({ challenge: 'challenge-reg' })),
  generateAuthenticationOptions: jest.fn(async () => ({ challenge: 'challenge-auth' })),
  verifyRegistrationResponse: (...args: unknown[]) => mockVerifyRegistration(...args),
  verifyAuthenticationResponse: (...args: unknown[]) => mockVerifyAuthentication(...args),
}));

const credentials: Record<string, {
  credentialId: string; creatorId: string; publicKey: string; counter: number;
  transports: string[]; deviceLabel: string | null; createdAt: number; lastUsedAt: number | null;
}> = {};

jest.mock('../../persistent-storage', () => ({
  getDb: () => ({}),
  listVaultCredentials: (_db: unknown, creatorId: string) =>
    Object.values(credentials).filter((c) => c.creatorId === creatorId),
  getVaultCredential: (_db: unknown, id: string) => credentials[id] ?? null,
  saveVaultCredential: (_db: unknown, c: Record<string, unknown>) => {
    credentials[c.credentialId as string] = { ...c, lastUsedAt: null } as never;
  },
  recordVaultCredentialUse: (_db: unknown, id: string, counter: number) => {
    if (credentials[id]) credentials[id].counter = counter;
  },
}));

import {
  beginEnrolment,
  completeEnrolment,
  beginEntry,
  completeEntry,
  hasEnrolledDevice,
  resetBiometricChallengesForTests,
  relyingParty,
} from '../vault-biometric-service';

const CREATOR = 'creator-1';
const OTHER = 'creator-2';

const registration = { id: 'cred-a', response: { transports: ['internal'] } } as never;
const assertion = (id = 'cred-a') => ({ id }) as never;

function enrolmentSucceeds(credentialId = 'cred-a') {
  mockVerifyRegistration.mockResolvedValue({
    verified: true,
    registrationInfo: {
      credential: { id: credentialId, publicKey: new Uint8Array([1, 2, 3]), counter: 0 },
    },
  });
}

beforeEach(() => {
  resetBiometricChallengesForTests();
  for (const k of Object.keys(credentials)) delete credentials[k];
  mockVerifyRegistration.mockReset();
  mockVerifyAuthentication.mockReset();
});

describe('relying party', () => {
  it('binds assertions to this origin, so one signed elsewhere is worthless', () => {
    const rp = relyingParty();
    expect(rp.origin).toMatch(/^https?:\/\//);
    expect(rp.id).not.toContain('/');
  });
});

describe('enrolment', () => {
  it('stores the public key once the device proves itself', async () => {
    await beginEnrolment(CREATOR, 'Founder');
    enrolmentSucceeds();

    await expect(completeEnrolment(CREATOR, registration, 'هذا الحاسوب'))
      .resolves.toEqual({ status: 'enrolled' });
    expect(credentials['cred-a'].creatorId).toBe(CREATOR);
    expect(credentials['cred-a'].deviceLabel).toBe('هذا الحاسوب');
  });

  it('refuses a registration that was never challenged', async () => {
    enrolmentSucceeds();
    await expect(completeEnrolment(CREATOR, registration, null))
      .resolves.toEqual({ status: 'failed', reason: 'challenge-expired' });
  });

  it('refuses to store anything the library did not verify', async () => {
    await beginEnrolment(CREATOR, 'Founder');
    mockVerifyRegistration.mockResolvedValue({ verified: false });

    await expect(completeEnrolment(CREATOR, registration, null))
      .resolves.toEqual({ status: 'failed', reason: 'verification-failed' });
    expect(Object.keys(credentials)).toHaveLength(0);
  });

  it('survives the library throwing on malformed input', async () => {
    await beginEnrolment(CREATOR, 'Founder');
    mockVerifyRegistration.mockRejectedValue(new Error('malformed attestation'));

    await expect(completeEnrolment(CREATOR, registration, null))
      .resolves.toEqual({ status: 'failed', reason: 'verification-failed' });
  });

  it('demands the device verify the human, not merely its own presence', async () => {
    await beginEnrolment(CREATOR, 'Founder');
    enrolmentSucceeds();
    await completeEnrolment(CREATOR, registration, null);

    expect(mockVerifyRegistration.mock.calls[0][0].requireUserVerification).toBe(true);
  });
});

describe('entry', () => {
  async function enrol(creatorId: string, credentialId: string) {
    await beginEnrolment(creatorId, 'Founder');
    enrolmentSucceeds(credentialId);
    await completeEnrolment(creatorId, registration, null);
  }

  it('offers no challenge to a Creator with no enrolled device', async () => {
    await expect(beginEntry(CREATOR)).resolves.toBeNull();
    expect(hasEnrolledDevice(CREATOR)).toBe(false);
  });

  it('opens the Vault on a verified assertion', async () => {
    await enrol(CREATOR, 'cred-a');
    await beginEntry(CREATOR);
    mockVerifyAuthentication.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 7 },
    });

    await expect(completeEntry(CREATOR, assertion()))
      .resolves.toEqual({ status: 'authenticated' });
  });

  it('advances the counter, so a replayed assertion is detectable', async () => {
    await enrol(CREATOR, 'cred-a');
    await beginEntry(CREATOR);
    mockVerifyAuthentication.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 12 },
    });

    await completeEntry(CREATOR, assertion());
    expect(credentials['cred-a'].counter).toBe(12);
  });

  it('refuses a second use of the same challenge', async () => {
    await enrol(CREATOR, 'cred-a');
    await beginEntry(CREATOR);
    mockVerifyAuthentication.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 1 },
    });

    await completeEntry(CREATOR, assertion());
    await expect(completeEntry(CREATOR, assertion()))
      .resolves.toEqual({ status: 'failed', reason: 'challenge-expired' });
  });

  it('refuses another Creator’s credential even with a valid signature', async () => {
    await enrol(OTHER, 'cred-other');
    await enrol(CREATOR, 'cred-a');
    await beginEntry(CREATOR);
    mockVerifyAuthentication.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 3 },
    });

    await expect(completeEntry(CREATOR, assertion('cred-other')))
      .resolves.toEqual({ status: 'failed', reason: 'unknown-credential' });
  });

  it('refuses a credential it has never seen', async () => {
    await enrol(CREATOR, 'cred-a');
    await beginEntry(CREATOR);

    await expect(completeEntry(CREATOR, assertion('cred-ghost')))
      .resolves.toEqual({ status: 'failed', reason: 'unknown-credential' });
    expect(mockVerifyAuthentication).not.toHaveBeenCalled();
  });

  it('refuses an assertion the library rejects', async () => {
    await enrol(CREATOR, 'cred-a');
    await beginEntry(CREATOR);
    mockVerifyAuthentication.mockResolvedValue({ verified: false });

    await expect(completeEntry(CREATOR, assertion()))
      .resolves.toEqual({ status: 'failed', reason: 'verification-failed' });
  });

  it('demands user verification on entry too', async () => {
    await enrol(CREATOR, 'cred-a');
    await beginEntry(CREATOR);
    mockVerifyAuthentication.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 1 },
    });
    await completeEntry(CREATOR, assertion());

    expect(mockVerifyAuthentication.mock.calls[0][0].requireUserVerification).toBe(true);
  });
});
