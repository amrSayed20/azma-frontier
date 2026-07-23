import { resolveChamberContext, resolveSceneIdentity } from '../route-context';

describe('DirectorStage — Route Context Resolution', () => {
  it('resolveChamberContext is unchanged — still resolves only the 5 real Chambers, everything else to universal', () => {
    expect(resolveChamberContext('/qiyamah-chamber')).toBe('qiyamah-chamber');
    expect(resolveChamberContext('/login')).toBe('universal');
    expect(resolveChamberContext('/')).toBe('universal');
  });

  it('resolveSceneIdentity recognizes Imperial Gates distinctly from Chambers', () => {
    expect(resolveSceneIdentity('/')).toBe('landing');
    expect(resolveSceneIdentity('/login')).toBe('login');
    expect(resolveSceneIdentity('/signup')).toBe('signup');
    expect(resolveSceneIdentity('/subscribe')).toBe('subscription');
    expect(resolveSceneIdentity('/subscribe/success')).toBe('subscription');
  });

  it('resolveSceneIdentity still resolves real Chambers exactly as before', () => {
    expect(resolveSceneIdentity('/qiyamah-chamber')).toBe('qiyamah-chamber');
    expect(resolveSceneIdentity('/ras-amr')).toBe('ras-amr');
  });

  it('resolveSceneIdentity falls back to universal for routes that are neither a Gate nor a Chamber', () => {
    expect(resolveSceneIdentity('/sovereign-vault')).toBe('universal');
    expect(resolveSceneIdentity('/founder')).toBe('universal');
  });
});
