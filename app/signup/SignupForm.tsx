'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { ConstitutionalLink } from '@/src/constitutional-navigation';
/*
 * ONE SOURCE FOR WHAT A ROOM IS CALLED.
 *
 *   The Founder retired the old chamber names, and the approved descriptive
 *   ones already live in the landing's content module — with their own
 *   bilingual role lines and a comment explaining why no `state` and no
 *   `limit` field exists on that table. Typing five names again here is
 *   exactly how two public surfaces come to disagree about what a room is
 *   called, so this reads them instead. It imports the CONTENT module
 *   directly, not the landing component, so nothing of the landing's markup
 *   or stylesheet is pulled into this route.
 */
import { LANDING_CHAMBERS, LANDING_PROOF_TOTAL } from
  '@/src/imperial-experience-engine/experiences/landing/landing-content';
import '@/src/imperial-experience-engine/experiences/signup/signup-experience.css';

interface Props {
  readonly dict: Dictionary;
  readonly locale: Locale;
  /**
   * REGISTRATION GATEWAY, PACKAGE II (2026-07-23): the ceremonial handoff the
   * parent performs before the route changes.
   *
   * It is no longer called from here. Verification leaves this application
   * entirely — the Creator goes to Google and returns to
   * /api/auth/google/callback, which redirects them onward — so there is no
   * moment on this page at which a handoff could be performed. The prop is
   * kept so the parent's contract is unchanged.
   */
  readonly onSuccess?: () => void;
}

/** شعارُ Google الرسميُّ بأقواسِه الأربعة — لا بديلَ مرسومًا بيدٍ عنه. */
function GoogleGlyph() {
  return (
    <svg className="iwan-go-glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

/**
 * ─── WHY THIS IS A DOOR AND NOT A FORM ──────────────────────────────────────
 *
 *   This page used to collect an address, a password, and a confirmation, and
 *   POST them to /api/auth/signup — which created the account and set a session
 *   cookie in the same response. The only check on the address was a regular
 *   expression testing that it LOOKED like one.
 *
 *   The fields are gone rather than hidden. Leaving an address field on the
 *   page would say, in the most direct way an interface can, that typing an
 *   address is what establishes it as yours — and that is the precise belief
 *   this gate exists to end.
 *
 * ─── «الإيوان», 2026-11-23 — WHAT THE REBUILD CHANGED, AND WHAT IT DID NOT ──
 *
 *   NOT CHANGED: the mechanism. Still one anchor to /api/auth/google/start,
 *   still a full page navigation, still the six refusal codes translated into
 *   the Creator's own tongue, still no field that could teach the wrong
 *   belief. Nothing about identity was touched by a visual package.
 *
 *   CHANGED: this route no longer imports `app/creator-access.css`. That
 *   stylesheet is shared by /login, /subscribe, /subscribe/success, /founder
 *   and the not-found page, and editing it to redress ONE surface would have
 *   silently redressed five — the exact class of leak that `body{overflow:
 *   hidden}` in the Vault's stylesheet once caused in another chamber. It is
 *   left byte-identical; those five pages keep it, and each gets its own turn.
 *
 *   ADDED: the account is no longer offered against an empty surface. What it
 *   opens is stated beside it — five rooms by the names the Founder approved,
 *   and the library figure — read from the authority that already holds both.
 */
export function SignupForm({ dict, locale }: Props) {
  const params = useSearchParams();
  const [leaving, setLeaving] = useState(false);
  const ar = locale === 'ar';

  /**
   * The callback sends the Creator back here with a short reason when
   * verification did not complete. The reason is a code, never the provider's
   * own words — those name an issuer, an audience or a token and stay on the
   * server.
   */
  const identityOutcome = params?.get('identity') ?? null;
  const ERRORS: Record<string, string> = {
    unavailable: t(dict, 'signup.identityUnavailable'),
    cancelled: t(dict, 'signup.identityCancelled'),
    'verification-failed': t(dict, 'signup.identityFailed'),
    'invalid-callback': t(dict, 'signup.identityFailed'),
    'email-not-verified': t(dict, 'signup.identityEmailUnverified'),
    'email-belongs-to-existing-account': t(dict, 'signup.identityEmailTaken'),
  };
  const error = identityOutcome ? ERRORS[identityOutcome] ?? null : null;

  const assurances = [
    { mark: '✦', title: 'signup.assureFreeTitle', body: 'signup.assureFreeBody' },
    { mark: '◈', title: 'signup.assureKeyTitle', body: 'signup.assureKeyBody' },
    { mark: '❖', title: 'signup.assureOwnTitle', body: 'signup.assureOwnBody' },
  ] as const;

  return (
    <main className="iwan-hall">
      <section className="iwan-door">
        <div className="iwan-brand">
          <span className="iwan-mark" aria-hidden="true" />
          <span className="iwan-brand-text">
            <span className="iwan-brand-name">AZMA</span>
            <span className="iwan-brand-sub">{ar ? 'منصّةُ الإنشاء' : 'The creation platform'}</span>
          </span>
        </div>

        <p className="iwan-kicker">{t(dict, 'signup.kicker')}</p>
        <h1 className="iwan-title">{t(dict, 'signup.title')}</h1>
        <p className="iwan-sub">{t(dict, 'signup.subtitle')}</p>

        {error && <div className="iwan-error" role="alert">{error}</div>}

        {/*
          A full page navigation, not fetch(). The verification leaves this
          origin for Google and comes back to a route that sets the session
          cookie — a flow no in-page request can carry out.
        */}
        <a
          className="iwan-go"
          href="/api/auth/google/start"
          onClick={() => setLeaving(true)}
        >
          <GoogleGlyph />
          <span>{leaving ? t(dict, 'signup.googleBusy') : t(dict, 'signup.googleContinue')}</span>
        </a>

        <p className="iwan-why">{t(dict, 'signup.whyVerify')}</p>

        <ul className="iwan-assures">
          {assurances.map((a) => (
            <li className="iwan-assure" key={a.title}>
              <span className="iwan-assure-mark" aria-hidden="true">{a.mark}</span>
              <span>
                <span className="iwan-assure-title">{t(dict, a.title)}</span>
                <span className="iwan-assure-body">{t(dict, a.body)}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="iwan-foot">
          {t(dict, 'signup.footerPrompt')}{' '}
          <ConstitutionalLink to="/login">{t(dict, 'signup.footerLink')}</ConstitutionalLink>
        </p>
      </section>

      <aside className="iwan-beyond">
        <h2 className="iwan-beyond-title">{t(dict, 'signup.beyondTitle')}</h2>
        <p className="iwan-beyond-note">{t(dict, 'signup.beyondNote')}</p>

        <ul className="iwan-rooms">
          {LANDING_CHAMBERS.map((room) => (
            <li className="iwan-room" key={room.id}>
              <span className="iwan-room-arch" aria-hidden="true" />
              <span>
                <span className="iwan-room-name">{ar ? room.nameAr : room.nameEn}</span>
                <span className="iwan-room-role">{ar ? room.roleAr : room.roleEn}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="iwan-library">
          <span className="iwan-library-figure">
            {ar ? LANDING_PROOF_TOTAL.figureAr : LANDING_PROOF_TOTAL.figureEn}
          </span>
          <span className="iwan-library-label">
            {ar ? LANDING_PROOF_TOTAL.labelAr : LANDING_PROOF_TOTAL.labelEn}
          </span>
        </p>
      </aside>
    </main>
  );
}
