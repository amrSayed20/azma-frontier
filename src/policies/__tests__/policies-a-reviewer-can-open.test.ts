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
