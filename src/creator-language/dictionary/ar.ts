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
  'gate.tagline': 'عظمة تتجسد.. امبراطورية تُدار.. رؤية تُحقق',
  'gate.titleKnownDefault': 'أهلاً بعودتك',
  'gate.memberButton': 'تسجيل الدخول',
  'gate.explorerButton': 'المتابعة إلى التسجيل',
  'gate.thresholdCaption': 'اعبر',
  'gate.enterChamberButton': 'ادخل حجرة القيامة',
  'gate.languageLabel': 'اللغة',
  'gate.chooseLanguage': 'اختر لغتك',
  'gate.companionMessage': 'الإمبراطورية تراك',
  'gate.companionMessageReturning': 'لا تزال الإمبراطورية تراك',
  'gate.companionMessageIdle': 'خذ وقتك.. الإمبراطورية لا تتعجّل',
  'gate.companionMessageExiting': 'الإمبراطورية تسير معك',

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
  'signup.submitBusy': 'جارٍ إنشاء الحساب…',
  'signup.footerPrompt': 'لديك حساب بالفعل؟',
  'signup.footerLink': 'تسجيل الدخول',
  'signup.errorPasswordMismatch': 'كلمتا المرور غير متطابقتين.',
  'signup.errorUnreachable': 'تعذر الوصول إلى الخادم. حاول مرة أخرى.',
  'signup.errorFallback': 'فشل إنشاء الحساب.',

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
  'login.submitBusy': 'جارٍ تسجيل الدخول…',
  'login.footerPrompt': 'ليس لديك حساب؟',
  'login.footerLink': 'إنشاء حساب',
  'login.errorUnreachable': 'تعذر الوصول إلى الخادم. حاول مرة أخرى.',
  'login.errorFallback': 'فشل تسجيل الدخول.',

  'qiyamah.companionMessage': 'الإمبراطورية تصنع معك',

  'subscribe.kicker': 'بوابة العبور السيادي',
  'subscribe.title': 'الاشتراك',
  'subscribe.subtitle': 'افتح باب التوليد مع القيامة.',
  'subscribe.planName': 'الاشتراك السيادي الشهري',
  'subscribe.planDesc': 'وصول غير محدود إلى مسار التوليد الأول، بفوترة شهرية.',
  'subscribe.checkingStatus': 'جارٍ التحقق من جلستك…',
  'subscribe.signInPrompt': 'للاشتراك.',
  'subscribe.signInLink': 'سجّل الدخول',
  'subscribe.founderNotice': 'المؤسسون لديهم وصول كامل بالفعل — لا حاجة للاشتراك.',
  'subscribe.submitIdle': 'اشترك الآن',
  'subscribe.submitBusy': 'جارٍ بدء عملية الدفع…',
  'subscribe.errorUnreachable': 'تعذر الوصول إلى الخادم. حاول مرة أخرى.',
  'subscribe.errorFallback': 'تعذر بدء عملية الدفع.',

  'subscribeSuccess.kicker': 'بوابة العبور السيادي',
  'subscribeSuccess.title': 'مكانتك السيادية مؤكدة الآن',
  'subscribeSuccess.subtitleNamed': 'أهلاً بك، {name}. حجرة القيامة مفتوحة أمامك الآن — يجري تفعيل اشتراكك، وهذا يستغرق لحظات فقط.',
  'subscribeSuccess.subtitleAnonymous': 'أهلاً بك. حجرة القيامة مفتوحة أمامك الآن — يجري تفعيل اشتراكك، وهذا يستغرق لحظات فقط.',
  'subscribeSuccess.enterButton': 'ادخل حجرة القيامة',

  'notFound.kicker': 'بوابة العبور السيادي',
  'notFound.title': 'هذا المسار غير موجود داخل الإمبراطورية',
  'notFound.subtitle': 'الطريق الذي سلكته لا يفضي إلى مكان داخل عظمة. عد إلى البوابة لتختار طريقك من جديد.',
  'notFound.returnButton': 'العودة إلى البوابة',

  'action.signIn': 'تسجيل الدخول',
  'action.signUp': 'إنشاء حساب',
  'action.enterChamber': 'ادخل حجرة القيامة',
  'action.subscribe': 'اشترك',
  'action.signInToGenerate': 'سجّل الدخول للتوليد',
  'action.subscribeToGenerate': 'اشترك للتوليد',
  'action.retryGeneration': 'حاول مجدداً',
  'action.generateAnother': 'توليد جديد',
};
