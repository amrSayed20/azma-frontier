import { selectCompanionMessageKey } from '../select-companion-message';

describe('Arrival — selectCompanionMessageKey', () => {
  it('defaults to the plain message for a first-time, present, entering visitor', () => {
    expect(selectCompanionMessageKey({ phase: 'entering', presence: 'present', isReturning: false }))
      .toBe('gate.companionMessage');
  });

  it('acknowledges a returning device once settled', () => {
    expect(selectCompanionMessageKey({ phase: 'stable', presence: 'present', isReturning: true }))
      .toBe('gate.companionMessageReturning');
  });

  it('reassures an idle visitor regardless of returning status', () => {
    expect(selectCompanionMessageKey({ phase: 'stable', presence: 'idle', isReturning: false }))
      .toBe('gate.companionMessageIdle');
    expect(selectCompanionMessageKey({ phase: 'entering', presence: 'idle', isReturning: true }))
      .toBe('gate.companionMessageIdle');
  });

  it('acknowledges the chosen step above every other signal, including idle and returning', () => {
    expect(selectCompanionMessageKey({ phase: 'exiting', presence: 'present', isReturning: false }))
      .toBe('gate.companionMessageExiting');
    expect(selectCompanionMessageKey({ phase: 'exiting', presence: 'idle', isReturning: true }))
      .toBe('gate.companionMessageExiting');
  });
});
