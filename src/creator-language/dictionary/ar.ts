/**
 * AZMA OS — CREATOR LANGUAGE EXPERIENCE
 * Dictionary — Arabic (default)
 *
 * See en.ts for the coverage boundary this dictionary mirrors exactly —
 * same keys, both languages, so no page can end up with a string in one
 * locale and a gap in the other.
 */

import type { Dictionary } from '../types';

export const ar: Dictionary = {
  'gate.wordmark': 'عظمة',
  'gate.tagline': 'عظمة تتجسد.. إمبراطورية تُدار.. رؤية تُحقق',
  'gate.titleKnownDefault': 'أهلاً بعودتك',
  'gate.memberButton': 'تسجيل الدخول',
  'gate.explorerButton': 'المتابعة إلى التسجيل',
  'gate.thresholdCaption': 'اعبر',
  'gate.enterChamberButton': 'ادخل حجرة القيامة',
  'gate.languageLabel': 'اللغة',
  'gate.chooseLanguage': 'اختر لغتك',
  'gate.companionMessage': 'الإمبراطورية تراك',
  'gate.install': '⇩ ثبِّت الإمبراطورية',
  'gate.companionMessageReturning': 'لا تزال الإمبراطورية تراك',
  'gate.companionMessageIdle': 'خذ وقتك.. الإمبراطورية لا تتعجّل',
  'gate.companionMessageExiting': 'الإمبراطورية تسير معك',

  // The one card at the foot of the door. No price stands at a threshold, and
  // after the Founder's ruling of 2026-09-28 no ledger does either: the words
  // for a Balance card were written and are removed with it.
  'gate.policiesName': 'السياسات',
  'gate.policiesRole': 'ما تلتزم به الإمبراطورية تجاهك',


  // ── THE SOVEREIGN ENTRY GATEWAY ──────────────────────────────────────
  //   Every label the gateway shows. Both tongues carry the same keys, so
  //   a label can never exist in one language and be missing in the other.
  'gateway.enter': 'دخول',
  'gateway.skip': 'تخطَّ المشهد',
  'gateway.introTitle': 'ما هذا المكان',
  'gateway.introBody': 'AZMA OS نظامُ تشغيلٍ إبداعيٌّ سياديّ. يَجمع المعرفةَ والإبداعَ والإنتاجَ وحفظَ الأصولِ وإدارةَ التوزيع، في حُجراتٍ متخصّصةٍ تَعمل معاً فتُعطيك بيئةً واحدةً تُنجز فيها عملك.',
  'gateway.introSecond': 'وما يَخرج منه لك. يُحفَظ في خزانتك باسمك. وما لم يَكتمل بعد، مكتوبٌ أنّه لم يَكتمل — لن تَكتشف ذلك بعد الدفع.',
  'gateway.chambersTitle': 'الحُجراتُ الخمس',
  'gateway.chambersLede': 'من المعرفةِ إلى التوزيع. وهذا ترتيبُ شرحٍ لك، لا ترتيبُ الحُجراتِ داخلَ المنصّة.',
  'gateway.policiesTitle': 'ما تَلتزم به الإمبراطوريّةُ تجاهك',
  'gateway.policiesLede': 'اقرأها كاملةً قبل أن تُنشئ حساباً. ولا نَعرض عليك بطاقةً لا تَفتح على نصّ.',
  'gateway.policyOpen': 'اقرأ النصَّ كاملاً',
  'gateway.policyClose': 'إغلاق',
  'gateway.policyVersion': 'الإصدار',
  'gateway.balanceTitle': 'ميزان القيمة السيادي',
  'gateway.balanceLede': 'رصيدٌ تَشتريه مرّةً، ولا يَنتهي، ولا يُجدَّد تلقائيّاً. وإذا نَفِد، تَشتري غيرَه — الباقةَ نفسَها أو أكبرَ منها.',
  'gateway.balanceUnits': 'وحدة',
  'gateway.balanceNoExpiry': 'لا تَنتهي صلاحيّتُه',
  'gateway.balanceOneTime': 'شراءٌ لمرّةٍ واحدة · بلا تجديدٍ تلقائيّ',
  'gateway.balanceNoPurchaseHere': 'الشراءُ يَتمّ داخلَ المنصّة، لا من هنا.',
  'gateway.accountTitle': 'ادخل الإمبراطوريّة',
  'gateway.accountLede': 'عَرفتَ ما يَكفي. والبابُ مفتوحٌ من جهتَين.',
  'gateway.accountSignIn': 'لي حسابٌ — دخول',
  'gateway.accountSignUp': 'أنشئ حساباً',
  'gateway.stateReady': 'تَعمل',
  'gateway.statePartial': 'جزئيّة',
  'gateway.stateClosed': 'مُغلَقة اليوم',

  // ── THE POLICY SURFACES ──────────────────────────────────────────────
  //   MEASURED on the live release: a reader who chose English met the
  //   policy index in Arabic, because its labels were written into the
  //   page instead of read from here.
  'policies.indexTitle': 'السياسات',
  'policies.backToGate': '← عُد إلى البوابة',
  'policies.version': 'الإصدار',
  'policies.effectiveFrom': 'سارية من',
  'policies.noEffectiveDate': 'لم يُحدَّد تاريخ سريانها بعد',
  'policies.arabicIsGoverning': 'هذا النصُّ عربيٌّ، وهو النصُّ الحاكم. ولا تُوجد نسخةٌ إنجليزيّةٌ مُقَرّةٌ منه بعد — ولن نَعرض عليك ترجمةً لم تُقَرّ.',
  'signup.kicker': 'بوابة العبور السيادي',
  'signup.companionMessage': 'لم تغادر الإمبراطورية',
  'signup.companionMessageBorn': 'وُلِدْتَ صانعًا.. تعال',
  'signup.title': 'أنشئ حسابك السيادي',
  'signup.subtitle': 'أنشئ حسابك للتوليد مع القيامة.',
  'signup.emailLabel': 'البريد الإلكتروني',
  'signup.displayNameLabel': 'الاسم الظاهر (اختياري)',
  'signup.passwordLabel': 'كلمة المرور',
  'signup.confirmPasswordLabel': 'تأكيد كلمة المرور',
  'signup.submitIdle': 'إنشاء الحساب',
  'signup.submitBusy': 'البوابة تستقبلك…',
  'signup.footerPrompt': 'لديك حساب بالفعل؟',
  'signup.footerLink': 'تسجيل الدخول',
  // GOOGLE IDENTITY GATE: registration is a verification, not a form. Nothing
  // shown to the Creator may imply that typing an address proves it is theirs.
  'signup.googleContinue': 'المتابعة باستخدام Google',
  'signup.googleBusy': 'البوابة تتحقّق…',
  'signup.verifiedWelcome': 'تم التحقق من حسابك',
  'signup.whyVerify': 'نتحقّق من بريدك مرّةً واحدة، فيصير الحساب لك وحدك ولا يُنتحل.',
  'signup.identityUnavailable': 'الدخول عبر جوجل غير متاحٍ حالياً.',
  'signup.identityCancelled': 'أُلغي التحقّق. لم يُنشأ شيء.',
  'signup.identityFailed': 'تعذّر التحقّق من هويّتك. أعد المحاولة.',
  'signup.identityEmailUnverified': 'هذا البريد غير مُوثَّقٍ لدى جوجل نفسها.',
  'signup.identityEmailTaken': 'يوجد حسابٌ بهذا البريد أُنشئ بطريقةٍ أخرى. ادخل به أوّلاً.',
  'signup.errorPasswordMismatch': 'المفتاحان لا يتطابقان.',
  'signup.errorUnreachable': 'البوابة لا تستجيب. عُد بعد لحظة.',
  'signup.errorFallback': 'البوابة لم تُفتَح. تأكد من بياناتك.',

  'login.kicker': 'بوابة العبور السيادي',
  'login.companionMessage': 'الإمبراطورية تعرفك',
  // Deliberately the exact same phrase as gate.titleKnownDefault — the
  // Empire's own existing "returning Creator" recognition, echoed here
  // rather than reworded. Continuity of language, not just of mechanism.
  'login.companionMessageRecognized': 'أهلاً بعودتك',
  'login.title': 'تسجيل الدخول',
  'login.subtitle': 'أهلاً بعودتك إلى عظمة.',
  'login.emailLabel': 'البريد الإلكتروني',
  'login.passwordLabel': 'كلمة المرور',
  'login.submitIdle': 'دخول',
  'login.submitBusy': 'البوابة تعرفك…',
  'login.footerPrompt': 'ليس لديك حساب؟',
  'login.footerLink': 'إنشاء حساب',
  'login.errorUnreachable': 'البوابة لا تستجيب. عُد بعد لحظة.',
  'login.errorFallback': 'البوابة لم تعرفك. تأكد من بياناتك.',

  'qiyamah.companionMessage': 'الإمبراطورية تصنع معك',

  'subscribe.kicker': 'بوابة العبور السيادي',
  'subscribe.title': 'الاشتراك',
  'subscribe.subtitle': 'افتح باب التوليد مع القيامة.',
  'subscribe.planName': 'الاشتراك السيادي الشهري',
  'subscribe.planDesc': 'وصول غير محدود إلى مسار التوليد الأول، بفوترة شهرية.',
  'subscribe.checkingStatus': 'البوابة تقرأ مكانتك…',
  'subscribe.signInPrompt': 'للاشتراك.',
  'subscribe.signInLink': 'سجّل الدخول',
  'subscribe.founderNotice': 'المؤسسون لديهم وصول كامل بالفعل — لا حاجة للاشتراك.',
  'subscribe.submitIdle': 'اشترك الآن',
  'subscribe.submitBusy': 'الإمبراطورية تستقبل اشتراكك…',
  'subscribe.errorUnreachable': 'البوابة لا تستجيب. عُد بعد لحظة.',
  'subscribe.errorFallback': 'بوابة الاشتراك لم تُفتَح. أعِد المحاولة.',

  'subscribeSuccess.kicker': 'بوابة العبور السيادي',
  'subscribeSuccess.title': 'مكانتك السيادية مؤكدة الآن',
  'subscribeSuccess.subtitleNamed': 'أهلاً بك، {name}. الإمبراطورية مفتوحة أمامك الآن — يجري تفعيل اشتراكك، وهذا يستغرق لحظات فقط.',
  'subscribeSuccess.subtitleAnonymous': 'أهلاً بك. الإمبراطورية مفتوحة أمامك الآن — يجري تفعيل اشتراكك، وهذا يستغرق لحظات فقط.',
  'subscribeSuccess.enterButton': 'ادخل الإمبراطورية',

  'notFound.kicker': 'بوابة العبور السيادي',
  'notFound.title': 'هذا المسار غير موجود داخل الإمبراطورية',
  'notFound.subtitle': 'الطريق الذي سلكته لا يفضي إلى مكان داخل عظمة. عد إلى البوابة لتختار طريقك من جديد.',
  'notFound.returnButton': 'العودة إلى البوابة',

  'action.signIn': 'تسجيل الدخول',
  'action.signUp': 'إنشاء حساب',
  'action.enterChamber': 'ادخل حجرة القيامة',
  'action.subscribe': 'اشترك',
  'action.signInToGenerate': 'سجّل الدخول للتوليد',
  // Not «اشترك»: nothing here renews, recurs or needs cancelling, and the
  //   policy says so in as many words. A label that contradicts the policy
  //   beneath it is a false statement wherever it is stored.
  'action.subscribeToGenerate': 'زِد ميزانك للتوليد',
  'action.retryGeneration': 'حاول مجدداً',
  'action.generateAnother': 'توليد جديد',
};
