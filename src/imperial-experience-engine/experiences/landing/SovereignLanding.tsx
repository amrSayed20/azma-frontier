'use client';

/**
 * AZMA OS — THE SOVEREIGN LANDING.
 *
 * ═══ WHAT THIS IS ═══════════════════════════════════════════════════════════
 *
 *   The public reception of azmaos.com, built to the design the Founder
 *   approved, and revised to his order of 2026-11-20 (MISSION 02, final).
 *
 * ═══ THE RULES THIS FILE IS WRITTEN UNDER ═══════════════════════════════════
 *
 *   1 · NOTHING SHARED IS TOUCHED. Every class begins `lp-`. `gate-` is
 *       forbidden by the order because the Vault already defines
 *       `gate-card`, `gate-icon`, `gate-name` and `gate-portal-effect`;
 *       `gi-` is the gateway's. A guard reads this file and the stylesheet
 *       and proves both.
 *
 *   2 · NO BUILD STAGE REACHES A VISITOR. There is no state badge, no
 *       «جاهزة», no «مبنيّة جزئيّاً», no count of finished ministries. The
 *       landing reads `LANDING_CHAMBERS`, a table that HAS no state field —
 *       so the leak is impossible rather than merely avoided. It deliberately
 *       does NOT read `GATEWAY_CHAMBERS`, which is built around `state` and
 *       `limitAr` and still serves the gateway's own forty-three guards.
 *
 *   3 · AND NOTHING UNREACHABLE IS PROMISED. The same order forbids turning
 *       an unavailable capability into a claim that it works. Video from a
 *       text idea and automatic scene commission are both gated on an active
 *       subscription that no Creator can buy today, so neither is named here
 *       — not as a promise and not as a progress report. Silence, not
 *       staging. The measurement is in `landing-content.ts`.
 *
 *   4 · THE APPROVED TEXTS ARE RE-READ, NOT RE-WRITTEN.
 *       `gateway.introTitle`, `introBody`, `introSecond`, `limitsTitle` and
 *       `limitsBody` render from THE SAME dictionary keys the gateway uses.
 *       Google's brand verification refused this app once for a homepage that
 *       did not rule out AI NCII; `limitsBody` is the remedy, and reading the
 *       key rather than copying the sentence is what makes it literal.
 *
 *   5 · NO PRICE IS TYPED. The packages arrive as props from `app/page.tsx`,
 *       which reads `SOVEREIGN_PACKAGES` — «APPROVED. DO NOT ALTER A SINGLE
 *       FIGURE.» Their placement is late in the page by the Founder's ruling
 *       of 2026-09-28, re-affirmed in this order.
 */

import { useCallback, useMemo, useState } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { LocaleSwitcher, getLocaleDefinition } from '@/src/creator-language';
import type { GatewayPackage, GatewayPolicy } from '../gateway/types';
import {
  LANDING_CHAMBERS,
  LANDING_SHOWCASE,
  LANDING_JOURNEY,
  LANDING_CAPABILITIES,
  LANDING_PROOF,
  LANDING_PROOF_TOTAL,
  LANDING_QUESTIONS,
  LANDING_FOOTER,
} from './landing-content';
import './landing.css';

export interface SovereignLandingProps {
  readonly dict: Dictionary;
  readonly locale: Locale;
  readonly policies: readonly GatewayPolicy[];
  readonly packages: readonly GatewayPackage[];
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const localiseNumber = (value: number, locale: Locale): string => {
  const grouped = value.toLocaleString('en-US');
  if (locale === 'en') return grouped;
  return grouped.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]!).replace(/,/g, '٬');
};

/**
 * Renders `**emphasis**` inside a sentence.
 *
 * Only رأس الأمر uses it, and for a reason the Founder named: «اشرح المونتاج
 * والاستوري بورد باعتبارهما مسارين إبداعيين مختلفين». Two roads in one
 * paragraph read as one road in two stages unless their names are set apart.
 * This is a splitter, not a markdown engine — it emits text nodes and
 * `<strong>`, never HTML, so nothing in the content file can inject markup.
 */
function withEmphasis(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
  );
}

const SHOWCASE_FILTERS = [
  { id: 'all',    labelAr: 'الكل',       labelEn: 'All' },
  { id: 'image',  labelAr: 'صورة',       labelEn: 'Image' },
  { id: 'motion', labelAr: 'حركة',       labelEn: 'Motion' },
  { id: 'voice',  labelAr: 'صوت',        labelEn: 'Voice' },
  { id: 'film',   labelAr: 'عملٌ نهائيّ', labelEn: 'Finished work' },
] as const;

export default function SovereignLanding({ dict, locale, policies, packages }: SovereignLandingProps) {
  const en = locale === 'en';
  const [filter, setFilter] = useState<string>('all');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const tiles = useMemo(
    () => (filter === 'all' ? LANDING_SHOWCASE : LANDING_SHOWCASE.filter((s) => s.kind === filter)),
    [filter],
  );

  const toggleQuestion = useCallback((id: string) => {
    setOpenQuestion((current) => (current === id ? null : id));
  }, []);

  const headline = en
    ? ['Turn your idea into ', 'a story that stays.']
    : ['حوّل فكرتك إلى ', 'حكاية تبقى.'];

  /**
   * The design elevates the third card. Chosen by POSITION, so a change to
   * the approved table can never leave this pointing at a package that no
   * longer exists.
   */
  const featuredIndex = Math.min(2, packages.length - 1);

  return (
    <div className="lp-root" data-locale={locale}>
      {/* The ambient ground. Three light layers behind everything, painted
          once here rather than per-section, so the page reads as one lit
          space instead of a stack of separately-glowing bands. */}
      <div className="lp-ambient" aria-hidden="true">
        <span className="lp-ambient-violet" />
        <span className="lp-ambient-gold" />
        <span className="lp-ambient-deep" />
        <span className="lp-ambient-grid" />
      </div>

      {/* ══ 0 · THE BAR ════════════════════════════════════════════════ */}
      <header className="lp-nav">
        <a className="lp-brand" href="#lp-top">
          <span className="lp-brand-mark" aria-hidden="true" />
          <span className="lp-brand-text">
            <span className="lp-brand-name">AZMA OS</span>
            <span className="lp-brand-sub">{en ? 'A creative operating system' : 'نظامُ تشغيلٍ إبداعيّ'}</span>
          </span>
        </a>

        <nav className="lp-nav-links" aria-label={en ? 'Sections' : 'أقسام الصفحة'}>
          <a href="#lp-journey">{en ? 'The journey' : 'الرحلة'}</a>
          <a href="#lp-chambers">{en ? 'Chambers' : 'الحُجرات'}</a>
          <a href="#lp-capabilities">{en ? 'Capabilities' : 'الأدوات'}</a>
          <a href="#lp-packages">{en ? 'Packages' : 'الباقات'}</a>
          <a href="#lp-questions">{en ? 'Questions' : 'الأسئلة'}</a>
        </nav>

        <div className="lp-nav-actions">
          <LocaleSwitcher
            currentLocale={locale}
            triggerLabel={getLocaleDefinition(locale)?.nativeName ?? t(dict, 'gate.languageLabel')}
            menuLabel={t(dict, 'gate.chooseLanguage')}
          />
          <a className="lp-btn lp-btn--gold lp-btn--sm" href="/signup">
            {en ? 'Start now' : 'ابدأ الآن'}
          </a>
        </div>
      </header>

      {/* ══ 1 · THE OPENING ════════════════════════════════════════════ */}
      <section className="lp-hero" id="lp-top">
        <div className="lp-hero-inner">
          <p className="lp-eyebrow lp-eyebrow--pill">
            {en ? 'Your idea deserves a chamber' : 'فكرتُك تَستحقُّ حُجرةً تَليق بها'}
          </p>

          <h1 className="lp-headline">
            {headline[0]}
            <span className="lp-headline-lit">{headline[1]}</span>
          </h1>

          <p className="lp-hero-lede">
            {en
              ? 'Research your material, make images and audio from it, assemble a finished work, and keep '
                + 'everything you own in your Vault — one place, from the first thought to the last file.'
              : 'ابحث عن مادّتك، واصنع منها صوراً وأصواتاً، وركّبها عملاً نهائيّاً، '
                + 'واحفظ كلَّ ما تَملكه في خزانتك — مكانٌ واحد، من أوّلِ فكرةٍ إلى آخرِ ملفّ.'}
          </p>

          <div className="lp-hero-actions">
            <a className="lp-btn lp-btn--gold" href="/signup">
              {en ? 'Create an account' : 'أنشئ حساباً'}
            </a>
            <a className="lp-btn lp-btn--ghost" href="/login">
              {en ? 'I have an account' : 'لي حسابٌ — دخول'}
            </a>
          </div>
        </div>

        {/* ── THE SHOWCASE ────────────────────────────────────────── */}
        <div className="lp-showcase">
          <div className="lp-showcase-head">
            <p className="lp-showcase-title">{en ? 'What you can make here' : 'ما يُمكن أن تَصنعه هنا'}</p>
            <div className="lp-filters" role="group" aria-label={en ? 'Filter by kind' : 'التصفية بالنوع'}>
              {SHOWCASE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`lp-filter${filter === f.id ? ' lp-filter--on' : ''}`}
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {en ? f.labelEn : f.labelAr}
                </button>
              ))}
            </div>
          </div>

          <ul className="lp-tiles">
            {tiles.map((tile) => (
              <li className="lp-tile" key={tile.id} data-kind={tile.kind}>
                <span className="lp-tile-art" aria-hidden="true">
                  <span className="lp-tile-art-wash" />
                  <span className="lp-tile-art-mark" />
                </span>
                <span className="lp-tile-label">{en ? tile.labelEn : tile.labelAr}</span>
                <span className="lp-tile-chamber">{en ? tile.chamberEn : tile.chamberAr}</span>
              </li>
            ))}
          </ul>

          {/*
            SAID IN THE SAME BREATH the panels are seen. An abstract gradient
            beside «what you can make» reads as a portfolio unless it says
            otherwise — and this Empire holds no production imagery it may
            publish, because a Creator's Vault asset is theirs, not ours.
          */}
          <p className="lp-showcase-note">
            {en
              ? 'These panels name capabilities and are drawn, not produced. This page shows no Creator’s work: what you make belongs to you and stays in your Vault.'
              : 'هذه اللوحاتُ تُسمّي القدراتِ وهي مرسومةٌ لا منتَجة. ولا تَعرض هذه الصفحةُ عملَ أيِّ مبدع: ما تَصنعه لك، ويَبقى في خزانتك.'}
          </p>
        </div>
      </section>

      {/* ══ 2 · THE JOURNEY ════════════════════════════════════════════ */}
      <section className="lp-section lp-journey" id="lp-journey">
        <header className="lp-section-head">
          <p className="lp-eyebrow">{en ? 'How it works' : 'كيف تَسير'}</p>
          <h2 className="lp-h2">
            {en ? 'From an idea to a finished work, in three steps' : 'من الفكرة إلى العمل النهائيّ في ثلاثِ خطوات'}
          </h2>
        </header>

        <ol className="lp-steps">
          {LANDING_JOURNEY.map((step) => (
            <li className="lp-step" key={step.id}>
              <span className="lp-step-node" aria-hidden="true">{localiseNumber(step.ordinal, locale)}</span>
              <h3 className="lp-step-title">{en ? step.titleEn : step.titleAr}</h3>
              <p className="lp-step-body">{en ? step.bodyEn : step.bodyAr}</p>
              <p className="lp-step-chamber">{en ? step.chamberEn : step.chamberAr}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ══ 2b · WHAT THIS IS, AND WHAT IT IS NOT FOR ══════════════════
          THE APPROVED TEXTS, from the gateway's own dictionary keys so the
          two surfaces cannot drift. Do not reword.                       */}
      <section className="lp-section lp-purpose" id="lp-purpose">
        <div className="lp-purpose-grid">
          <article className="lp-purpose-card">
            <h2 className="lp-h3">{t(dict, 'gateway.introTitle')}</h2>
            <p className="lp-purpose-body">{t(dict, 'gateway.introBody')}</p>
            <p className="lp-purpose-body">{t(dict, 'gateway.introSecond')}</p>
          </article>

          <article className="lp-purpose-card lp-purpose-card--limits">
            <h2 className="lp-h3">{t(dict, 'gateway.limitsTitle')}</h2>
            <p className="lp-purpose-body">{t(dict, 'gateway.limitsBody')}</p>
          </article>
        </div>
      </section>

      {/* ══ 3 · THE CHAMBERS ═══════════════════════════════════════════ */}
      <section className="lp-section lp-chambers" id="lp-chambers">
        <header className="lp-section-head">
          <p className="lp-eyebrow">{en ? 'Five chambers' : 'خمسُ حُجرات'}</p>
          <h2 className="lp-h2">
            {en ? 'Every stage of your work has ' : 'لكلِّ مرحلةٍ من عملك '}
            <span className="lp-headline-lit">{en ? 'its own chamber.' : 'غرفتُها.'}</span>
          </h2>
          <p className="lp-section-lede">{t(dict, 'gateway.chambersLede')}</p>
        </header>

        <div className="lp-chamber-grid">
          {LANDING_CHAMBERS.map((c) => (
            <a className="lp-chamber" key={c.id} href={c.href} data-chamber={c.id}>
              <span className="lp-chamber-art" aria-hidden="true" />
              <span className="lp-chamber-role">{en ? c.roleEn : c.roleAr}</span>
              <h3 className="lp-chamber-name">{en ? c.nameEn : c.nameAr}</h3>
              <p className="lp-chamber-body">{withEmphasis(en ? c.bodyEn : c.bodyAr)}</p>
              {/* What the chamber GIVES — the sentence that replaced the
                  qualification a visitor used to be handed. */}
              <p className="lp-chamber-value">{en ? c.valueEn : c.valueAr}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ══ 4 · THE CAPABILITIES ═══════════════════════════════════════ */}
      <section className="lp-section lp-capabilities" id="lp-capabilities">
        <header className="lp-section-head">
          <p className="lp-eyebrow">{en ? 'Capabilities' : 'الأدوات والخدمات'}</p>
          <h2 className="lp-h2">
            {en ? 'Everything you need to make professional work' : 'كلُّ ما تَحتاجه لصناعةِ محتوًى احترافيّ'}
          </h2>
          <p className="lp-section-lede">
            {en
              ? 'Each one is reachable from inside the platform, today.'
              : 'كلُّ قدرةٍ هنا يَصِلها المبدعُ من داخلِ المنصّة، اليوم.'}
          </p>
        </header>

        <div className="lp-capability-grid">
          {LANDING_CAPABILITIES.map((cap) => (
            <article className="lp-capability" key={cap.id}>
              <h3 className="lp-capability-title">{en ? cap.titleEn : cap.titleAr}</h3>
              <p className="lp-capability-body">{en ? cap.bodyEn : cap.bodyAr}</p>
              <p className="lp-capability-ground">{en ? cap.groundEn : cap.groundAr}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ══ 5 · THE PACKAGES — THE ONE LIGHT BAND ══════════════════════ */}
      <section className="lp-section lp-packages" id="lp-packages">
        <header className="lp-section-head">
          <p className="lp-eyebrow">{en ? 'The balance' : 'الميزان'}</p>
          <h2 className="lp-h2">{en ? 'Your balance is yours, with no expiry date.' : 'رصيدك لك، بلا موعدِ انتهاء.'}</h2>
          <p className="lp-section-lede">
            {en
              ? 'You buy once. There is no renewal and no month that ends and takes what you did not use.'
              : 'تَشتري مرّةً واحدة. لا تجديدَ تلقائيٌّ ولا شهرٌ يَنقضي فيَذهب ما لم تَستعمله.'}
          </p>
        </header>

        <div className="lp-package-grid">
          {packages.map((pkg, index) => (
            <article
              className={`lp-package${index === featuredIndex ? ' lp-package--featured' : ''}`}
              key={pkg.packageId}
            >
              <h3 className="lp-package-name">{pkg.nameAr}</h3>
              <p className="lp-package-price">
                <span className="lp-package-figure">{localiseNumber(pkg.priceEgp, locale)}</span>
                <span className="lp-package-currency">{en ? 'EGP' : 'جنيه'}</span>
              </p>
              <p className="lp-package-units">
                {localiseNumber(pkg.balanceUnits, locale)} {en ? 'units of balance' : 'وحدةً من الرصيد'}
              </p>
              <a
                className={`lp-btn ${index === featuredIndex ? 'lp-btn--gold' : 'lp-btn--quiet'} lp-btn--block`}
                href="/signup"
              >
                {en ? 'Start with this' : 'ابدأ بهذه'}
              </a>
            </article>
          ))}
        </div>

        <p className="lp-packages-note">
          {en
            ? 'Balance is bought from inside the platform, not from this page. Every act states its price before you press it.'
            : 'الرصيدُ يُشترى من داخلِ المنصّة، لا من هذه الصفحة. وسعرُ كلِّ عملٍ مكتوبٌ قبل أن تَضغطه.'}
        </p>
      </section>

      {/* ══ 6 · THE KNOWLEDGE FOUNDATION ═══════════════════════════════
          Where the reference design put testimonials. We hold no Creator
          testimony we may publish, so what stands here is what we DO hold,
          named rather than summed.                                       */}
      <section className="lp-section lp-proof" id="lp-proof">
        <header className="lp-section-head">
          <p className="lp-eyebrow">{en ? 'The foundation' : 'الأساس'}</p>
          <h2 className="lp-h2">
            {en ? 'Your research stands on ' : 'بحثُك يَقوم على '}
            <span className="lp-headline-lit">{en ? 'named sources.' : 'مصادرَ مُسمّاة.'}</span>
          </h2>
          <p className="lp-section-lede">
            {en
              ? 'The Qur’an, searched live, and nine of the major hadith collections — each narration carrying its own grading.'
              : 'القرآنُ يُبحَث فيه حيّاً، وتسعةٌ من أمّهاتِ كتبِ الحديث — وكلُّ روايةٍ تَحمل درجتها معها.'}
          </p>
        </header>

        <div className="lp-proof-total">
          <span className="lp-proof-total-figure">{en ? LANDING_PROOF_TOTAL.figureEn : LANDING_PROOF_TOTAL.figureAr}</span>
          <span className="lp-proof-total-label">{en ? LANDING_PROOF_TOTAL.labelEn : LANDING_PROOF_TOTAL.labelAr}</span>
        </div>

        <ul className="lp-proof-grid">
          {LANDING_PROOF.map((p) => (
            <li className="lp-proof-card" key={p.id}>
              <span className="lp-proof-figure">{p.figure}</span>
              <span className="lp-proof-label">{en ? p.labelEn : p.labelAr}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ══ 7 · THE QUESTIONS ══════════════════════════════════════════ */}
      <section className="lp-section lp-questions" id="lp-questions">
        <header className="lp-section-head">
          <p className="lp-eyebrow">{en ? 'Before you ask' : 'قبل أن تَسأل'}</p>
          <h2 className="lp-h2">{en ? 'Questions people actually ask' : 'الأسئلةُ الشائعة'}</h2>
        </header>

        <div className="lp-faq">
          {LANDING_QUESTIONS.map((q) => {
            const open = openQuestion === q.id;
            return (
              <div className={`lp-faq-item${open ? ' lp-faq-item--open' : ''}`} key={q.id}>
                <h3 className="lp-faq-heading">
                  <button
                    type="button"
                    className="lp-faq-q"
                    aria-expanded={open}
                    aria-controls={`lp-faq-a-${q.id}`}
                    id={`lp-faq-q-${q.id}`}
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <span className="lp-faq-q-text">{en ? q.questionEn : q.questionAr}</span>
                    <span className="lp-faq-sign" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  className="lp-faq-a"
                  id={`lp-faq-a-${q.id}`}
                  role="region"
                  aria-labelledby={`lp-faq-q-${q.id}`}
                  hidden={!open}
                >
                  <p>{en ? q.answerEn : q.answerAr}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ 8 · THE INVITATION ═════════════════════════════════════════ */}
      <section className="lp-section lp-invitation" id="lp-invitation">
        <h2 className="lp-h2">{t(dict, 'gateway.accountTitle')}</h2>
        <p className="lp-section-lede">{t(dict, 'gateway.accountLede')}</p>
        <div className="lp-hero-actions">
          <a className="lp-btn lp-btn--gold" href="/signup">{t(dict, 'gateway.accountSignUp')}</a>
          <a className="lp-btn lp-btn--ghost" href="/login">{t(dict, 'gateway.accountSignIn')}</a>
        </div>
      </section>

      {/* ══ 9 · THE FOOTER ═════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <span className="lp-brand-name">AZMA OS</span>
            <p className="lp-footer-blurb">
              {en
                ? 'A creative operating system for content makers: research, creation, production, keeping and delivery — five chambers, one place.'
                : 'نظامُ تشغيلٍ إبداعيٌّ لصنّاع المحتوى: بحثٌ وخلقٌ وإنتاجٌ وحفظٌ وتسليم — خمسُ حُجراتٍ في مكانٍ واحد.'}
            </p>
          </div>

          {LANDING_FOOTER.map((col) => (
            <nav className="lp-footer-col" key={col.id} aria-label={en ? col.titleEn : col.titleAr}>
              <h3 className="lp-footer-col-title">{en ? col.titleEn : col.titleAr}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{en ? link.labelEn : link.labelAr}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/*
            BUILT FROM WHAT IS GENUINELY PUBLISHED. `PUBLISHED_POLICIES` is
            already the filtered list of documents the platform can serve, so
            no card here can open onto a wall. The version travels with the
            title, because a policy without a version cannot be cited.
          */}
          <nav className="lp-footer-col" aria-label={en ? 'Policies' : 'السياسات'}>
            <h3 className="lp-footer-col-title">{en ? 'Policies' : 'السياسات'}</h3>
            <ul>
              {policies.map((p) => (
                <li key={p.slug}>
                  <a href={`/policies/${p.slug}`}>
                    {en ? p.titleEn : p.titleAr}
                    <span className="lp-footer-version">v{p.version}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="lp-footer-foot">
          <span>© {new Date().getFullYear()} AZMA OS</span>
          <span className="lp-footer-foot-note">
            {en ? 'Built in Arabic, for Arabic.' : 'بُنيت بالعربيّة، للعربيّة.'}
          </span>
        </div>
      </footer>
    </div>
  );
}
