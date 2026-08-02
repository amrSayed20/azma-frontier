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
   * REGISTRATION GATEWAY, PACKAGE II (2026-07-23): called instead of
   * navigating directly on successful registration, so the parent
   * (SignupExperience) can carry out the ceremonial handoff — the same
   * beginHandoff() mechanism Arrival already uses for its own threshold
   * — before the actual route change occurs. Optional, falling back to
   * the original direct navigation, so this file still works standalone
   * if ever rendered without that wrapper. The form's own fields,
   * validation, and submit mechanics are otherwise unchanged.
   */
  readonly onSuccess?: () => void;
}

export function SignupForm({ dict, onSuccess }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t(dict, 'signup.errorPasswordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName: displayName || undefined }),
      });
      const result = await response.json();

      if (result.status !== 'succeeded') {
        setError(result.message ?? t(dict, 'signup.errorFallback'));
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/imperial-foyer');
      }
    } catch {
      setError(t(dict, 'signup.errorUnreachable'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'signup.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'signup.title')}</h1>
        <p className="creator-access-subtitle">{t(dict, 'signup.subtitle')}</p>

        {error && <div className="creator-access-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="creator-access-field">
            <label htmlFor="email">{t(dict, 'signup.emailLabel')}</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="creator-access-field">
            <label htmlFor="displayName">{t(dict, 'signup.displayNameLabel')}</label>
            <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="creator-access-field">
            <label htmlFor="password">{t(dict, 'signup.passwordLabel')}</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="creator-access-field">
            <label htmlFor="confirmPassword">{t(dict, 'signup.confirmPasswordLabel')}</label>
            <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" className="creator-access-submit" disabled={submitting}>
            {submitting ? t(dict, 'signup.submitBusy') : t(dict, 'signup.submitIdle')}
          </button>
        </form>

        <p className="creator-access-footer">
          {t(dict, 'signup.footerPrompt')} <ConstitutionalLink to="/login">{t(dict, 'signup.footerLink')}</ConstitutionalLink>
        </p>
      </div>
    </main>
  );
}
