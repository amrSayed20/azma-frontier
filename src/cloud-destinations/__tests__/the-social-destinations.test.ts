/**
 * AZMA OS — the four social destinations, 2026-10-05.
 *
 *   Each test here guards something that, if it broke, would let the Empire
 *   tell a Creator something untrue: that a video was published when it is a
 *   draft, that a destination exists when Meta offers none, that an asset is
 *   reachable when its grant has expired.
 *
 *   `fetch` is replaced throughout; no test touches a provider.
 */

import { youtubeDestination, youtubeAcceptsMimeType, YOUTUBE_SCOPES } from '../youtube-destination';
import {
  facebookPageDestination, instagramBusinessDestination, metaOAuthDestination,
  discoverMetaDestinations, META_SCOPES,
} from '../meta-destination';
import { tiktokDestination, TIKTOK_SCOPES, TIKTOK_MAX_BYTES } from '../tiktok-destination';
import { destinationFor, serverCanDeliver } from '../destination-for';
import { mintMediaGrant, openMediaGrant, MEDIA_GRANT_TTL_MS } from '../fetchable-media-grant';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
const MP4 = new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]);

const original = global.fetch;
let calls: string[];
beforeEach(() => {
  calls = [];
  process.env.GOOGLE_CLIENT_ID = 'test-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
  process.env.META_APP_ID = 'meta-id';
  process.env.META_APP_SECRET = 'meta-secret';
  process.env.TIKTOK_CLIENT_KEY = 'tt-key';
  process.env.TIKTOK_CLIENT_SECRET = 'tt-secret';
  process.env.AZMA_TOKEN_KEY = 'a-test-key-of-at-least-thirty-two-characters';
});
afterEach(() => {
  global.fetch = original;
  for (const k of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'META_APP_ID', 'META_APP_SECRET',
    'TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'AZMA_TOKEN_KEY']) delete process.env[k];
});

function answer(fn: (url: string, init?: RequestInit) => unknown) {
  global.fetch = (async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    calls.push(url);
    const r = fn(url, init) as { status?: number; body?: unknown };
    const status = r.status ?? 200;
    return { ok: status >= 200 && status < 300, status, json: async () => r.body ?? {} } as unknown as Response;
  }) as unknown as typeof fetch;
}

// ── A · every destination resolves, and the server can deliver for each ───
it('A · all four social providers resolve to a real destination', () => {
  for (const p of ['youtube', 'facebook-page', 'instagram-business', 'tiktok'] as const) {
    expect(destinationFor(p)).not.toBeNull();
    expect(serverCanDeliver(p)).toBe(true);
  }
});

it('A · and the sealed providers are untouched by their arrival', () => {
  expect(serverCanDeliver('google-drive')).toBe(true);
  expect(serverCanDeliver('telegram')).toBe(true);
  // telegram-user remains client-delivered — adding four server providers
  // must not have quietly given it a server path.
  expect(serverCanDeliver('telegram-user')).toBe(false);
});

// ── B · YouTube ───────────────────────────────────────────────────────────
it('B · YouTube asks only for upload, never for the channel', () => {
  const scope = new URL(youtubeDestination.authorizationUrl({
    redirectUri: 'https://azmaos.com/api/cloud/youtube/callback', state: 's', nonce: 'n',
  })).searchParams.get('scope') ?? '';
  expect(scope.split(' ')).toEqual([...YOUTUBE_SCOPES]);
  // The broad `youtube` scope would grant reading, editing, comments and
  // playlists for a capability whose whole purpose is to insert one video.
  expect(scope).not.toMatch(/auth\/youtube(\s|$)/);
});

it('B · and asks for offline access with a forced consent', () => {
  const u = new URL(youtubeDestination.authorizationUrl({ redirectUri: 'https://x/cb', state: 's', nonce: 'n' }));
  expect(u.searchParams.get('access_type')).toBe('offline');
  expect(u.searchParams.get('prompt')).toBe('consent');
});

it('B · and never asks Google to add the scopes already granted', () => {
  // MEASURED on production 2026-10-05. With `include_granted_scopes=true`
  // copied from the Drive binding, a Creator who had linked their Drive was
  // sent to a screen asking for YouTube AND Drive at once, and Google refused:
  //   «scopes that cannot be requested together: youtube.upload, drive.file»
  // YouTube's grant must stand alone.
  const u = new URL(youtubeDestination.authorizationUrl({ redirectUri: 'https://x/cb', state: 's', nonce: 'n' }));
  expect(u.searchParams.get('include_granted_scopes')).toBeNull();
  expect(u.searchParams.get('scope')).not.toContain('drive');
});

it('B · an image is refused before YouTube is troubled with it', async () => {
  answer(() => ({ body: { id: 'v' } }));
  expect(await youtubeDestination.deliver('tok', {
    bytes: PNG, fileName: 'a.png', mimeType: 'image/png',
  })).toMatchObject({ ok: false, reason: 'rejected' });
  expect(calls).toEqual([]);
  expect(youtubeAcceptsMimeType('image/png')).toBe(false);
  expect(youtubeAcceptsMimeType('video/mp4')).toBe(true);
});

it('B · a real video id is what comes back', async () => {
  answer(() => ({ body: { id: 'dQw4w9WgXcQ' } }));
  expect(await youtubeDestination.deliver('tok', {
    bytes: MP4, fileName: 'a.mp4', mimeType: 'video/mp4',
  })).toEqual({ ok: true, providerFileId: 'dQw4w9WgXcQ' });
});

it('B · a 200 with no video id is NOT a publication', async () => {
  answer(() => ({ body: {} }));
  expect(await youtubeDestination.deliver('tok', {
    bytes: MP4, fileName: 'a.mp4', mimeType: 'video/mp4',
  })).toMatchObject({ ok: false, reason: 'rejected' });
});

// ── C · Meta — one binding, two destinations ──────────────────────────────
it('C · Meta is a binding and refuses to be published to', async () => {
  expect(await metaOAuthDestination.deliver('tok', {
    bytes: PNG, fileName: 'a.png', mimeType: 'image/png',
  })).toMatchObject({ ok: false, reason: 'rejected' });
});

it('C · Meta never asks for business_management', () => {
  const scope = new URL(metaOAuthDestination.authorizationUrl({
    redirectUri: 'https://azmaos.com/api/cloud/meta/callback', state: 's', nonce: 'n',
  })).searchParams.get('scope') ?? '';
  expect(scope.split(',')).toEqual([...META_SCOPES]);
  // It would grant control of a Creator's whole business portfolio for a
  // capability that posts one file.
  expect(scope).not.toContain('business_management');
});

it('C · discovery finds a Page and the Instagram account linked to it', async () => {
  answer(() => ({ body: { data: [
    { id: '100', name: 'قناة أزما', access_token: 'page-tok',
      instagram_business_account: { id: '200', username: 'azma' } },
  ] } }));
  const found = await discoverMetaDestinations('user-tok');
  expect(found.map((d) => d.kind)).toEqual(['facebook-page', 'instagram-business']);
  // Instagram publishes under the PAGE's token, not one of its own.
  expect(found[1].accessToken).toBe('page-tok');
  expect(found[1].id).toBe('200');
});

it('C · a Page with no Instagram account yields exactly one destination', async () => {
  answer(() => ({ body: { data: [{ id: '100', name: 'صفحة', access_token: 't' }] } }));
  expect((await discoverMetaDestinations('u')).map((d) => d.kind)).toEqual(['facebook-page']);
});

it('C · a Creator with no Page gets nothing, not a connected-but-useless account', async () => {
  answer(() => ({ body: { data: [] } }));
  expect(await discoverMetaDestinations('u')).toEqual([]);
});

it('C · a Page post returns the post id, preferred over the object id', async () => {
  answer(() => ({ body: { id: '100_1', post_id: '100_999' } }));
  expect(await facebookPageDestination.deliver('tok', {
    bytes: PNG, fileName: 'a.png', mimeType: 'image/png', providerTarget: '100',
  })).toEqual({ ok: true, providerFileId: '100_999' });
  expect(calls[0]).toContain('/100/photos');
});

it('C · a Page video goes to videos, not photos', async () => {
  answer(() => ({ body: { id: 'v1' } }));
  await facebookPageDestination.deliver('tok', {
    bytes: MP4, fileName: 'a.mp4', mimeType: 'video/mp4', providerTarget: '100',
  });
  expect(calls[0]).toContain('/100/videos');
});

it('C · Instagram refuses to publish without the URL it requires', async () => {
  answer(() => ({ body: { id: 'x' } }));
  expect(await instagramBusinessDestination.deliver('tok', {
    bytes: PNG, fileName: 'a.png', mimeType: 'image/png', providerTarget: '200',
  })).toMatchObject({ ok: false, reason: 'rejected' });
  // Nothing was sent to Meta: this is a caller error, named as one.
  expect(calls).toEqual([]);
});

it('C · Instagram publishes in two steps and returns the published id', async () => {
  answer((url) => (url.includes('media_publish')
    ? { body: { id: 'IG_POST_1' } }
    : { body: { id: 'CONTAINER_1' } }));
  const outcome = await instagramBusinessDestination.deliver('tok', {
    bytes: PNG, fileName: 'a.png', mimeType: 'image/png',
    providerTarget: '200', publicMediaUrl: 'https://azmaos.com/m/abc',
  });
  expect(outcome).toEqual({ ok: true, providerFileId: 'IG_POST_1' });
  expect(calls[0]).toContain('image_url=');
  expect(calls[1]).toContain('creation_id=CONTAINER_1');
});

// ── D · TikTok — a draft, and never called a publication ──────────────────
it('D · TikTok asks only for upload, which needs no audit', () => {
  const u = new URL(tiktokDestination.authorizationUrl({ redirectUri: 'https://x/cb', state: 's', nonce: 'n' }));
  expect(u.searchParams.get('scope')).toBe(TIKTOK_SCOPES.join(','));
  // `video.publish` would be the direct-post scope, and asking for one TikTok
  // has not audited produces a link that fails at consent.
  expect(u.searchParams.get('scope')).not.toContain('video.publish');
});

it('D · the bytes go to the URL TikTok issues, not to the init endpoint', async () => {
  answer((url) => (url.includes('/init/')
    ? { body: { data: { publish_id: 'pub_1', upload_url: 'https://upload.tiktok/x' } } }
    : { body: {} }));
  const outcome = await tiktokDestination.deliver('tok', {
    bytes: MP4, fileName: 'a.mp4', mimeType: 'video/mp4',
  });
  expect(outcome).toEqual({ ok: true, providerFileId: 'pub_1' });
  expect(calls[0]).toContain('/inbox/video/init/');
  expect(calls[1]).toBe('https://upload.tiktok/x');
});

it('D · a file past TikTok\'s ceiling is refused here, with the real reason', async () => {
  answer(() => ({ body: {} }));
  expect(await tiktokDestination.deliver('tok', {
    bytes: new Uint8Array(TIKTOK_MAX_BYTES + 1), fileName: 'a.mp4', mimeType: 'video/mp4',
  })).toMatchObject({ ok: false, reason: 'rejected' });
  expect(calls).toEqual([]);
});

it('D · an image is refused — TikTok takes video', async () => {
  answer(() => ({ body: {} }));
  expect(await tiktokDestination.deliver('tok', {
    bytes: PNG, fileName: 'a.png', mimeType: 'image/png',
  })).toMatchObject({ ok: false, reason: 'rejected' });
});

// ── E · the grant that opens one asset for minutes ────────────────────────
it('E · a grant opens exactly the asset and owner sealed into it', () => {
  const token = mintMediaGrant('asset-1', 'creator-1')!;
  expect(openMediaGrant(token)).toEqual({ assetId: 'asset-1', ownerId: 'creator-1' });
});

it('E · and is worthless once its minutes are spent', () => {
  const token = mintMediaGrant('asset-1', 'creator-1', 1_000)!;
  expect(openMediaGrant(token, 1_000 + MEDIA_GRANT_TTL_MS + 1)).toBeNull();
});

it('E · a tampered or foreign token opens nothing', () => {
  expect(openMediaGrant('not-a-grant')).toBeNull();
  const token = mintMediaGrant('asset-1', 'creator-1')!;
  expect(openMediaGrant(token.slice(0, -4) + 'AAAA')).toBeNull();
});

it('E · and no grant is minted at all when the vault has no key', () => {
  delete process.env.AZMA_TOKEN_KEY;
  // The same refusal the vault makes everywhere — never a weaker fallback.
  expect(mintMediaGrant('asset-1', 'creator-1')).toBeNull();
});
