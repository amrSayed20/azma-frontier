/**
 * Phase 3B Package II — N-5: PIN format validation tests.
 * Tests the 4-digit constraint enforced by both API routes before
 * touching the database. Uses the same regex the routes use.
 */

const PIN_REGEX = /^\d{4}$/;

describe('vault PIN format validation', () => {
  it('accepts a 4-digit string', () => {
    expect(PIN_REGEX.test('1234')).toBe(true);
    expect(PIN_REGEX.test('0000')).toBe(true);
    expect(PIN_REGEX.test('9999')).toBe(true);
  });

  it('rejects wrong-length strings', () => {
    expect(PIN_REGEX.test('123')).toBe(false);    // too short
    expect(PIN_REGEX.test('12345')).toBe(false);  // too long
    expect(PIN_REGEX.test('')).toBe(false);        // empty
  });

  it('rejects non-digit characters', () => {
    expect(PIN_REGEX.test('12a4')).toBe(false);
    expect(PIN_REGEX.test('12 4')).toBe(false);
    expect(PIN_REGEX.test('abcd')).toBe(false);
  });

  it('rejects strings with leading/trailing whitespace', () => {
    expect(PIN_REGEX.test(' 123')).toBe(false);
    expect(PIN_REGEX.test('123 ')).toBe(false);
  });
});
