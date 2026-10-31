'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../creator-access.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { ConstitutionalLink } from '@/src/constitutional-navigation';

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

/**
 * Serves both the Creator Login Flow and the Founder Login Flow — a
 * Founder is simply a Creator record with role='founder' (see
 * src/authentication), authenticated identically. The only difference
 * is the post-login redirect, driven by the role the API returns.
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
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'login.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'login.title')}</h1>
        <p className="creator-access-subtitle">{t(dict, 'login.subtitle')}</p>

        {error && <div className="creator-access-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="creator-access-field">
            <label htmlFor="email">{t(dict, 'login.emailLabel')}</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="creator-access-field">
            <label htmlFor="password">{t(dict, 'login.passwordLabel')}</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="creator-access-submit" disabled={submitting}>
            {submitting ? t(dict, 'login.submitBusy') : t(dict, 'login.submitIdle')}
          </button>
        </form>

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
        */}
        <a
          className="creator-access-submit creator-access-google"
          href="/api/auth/google/start"
          onClick={() => setLeaving(true)}
        >
          {leaving ? t(dict, 'login.googleBusy') : t(dict, 'login.googleContinue')}
        </a>

        <p className="creator-access-footer">
          {t(dict, 'login.footerPrompt')} <ConstitutionalLink to="/signup">{t(dict, 'login.footerLink')}</ConstitutionalLink>
        </p>
      </div>
    </main>
  );
}
