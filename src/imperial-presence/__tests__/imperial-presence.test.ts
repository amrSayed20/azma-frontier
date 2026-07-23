import {
  CONSTITUTIONAL_IDENTITY_OBJECTIVES,
  KNOWN_APPLICATION_ROUTES,
  verifyOneConstitutionalFaceExists,
  verifyOneConstitutionalVoiceExists,
  verifyOneConstitutionalTongueExists,
  verifyEveryChamberInheritsOneConstitutionalIdentity,
  verifyAuthoritiesRemainUnified,
  verifyOneUninterruptedImperialPresence,
  getConstitutionalIdentityCertificationReport,
} from '../index';
import { resolveChamberContext } from '../../sovereign-identity/director-stage/route-context';

describe('The Constitutional Identity (The Imperial Presence)', () => {
  it('names exactly the 9 Directive objectives, each mapped to a real, evidenced artifact', () => {
    expect(CONSTITUTIONAL_IDENTITY_OBJECTIVES.length).toBe(9);
    const names = CONSTITUTIONAL_IDENTITY_OBJECTIVES.map((entry) => entry.objective);
    expect(names).toEqual([
      'Face',
      'Voice',
      'Tongue',
      'Motion Authority',
      'Lighting Authority',
      'Typography Authority',
      'Color Authority',
      'Cinematic Director',
      'Presence Layer',
    ]);
    CONSTITUTIONAL_IDENTITY_OBJECTIVES.forEach((entry) => {
      expect(entry.existingArtifact.length).toBeGreaterThan(0);
      expect(entry.sourceModule.length).toBeGreaterThan(0);
    });
  });

  it('Certification Requirement 1 — one Constitutional Face exists', () => {
    const result = verifyOneConstitutionalFaceExists();
    expect(result.verified).toBe(true);
  });

  it('Certification Requirement 2 — one Constitutional Voice exists', () => {
    const result = verifyOneConstitutionalVoiceExists();
    expect(result.verified).toBe(true);
  });

  it('Certification Requirement 3 — one Constitutional Tongue exists', () => {
    const result = verifyOneConstitutionalTongueExists();
    expect(result.verified).toBe(true);
  });

  it('Certification Requirement 4 — every chamber inherits one Constitutional Identity', () => {
    const result = verifyEveryChamberInheritsOneConstitutionalIdentity();
    expect(result.verified).toBe(true);
  });

  it('Certification Requirement 5 — motion, lighting, typography, color, and cinematic direction remain unified', () => {
    const result = verifyAuthoritiesRemainUnified();
    expect(result.verified).toBe(true);
  });

  it('Certification Requirement 6 — the Creator experiences one uninterrupted Imperial Presence', () => {
    const result = verifyOneUninterruptedImperialPresence();
    expect(result.verified).toBe(true);
  });

  it('every known application route resolves to a defined ChamberContext — never falls through to an undefined identity', () => {
    KNOWN_APPLICATION_ROUTES.forEach((pathname) => {
      const context = resolveChamberContext(pathname);
      expect(context).toBeTruthy();
    });
  });

  it('produces a full 6-item Certification Report, all verified', () => {
    const report = getConstitutionalIdentityCertificationReport();
    expect(report.length).toBe(6);
    report.forEach((entry) => {
      expect(entry.verified).toBe(true);
    });
  });

  it('an unrecognized route honestly resolves to "universal" rather than an invented chamber identity', () => {
    expect(resolveChamberContext('/some-route-that-does-not-exist')).toBe('universal');
    expect(resolveChamberContext(null)).toBe('universal');
  });
});
