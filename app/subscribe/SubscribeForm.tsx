'use client';

import { useEffect, useState } from 'react';
import '../creator-access.css';
import { t } from '@/src/creator-language';
import type { Dictionary } from '@/src/creator-language';
import { resolveAvailableActions } from '@/src/button-engine';

interface SessionInfo {
  readonly authenticated: boolean;
  readonly role?: 'founder' | 'creator';
  readonly displayName?: string | null;
}

export interface PackOption {
  readonly packId: 'start' | 'create' | 'achieve';
  readonly displayName: string;
  readonly azmaUnits: number;
  readonly priceEgp: number;
}

interface BalanceInfo {
  readonly availableUnits: number;
  readonly trial?: { readonly remainingImages: number };
}

const CHECKOUT_FAILURE_REASONS = new Set(['unauthorized', 'invalid-pack', 'invalid-name', 'invalid-phone', 'gateway-unavailable', 'gateway-error']);

export function SubscribeForm({ dict, packs }: { readonly dict: Dictionary; readonly packs: readonly PackOption[] }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [packId, setPackId] = useState<PackOption['packId']>(packs[0]?.packId ?? 'start');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((info: SessionInfo) => {
        setSession(info);
        if (info.displayName) setFullName((current) => current || info.displayName || '');
        if (!info.authenticated || info.role === 'founder') return;
        fetch('/api/sovereign/economy/balance')
          .then((response) => (response.ok ? response.json() : null))
          .then((data: BalanceInfo | null) => { if (data) setBalance(data); })
          .catch(() => { /* the balance line simply stays hidden */ });
      })
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
          packId,
          fullName,
          phone,
          successUrl: `${window.location.origin}/subscribe/success`,
          cancelUrl: `${window.location.origin}/subscribe`,
        }),
      });
      const result = await response.json();

      if (result.status !== 'succeeded') {
        setError(CHECKOUT_FAILURE_REASONS.has(result.reason)
          ? t(dict, `subscribe.error.${result.reason}`)
          : t(dict, 'subscribe.errorFallback'));
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

        {balance && (
          <p className="creator-access-balance" role="status">
            {t(dict, 'subscribe.balance', { units: String(balance.availableUnits) })}
            {balance.trial && balance.trial.remainingImages > 0 && (
              <> · {t(dict, 'subscribe.trialRemaining', { count: String(balance.trial.remainingImages) })}</>
            )}
          </p>
        )}

        <div className="creator-access-packs" role="radiogroup" aria-label={t(dict, 'subscribe.packsLabel')}>
          {packs.map((pack) => (
            <button
              key={pack.packId}
              type="button"
              role="radio"
              aria-checked={packId === pack.packId}
              className={`creator-access-plan creator-access-pack${packId === pack.packId ? ' creator-access-pack--selected' : ''}`}
              onClick={() => setPackId(pack.packId)}
            >
              <span className="creator-access-plan-name">
                <bdi>{pack.displayName}</bdi> · {t(dict, 'subscribe.packUnits', { units: String(pack.azmaUnits) })}
              </span>
              <span className="creator-access-pack-price">{t(dict, 'subscribe.packPrice', { price: String(pack.priceEgp) })}</span>
              <span className="creator-access-plan-desc">{t(dict, `subscribe.pack.${pack.packId}`)}</span>
            </button>
          ))}
        </div>
        <p className="creator-access-status">{t(dict, 'subscribe.oneTimeNote')}</p>
        <p className="creator-access-links">
          <a href="/terms">{t(dict, 'legal.terms.link')}</a>
          <a href="/refund">{t(dict, 'legal.refund.link')}</a>
        </p>

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
          <>
            <div className="creator-access-field">
              <label htmlFor="payerName">{t(dict, 'subscribe.fullNameLabel')}</label>
              <input id="payerName" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="creator-access-field">
              <label htmlFor="payerPhone">{t(dict, 'subscribe.phoneLabel')}</label>
              <input id="payerPhone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="01012345678" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <p className="creator-access-status">{t(dict, 'subscribe.payerNote')}</p>
          </>
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
