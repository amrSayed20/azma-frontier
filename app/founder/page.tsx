'use client';

import { useState } from 'react';
import '../creator-access.css';

/**
 * The Founder's own dedicated Constitutional Entry — distinct from the
 * generic, Creator-facing /login, per "The Founder Identity Resolution"
 * (one authentication system, distinct entry surface). Uses the exact
 * same, unmodified /api/auth/login endpoint; the only thing unique to
 * this gateway is that it verifies the resulting session is actually a
 * Founder before proceeding toward the Command Bridge.
 */
export default function FounderGatewayPage() {
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
        setError(result.message ?? 'Sign in failed.');
        return;
      }

      if (result.role !== 'founder') {
        setError("This entry is for Founders only. If you're a Creator, sign in at /login instead.");
        return;
      }

      window.location.assign('/sovereign-high-council');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <h1 className="creator-access-title">Founder Entry</h1>
        <p className="creator-access-subtitle">A separate Constitutional Entry to the Command Bridge.</p>

        {error && <div className="creator-access-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="creator-access-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="creator-access-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="creator-access-submit" disabled={submitting}>
            {submitting ? 'Verifying…' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  );
}
