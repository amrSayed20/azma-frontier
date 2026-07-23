import {
  CHAMBER_DIRECTORY,
  isChamberDestination,
  getChamberPathname,
  verifyEveryChamberHasOneNavigableDestination,
  verifyEveryChamberDestinationIsAKnownRoute,
  getConstitutionalNavigationCertificationReport,
} from '../index';
import { CONTEXT_ROLES } from '../../core/tongue';

describe('The Constitutional Navigation Layer', () => {
  it('lists exactly the 5 real Chambers (every ChamberContext except "universal")', () => {
    const expected = Object.keys(CONTEXT_ROLES).filter((id) => id !== 'universal').sort();
    expect(CHAMBER_DIRECTORY.map((entry) => entry.chamber).sort()).toEqual(expected);
  });

  it('derives each Chamber pathname as "/" + its ChamberContext id, never a re-invented path', () => {
    CHAMBER_DIRECTORY.forEach((entry) => {
      expect(entry.pathname).toBe(`/${entry.chamber}`);
    });
  });

  it('inherits each Chamber role verbatim from CONTEXT_ROLES, never a re-authored description', () => {
    CHAMBER_DIRECTORY.forEach((entry) => {
      expect(entry.role).toBe(CONTEXT_ROLES[entry.chamber]);
    });
  });

  it('isChamberDestination recognizes every real Chamber and rejects non-Chamber routes', () => {
    CHAMBER_DIRECTORY.forEach((entry) => {
      expect(isChamberDestination(entry.chamber)).toBe(true);
    });
    ['universal', 'sovereign-member', 'sovereign-gate', 'sovereign-vault', 'login', 'signup', '/'].forEach((route) => {
      expect(isChamberDestination(route)).toBe(false);
    });
  });

  it('getChamberPathname matches the Chamber Directory', () => {
    CHAMBER_DIRECTORY.forEach((entry) => {
      expect(getChamberPathname(entry.chamber)).toBe(entry.pathname);
    });
  });

  it('Certification Requirement 1 — every real Chamber has exactly one navigable destination', () => {
    expect(verifyEveryChamberHasOneNavigableDestination().verified).toBe(true);
  });

  it('Certification Requirement 2 — every Chamber destination is a known, certified route', () => {
    expect(verifyEveryChamberDestinationIsAKnownRoute().verified).toBe(true);
  });

  it('produces a full 2-item Certification Report, all verified', () => {
    const report = getConstitutionalNavigationCertificationReport();
    expect(report.length).toBe(2);
    report.forEach((entry) => expect(entry.verified).toBe(true));
  });
});
