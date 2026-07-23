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
        setError(result.message ?? t(dict, 'login.errorFallback'));
        return;
      }

      const destination = result.role === 'founder' ? '/sovereign-high-council' : '/qiyamah-chamber';
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

        <p className="creator-access-footer">
          {t(dict, 'login.footerPrompt')} <ConstitutionalLink to="/signup">{t(dict, 'login.footerLink')}</ConstitutionalLink>
        </p>
      </div>
    </main>
  );
}
