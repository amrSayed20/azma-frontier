import { resolveGateId } from '../route-gate-context';

describe('The Imperial Gates — Route Resolution', () => {
  it('resolves the root path to landing', () => {
    expect(resolveGateId('/')).toBe('landing');
    expect(resolveGateId('')).toBe('landing');
    expect(resolveGateId(null)).toBe('landing');
  });

  it('resolves /login to login', () => {
    expect(resolveGateId('/login')).toBe('login');
  });

  it('resolves /signup to signup', () => {
    expect(resolveGateId('/signup')).toBe('signup');
  });

  it('resolves /subscribe and /subscribe/success both to subscription', () => {
    expect(resolveGateId('/subscribe')).toBe('subscription');
    expect(resolveGateId('/subscribe/success')).toBe('subscription');
  });

  it('does not recognize /founder as a Gate — the Founder journey is constitutionally separate', () => {
    expect(resolveGateId('/founder')).toBeNull();
  });

  it('returns null for a Chamber route — Gates and Chambers are resolved separately', () => {
    expect(resolveGateId('/qiyamah-chamber')).toBeNull();
  });

  it('returns null for any other unrecognized route', () => {
    expect(resolveGateId('/sovereign-vault')).toBeNull();
  });
});
