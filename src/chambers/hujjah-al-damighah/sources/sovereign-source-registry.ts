/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Sovereign Source Registry.
 *
 * Every source the chamber knows of, whether or not it can reach it. A source
 * that refuses this host stays registered and is shown as refused — the Creator
 * learns that a named authority was consulted and could not be reached, instead
 * of a silence they must interpret.
 *
 * ─── EVERY ACCESS STATE HERE WAS MEASURED ───────────────────────────────────
 *
 *   From the production host (2.28.52.180) on 2026-09-15, not from an
 *   engineer's laptop — which reaches things this server cannot, as gutendex
 *   proved by answering 200 to one and 403 to the other.
 *
 *   OPEN      hadith text CDN      200 in 24ms   (9 collections, Arabic)
 *   OPEN      hadith encyclopedia  200 in 506ms  (Arabic gradings + شرح)
 *   OPEN      Qur'an               200 in 34ms
 *   OPEN      Arabic encyclopedia  200 in 222ms
 *   BLOCKED   dorar.net            403
 *   BLOCKED   sunnah.com           403
 *   BLOCKED   sunna.alifta.gov.sa  challenge page
 *   BLOCKED   library index        403  (200 from an ordinary connection)
 *
 *   The three Hadith authorities the Founder named are all refused from this
 *   host. They remain registered, because the fix is a route to them, and a
 *   source deleted for being unreachable is a source nobody remembers to fix.
 *
 * ─── THE SECRECY BOUNDARY HOLDS ─────────────────────────────────────────────
 *
 *   `sourceId` and `endpoint` are internal. What reaches a Creator is `titleAr`
 *   — «صحيح البخاري», «القرآن الكريم» — which names the work, not the vendor
 *   that serves it. A collection's name is the evidence's identity; a hostname
 *   is plumbing.
 */

import { SourceAuthority } from '../domain/evidence-authority';
import {
  SovereignSource,
  SourceType,
  SourceRole,
  VerificationStatus,
  AccessStatus,
  CoverageStatus,
  CopyrightStatus,
} from './source-contracts';

/** When the access states below were established by real requests. */
const MEASURED_AT = Date.parse('2026-09-15T00:00:00Z');

export const SOVEREIGN_SOURCES: readonly SovereignSource[] = [
  // ─── LAYER 1 — SCRIPTURE ───────────────────────────────────────────────────
  {
    sourceId: 'scripture',
    titleAr: 'القرآن الكريم',
    sourceType: SourceType.SCRIPTURE,
    sourceRole: SourceRole.PRIMARY_TEXT,
    language: 'ar',
    authorityClass: SourceAuthority.SCRIPTURE,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    coverage: CoverageStatus.FULLY_REVIEWED,
    copyrightStatus: CopyrightStatus.PUBLIC_DOMAIN,
    edition: 'رسم عثماني، ومعه التفسير الميسّر',
    domains: ['religious', 'history'],
    note: 'Verse text with sura and number, plus the Muyassar reading. Search is literal over the Uthmani text: measured, the whole phrase «قصة أصحاب الكهف» answers 404 while «أصحاب الكهف» answers in 34ms.',
    lastMeasuredAtMs: MEASURED_AT,
  },

  // ─── LAYER 2 — HADITH AND SUNNAH ──────────────────────────────────────────
  {
    sourceId: 'hadith-collections',
    titleAr: 'كتب السنّة التسعة',
    sourceType: SourceType.HADITH_COLLECTION,
    sourceRole: SourceRole.PRIMARY_TEXT,
    language: 'ar',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    // The full text of each collection is retrieved, so coverage is whole —
    // unlike the library, which is read only at its opening.
    coverage: CoverageStatus.FULLY_REVIEWED,
    copyrightStatus: CopyrightStatus.FREELY_LICENSED,
    edition: 'صحيح البخاري · صحيح مسلم · سنن أبي داود · جامع الترمذي · سنن النسائي · سنن ابن ماجه · موطأ مالك · الأربعون النووية · الأربعون القدسية',
    domains: ['religious'],
    note: 'Measured: 7589 narrations for al-Bukhari in 187ms, 7563 for Muslim, 5274 for Abu Dawud. Gradings arrive with the name of the scholar who issued them — al-Albani, Shuayb al-Arnaut, Zubayr Ali Zai — and they differ from one another, which the Creator is shown rather than spared. The two Sahihs carry no grading field at all, and are therefore displayed as ungraded rather than graded by the reputation of their titles.',
    lastMeasuredAtMs: MEASURED_AT,
  },
  {
    sourceId: 'hadith-encyclopedia',
    titleAr: 'الموسوعة الحديثية',
    sourceType: SourceType.HADITH_ENCYCLOPEDIA,
    sourceRole: SourceRole.SCHOLARLY_APPARATUS,
    language: 'ar',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    coverage: CoverageStatus.INDEX_ONLY,
    copyrightStatus: CopyrightStatus.PERMITTED_REFERENCE,
    domains: ['religious'],
    note: 'Carries the grading in Arabic natively along with attribution, takhrij and a scholarly explanation. Browsable by subject; measured to have no search endpoint (400 and 404), so it is reached by category rather than by query.',
    lastMeasuredAtMs: MEASURED_AT,
  },

  // The three authorities the Founder named. All refused from this host.
  {
    sourceId: 'dorar',
    titleAr: 'الموسوعة الحديثية — الدرر السنية',
    sourceType: SourceType.HADITH_ENCYCLOPEDIA,
    sourceRole: SourceRole.SCHOLARLY_APPARATUS,
    language: 'ar',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.UNVERIFIED,
    accessStatus: AccessStatus.BLOCKED,
    coverage: CoverageStatus.SOURCE_BLOCKED,
    copyrightStatus: CopyrightStatus.PERMITTED_REFERENCE,
    domains: ['religious'],
    note: 'Answers 403 to this host on both its JSON route and its search page. Registered so the refusal is visible and so a future route to it has somewhere to attach.',
    lastMeasuredAtMs: MEASURED_AT,
  },
  {
    sourceId: 'sunnah-com',
    titleAr: 'مكتبة السنّة النبوية',
    sourceType: SourceType.HADITH_COLLECTION,
    sourceRole: SourceRole.PRIMARY_TEXT,
    language: 'mixed',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.UNVERIFIED,
    accessStatus: AccessStatus.REQUIRES_KEY,
    coverage: CoverageStatus.SOURCE_BLOCKED,
    copyrightStatus: CopyrightStatus.PERMITTED_REFERENCE,
    domains: ['religious'],
    note: 'Its API answers 403 Forbidden without a credential the Empire does not hold; its public pages answer 403 to this host. Registered pending a credential.',
    lastMeasuredAtMs: MEASURED_AT,
  },
  {
    sourceId: 'alifta-sunna',
    titleAr: 'بوابة السنّة النبوية الرسمية',
    sourceType: SourceType.HADITH_COLLECTION,
    sourceRole: SourceRole.PRIMARY_TEXT,
    language: 'ar',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.UNVERIFIED,
    accessStatus: AccessStatus.BLOCKED,
    coverage: CoverageStatus.SOURCE_BLOCKED,
    copyrightStatus: CopyrightStatus.PERMITTED_REFERENCE,
    domains: ['religious'],
    note: 'Returns an interstitial challenge page to this host rather than its index. Registered so the Creator is told a named authority was consulted and refused.',
    lastMeasuredAtMs: MEASURED_AT,
  },

  // ─── LAYER 3 — SIRAH, BIOGRAPHY, HISTORY ──────────────────────────────────
  {
    sourceId: 'arabic-wikipedia',
    titleAr: 'الموسوعة العربية',
    sourceType: SourceType.ENCYCLOPEDIA,
    sourceRole: SourceRole.NARRATIVE,
    language: 'ar',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    coverage: CoverageStatus.PARTIALLY_REVIEWED,
    copyrightStatus: CopyrightStatus.FREELY_LICENSED,
    domains: ['religious', 'history', 'culture', 'scientific', 'medical'],
    note: 'Arabic narrative and biography. Measured 200 in 222ms for «أبو بكر الصديق». A general encyclopedia, so it carries narrative and not primary text — it never outranks a verse or a narration.',
    lastMeasuredAtMs: MEASURED_AT,
  },

  // ─── THE LIBRARY AND THE REST ─────────────────────────────────────────────
  {
    sourceId: 'gutenberg',
    titleAr: 'مكتبة الكتب الحرّة',
    sourceType: SourceType.LIBRARY,
    sourceRole: SourceRole.NARRATIVE,
    language: 'en',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.UNVERIFIED,
    accessStatus: AccessStatus.BLOCKED,
    coverage: CoverageStatus.EXCERPT_ONLY,
    copyrightStatus: CopyrightStatus.PUBLIC_DOMAIN,
    domains: ['history', 'culture', 'scientific'],
    note: 'Its catalogue index answers 403 to this host while answering 200 in 0.89s to an ordinary connection, so the library is silent in production though the service is healthy. Its book text remains reachable. Even when reachable, only the opening ten kilobytes of a volume is ever read — the Creator is told this rather than left to assume a whole book was searched. Measured: 79,381 volumes, of which exactly one is in Arabic.',
    lastMeasuredAtMs: MEASURED_AT,
  },
  {
    sourceId: 'open-library',
    titleAr: 'فهرس الكتب العالمي',
    sourceType: SourceType.LIBRARY,
    sourceRole: SourceRole.INDEX,
    language: 'en',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    coverage: CoverageStatus.INDEX_ONLY,
    copyrightStatus: CopyrightStatus.FREELY_LICENSED,
    domains: ['history', 'culture', 'scientific'],
    note: 'Carries descriptions rather than full text, so it locates a work without evidencing it.',
    lastMeasuredAtMs: MEASURED_AT,
  },
  {
    sourceId: 'wikipedia',
    titleAr: 'الموسوعة العالمية',
    sourceType: SourceType.ENCYCLOPEDIA,
    sourceRole: SourceRole.CONTEXT,
    language: 'en',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    coverage: CoverageStatus.PARTIALLY_REVIEWED,
    copyrightStatus: CopyrightStatus.FREELY_LICENSED,
    domains: ['history', 'culture', 'scientific', 'medical'],
    note: 'English. Everything it returns crosses the translation layer before it reaches a Creator, because the chamber speaks and would otherwise read English aloud.',
    lastMeasuredAtMs: MEASURED_AT,
  },
  {
    sourceId: 'google-trends',
    titleAr: 'اتجاهات الاهتمام العام',
    sourceType: SourceType.CONTEMPORARY,
    sourceRole: SourceRole.CONTEXT,
    language: 'en',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    coverage: CoverageStatus.INDEX_ONLY,
    copyrightStatus: CopyrightStatus.PERMITTED_REFERENCE,
    domains: ['culture'],
    note: 'Contemporary attention, not knowledge. Never evidence for a religious or historical claim.',
    lastMeasuredAtMs: MEASURED_AT,
  },
  {
    sourceId: 'hacker-news',
    titleAr: 'المجال التقني المعاصر',
    sourceType: SourceType.CONTEMPORARY,
    sourceRole: SourceRole.CONTEXT,
    language: 'en',
    authorityClass: SourceAuthority.DOCUMENTED,
    verificationStatus: VerificationStatus.VERIFIED,
    accessStatus: AccessStatus.OPEN,
    coverage: CoverageStatus.INDEX_ONLY,
    copyrightStatus: CopyrightStatus.PERMITTED_REFERENCE,
    domains: ['scientific', 'culture'],
    note: 'Technical discourse. Context only.',
    lastMeasuredAtMs: MEASURED_AT,
  },
];

// ─── READING THE REGISTRY ────────────────────────────────────────────────────

const BY_ID = new Map(SOVEREIGN_SOURCES.map((s) => [s.sourceId, s]));

export function findSource(sourceId: string): SovereignSource | null {
  return BY_ID.get(sourceId.trim().toLowerCase()) ?? null;
}

/** The Creator-facing name of a source, or null when it is not registered. */
export function sourceTitleAr(sourceId: string): string | null {
  return findSource(sourceId)?.titleAr ?? null;
}

/**
 * Whether a source has any business answering a question in this domain.
 *
 * The registry has recorded each source's domains since it was built, and the
 * chamber was not consulting that record — so a religious question was put to
 * the register of contemporary public attention and to a forum of technical
 * discourse, and they took places that the Qur'an and the Sunnah did not get.
 * Measured live: of ten pieces of evidence for a religious question, three came
 * from a Ministry whose only sources are trends and technology news.
 *
 * An unregistered source is allowed through rather than silently dropped: the
 * registry governs what it knows about, and a source it has never heard of is
 * a gap in the registry, not grounds to silence a provider the Empire
 * deliberately attached.
 */
export function sourceServesDomain(sourceId: string, domain?: string | null): boolean {
  if (!domain) return true;
  const wanted = domain.trim().toLowerCase();

  // A domain no source declares is a domain this registry does not govern —
  // the Sovereign path carries 'observation', 'fulfillment' and 'general',
  // which describe why an investigation was raised rather than what body of
  // knowledge answers it. Filtering on one of those would have silenced every
  // source in the Empire and severed a bridge that already works. The registry
  // governs what it models; where it models nothing, it rules nothing.
  if (!GOVERNED_DOMAINS.has(wanted)) return true;

  const source = findSource(sourceId);
  if (!source) return true;
  return source.domains.includes(wanted);
}

/** Every domain any registered source declares. Derived, never hand-listed. */
const GOVERNED_DOMAINS: ReadonlySet<string> = new Set(
  SOVEREIGN_SOURCES.flatMap((s) => s.domains),
);

/** The domains the registry actually governs, for inspection and for tests. */
export function governedDomains(): string[] {
  return [...GOVERNED_DOMAINS].sort();
}

/** Sources the chamber can actually reach, for a given domain. */
export function reachableSourcesFor(domain: string): readonly SovereignSource[] {
  return SOVEREIGN_SOURCES.filter(
    (s) => s.accessStatus === AccessStatus.OPEN && s.domains.includes(domain),
  );
}

/**
 * Sources that were named for this domain but cannot be reached.
 *
 * Shown to the Creator so an absence is explained rather than merely felt. A
 * religious question that returns no Hadith from the three named authorities
 * should say why.
 */
export function unreachableSourcesFor(domain: string): readonly SovereignSource[] {
  return SOVEREIGN_SOURCES.filter(
    (s) => s.accessStatus !== AccessStatus.OPEN && s.domains.includes(domain),
  );
}

/** The chamber's own account of which sources answered and which refused. */
export interface SourceAvailabilityReport {
  readonly reachable: readonly string[];
  readonly unreachable: readonly { titleAr: string; reasonAr: string }[];
}

export function availabilityFor(domain: string): SourceAvailabilityReport {
  return {
    reachable: reachableSourcesFor(domain).map((s) => s.titleAr),
    unreachable: unreachableSourcesFor(domain).map((s) => ({
      titleAr: s.titleAr,
      reasonAr:
        s.accessStatus === AccessStatus.REQUIRES_KEY
          ? 'يتطلب إذن وصول لا تملكه الإمبراطورية بعد'
          : 'لا يستجيب لطلبات الإمبراطورية حالياً',
    })),
  };
}
