/**
 * Three defects this file exists to catch — nothing wider.
 *
 * All three are REGRESSIONS OF TRANSCRIPTION: a legal text moved from `docs/`
 * into the build is copied by hand, and the next hand to copy one will not
 * have read the reasons the last one changed what it changed.
 */
import { PUBLISHED_POLICIES, policyBySlug } from '../index';

describe('the policies a platform reviewer is given', () => {
  /**
   * TikTok, Meta and XPay are each handed a URL and open it. The slug is the
   * URL. Unregistering a policy — or renaming its slug — turns a submitted
   * application into a 404 nobody discovers until the review is refused.
   */
  it('answers at both slugs handed to the platforms', () => {
    expect(policyBySlug('terms-of-service')).toBeDefined();
    expect(policyBySlug('privacy-policy')).toBeDefined();
  });

  /**
   * TERMS §9, in the Founder's own words: «لا تُنشر هذه الوثيقة بصياغة حدود
   * المسؤولية الحالية.» The clause was removed to obey him. A transcription
   * that restores it publishes a liability cap he forbade publishing.
   */
  it('does not publish the liability wording the Founder forbade', () => {
    expect(policyBySlug('terms-of-service')!.body).not.toContain('الأضرار غير المباشرة');
  });

  /**
   * The source documents carry ⚠️ LEGAL REVIEW REQUIRED labels addressed to an
   * internal reviewer. A published legal page is read by a Creator and by a
   * platform, and neither is that reviewer. The GAPS survive as plain
   * statements; the scaffolding must not.
   */
  it('carries no internal review scaffolding on any published page', () => {
    for (const p of PUBLISHED_POLICIES) {
      expect(p.body).not.toContain('LEGAL REVIEW REQUIRED');
    }
  });
});

/**
 * ─── THE LIKENESS CLAUSES, 2026-10-12 ──────────────────────────────────────
 *
 *   A fourth defect joins the three above, and it is of the same family: the
 *   likeness wording exists in `docs/policies/` AND in the transcription that
 *   is actually served. A hand that edits one and not the other gives the
 *   Empire two texts about one subject — which is what kept five documents
 *   unpublished for a month.
 *
 *   These assert the SUBSTANCE, not the prose: each one names a thing the
 *   clause must say, or a thing it must never say.
 */
describe('the likeness clauses, where a Creator actually reads them', () => {
  const terms = policyBySlug('terms-of-service')!.body;
  const privacy = policyBySlug('privacy-policy')!.body;

  it('the terms say the Creator holds the rights and bears the declaration', () => {
    expect(terms).toContain('تملك الحقوق والأذون اللازمة');
  });

  it('and that possession of an image is not consent', () => {
    expect(terms).toContain('ليس في ذاته موافقةً من الشخص الظاهر فيه');
  });

  it('and that AZMA verifies nothing on the Creator’s behalf', () => {
    expect(terms).toContain('ولا تتحقّق AZMA نيابةً عنك من موافقة الشخص الظاهر');
  });

  it('the forbidden use is in the published prohibition list, not only in a repo file', () => {
    expect(terms).toContain('شبيهَ شخصٍ بغير إذنه');
  });

  it('the closing disclaimer denies the verification a reader might assume', () => {
    expect(terms).toContain('تحقّقاً من موافقة أيّ شخصٍ');
  });

  it('the privacy policy says what the declaration stores — and that it is only that', () => {
    expect(privacy).toContain('إصدار نصّ الإقرار الذي قرأته ولحظة إقرارك به');
    expect(privacy).toContain('ولا نحفظ نسخةً ثانيةً من وجهٍ أو مادّةٍ لأجل الإقرار');
  });

  it('it says what is passed to a processor, and that the declaration is not', () => {
    expect(privacy).toContain('ولا يُمرّر إقرارُك إلى المزوّد');
  });

  it('and it promises NO deletion at a provider we have not measured', () => {
    expect(privacy).toContain('لم تُوثّق ولم تُقَس');
    expect(privacy).not.toMatch(/يُحذَف فوراً|نحذفها عند المزوّد|تُحذَف من خوادم المزوّد/);
  });

  it('the refund policy prices nothing it has not measured', () => {
    const refunds = policyBySlug('refunds-and-credit-balance')!.body;
    expect(refunds).toContain('CAPABILITIES NOT YET PRICED');
    expect(refunds).toContain('consume no credit balance');
  });

  it('every published document that gained a clause also gained a version', () => {
    expect(policyBySlug('terms-of-service')!.version).toBe('1.2');
    expect(policyBySlug('privacy-policy')!.version).toBe('1.2');
    expect(policyBySlug('refunds-and-credit-balance')!.version).toBe('1.1');
  });

  it('and the served body states the same version as the record', () => {
    // MEASURED HAZARD: the version lives twice — in the field and inside the
    // text. Two numbers for one document is how a reader cites a text nobody
    // can find.
    expect(terms).toContain('الإصدار: 1.2');
    expect(privacy).toContain('الإصدار: 1.2');
    expect(policyBySlug('refunds-and-credit-balance')!.body).toContain('Policy Version: 1.1');
  });
});
