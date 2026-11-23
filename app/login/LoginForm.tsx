'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { ConstitutionalLink } from '@/src/constitutional-navigation';
import '@/src/imperial-experience-engine/experiences/login/login-experience.css';

interface Props {
  readonly dict: Dictionary;
  /**
   * RECOGNITION GATEWAY (2026-07-23): called with the role-resolved
   * destination instead of navigating directly, so the parent
   * (LoginExperience) can carry out the ceremonial handoff — the same
   * beginHandoff() mechanism Arrival and Signup already use. Optional,
   * falling back to the original direct navigation. The role→
   * destination decision itself is unchanged, computed here exactly as
   * before, only handed off rather than acted on directly.
   */
  readonly onSuccess?: (destination: string) => void;
}

/** شعارُ Google الرسميُّ بأقواسِه الأربعة — لا بديلَ مرسومًا بيدٍ عنه. */
function GoogleGlyph() {
  return (
    <svg className="dihliz-google-glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

/**
 * Serves both the Creator Login Flow and the Founder Login Flow — a
 * Founder is simply a Creator record with role='founder' (see
 * src/authentication), authenticated identically. The only difference
 * is the post-login redirect, driven by the role the API returns.
 *
 * ─── «الدِّهليز», 2026-11-23 — WHAT THE REBUILD CHANGED, AND WHAT IT DID NOT
 *
 *   NOT CHANGED — and this is the whole of it: the POST to /api/auth/login,
 *   the payload, the `status !== 'succeeded'` branch, the refusal sentence
 *   that names both roads without naming which one is this address's, the
 *   role→destination decision, the onSuccess handoff, and the anchor to
 *   /api/auth/google/start. Not one line of authentication was touched by a
 *   visual package, and a guard asserts each of those by name.
 *
 *   CHANGED: this route no longer imports `app/creator-access.css`. That
 *   stylesheet is shared, and editing it to redress ONE surface would
 *   silently redress the others. It is left byte-identical and still serves
 *   /subscribe, /subscribe/success, /founder and the not-found page.
 *
 *   ADDED, and reported rather than slipped in: `autoComplete` on both
 *   fields. A sign-in form without `current-password` is one a password
 *   manager cannot fill, which made the Google road the only practical way
 *   in even for the accounts that do have a password. It changes no
 *   workflow and no credential — it tells the browser what the field is.
 */
export function LoginForm({ dict, onSuccess }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (result.status !== 'succeeded') {
        /*
          THE REFUSAL WAS TRUE AND USELESS.

          The server answered «Invalid email or password.» — in English, on an
          Arabic page, and saying nothing a Creator could act on. For an
          account made with Google it is also unanswerable: there IS no
          password, so no amount of trying will ever work.

          What it must NOT do is say «this address signs in with Google»:
          that would answer, for anyone who asks, whether an address has an
          account here. So the sentence names BOTH roads without naming which
          one is theirs, and the Google door now sits directly beneath it.
        */
        setError(
          result.reason === 'invalid-credentials'
            ? t(dict, 'login.errorCredentials')
            : result.message ?? t(dict, 'login.errorFallback'),
        );
        return;
      }

      const destination = result.role === 'founder' ? '/sovereign-high-council' : '/imperial-foyer';
      if (onSuccess) {
        onSuccess(destination);
      } else {
        router.push(destination);
      }
    } catch {
      setError(t(dict, 'login.errorUnreachable'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="dihliz-passage">
      <div className="dihliz-door">
        <div className="dihliz-brand">
          <span className="dihliz-mark" aria-hidden="true" />
          <span className="dihliz-brand-text">
            <span className="dihliz-brand-name">AZMA</span>
            <span className="dihliz-brand-sub">{t(dict, 'login.brandSub')}</span>
          </span>
        </div>

        <p className="dihliz-kicker">{t(dict, 'login.kicker')}</p>
        <h1 className="dihliz-title">{t(dict, 'login.title')}</h1>
        <p className="dihliz-sub">{t(dict, 'login.subtitle')}</p>

        {error && <div className="dihliz-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="dihliz-field">
            <label htmlFor="email">{t(dict, 'login.emailLabel')}</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="dihliz-field">
            <label htmlFor="password">{t(dict, 'login.passwordLabel')}</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="dihliz-submit" disabled={submitting}>
            {submitting ? t(dict, 'login.submitBusy') : t(dict, 'login.submitIdle')}
          </button>
        </form>

        <p className="dihliz-or">
          <span className="dihliz-or-rule" aria-hidden="true" />
          <span>{t(dict, 'login.orDivider')}</span>
          <span className="dihliz-or-rule" aria-hidden="true" />
        </p>

        {/*
          THE DOOR THIS PAGE DID NOT HAVE.

          MEASURED on production 2026-10-31, on a Creator's own account: every
          account made since registration became Google-only has NO password —
          deliberately, so there is no credential to guess or stuff. And this
          page offered nothing but a password. A Creator who had signed up two
          minutes earlier typed their address, was told «Invalid email or
          password», and had no way in at all. The Empire kept the key and hid
          the lock.

          An anchor, not a fetch: the road to Google leaves this origin and
          comes back carrying a state cookie, which no in-page request can do.

          It is the one METAL fill on this screen besides the house's mark,
          and it is metal on /signup too — the same road, so a Creator who
          came in through a gold door recognises it on the way back.
        */}
        <a
          className="dihliz-google"
          href="/api/auth/google/start"
          onClick={() => setLeaving(true)}
        >
          <GoogleGlyph />
          <span>{leaving ? t(dict, 'login.googleBusy') : t(dict, 'login.googleContinue')}</span>
        </a>

        <p className="dihliz-foot">
          {t(dict, 'login.footerPrompt')}{' '}
          <ConstitutionalLink to="/signup">{t(dict, 'login.footerLink')}</ConstitutionalLink>
        </p>
      </div>
    </main>
  );
}
