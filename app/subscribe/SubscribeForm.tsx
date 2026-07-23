'use client';

import { useEffect, useState } from 'react';
import '../creator-access.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { resolveAvailableActions } from '@/src/button-engine';

interface SessionInfo {
  readonly authenticated: boolean;
  readonly role?: 'founder' | 'creator';
}

export function SubscribeForm({ dict }: { readonly dict: Dictionary }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then(setSession)
      .catch(() => setSession({ authenticated: false }));
  }, []);

  const handleSubscribe = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/subscribe/success`,
          cancelUrl: `${window.location.origin}/subscribe`,
        }),
      });
      const result = await response.json();

      if (result.status !== 'succeeded') {
        setError(result.message ?? t(dict, 'subscribe.errorFallback'));
        return;
      }

      window.location.href = result.checkoutUrl;
    } catch {
      setError(t(dict, 'subscribe.errorUnreachable'));
    } finally {
      setSubmitting(false);
    }
  };

  // THE BUTTON ENGINE: the same resolver the Gate and the Chamber use —
  // this page no longer hand-derives its own copy of "what can this
  // Creator do right now."
  const actions = session
    ? resolveAvailableActions({ threshold: 'subscribe', authenticated: session.authenticated, role: session.role ?? null })
    : [];
  const action = actions[0];

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'subscribe.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'subscribe.title')}</h1>
        <p className="creator-access-subtitle">{t(dict, 'subscribe.subtitle')}</p>

        <div className="creator-access-plan">
          <p className="creator-access-plan-name">{t(dict, 'subscribe.planName')}</p>
          <p className="creator-access-plan-desc">{t(dict, 'subscribe.planDesc')}</p>
        </div>

        {error && <div className="creator-access-error">{error}</div>}

        {session === null && <p className="creator-access-status">{t(dict, 'subscribe.checkingStatus')}</p>}

        {action?.id === 'sign-in-to-subscribe' && (
          <p className="creator-access-footer">
            <a href={action.href}>{t(dict, action.labelKey)}</a> {t(dict, 'subscribe.signInPrompt')}
          </p>
        )}

        {action?.id === 'founder-no-subscription-needed' && (
          <p className="creator-access-status">{t(dict, action.labelKey)}</p>
        )}

        {action?.id === 'subscribe' && (
          <button type="button" className="creator-access-submit" onClick={handleSubscribe} disabled={submitting}>
            {submitting ? t(dict, 'subscribe.submitBusy') : t(dict, action.labelKey)}
          </button>
        )}
      </div>
    </main>
  );
}
