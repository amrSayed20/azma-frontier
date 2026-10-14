/**
 * AZMA OS — بوّابة العبور السيادي · THE SOVEREIGN ENTRY GATEWAY
 *
 * ─── WHAT A VISITOR MEETS, AND WHY IT IS ONE COMPONENT ──────────────────────
 *
 *   A stranger arrives at azmaos.com knowing nothing. They approach a door,
 *   choose a tongue, cross it, and read what this place is — five chambers,
 *   three policies, four packages — and only then are they asked whether they
 *   have an account.
 *
 *   The approach and the introduction are ONE component because the Architect
 *   required the crossing not to feel like a page change. A navigation between
 *   them would paint a new document, and no amount of fading hides that. Here
 *   the scene and the introduction are two states of one mounted tree, so the
 *   camera can carry the visitor from one into the other without a reload.
 *
 * ─── THE CAMERA, AND WHOSE JOB IT IS NOT ────────────────────────────────────
 *
 *   RULED by the Chief Architect: the gateway scene owns its own motion, and
 *   `DirectorStage` is left exactly as it is.
 *
 *   That ruling matters because DirectorStage is constitutionally an OBSERVER
 *   — it passes `null` as the container to every ACDE call and never mutates a
 *   chamber's DOM. Driving a camera from it would have meant rewriting what it
 *   is. So the motion lives here, in two CSS custom properties on one element,
 *   and the Director's responsibilities are untouched.
 *
 * ─── THE PHOTOGRAPH IS THE FOYER ────────────────────────────────────────────
 *
 *   The Architect's own image already contains the hall: the chandelier, the
 *   candelabra down both walls, the tiled floor, the carved doors at the end.
 *   So no corridor is built around it. The approach pushes INTO the picture,
 *   centred on the doors — which is both truer to «use that exact image» and
 *   far cheaper to run than a stack of parallax planes.
 *
 *   MEASURED: the supplied file is a 1080×2340 phone capture; the photograph
 *   inside it is 1021×1080. That is the whole budget, so the approach is
 *   capped at `--gate-zoom-max` and never magnifies beyond it. A door that
 *   dissolves into pixels at the end of the walk would be worse than a shorter
 *   walk, and no generative upscale touches the Architect's carving.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { LocaleSwitcher } from '@/src/creator-language';
import { GATEWAY_CHAMBERS } from './chambers';
import type { GatewayPackage, GatewayPolicy } from './types';
import './gateway.css';

/** How long the approach takes when nobody interrupts it. */
const APPROACH_MS = 6000;

type Phase = 'approaching' | 'arrived' | 'crossing' | 'inside';

export function SovereignGateway({
  dict, locale, policies, packages,
}: {
  readonly dict: Dictionary;
  readonly locale: Locale;
  /** Read from `src/policies` on the server — only what is truly published. */
  readonly policies: readonly GatewayPolicy[];
  /** Read from `SOVEREIGN_PACKAGES` on the server. Never restated here. */
  readonly packages: readonly GatewayPackage[];
}) {
  const [phase, setPhase] = useState<Phase>('approaching');
  const [openPolicy, setOpenPolicy] = useState<GatewayPolicy | null>(null);
  const introRef = useRef<HTMLElement | null>(null);
  /** Where the visitor stood when a policy was opened, to put them back. */
  const scrollMark = useRef(0);
  /** The card they opened it from — focus belongs back on it when they close. */
  const openedFrom = useRef<HTMLButtonElement | null>(null);

  // ── THE APPROACH ────────────────────────────────────────────────────────
  //   One timer, and anything the visitor does ends it immediately. Nobody is
  //   held inside a moving picture: that is an acceptance criterion, not a
  //   courtesy.
  useEffect(() => {
    if (phase !== 'approaching') return undefined;
    const settle = window.setTimeout(() => setPhase('arrived'), APPROACH_MS);
    return () => window.clearTimeout(settle);
  }, [phase]);

  const land = useCallback(() => {
    setPhase((p) => (p === 'approaching' ? 'arrived' : p));
  }, []);

  useEffect(() => {
    if (phase !== 'approaching') return undefined;
    const end = () => land();
    window.addEventListener('pointerdown', end, { once: true });
    window.addEventListener('wheel', end, { once: true, passive: true });
    window.addEventListener('keydown', end, { once: true });
    return () => {
      window.removeEventListener('pointerdown', end);
      window.removeEventListener('wheel', end);
      window.removeEventListener('keydown', end);
    };
  }, [phase, land]);

  // ── THE CROSSING ────────────────────────────────────────────────────────
  //   The doors fill the frame, the light goes, and the introduction is
  //   already mounted underneath — so what the visitor sees is a threshold
  //   passed, not a document replaced.
  const cross = useCallback(() => {
    setPhase('crossing');
    window.setTimeout(() => {
      setPhase('inside');
      // The page is scrolled to the introduction rather than navigated to it.
      introRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 1100);
  }, []);

  const readPolicy = useCallback((p: GatewayPolicy, from: HTMLButtonElement) => {
    scrollMark.current = window.scrollY || document.documentElement.scrollTop;
    openedFrom.current = from;
    setOpenPolicy(p);
  }, []);

  const closePolicy = useCallback(() => setOpenPolicy(null), []);

  /**
   * Locking the page behind the reader, and putting the visitor back after.
   *
   * The page is held at a negative offset rather than given `overflow:
   * hidden`, because hiding the body's overflow does not reliably lock a page
   * whose scroller is the root element — and a reader whose page slides while
   * they read has lost their place before they have closed anything.
   *
   * Holding the offset also makes the return arithmetic instead of a guess:
   * the exact line they left is `returnTo`, and nothing else gets a vote.
   */
  useEffect(() => {
    if (!openPolicy) return undefined;
    const returnTo = scrollMark.current;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePolicy(); };
    window.addEventListener('keydown', onKey);

    const body = document.body;
    const prior = { position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.position = 'fixed';
    body.style.top = `-${returnTo}px`;
    body.style.width = '100%';

    return () => {
      window.removeEventListener('keydown', onKey);
      body.style.position = prior.position;
      body.style.top = prior.top;
      body.style.width = prior.width;
      // Focus returns to the card they opened it from, which is where a
      // keyboard reader expects to be. `preventScroll` because moving focus
      // is not permission to move the page.
      openedFrom.current?.focus({ preventScroll: true });
      window.scrollTo(0, returnTo);
    };
  }, [openPolicy, closePolicy]);

  const stateLabel = (s: 'ready' | 'partial' | 'closed') =>
    t(dict, s === 'ready' ? 'gateway.stateReady' : s === 'partial' ? 'gateway.statePartial' : 'gateway.stateClosed');

  return (
    <div className="gateway" data-phase={phase}>

      {/* ══ THE SCENE ══════════════════════════════════════════════════ */}
      <section className="gate-scene" aria-label={t(dict, 'gate.wordmark')}>
        <div className="gate-frame">
          {/*
            The Architect's own photograph, unaltered. `object-fit: cover` with
            a transform-origin on the doors is what turns a still into an
            approach — the picture is not redrawn, the frame moves into it.
          */}
          <img
            className="gate-photo"
            src="/gateway/sovereign-gate.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
          {/*
            The hall's darkness, as its own layer. It was a `filter` on the
            photograph until it was measured: 24fps on an unthrottled desktop,
            because a filter repaints a full-screen bitmap every frame. An
            opacity on a flat layer is handed to the compositor instead.
          */}
          <div className="gate-dark" aria-hidden="true" />
          <div className="gate-vignette" aria-hidden="true" />
        </div>

        <div className="gate-controls">
          <h1 className="gate-wordmark">{t(dict, 'gate.wordmark')}</h1>
          <p className="gate-tagline">{t(dict, 'gate.tagline')}</p>
          <div className="gate-actions">
            <button type="button" className="gate-enter" onClick={cross}>
              {t(dict, 'gateway.enter')}
            </button>
            <div className="gate-language">
              <LocaleSwitcher
                currentLocale={locale}
                triggerLabel={t(dict, 'gate.languageLabel')}
                menuLabel={t(dict, 'gate.chooseLanguage')}
              />
            </div>
          </div>
        </div>

        {phase === 'approaching' && (
          <button type="button" className="gate-skip" onClick={land}>
            {t(dict, 'gateway.skip')}
          </button>
        )}
      </section>

      {/* ══ THE INTRODUCTION ═══════════════════════════════════════════ */}
      <main className="gate-inside" ref={introRef}>

        <section className="gi-intro">
          <h2 className="gi-h2">{t(dict, 'gateway.introTitle')}</h2>
          <p className="gi-lede">{t(dict, 'gateway.introBody')}</p>
          <p className="gi-lede gi-lede--second">{t(dict, 'gateway.introSecond')}</p>
        </section>

        <section className="gi-chambers">
          <h2 className="gi-h2">{t(dict, 'gateway.chambersTitle')}</h2>
          <p className="gi-note">{t(dict, 'gateway.chambersLede')}</p>
          <div className="gi-chamber-list">
            {GATEWAY_CHAMBERS.map((c) => (
              <article className="gi-chamber" key={c.id}>
                <header className="gi-chamber-head">
                  <h3 className="gi-chamber-name">{locale === 'en' ? c.nameEn : c.nameAr}</h3>
                  <span className="gi-chamber-alt">{locale === 'en' ? c.nameAr : c.nameEn}</span>
                  <span className={`gi-state gi-state--${c.state}`}>{stateLabel(c.state)}</span>
                </header>
                <p className="gi-chamber-role">{locale === 'en' ? c.roleEn : c.roleAr}</p>
                <p className="gi-chamber-body">{locale === 'en' ? c.bodyEn : c.bodyAr}</p>
                <p className="gi-chamber-rel">{locale === 'en' ? c.relationEn : c.relationAr}</p>
                {/*
                  The limit, when there is one. It is part of the card and not
                  a footnote: a chamber that is partly built says so where its
                  promise is made, or the promise is the thing that is read.
                */}
                {(locale === 'en' ? c.limitEn : c.limitAr) && (
                  <p className="gi-chamber-limit">{locale === 'en' ? c.limitEn : c.limitAr}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="gi-policies">
          <h2 className="gi-h2">{t(dict, 'gateway.policiesTitle')}</h2>
          <p className="gi-note">{t(dict, 'gateway.policiesLede')}</p>
          <div className="gi-policy-list">
            {policies.map((p) => (
              <button
                type="button"
                className="gi-policy"
                key={p.slug}
                onClick={(e) => readPolicy(p, e.currentTarget)}
              >
                <span className="gi-policy-name">{locale === 'en' ? p.titleEn : p.titleAr}</span>
                <span className="gi-policy-meta">
                  {t(dict, 'gateway.policyVersion')} {p.version}
                </span>
                <span className="gi-policy-open">{t(dict, 'gateway.policyOpen')} ←</span>
              </button>
            ))}
          </div>
        </section>

        <section className="gi-balance">
          <h2 className="gi-h2">{t(dict, 'gateway.balanceTitle')}</h2>
          <p className="gi-note">{t(dict, 'gateway.balanceLede')}</p>
          <div className="gi-pack-list">
            {packages.map((p) => (
              <article className="gi-pack" key={p.packageId}>
                <h3 className="gi-pack-name">{p.nameAr}</h3>
                <p className="gi-pack-price">
                  <span className="gi-pack-figure">{p.priceEgp.toLocaleString('en-US')}</span>
                  <span className="gi-pack-currency">{locale === 'en' ? 'EGP' : 'ج.م'}</span>
                </p>
                <p className="gi-pack-units">
                  {p.balanceUnits.toLocaleString('en-US')} {t(dict, 'gateway.balanceUnits')}
                </p>
                <p className="gi-pack-terms">{t(dict, 'gateway.balanceNoExpiry')}</p>
                <p className="gi-pack-terms">{t(dict, 'gateway.balanceOneTime')}</p>
              </article>
            ))}
          </div>
          <p className="gi-note gi-note--quiet">{t(dict, 'gateway.balanceNoPurchaseHere')}</p>
        </section>

        <section className="gi-account">
          <h2 className="gi-h2">{t(dict, 'gateway.accountTitle')}</h2>
          <p className="gi-note">{t(dict, 'gateway.accountLede')}</p>
          <div className="gi-account-doors">
            {/*
              Plain anchors into the authentication that already exists. This
              gateway does not host a form, does not carry a credential, and
              does not touch how a session is made.
            */}
            <a className="gi-door gi-door--primary" href="/login">{t(dict, 'gateway.accountSignIn')}</a>
            <a className="gi-door" href="/signup">{t(dict, 'gateway.accountSignUp')}</a>
          </div>
        </section>
      </main>

      {/* ══ A POLICY, WHOLE ════════════════════════════════════════════ */}
      {openPolicy && (
        <div className="gi-reader" role="dialog" aria-modal="true" aria-label={openPolicy.titleAr}>
          <div className="gi-reader-bar">
            <span className="gi-reader-title">
              {locale === 'en' ? openPolicy.titleEn : openPolicy.titleAr}
            </span>
            <button type="button" className="gi-reader-close" onClick={closePolicy}>
              {t(dict, 'gateway.policyClose')} ✕
            </button>
          </div>
          {/*
            The ratified text, exactly as `src/policies` holds it. Nothing is
            summarised, shortened or re-worded in transit — a policy a visitor
            reads must be the policy that governs them.
          */}
          <article className="gi-reader-body">{openPolicy.body}</article>
        </div>
      )}
    </div>
  );
}
