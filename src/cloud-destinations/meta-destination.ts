/**
 * AZMA OS — ONE META BINDING, TWO REAL DESTINATIONS
 *
 * ─── FACEBOOK AND INSTAGRAM ARE NOT TWO INTEGRATIONS ────────────────────────
 *
 *   They are one application, one consent, one token — and then two kinds of
 *   place to publish. Building them separately would mean two OAuth flows, two
 *   token stores and two consent screens for a Creator who has one Meta
 *   account. The same economy Telegram taught: one bot, many chats.
 *
 * ─── WHAT META ACTUALLY PERMITS, SAID BEFORE IT IS DISCOVERED ───────────────
 *
 *   There is NO official way to publish to a personal Facebook profile. Meta
 *   removed `publish_actions` in 2018 and never replaced it. Any «post to your
 *   Facebook» that is not a Page is a promise the platform will not keep, so
 *   this module names its providers `facebook-page` and `instagram-business`
 *   after the only things that exist.
 *
 *   Instagram likewise publishes only from a PROFESSIONAL account — Business
 *   or Creator — linked to a Page. A personal Instagram account cannot be
 *   published to by any API, and discovery below simply will not find one.
 *
 * ─── AND THE ASYMMETRY THAT SHAPES THE CODE ─────────────────────────────────
 *
 *   A Page accepts the bytes: one multipart request, done. Instagram refuses
 *   bytes entirely — it takes a URL and fetches the file with Meta's own
 *   servers, in two steps, container then publish. That is why
 *   `publicMediaUrl` exists on the delivery contract, and why only this one
 *   destination reads it.
 */

import type {
  CloudDestination,
  DeliveryRequest,
  DeliveryOutcome,
} from './destination-contract';

const GRAPH = 'https://graph.facebook.com/v21.0';
const DIALOG = 'https://www.facebook.com/v21.0/dialog/oauth';

/**
 * The narrowest set that can list Pages and publish to both destinations.
 *
 * `pages_read_engagement` is required by Meta alongside `pages_manage_posts`;
 * `business_management` is deliberately NOT requested — it grants control over
 * a Creator's whole business portfolio for a capability that posts one file.
 */
export const META_SCOPES: readonly string[] = [
  'business_management',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
];

const appId = () => process.env.META_APP_ID;
const appSecret = () => process.env.META_APP_SECRET;
/**
 * The Facebook Login FOR BUSINESS configuration, when the app uses one.
 *
 * ─── WHY THIS EXISTS, AND WHAT IT MEASURED ────────────────────────────────
 *
 *   A Meta app built on use cases has no classic Facebook Login product, and
 *   therefore no scope list of its own. Asking it for scopes produced, on
 *   production 2026-10-06:
 *
 *       نطاقات غير صالحة: pages_show_list, pages_manage_posts, …
 *
 *   Business Login takes its permissions from a CONFIGURATION created in the
 *   app, identified by this id. The permissions live there, not in the request
 *   — so when a config id is present the request carries it INSTEAD of
 *   `scope`, never both.
 *
 *   It is not a secret: it appears in the authorization URL every Creator
 *   sees. It is an environment value only because it belongs to the Empire's
 *   Meta app rather than to this source tree.
 */
const loginConfigId = () => process.env.META_LOGIN_CONFIG_ID;

export function metaIsConfigured(): boolean {
  return Boolean(appId() && appSecret());
}

export class MetaNotConfigured extends Error {
  constructor() {
    super('META_APP_ID / META_APP_SECRET are not set');
    this.name = 'MetaNotConfigured';
  }
}

/** One place a Creator may actually publish to, as Meta itself reports it. */
export interface MetaDestination {
  readonly kind: 'facebook-page' | 'instagram-business';
  /** The Page id, or the Instagram professional account id. */
  readonly id: string;
  readonly label: string;
  /**
   * The PAGE access token. Instagram publishing is authorised by the token of
   * the Page its professional account is linked to, not by a token of its own
   * — which is why both kinds carry the same credential here.
   */
  readonly accessToken: string;
}

type GraphError = { error?: { message?: unknown; code?: unknown; type?: unknown } };

/** Meta's own words never reach a Creator; only a status and a code are kept. */
function detailOf(status: number, body: unknown): string {
  const e = (body as GraphError)?.error;
  const code = typeof e?.code === 'number' ? ` code=${e.code}` : '';
  return `HTTP ${status}${code}`;
}

/**
 * Turn the Creator's consent into every destination it actually opened.
 *
 * `/me/accounts` returns the Pages they administer, and each Page carries its
 * own token plus — when one exists — the Instagram professional account linked
 * to it. A Creator with no Page gets an empty list, which is the honest answer:
 * they have granted consent to publish nowhere, and the Chamber must say so
 * rather than show a connected account that cannot publish.
 */
export async function discoverMetaDestinations(userAccessToken: string): Promise<readonly MetaDestination[]> {
  const url = new URL(`${GRAPH}/me/accounts`);
  url.searchParams.set('fields', 'id,name,access_token,instagram_business_account{id,username}');
  url.searchParams.set('access_token', userAccessToken);

  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const body = (await response.json().catch(() => ({}))) as {
    data?: ReadonlyArray<{
      id?: unknown; name?: unknown; access_token?: unknown;
      instagram_business_account?: { id?: unknown; username?: unknown };
    }>;
    error?: { message?: unknown; code?: unknown; type?: unknown };
  };

  // ── AN EMPTY LIST AND A FAILED REQUEST ARE NOT THE SAME THING ──────────
  //   MEASURED on production 2026-10-07: three consenting links in a row
  //   ended in «meta-no-destinations», and nothing in the Empire could say
  //   whether Meta had answered «you administer no Page» or had refused the
  //   call outright. `if (!response.ok) return []` erased the difference.
  //
  //   Only the status and Meta's own error CODE are logged — never the token,
  //   and never Meta's prose, which can echo request parameters.
  if (!response.ok || body.error) {
    console.error('[meta/discover] refused:', detailOf(response.status, body),
      typeof body.error?.type === 'string' ? body.error.type : '');
    return [];
  }
  const count = (body.data ?? []).length;
  console.log('[meta/discover] pages returned:', count);

  // ── WHEN /me/accounts IS EMPTY, THE PAGES MAY BELONG TO A PORTFOLIO ────
  //
  //   MEASURED on production 2026-10-07/08, over several real consents:
  //
  //       granted: pages_show_list, pages_read_engagement, pages_manage_posts
  //       /me/accounts → 0        (with the short token too, so not the exchange)
  //       /me/businesses → code=100   (no business_management)
  //
  //   And the Creator does hold a Page — «شوف عظمة» — but his role on it comes
  //   THROUGH the business portfolio that owns it. `pages_show_list` reports
  //   Pages a person administers directly; a Page held by a portfolio is not
  //   one of those, so the honest answer from Meta was an empty list.
  //
  //   So when the direct list is empty, the portfolio is asked instead. This
  //   path needs `business_management`, which is a wider permission than this
  //   Empire likes — it is requested ONLY because a narrower one was tried
  //   first and measured insufficient for a real Creator's real Page.
  if ((body.data ?? []).length === 0) {
    const fromPortfolio = await discoverThroughPortfolios(userAccessToken);
    console.log('[meta/discover] pages via portfolio:', fromPortfolio.length);
    if (fromPortfolio.length > 0) return fromPortfolio;
  }

  const found: MetaDestination[] = [];
  for (const page of body.data ?? []) {
    if (typeof page.id !== 'string' || typeof page.access_token !== 'string') continue;
    const name = typeof page.name === 'string' ? page.name : 'صفحة';
    found.push({ kind: 'facebook-page', id: page.id, label: name, accessToken: page.access_token });

    const ig = page.instagram_business_account;
    if (ig && typeof ig.id === 'string') {
      const handle = typeof ig.username === 'string' ? `@${ig.username}` : 'إنستجرام';
      found.push({ kind: 'instagram-business', id: ig.id, label: `${handle} — ${name}`, accessToken: page.access_token });
    }
  }
  return found;
}

/**
 * The Pages a Creator reaches through a business portfolio.
 *
 * Two hops, because Meta models it in two: the portfolios the person belongs
 * to, then the Pages each portfolio owns. A Page token is requested per Page —
 * `owned_pages` does not carry one — and a Page whose token cannot be obtained
 * is skipped rather than returned without the credential that publishes it.
 */
async function discoverThroughPortfolios(userAccessToken: string): Promise<readonly MetaDestination[]> {
  const found: MetaDestination[] = [];
  try {
    const biz = new URL(`${GRAPH}/me/businesses`);
    biz.searchParams.set('access_token', userAccessToken);
    const businesses = (await (await fetch(biz, { signal: AbortSignal.timeout(20_000) })).json()) as {
      data?: ReadonlyArray<{ id?: unknown }>; error?: { code?: unknown };
    };
    if (businesses.error || !businesses.data?.length) {
      console.error('[meta/portfolio] unavailable:',
        businesses.error ? `code=${String(businesses.error.code)}` : 'none');
      return found;
    }

    for (const b of businesses.data) {
      if (typeof b.id !== 'string') continue;
      for (const edge of ['owned_pages', 'client_pages'] as const) {
        const pages = new URL(`${GRAPH}/${b.id}/${edge}`);
        pages.searchParams.set('fields', 'id,name,access_token,instagram_business_account{id,username}');
        pages.searchParams.set('access_token', userAccessToken);
        const got = (await (await fetch(pages, { signal: AbortSignal.timeout(20_000) })).json()) as {
          data?: ReadonlyArray<{
            id?: unknown; name?: unknown; access_token?: unknown;
            instagram_business_account?: { id?: unknown; username?: unknown };
          }>;
        };
        for (const page of got.data ?? []) {
          if (typeof page.id !== 'string') continue;
          if (found.some((f) => f.id === page.id)) continue;

          // `owned_pages` rarely carries a token; ask the Page for its own.
          let token = typeof page.access_token === 'string' ? page.access_token : null;
          if (!token) {
            const one = new URL(`${GRAPH}/${page.id}`);
            one.searchParams.set('fields', 'access_token');
            one.searchParams.set('access_token', userAccessToken);
            const t = (await (await fetch(one, { signal: AbortSignal.timeout(15_000) })).json()) as
              { access_token?: unknown };
            token = typeof t.access_token === 'string' ? t.access_token : null;
          }
          // A destination without the credential that publishes to it is not a
          // destination. It is dropped rather than shown as connected.
          if (!token) { console.error('[meta/portfolio] no page token for', page.id); continue; }

          const name = typeof page.name === 'string' ? page.name : 'صفحة';
          found.push({ kind: 'facebook-page', id: page.id, label: name, accessToken: token });
          const ig = page.instagram_business_account;
          if (ig && typeof ig.id === 'string') {
            const handle = typeof ig.username === 'string' ? `@${ig.username}` : 'إنستجرام';
            found.push({ kind: 'instagram-business', id: ig.id, label: `${handle} — ${name}`, accessToken: token });
          }
        }
      }
    }
  } catch (err) {
    console.error('[meta/portfolio] failed:', err instanceof Error ? err.message.slice(0, 120) : 'unknown');
  }
  return found;
}

/**
 * The OAuth half, shared by both destinations.
 *
 * It implements `CloudDestination` so the one linking flow can drive it, and
 * its `deliver` refuses: nothing publishes to «Meta», only to a Page or to an
 * Instagram professional account. A stub that returned something plausible
 * here would be a path a caller could take by accident.
 */
export const metaOAuthDestination: CloudDestination = {
  identity: {
    id: 'facebook-page',
    labelAr: 'ميتا',
    get configured() { return metaIsConfigured(); },
  },

  authorizationUrl({ redirectUri, state }) {
    const id = appId();
    if (!id) throw new MetaNotConfigured();
    const url = new URL(DIALOG);
    url.searchParams.set('client_id', id);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    const config = loginConfigId();
    if (config) {
      // Business Login: the configuration names the permissions. Sending
      // `scope` alongside it is what Meta refused — see the header.
      url.searchParams.set('config_id', config);
    } else {
      // Classic Facebook Login, for an app that has the product.
      url.searchParams.set('scope', META_SCOPES.join(','));
    }
    return url.toString();
  },

  /**
   * Meta's first token lives about an hour. The exchange for a long-lived one
   * is a SECOND call, and skipping it yields a link that works during testing
   * and dies silently the same afternoon.
   */
  async exchangeCode(code, redirectUri) {
    const id = appId();
    const secret = appSecret();
    if (!id || !secret) throw new MetaNotConfigured();

    const first = new URL(`${GRAPH}/oauth/access_token`);
    first.searchParams.set('client_id', id);
    first.searchParams.set('client_secret', secret);
    first.searchParams.set('redirect_uri', redirectUri);
    first.searchParams.set('code', code);
    const short = await fetch(first, { signal: AbortSignal.timeout(20_000) });
    if (!short.ok) throw new Error(`meta exchange failed: HTTP ${short.status}`);
    const shortBody = (await short.json()) as { access_token?: unknown };
    if (typeof shortBody.access_token !== 'string') throw new Error('meta exchange failed: no access_token');

    // ── DOES THE TOKEN SEE THE PAGES BEFORE WE EXCHANGE IT? ──────────────
    //   MEASURED 2026-10-07: pages_show_list, pages_read_engagement and
    //   pages_manage_posts were all granted, and `/me/accounts` still returned
    //   none. One suspect is this very exchange: a Business Login token is
    //   scoped to the assets the Creator picked, and trading it for a
    //   long-lived one may not carry that scoping across.
    //
    //   Counting with the SHORT-lived token isolates that. Counts only.
    try {
      const before = new URL(`${GRAPH}/me/accounts`);
      before.searchParams.set('access_token', shortBody.access_token);
      const seen = (await (await fetch(before, { signal: AbortSignal.timeout(15_000) })).json()) as {
        data?: ReadonlyArray<unknown>; error?: { code?: unknown };
      };
      console.log('[meta/exchange] pages visible to SHORT token:',
        seen.error ? `error code=${String(seen.error.code)}` : (seen.data ?? []).length);
    } catch { console.log('[meta/exchange] pages visible to SHORT token: (probe failed)'); }

    const second = new URL(`${GRAPH}/oauth/access_token`);
    second.searchParams.set('grant_type', 'fb_exchange_token');
    second.searchParams.set('client_id', id);
    second.searchParams.set('client_secret', secret);
    second.searchParams.set('fb_exchange_token', shortBody.access_token);
    const long = await fetch(second, { signal: AbortSignal.timeout(20_000) });
    if (!long.ok) throw new Error(`meta long-lived exchange failed: HTTP ${long.status}`);
    const longBody = (await long.json()) as { access_token?: unknown };
    const token = typeof longBody.access_token === 'string' ? longBody.access_token : shortBody.access_token;

    return { refreshToken: token, accountId: 'meta-user', accountLabel: null, scopes: META_SCOPES };
  },

  // A Page token derived from a long-lived user token does not expire, so the
  // stored grant IS the access. It is returned unchanged rather than refreshed
  // against an endpoint that would only echo it back.
  async refreshAccess(refreshToken) { return refreshToken; },

  async deliver() {
    return { ok: false, reason: 'rejected', detail: 'meta is a binding, not a destination' };
  },
};

/** Publish to a Facebook Page. It takes the bytes directly. */
export const facebookPageDestination: CloudDestination = {
  identity: {
    id: 'facebook-page',
    labelAr: 'صفحة فيسبوك',
    get configured() { return metaIsConfigured(); },
  },
  authorizationUrl(input) { return metaOAuthDestination.authorizationUrl(input); },
  exchangeCode(code, redirectUri, nonce) { return metaOAuthDestination.exchangeCode(code, redirectUri, nonce); },
  async refreshAccess(refreshToken) { return refreshToken; },

  async deliver(accessToken, request: DeliveryRequest): Promise<DeliveryOutcome> {
    const pageId = request.providerTarget;
    if (!pageId) return { ok: false, reason: 'rejected', detail: 'no page target given' };

    const isPhoto = request.mimeType.startsWith('image/');
    const isVideo = request.mimeType.startsWith('video/');
    if (!isPhoto && !isVideo) {
      return { ok: false, reason: 'rejected', detail: `unsupported media ${request.mimeType}` };
    }

    const form = new FormData();
    form.set('access_token', accessToken);
    form.set('published', 'true');
    form.set('source', new Blob([new Uint8Array(request.bytes)], { type: request.mimeType }), request.fileName);

    try {
      const response = await fetch(`${GRAPH}/${encodeURIComponent(pageId)}/${isPhoto ? 'photos' : 'videos'}`, {
        method: 'POST', body: form, signal: AbortSignal.timeout(300_000),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: unknown; post_id?: unknown };

      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: 'unauthorised', detail: detailOf(response.status, body) };
      }
      if (!response.ok) return { ok: false, reason: 'rejected', detail: detailOf(response.status, body) };

      // `post_id` identifies the post; `id` the photo/video object. Either is
      // a real provider identifier, and the post is preferred because it is
      // what a Creator can actually open.
      const id = typeof body.post_id === 'string' ? body.post_id
        : typeof body.id === 'string' ? body.id : null;
      return id ? { ok: true, providerFileId: id }
        : { ok: false, reason: 'rejected', detail: 'no post id returned' };
    } catch (err) {
      return { ok: false, reason: 'unreachable', detail: err instanceof Error ? err.message : 'no response' };
    }
  },
};

/**
 * Publish to an Instagram professional account.
 *
 * Two calls, because Meta requires two: a container that names a URL Meta will
 * fetch, then a publish that makes it live. The container may take seconds to
 * become ready for video, so the publish is retried briefly rather than failing
 * on a race that is expected behaviour.
 */
export const instagramBusinessDestination: CloudDestination = {
  identity: {
    id: 'instagram-business',
    labelAr: 'إنستجرام',
    get configured() { return metaIsConfigured(); },
  },
  authorizationUrl(input) { return metaOAuthDestination.authorizationUrl(input); },
  exchangeCode(code, redirectUri, nonce) { return metaOAuthDestination.exchangeCode(code, redirectUri, nonce); },
  async refreshAccess(refreshToken) { return refreshToken; },

  async deliver(accessToken, request: DeliveryRequest): Promise<DeliveryOutcome> {
    const igUserId = request.providerTarget;
    if (!igUserId) return { ok: false, reason: 'rejected', detail: 'no instagram target given' };
    if (!request.publicMediaUrl) {
      // Not a provider failure — a caller that did not mint the URL Instagram
      // requires. Named as such rather than reported as a Meta rejection.
      return { ok: false, reason: 'rejected', detail: 'instagram requires a fetchable media url' };
    }

    const isVideo = request.mimeType.startsWith('video/');
    if (!isVideo && !request.mimeType.startsWith('image/')) {
      return { ok: false, reason: 'rejected', detail: `unsupported media ${request.mimeType}` };
    }

    try {
      const container = new URL(`${GRAPH}/${encodeURIComponent(igUserId)}/media`);
      container.searchParams.set('access_token', accessToken);
      container.searchParams.set(isVideo ? 'video_url' : 'image_url', request.publicMediaUrl);
      if (isVideo) container.searchParams.set('media_type', 'REELS');

      const made = await fetch(container, { method: 'POST', signal: AbortSignal.timeout(120_000) });
      const madeBody = (await made.json().catch(() => ({}))) as { id?: unknown };
      if (made.status === 401 || made.status === 403) {
        return { ok: false, reason: 'unauthorised', detail: detailOf(made.status, madeBody) };
      }
      if (!made.ok || typeof madeBody.id !== 'string') {
        return { ok: false, reason: 'rejected', detail: detailOf(made.status, madeBody) };
      }

      // Video containers are processed asynchronously; publishing too early is
      // refused with a specific code. Four attempts over ~30s covers the
      // ordinary case without turning a real failure into a long hang.
      let last = 'no attempt';
      for (let attempt = 0; attempt < 4; attempt += 1) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 8_000));
        const publish = new URL(`${GRAPH}/${encodeURIComponent(igUserId)}/media_publish`);
        publish.searchParams.set('access_token', accessToken);
        publish.searchParams.set('creation_id', madeBody.id);
        const done = await fetch(publish, { method: 'POST', signal: AbortSignal.timeout(120_000) });
        const doneBody = (await done.json().catch(() => ({}))) as { id?: unknown };
        if (done.ok && typeof doneBody.id === 'string') {
          return { ok: true, providerFileId: doneBody.id };
        }
        if (done.status === 401 || done.status === 403) {
          return { ok: false, reason: 'unauthorised', detail: detailOf(done.status, doneBody) };
        }
        last = detailOf(done.status, doneBody);
      }
      return { ok: false, reason: 'rejected', detail: last };
    } catch (err) {
      return { ok: false, reason: 'unreachable', detail: err instanceof Error ? err.message : 'no response' };
    }
  },
};
