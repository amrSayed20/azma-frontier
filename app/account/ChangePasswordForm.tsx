'use client';

import { useState } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';

/** API failure reasons that have their own sentence in the dictionary. */
const KNOWN_FAILURES = new Set(['invalid-input', 'invalid-credentials', 'too-many-attempts', 'unauthorized']);

export function ChangePasswordForm({ dict }: { readonly dict: Dictionary }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setChanged(false);
    if (newPassword !== confirmPassword) {
      setError(t(dict, 'account.errorMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (result.status !== 'succeeded') {
        setError(KNOWN_FAILURES.has(result.reason) ? t(dict, `account.error.${result.reason}`) : t(dict, 'account.errorFallback'));
        return;
      }
      setChanged(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError(t(dict, 'account.errorUnreachable'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="creator-access-error" role="alert">{error}</div>}
      {changed && <div className="creator-access-success" role="status">{t(dict, 'account.success')}</div>}
      <div className="creator-access-field">
        <label htmlFor="currentPassword">{t(dict, 'account.currentPasswordLabel')}</label>
        <input id="currentPassword" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div className="creator-access-field">
        <label htmlFor="newPassword">{t(dict, 'account.newPasswordLabel')}</label>
        <input id="newPassword" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <div className="creator-access-field">
        <label htmlFor="confirmNewPassword">{t(dict, 'account.confirmPasswordLabel')}</label>
        <input id="confirmNewPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      <button type="submit" className="creator-access-submit" disabled={submitting}>
        {submitting ? t(dict, 'account.submitBusy') : t(dict, 'account.submitIdle')}
      </button>
    </form>
  );
}
