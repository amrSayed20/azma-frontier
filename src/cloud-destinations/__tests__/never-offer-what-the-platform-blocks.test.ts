/**
 * AZMA OS — THE GATE, 2026-10-10.
 *
 * FOUNDER'S RULE: a destination is offered ONLY to a Creator who can complete
 * it today. Each test here guards one way the old code broke it.
 */

import {
  destinationAccessFor, platformAdmits, offerKeyOfProvider,
} from '../destination-eligibility';

const NAMES = ['AZMA_PLATFORM_ADMITS_TIKTOK', 'AZMA_PLATFORM_ADMITS_META', 'AZMA_PLATFORM_ADMITS_YOUTUBE'];
afterEach(() => { for (const n of NAMES) delete process.env[n]; });

const ask = (offerKey: string, creatorEmail: string | null) =>
  destinationAccessFor({ offerKey, empireHoldsCredential: true, creatorEmail });

describe('the Empire holding a key is not the platform admitting a Creator', () => {
  it('a Creator the platform does not admit is not offered the destination', () => {
    process.env.AZMA_PLATFORM_ADMITS_TIKTOK = 'founder@azmaos.com';
    expect(ask('tiktok', 'subscriber@example.com').access).toBe('AWAITING_PLATFORM_REVIEW');
  });

  it('an undeclared platform admits nobody — the default is closed', () => {
    expect(ask('tiktok', 'founder@azmaos.com').access).toBe('AWAITING_PLATFORM_REVIEW');
  });

  it('a Creator the platform admits is offered the destination', () => {
    process.env.AZMA_PLATFORM_ADMITS_META = 'founder@azmaos.com';
    expect(ask('meta', 'founder@azmaos.com').access).toBe('OPEN');
  });

  it('a granted review opens the destination to every Creator', () => {
    process.env.AZMA_PLATFORM_ADMITS_YOUTUBE = 'everyone';
    expect(ask('youtube', 'anyone@example.com').access).toBe('OPEN');
  });
});

describe('each refusal names its own remedy', () => {
  it('a missing Empire credential is never reported as a platform review', () => {
    process.env.AZMA_PLATFORM_ADMITS_TIKTOK = 'everyone';
    expect(destinationAccessFor({
      offerKey: 'tiktok', empireHoldsCredential: false, creatorEmail: 'founder@azmaos.com',
    }).access).toBe('NOT_CONFIGURED');
  });

  it('an open door carries no reason to show', () => {
    process.env.AZMA_PLATFORM_ADMITS_META = 'everyone';
    expect(ask('meta', null).reasonAr).toBe('');
  });

  it('a closed door always carries one', () => {
    expect(ask('tiktok', 'subscriber@example.com').reasonAr.length).toBeGreaterThan(0);
  });
});

describe('the gate judges only what a platform reviews', () => {
  it('the Creator’s own credential answers to no review', () => {
    expect(offerKeyOfProvider('telegram')).toBeNull();
    expect(offerKeyOfProvider('google-drive')).toBeNull();
  });

  it('one Meta consent is one reviewed door for both its providers', () => {
    expect(offerKeyOfProvider('facebook-page')).toBe('meta');
    expect(offerKeyOfProvider('instagram-business')).toBe('meta');
  });
});

describe('an admit list is read as accounts, not as text', () => {
  it('an emptied declaration does not keep admitting the last name in it', () => {
    process.env.AZMA_PLATFORM_ADMITS_TIKTOK = '   ';
    expect(platformAdmits('tiktok', 'founder@azmaos.com')).toBe(false);
  });

  it('a name listed among others is admitted whatever the spacing', () => {
    process.env.AZMA_PLATFORM_ADMITS_META = 'a@x.com, Founder@AZMAOS.com ; b@x.com';
    expect(platformAdmits('meta', 'founder@azmaos.com')).toBe(true);
  });

  it('a Creator with no email is never admitted by a list', () => {
    process.env.AZMA_PLATFORM_ADMITS_META = 'founder@azmaos.com';
    expect(platformAdmits('meta', null)).toBe(false);
  });
});

/**
 * A guard nobody calls is not a guard. Three doors lead out of the Empire to a
 * reviewed platform — the Chamber's link button, the OAuth start route, and
 * the publishing action — and the debt was paid only if all three ask.
 */
describe('every door out asks the gate', () => {
  const read = (f: string) =>
    require('fs').readFileSync(require('path').join(process.cwd(), f), 'utf8') as string;

  it.each([
    'app/makman-al-ghayah/cloud-actions.ts',
    'src/cloud-destinations/oauth-link-flow.ts',
  ])('%s reads the verdict', (file) => {
    expect(read(file)).toContain('destinationAccessFor');
  });

  it('the Chamber no longer draws a destination from a bare boolean', () => {
    expect(read('app/makman-al-ghayah/page.tsx')).not.toContain('cloud?.offers');
  });
});
