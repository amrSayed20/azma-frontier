'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '../creator-access.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { ConstitutionalLink } from '@/src/constitutional-navigation';

interface Props {
  readonly dict: Dictionary;
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
 */
export function SignupForm({ dict }: Props) {
  const params = useSearchParams();
  const [leaving, setLeaving] = useState(false);

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

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'signup.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'signup.title')}</h1>
        <p className="creator-access-subtitle">{t(dict, 'signup.subtitle')}</p>

        {error && <div className="creator-access-error">{error}</div>}

        {/*
          A full page navigation, not fetch(). The verification leaves this
          origin for Google and comes back to a route that sets the session
          cookie — a flow no in-page request can carry out.
        */}
        <a
          className="creator-access-submit creator-access-google"
          href="/api/auth/google/start"
          onClick={() => setLeaving(true)}
        >
          {leaving ? t(dict, 'signup.googleBusy') : t(dict, 'signup.googleContinue')}
        </a>

        <p className="creator-access-why">{t(dict, 'signup.whyVerify')}</p>

        <p className="creator-access-footer">
          {t(dict, 'signup.footerPrompt')} <ConstitutionalLink to="/login">{t(dict, 'signup.footerLink')}</ConstitutionalLink>
        </p>
      </div>
    </main>
  );
}
