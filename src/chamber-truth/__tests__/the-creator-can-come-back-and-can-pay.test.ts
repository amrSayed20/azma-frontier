/**
 * AZMA OS — المبدعُ يَعود، ويَدفَع، ويَرى أين وصل.
 *
 * ─── THREE DEAD ENDS, ALL MEASURED ON PRODUCTION, 2026-10-30/31 ─────────────
 *
 *   A real Creator, a real card, a real 99 EGP. The money arrived, the webhook
 *   credited 1,375 units — and three separate things still failed him:
 *
 *     1  The sign-in page offered only a password. Registration has been
 *        Google-only since `registration-requires-verified-identity`, so every
 *        account made since has NO password at all — deliberately, because a
 *        password that does not exist cannot be guessed or stuffed. He typed
 *        his address, was told «Invalid email or password», and had no way in.
 *
 *     2  That refusal was in English on an Arabic page, and named no road out.
 *        For his account it was also unanswerable: no password exists to fix.
 *
 *     3  After paying, XPay returned him to `http://localhost:3000/...` —
 *        the private origin behind nginx — and his browser showed
 *        ERR_CONNECTION_REFUSED. The purchase had completely succeeded. The
 *        last instruction sent him nowhere.
 *
 *   The Google callback already carried a comment warning about exactly the
 *   third fault, measured on a sign-in months earlier. The lesson was written
 *   once and applied in one place. These tests are so it is not lost again.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const LOGIN = read('app/login/LoginForm.tsx');
const SIGNUP = read('app/signup/SignupForm.tsx');
const CHECKOUT = read('app/api/sovereign/economy/xpay-checkout/route.ts');
const AR = read('src/creator-language/dictionary/ar.ts');
const EN = read('src/creator-language/dictionary/en.ts');

describe('١ · بابُ العودة — حسابٌ بلا كلمةِ مرورٍ يَجِد مدخلَه', () => {
  it('the sign-in page offers the road every new account was made on', () => {
    expect(LOGIN).toContain('href="/api/auth/google/start"');
  });

  it('it is an anchor, not a fetch — the state cookie cannot survive one', () => {
    // The same reason signup gives. A road that leaves this origin and returns
    // carrying a cookie is a navigation, and an in-page request is not.
    const anchor = LOGIN.slice(LOGIN.indexOf('href="/api/auth/google/start"') - 200);
    expect(anchor.slice(0, 260)).toContain('<a');
    expect(LOGIN).not.toMatch(/fetch\(\s*['"]\/api\/auth\/google\/start/);
  });

  it('both doors are offered in the same words on both pages', () => {
    expect(AR).toContain("'login.googleContinue': 'المتابعة باستخدام Google'");
    expect(AR).toContain("'signup.googleContinue': 'المتابعة باستخدام Google'");
    expect(EN).toContain("'login.googleContinue': 'Continue with Google'");
    expect(SIGNUP).toContain('/api/auth/google/start');
  });
});

describe('٢ · الرفضُ يَقول ما يُفعَل، ولا يَفضَح مَن له حساب', () => {
  it('a refused sign-in is answered in the Creator\'s own tongue', () => {
    expect(LOGIN).toContain("result.reason === 'invalid-credentials'");
    expect(LOGIN).toContain("t(dict, 'login.errorCredentials')");
  });

  it('the sentence names the Google road so a password-less account can act', () => {
    const ar = AR.slice(AR.indexOf("'login.errorCredentials'"), AR.indexOf("'login.errorCredentials'") + 300);
    expect(ar).toContain('Google');
  });

  it('and it never says whether THIS address has an account', () => {
    // «هذا الحساب يدخل بجوجل» would answer, for anyone who asks, whether an
    // address is registered here. The sentence names both roads instead.
    const ar = AR.slice(AR.indexOf("'login.errorCredentials'"), AR.indexOf("'login.errorCredentials'") + 300);
    expect(ar).not.toMatch(/هذا الحساب|هذا البريد مُسجَّل|account exists/);
  });
});

describe('٣ · العودةُ بعد الدفعِ تَصِل إلى الإمبراطوريّة، لا إلى الخادم', () => {
  it('the checkout builds its return on the Empire\'s own address', () => {
    expect(CHECKOUT).toContain('const origin = PUBLIC_ORIGIN;');
    expect(CHECKOUT).toContain("import { PUBLIC_ORIGIN } from '@/app/api/auth/google/start/route'");
  });

  it('never on the server\'s view of the request, which is private behind nginx', () => {
    // `request.nextUrl.origin` is http://localhost:3000 in production. A
    // Creator sent there after paying sees ERR_CONNECTION_REFUSED.
    const live = CHECKOUT.split('\n').filter((l) => !l.trimStart().startsWith('//'));
    expect(live.join('\n')).not.toContain('request.nextUrl.origin');
  });

  it('and both destinations it hands the gateway are built from it', () => {
    expect(CHECKOUT).toContain("successUrl: returnUrl(origin, '/sovereign-balance?paid=1')");
    expect(CHECKOUT).toContain("cancelUrl: returnUrl(origin, '/sovereign-balance')");
  });
});
