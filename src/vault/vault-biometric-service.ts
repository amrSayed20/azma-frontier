/**
 * AZMA OS — VAULT BIOMETRIC ENTRY
 *
 * Opens the Sovereign Vault with the Creator's own fingerprint or face,
 * through WebAuthn platform authenticators — Windows Hello, Touch ID, the
 * Android biometric prompt.
 *
 * The biometric never reaches this server. The device matches it locally and
 * proves the match by signing a challenge with a private key that cannot leave
 * the device's secure hardware. What is stored here is the matching public key
 * and a signature counter, so a copy of this database reveals no biometric of
 * anyone and cannot be replayed against another origin.
 *
 * Signature verification is delegated to @simplewebauthn/server rather than
 * hand-written: it means parsing CBOR, decoding COSE keys and walking
 * attestation chains, and hand-rolled cryptography guarding a Creator's whole
 * asset archive is a risk this chamber should not take.
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import {
  getDb,
  listVaultCredentials,
  getVaultCredential,
  saveVaultCredential,
  recordVaultCredentialUse,
} from '../persistent-storage';

/** The Relying Party is the site itself; an assertion signed for one origin is
    worthless at another, which is what makes WebAuthn unphishable. */
export function relyingParty(): { id: string; name: string; origin: string } {
  const origin = process.env.AZMA_PUBLIC_ORIGIN ?? 'https://azmaos.com';
  return { id: new URL(origin).hostname, name: 'AZMA OS', origin };
}

/** Challenges are short-lived and single-use: a captured one is useless a
    minute later, and useless twice. In-process by design — the same disclosed
    limitation the PIN attempt tracker carries. */
const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const challenges = new Map<string, { challenge: string; expiresAt: number }>();

function rememberChallenge(creatorId: string, challenge: string, now = Date.now()): void {
  challenges.set(creatorId, { challenge, expiresAt: now + CHALLENGE_TTL_MS });
}

function consumeChallenge(creatorId: string, now = Date.now()): string | null {
  const entry = challenges.get(creatorId);
  challenges.delete(creatorId);
  if (!entry || entry.expiresAt <= now) return null;
  return entry.challenge;
}

export function resetBiometricChallengesForTests(): void {
  challenges.clear();
}

// ── Enrolment ────────────────────────────────────────────────────────────────

export async function beginEnrolment(
  creatorId: string,
  creatorName: string,
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const rp = relyingParty();
  const existing = listVaultCredentials(getDb(), creatorId);

  const options = await generateRegistrationOptions({
    rpName: rp.name,
    rpID: rp.id,
    userName: creatorName,
    userDisplayName: creatorName,
    attestationType: 'none',
    // Enrolling the same device twice would leave a Creator unable to tell
    // their keys apart.
    excludeCredentials: existing.map((c) => ({ id: c.credentialId })),
    authenticatorSelection: {
      // platform: the fingerprint reader or camera built into this device,
      // never a roaming key the Creator would have to carry.
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'required',
    },
  });

  rememberChallenge(creatorId, options.challenge);
  return options;
}

export interface EnrolmentOutcome {
  readonly status: 'enrolled' | 'failed';
  readonly reason?: string;
}

export async function completeEnrolment(
  creatorId: string,
  response: RegistrationResponseJSON,
  deviceLabel: string | null,
): Promise<EnrolmentOutcome> {
  const expectedChallenge = consumeChallenge(creatorId);
  if (!expectedChallenge) return { status: 'failed', reason: 'challenge-expired' };

  const rp = relyingParty();
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: rp.origin,
      expectedRPID: rp.id,
      requireUserVerification: true,
    });
  } catch {
    return { status: 'failed', reason: 'verification-failed' };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { status: 'failed', reason: 'verification-failed' };
  }

  const { credential } = verification.registrationInfo;
  saveVaultCredential(getDb(), {
    credentialId: credential.id,
    creatorId,
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    transports: response.response.transports ?? [],
    deviceLabel,
    createdAt: Date.now(),
  });

  return { status: 'enrolled' };
}

// ── Entry ────────────────────────────────────────────────────────────────────

export async function beginEntry(creatorId: string): Promise<PublicKeyCredentialRequestOptionsJSON | null> {
  const enrolled = listVaultCredentials(getDb(), creatorId);
  if (enrolled.length === 0) return null;

  const rp = relyingParty();
  const options = await generateAuthenticationOptions({
    rpID: rp.id,
    allowCredentials: enrolled.map((c) => ({
      id: c.credentialId,
      transports: c.transports as never,
    })),
    userVerification: 'required',
  });

  rememberChallenge(creatorId, options.challenge);
  return options;
}

export interface EntryOutcome {
  readonly status: 'authenticated' | 'failed';
  readonly reason?: string;
}

export async function completeEntry(
  creatorId: string,
  response: AuthenticationResponseJSON,
): Promise<EntryOutcome> {
  const expectedChallenge = consumeChallenge(creatorId);
  if (!expectedChallenge) return { status: 'failed', reason: 'challenge-expired' };

  const stored = getVaultCredential(getDb(), response.id);
  // A credential belonging to another Creator must never open this Vault, even
  // if the signature itself is valid.
  if (!stored || stored.creatorId !== creatorId) {
    return { status: 'failed', reason: 'unknown-credential' };
  }

  const rp = relyingParty();
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: rp.origin,
      expectedRPID: rp.id,
      requireUserVerification: true,
      credential: {
        id: stored.credentialId,
        publicKey: new Uint8Array(Buffer.from(stored.publicKey, 'base64url')),
        counter: stored.counter,
        transports: stored.transports as never,
      },
    });
  } catch {
    return { status: 'failed', reason: 'verification-failed' };
  }

  if (!verification.verified) return { status: 'failed', reason: 'verification-failed' };

  recordVaultCredentialUse(getDb(), stored.credentialId, verification.authenticationInfo.newCounter);
  return { status: 'authenticated' };
}

export function hasEnrolledDevice(creatorId: string): boolean {
  return listVaultCredentials(getDb(), creatorId).length > 0;
}
