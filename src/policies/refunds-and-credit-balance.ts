/**
 * AZMA OS — POLICY: REFUNDS & CREDIT BALANCE.
 *
 * ─── THE FOUNDER'S OWN TEXT, 2026-09-28, VERBATIM ───────────────────────────
 *
 *   Delivered finished, carrying a company identity the repository had never
 *   held: Topline Design, Nasr City Cairo, with a phone and an address. That
 *   makes it an instrument, not a draft, and an instrument is transcribed and
 *   not edited. Two things in it are therefore REPORTED and left untouched:
 *
 *     · §4 reads «remains محفوظًا in the account» — one Arabic word inside an
 *       English sentence.
 *     · The effective date is «[To be added]», so the document does not yet
 *       say when it begins to govern.
 *
 *   Both are the Founder's to correct. Changing a legal text on his behalf is
 *   a larger fault than shipping his own words as he wrote them.
 *
 * ─── AND WHY THE TEXT LIVES IN TYPESCRIPT ───────────────────────────────────
 *
 *   MEASURED 2026-09-28: the release artifact is `tar … .next package.json
 *   package-lock.json`. `docs/` NEVER REACHES THE SERVER. So the seven policy
 *   documents written in September exist on a laptop and in git, and not one
 *   of them can be served to anyone — while XPay requires public policy URLs
 *   before it will take a pound. A policy that cannot be read is not a policy.
 *
 *   Text compiled into the build travels with it. That is the whole reason
 *   this is a `.ts` file and not another `.md`.
 */

import type { PolicyDocument } from './types';

/**
 * ─── ONE QUESTION THIS DOCUMENT DELIBERATELY DOES NOT ANSWER ────────────────
 *
 *   LEGAL REVIEW REQUIRED (reviewer-facing, and kept OUT of the published body
 *   by `policies-a-reviewer-can-open.test.ts` — a page a Creator opens must
 *   not carry our internal markers):
 *
 *   Does a third-party processing provider charge AZMA for a job that failed
 *   after partially rendering? The provider documents that credits apply to
 *   «frames that actually render», which implies a partial charge on a partial
 *   failure. NOT measured against a real failure as of 2026-10-12.
 *
 *   So §6 promises the Creator nothing about OUR cost, and says only what it
 *   has always said about THEIR balance.
 */
export const REFUNDS_AND_CREDIT_BALANCE: PolicyDocument = {
  slug: 'refunds-and-credit-balance',
  titleEn: 'Refunds & Credit Balance',
  titleAr: 'الاسترداد ورصيد الوحدات',
  language: 'ar',
  version: '1.2',
  /** «[To be added]» in the Founder's text. Until it is a date, it is null. */
  effectiveDate: null,
  body: `سياسة الاسترداد ورصيد الوحدات
AZMA OS

تاريخ السريان: [يُضاف]
إصدار السياسة: 1.2


١. الغرض

تشرح هذه السياسة القواعد التي تحكم شراء الوحدات داخل AZMA OS، ومعاملة الرصيد غير المستهلك، والإخفاقات المتعلقة بالإنتاج، وطلبات الاسترداد.

تُشغَّل AZMA OS بواسطة:

Topline Design

الموقع:
azmaos.com

العنوان:
مدينة نصر، القاهرة

الهاتف:
01069269456

البريد الإلكتروني:
azma.os27@gmail.com


٢. رصيد الوحدات

الوحدات المشتراة أو المضافة بطريقة مشروعة إلى حساب في AZMA OS تُكوِّن رصيداً رقمياً مرتبطاً بذلك الحساب.

ويُستعمل رصيد الوحدات للوصول إلى قدرات الإنتاج والإبداع المؤهَّلة والمتاحة داخل AZMA OS وفق قواعد الخدمة السارية.

والرصيد الظاهر في حساب المستخدم هو رصيد وحداته المتاح في AZMA OS.


٣. لا استرداد نقدي

جميع عمليات شراء وحدات AZMA OS نهائية وغير قابلة للاسترداد نقداً.

والوحدات غير المستهلكة لا تُستبدل نقداً، ولا يمكن سحبها، ولا تحويلها إلى حساب بنكي، ولا تحويلها إلى أي وسيلة دفع نقدية أخرى.

وتسري هذه السياسة سواء استهلك المستخدم جزءاً من الرصيد المشترى أو لم يستهلك منه شيئاً.

ولا يستثني أي نص في هذه السياسة أي حق في الاسترداد أو أي حق للمستهلك لا يجوز استثناؤه قانوناً بموجب القانون الواجب التطبيق.


٤. رصيد الوحدات لا تنتهي صلاحيته

الوحدات المدفوعة التي اشتراها المستخدم لا تنتهي صلاحيتها لمجرد مرور الوقت.

وانتهاء الاشتراك أو إلغاؤه أو عدم تجديده لا يُلغي بذاته رصيد الوحدات الذي سبق للمستخدم شراؤه ولا يُزيله.

ويبقى الرصيد المشترى محفوظاً في الحساب، ولا يسقط لمجرد توقف المستخدم عن استعمال المنصّة مدةً من الزمن.

وما دام الحساب مستوفياً لمتطلبات المنصّة والأمان والقانون والملكية السارية، يبقى الرصيد مرتبطاً بذلك الحساب.


٥. الاشتراك ورصيد الوحدات أمران منفصلان

الاشتراك في AZMA OS ورصيد وحدات المستخدم أمران منفصلان.

وإلغاء الاشتراك أو عدم تجديده لا يعني تلقائياً أنّ الوحدات التي سبق شراؤها تُسترد أو تُزال.

وكذلك فإنّ شراء وحدات لا يُعدّ بالضرورة اشتراكاً ما لم تنصّ عملية الشراء المعنية على خلاف ذلك صراحةً.


٦. إخفاق الإنتاج

إذا أخفقت عملية إنتاج مؤهَّلة قبل أن تُسلِّم AZMA OS نتيجة الإنتاج المقصودة بنجاح، جاز لـAZMA OS أن تُعيد أو تَرُدّ الوحدات التي استهلكتها تلك العملية المخفقة وفق قواعد الإنتاج والمحاسبة في المنصّة.

وتتعلق هذه المعاملة بإعادة وحدات المنصّة المرتبطة بعملية إنتاج مخفقة.

ولا تُعدّ استرداداً نقدياً لثمن شراء الوحدات الأصلي.

وحيث تكون عملية الإنتاج قد اكتملت بنجاح وسُلِّم الأصل الناتج إلى حساب المستخدم، تُعدّ العملية عملية إنتاج مكتملة.


٧. الإنتاج الناجح

متى اكتملت عملية الإنتاج بنجاح وسُلِّم الأصل الناتج، عُدَّت الوحدات التي استهلكتها تلك العملية مستهلَكة.

ولا يجوز للمستخدم طلب استرداد نقدي لمجرد أنّ الناتج الإبداعي لا يوافق ذوقه الإبداعي الشخصي.

ويُنصح المستخدمون بمراجعة إعدادات الإنتاج المتاحة والقدرات والتكاليف السارية قبل بدء أي عملية إنتاج.


٨. إغلاق الحساب

إغلاق حساب AZMA OS أو هجره أو التوقف عن استعماله لا يُنشئ حقاً تلقائياً في استرداد نقدي للوحدات التي سبق شراؤها.

وحيث يوجب القانون الواجب التطبيق أو مشكلة موثَّقة في الحساب أو خطأ موثَّق في المنصّة معاملةً مختلفة، يُعالَج الأمر وفق المتطلبات القانونية أو متطلبات المنصّة السارية.


٩. أمان الحساب وملكيته

ترتبط الوحدات بحساب AZMA OS الذي اشتُريت أو اكتُسبت من خلاله بطريقة مشروعة.

والمستخدمون مسؤولون عن الحفاظ على أمان حساباتهم وحماية بيانات تسجيل دخولهم.

ويجوز لـAZMA OS اتخاذ تدابير معقولة عند وجود دليل على احتيال أو وصول غير مصرَّح به أو إساءة استعمال أو مخالفة لشروط المنصّة.


١٠. الشفافية

تسعى AZMA OS إلى عرض كلفة الوحدات السارية قبل بدء عملية الإنتاج، حيث تتوفر لدى المنصّة معلومات كافية لتحديد تلك الكلفة.

وعلى المستخدم مراجعة كلفة الإنتاج المعروضة ورصيده المتاح قبل تأكيد أي عملية مدفوعة.

ولا تُقدِّم AZMA OS الكلفة التقديرية على أنّها كلفة نهائية مضمونة لدى المزوّد حيث لا يمكن بعدُ تحديد كلفة الإنتاج الفعلية.


١١. تغيير السياسة

يجوز لـAZMA OS تحديث هذه السياسة عند الحاجة لتعكس تغيّرات في المنصّة أو خدماتها أو المتطلبات القانونية السارية أو الممارسات التشغيلية.

وتُتاح النسخة الحالية من السياسة في قسم السياسات في AZMA OS.

ويُعرَض تاريخ السريان ورقم الإصدار مع السياسة حيثما كان ذلك مناسباً.


١٢. التواصل

للأسئلة المتعلقة بالوحدات أو أرصدة الحسابات أو رسوم الإنتاج أو هذه السياسة، يمكن للمستخدمين التواصل مع:

Topline Design

الموقع:
azmaos.com

العنوان:
مدينة نصر، القاهرة

الهاتف:
01069269456

البريد الإلكتروني:
azma.os27@gmail.com


١٣. تمييز مهمّ

للتوضيح:

• إعادة الوحدات بعد عملية إنتاج مخفقة مؤهَّلة ليست استرداداً نقدياً.

• الوحدات المشتراة لا تنتهي صلاحيتها لمجرد مرور الوقت.

• إلغاء الاشتراك لا يُلغي تلقائياً الوحدات التي سبق شراؤها.

• الوحدات المستهلَكة في إنتاج ناجح لا تُحوَّل إلى نقد لمجرد عدم رضا المستخدم عن النتيجة الإبداعية.

• أي حقوق لا يجوز استثناؤها قانوناً تبقى غير متأثرة.


ملاحظة على الترجمة

هذه الوثيقة هي النصّ العربي لسياسة الاسترداد ورصيد الوحدات، مترجمةً عن نصّها الإنجليزي الصادر بإصدار 1.1، ومحفوظاً فيها معناه الملزِم كما هو. والنصّ الإنجليزي الأصلي محفوظ في مستودع الإمبراطوريّة.


نهاية السياسة`,
};
