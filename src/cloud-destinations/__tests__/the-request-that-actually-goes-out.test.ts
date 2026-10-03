/**
 * AZMA OS — what the Drive authorization request actually carries, 2026-10-03.
 *
 *   The directive was explicit: «Do not merely verify that drive.file exists in
 *   documentation or Cloud Console. Verify that the runtime authorization
 *   request actually contains it.»
 *
 *   MEASURED on production the same day, by following /api/cloud/google/start
 *   as the Founder and reading the redirect Google was handed:
 *
 *       scope        openid email https://www.googleapis.com/auth/drive.file
 *       redirect_uri https://azmaos.com/api/cloud/google/callback
 *       access_type  offline   ·   prompt  consent
 *       state ✓  nonce ✓  client_id ✓
 *
 *   This suite holds every one of those to the code, so the measurement cannot
 *   quietly stop being true. Each assertion below is a line that, if deleted,
 *   breaks a real thing in a way no other test would catch.
 */

import { googleDriveDestination, DRIVE_SCOPE } from '../google-drive-destination';

const URL_FOR = () =>
  new URL(googleDriveDestination.authorizationUrl({
    redirectUri: 'https://azmaos.com/api/cloud/google/callback',
    state: 'state-value',
    nonce: 'nonce-value',
  }));

beforeEach(() => { process.env.GOOGLE_CLIENT_ID = 'test-client-id'; });
afterEach(() => { delete process.env.GOOGLE_CLIENT_ID; });

it('the request that goes to Google carries drive.file, and nothing wider', () => {
  const scope = URL_FOR().searchParams.get('scope') ?? '';
  expect(scope.split(' ')).toEqual(['openid', 'email', DRIVE_SCOPE]);
  // The restricted Drive scopes would see the Creator's whole drive. An
  // application that uploads one file has no use for that power.
  expect(scope).not.toMatch(/auth\/drive(\.readonly|\.metadata)?(\s|$)/);
});

it('and asks for offline access with a forced consent', () => {
  // Google returns a refresh token ONLY with access_type=offline, and only on
  // the FIRST consent unless prompt=consent forces it again. Without both, a
  // Creator re-links successfully, nothing usable is stored, and the failure
  // surfaces weeks later when a file will not upload.
  const u = URL_FOR();
  expect(u.searchParams.get('access_type')).toBe('offline');
  expect(u.searchParams.get('prompt')).toBe('consent');
});

it('and binds the callback to this browser and this request', () => {
  const u = URL_FOR();
  // `state` defeats a link an attacker sends; `nonce` defeats a genuine
  // id_token captured elsewhere and replayed into our callback.
  expect(u.searchParams.get('state')).toBe('state-value');
  expect(u.searchParams.get('nonce')).toBe('nonce-value');
});

it('and names the one redirect URI it was handed, never one it built', () => {
  // The lesson this repository already paid for: a redirect URI derived from
  // `request.nextUrl.origin` becomes https://localhost:3000/... behind nginx,
  // and every link dies on Google's own screen where nothing here can explain.
  expect(URL_FOR().searchParams.get('redirect_uri'))
    .toBe('https://azmaos.com/api/cloud/google/callback');
});

it('and refuses to be built at all when the Empire holds no credential', () => {
  delete process.env.GOOGLE_CLIENT_ID;
  expect(() => URL_FOR()).toThrow();
});
