/**
 * A catalogue is asked the subject, not the asking.
 *
 * ─── MEASURED, ON THE LIVE ARABIC ENCYCLOPEDIA ──────────────────────────────
 *
 *   «اشرح للمريض عملية استئصال المرارة»   →  0 results
 *   «استئصال المرارة»                      →  10, the first being the article
 *                                              of that exact name
 *
 *   The whole medical domain answered a doctor with nothing, because the words
 *   they used to *ask* — اشرح، للمريض، عملية — were searched as though they
 *   named what they asked *about*.
 *
 *   «يجب أن تكون الحجرة صادقة وتجيب المستخدم من سؤاله أو موضوعه... وخاصة سياق
 *    البحث وليس الكلمات المستخدمة في الموضوع.»
 */

import { subjectOf, subjectWordsOf, hasFraming } from '../domain/question-subject';

describe('the questions that cost a Creator an answer', () => {
  it('reduces a doctor’s question to the procedure', () => {
    expect(subjectOf('اشرح للمريض عملية استئصال المرارة')).toBe('استئصال المرارة');
  });

  it('reduces the Founder’s question to its subject', () => {
    expect(subjectOf('قصة صاحب الحوت سيدنا يونس')).toBe('صاحب الحوت سيدنا يونس');
  });

  it('reduces a question about merit to the thing itself', () => {
    expect(subjectOf('ما ورد في فضل الصبر')).toBe('الصبر');
  });

  it('leaves a name alone when a question is already its subject', () => {
    expect(subjectOf('صلاح الدين الأيوبي')).toBe('صلاح الدين الأيوبي');
  });

  it('keeps a name intact inside a framed question', () => {
    expect(subjectOf('من هو صلاح الدين الأيوبي')).toBe('صلاح الدين الأيوبي');
  });
});

describe('order is meaning', () => {
  it('keeps the words as they were written', () => {
    // «استئصال المرارة» is a procedure; «المرارة استئصال» is nothing.
    expect(subjectWordsOf('عملية استئصال المرارة')).toEqual(['استئصال', 'المرارة']);
  });
});

describe('what it refuses to strip', () => {
  it('keeps a framing word when it is the subject itself', () => {
    // Someone may genuinely be asking about medicine, or about stories.
    expect(subjectOf('الطب النبوي')).toContain('الطب');
    expect(subjectOf('القصة القصيرة')).toContain('القصيرة');
  });

  it('returns the question whole when nothing would survive', () => {
    // A catalogue asked too much finds a little; asked nothing, it finds
    // nothing at all.
    expect(subjectOf('ما هو')).toBe('ما هو');
    expect(subjectOf('اشرح لي')).toBe('اشرح لي');
  });

  it('leaves an English question to the catalogues that index English', () => {
    expect(subjectOf('what is solar energy')).toContain('solar');
  });
});

describe('recognising that a question carries framing at all', () => {
  it('sees it where it is', () => {
    expect(hasFraming('اشرح للمريض عملية استئصال المرارة')).toBe(true);
  });

  it('does not invent it where it is not', () => {
    expect(hasFraming('استئصال المرارة')).toBe(false);
  });
});

describe('diacritics do not hide a framing word', () => {
  it('strips one written with them', () => {
    expect(subjectOf('قِصَّةُ أَصْحَابِ الفِيل')).not.toContain('قِصَّةُ');
  });
});
