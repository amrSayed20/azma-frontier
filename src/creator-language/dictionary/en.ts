/**
 * AZMA OS — CREATOR LANGUAGE EXPERIENCE
 * Dictionary — English
 *
 * Coverage matches this mission's own scope boundary: the Imperial Gate,
 * the Creator Access Experience, and the Button Engine's action labels.
 * Chamber ceremonial copy (Qiyamah, Hujjah) is intentionally not covered
 * here — those chambers already consume the same locale mechanism (see
 * root layout), so adding their coverage later is purely additive.
 * Qiyamah Chamber Package I (2026-07-23) added exactly one key —
 * qiyamah.companionMessage, for its new Imperial Voice companion — the
 * Chamber's own ceremonial copy (headings, ritual language) remains
 * Arabic-only per the existing disclosed note in QiyamahChamberClient.tsx.
 */

import type { Dictionary } from '../types';

export const en: Dictionary = {
  'gate.wordmark': 'AZMA OS',
  'gate.tagline': 'Greatness takes form.. an empire is governed.. a vision is fulfilled.',
  'gate.titleKnownDefault': 'Welcome back',
  'gate.memberButton': 'Sign in',
  'gate.explorerButton': 'Continue to Registration',
  'gate.thresholdCaption': 'Enter',
  'gate.enterChamberButton': 'Enter Qiyamah',
  'gate.languageLabel': 'Language',
  'gate.chooseLanguage': 'Choose your language',
  'gate.companionMessage': 'The Empire sees you',
  'gate.install': '⇩ Install',
  'gate.companionMessageReturning': 'The Empire still sees you',
  'gate.companionMessageIdle': 'Take your time — the Empire does not rush',
  'gate.companionMessageExiting': 'The Empire walks with you',

  'gate.policiesName': 'Policies',
  'gate.policiesRole': 'What the Empire owes you',


  // ── THE SOVEREIGN ENTRY GATEWAY ──────────────────────────────────────
  //   Every label the gateway shows. Both tongues carry the same keys, so
  //   a label can never exist in one language and be missing in the other.
  'gateway.enter': 'ENTER',
  'gateway.skip': 'Skip the approach',
  'gateway.introTitle': 'What this place is',
  'gateway.introBody': 'AZMA OS is a sovereign creative operating system for content creators. You use it to produce short films, scenes, images, voice and copy for your own content and for marketing your work, then keep them in your vault and publish them to your own accounts. It brings together knowledge, creation, production, asset keeping and distribution in specialised chambers that work as one environment for your work.',
  'gateway.introSecond': 'What comes out of it is yours. It is kept in your Vault, in your name. And whatever is not finished says so — you will not discover it after paying.',
  'gateway.limitsTitle': 'What is not allowed here',
  'gateway.limitsBody': 'AZMA OS is a production tool for your own content and for marketing your work. It must never be used to produce sexual, nude or intimate material depicting a real person without their explicit consent, nor to produce a person\u2019s likeness without their permission by face swap, photo animation, lip sync or any other means. Any such material involving a minor is forbidden absolutely, in every case. AZMA OS does not use Google APIs, nor any of its providers’ interfaces, to create non-consensual intimate imagery (AI NCII). A breach is sufficient grounds to suspend the account.',
  'gateway.chambersTitle': 'The five chambers',
  'gateway.chambersLede': 'From knowledge to distribution. This is the order they are explained in, not their order inside the platform.',
  'gateway.policiesTitle': 'What the Empire owes you',
  'gateway.policiesLede': 'Read them in full before you create an account. We show no card that opens onto nothing.',
  'gateway.policyOpen': 'Read the full text',
  'gateway.policyClose': 'Close',
  'gateway.policyVersion': 'Version',
  'gateway.balanceTitle': 'The Sovereign Value Balance',
  'gateway.balanceLede': 'Balance you buy once. It does not expire and it does not renew itself. When it runs out you buy more — the same package or a larger one.',
  'gateway.balanceUnits': 'units',
  'gateway.balanceNoExpiry': 'Does not expire',
  'gateway.balanceOneTime': 'One-time purchase · no automatic renewal',
  'gateway.balanceNoPurchaseHere': 'Buying happens inside the platform, not here.',
  'gateway.accountTitle': 'Enter the Empire',
  'gateway.accountLede': 'You know enough now. The door opens from two sides.',
  'gateway.accountSignIn': 'I have an account — sign in',
  'gateway.accountSignUp': 'Create an account',
  'gateway.stateReady': 'Working',
  'gateway.statePartial': 'Partial',
  'gateway.stateClosed': 'Closed today',

  // ── THE POLICY SURFACES ──────────────────────────────────────────────
  //   MEASURED on the live release: a reader who chose English met the
  //   policy index in Arabic, because its labels were written into the
  //   page instead of read from here.
  'policies.indexTitle': 'Policies',
  'policies.backToGate': '← Back to the gate',
  'policies.version': 'Version',
  'policies.effectiveFrom': 'Effective',
  'policies.noEffectiveDate': 'Effective date not yet set',
  'policies.arabicIsGoverning': 'This text is in Arabic, and the Arabic is what governs. No ratified English version exists yet — and we will not show you a translation nobody has ratified.',
  // ═══ «الإيوان» — the entrance hall, 2026-11-23 ═════════════════════════
  // The old chamber names are retired by the Founder's order, so nothing on
  // this page asks a stranger to learn a vocabulary before opening an account.
  'signup.kicker': 'Start here',
  'signup.companionMessage': 'I am with you, step by step',
  'signup.companionMessageBorn': 'Your account is ready — come',
  'signup.title': 'Create your AZMA account',
  'signup.subtitle': 'One account opens every room on the platform. Creating it is free, '
    + 'and asks you for no card and no payment.',
  'signup.assureFreeTitle': 'Signing up is free',
  'signup.assureFreeBody': 'No card, no payment to open the account. Payment is asked only when you choose an act whose price is written.',
  'signup.assureKeyTitle': 'No password is created here',
  'signup.assureKeyBody': 'Your identity is verified once through Google, so there is no password for you to keep and none for us to hold.',
  'signup.assureOwnTitle': 'What you make stays yours',
  'signup.assureOwnBody': 'Everything you produce is kept in your asset vault, and downloads from it whenever you want.',
  'signup.beyondTitle': 'What this account opens',
  'signup.beyondNote': 'Five rooms around one courtyard — enter whichever you like first; no order is imposed on you.',
  'signup.emailLabel': 'Email',
  'signup.displayNameLabel': 'Display name (optional)',
  'signup.passwordLabel': 'Password',
  'signup.confirmPasswordLabel': 'Confirm password',
  'signup.submitIdle': 'Sign up',
  'signup.submitBusy': 'Creating account…',
  'signup.footerPrompt': 'Already have an account?',
  'signup.footerLink': 'Sign in',
  // GOOGLE IDENTITY GATE — see the Arabic dictionary for why registration is a
  // verification rather than a form.
  'signup.googleContinue': 'Continue with Google',
  'signup.googleBusy': 'Verifying…',
  'signup.verifiedWelcome': 'Your account is verified',
  'signup.whyVerify': 'We verify your address once, so the account is yours alone and cannot be claimed by anyone else.',
  'signup.identityUnavailable': 'Signing in with Google is unavailable right now.',
  'signup.identityCancelled': 'Verification was cancelled. Nothing was created.',
  'signup.identityFailed': 'We could not verify your identity. Please try again.',
  'signup.identityEmailUnverified': 'Google itself has not confirmed this address.',
  'signup.identityEmailTaken': 'An account with this address was created another way. Sign in with it first.',
  'signup.errorPasswordMismatch': 'Passwords do not match.',
  'signup.errorUnreachable': 'Could not reach the server. Please try again.',
  'signup.errorFallback': 'Sign up failed.',

  // ═══ «الدِّهليز» — the vestibule, 2026-11-23 ═══════════════════════════
  // A returning Creator is not a visitor: this page does not explain or sell,
  // it recognises. The old court vocabulary is retired by the Founder's order.
  'login.kicker': 'Sign in',
  'login.brandSub': 'The creation platform',
  'login.orDivider': 'or',
  'login.companionMessage': 'I am here if you need me',
  // Deliberately the exact same phrase as gate.titleKnownDefault.
  'login.companionMessageRecognized': 'Welcome back',
  'login.title': 'Welcome back',
  'login.subtitle': 'Come in by the road you created your account with.',
  'login.emailLabel': 'Email',
  'login.passwordLabel': 'Password',
  'login.submitIdle': 'Sign in',
  'login.submitBusy': 'Signing in…',
  'login.footerPrompt': "Don't have an account?",
  'login.footerLink': 'Sign up',
  'login.googleContinue': 'Continue with Google',
  'login.googleBusy': 'Verifying…',
  'login.errorUnreachable': 'Could not reach the server. Please try again.',
  'login.errorFallback': 'Sign in failed.',
  // Names both roads without naming which one is this address's.
  'login.errorCredentials':
    'That did not sign you in. Check the email and password — and if you created your account with Google, use «Continue with Google» below.',

  'qiyamah.companionMessage': 'The Empire creates with you',

  'subscribe.kicker': 'The Sovereign Passage',
  'subscribe.title': 'Subscribe',
  'subscribe.subtitle': 'Unlock generation with Qiyamah.',
  'subscribe.planName': 'Creator Monthly',
  'subscribe.planDesc': 'Unlimited access to the First Generation Path, billed monthly.',
  'subscribe.checkingStatus': 'Checking your session…',
  'subscribe.signInPrompt': 'to subscribe.',
  'subscribe.signInLink': 'Sign in',
  'subscribe.founderNotice': 'Founders already have full access — no subscription needed.',
  'subscribe.submitIdle': 'Subscribe',
  'subscribe.submitBusy': 'Starting checkout…',
  'subscribe.errorUnreachable': 'Could not reach the server. Please try again.',
  'subscribe.errorFallback': 'Could not start checkout.',

  'subscribeSuccess.kicker': 'The Sovereign Passage',
  'subscribeSuccess.title': 'Your standing is confirmed',
  'subscribeSuccess.subtitleNamed': 'Welcome, {name}. The Empire is now open to you — your subscription is being activated, which usually takes only a moment.',
  'subscribeSuccess.subtitleAnonymous': 'Welcome. The Empire is now open to you — your subscription is being activated, which usually takes only a moment.',
  'subscribeSuccess.enterButton': 'Enter the Empire',

  'notFound.kicker': 'The Sovereign Passage',
  'notFound.title': 'This path does not exist within the Empire',
  'notFound.subtitle': 'The route you followed leads nowhere inside AZMA OS. Return to the Gate to choose your way again.',
  'notFound.returnButton': 'Return to the Gate',

  'action.signIn': 'Sign in',
  'action.signUp': 'Sign up',
  'action.enterChamber': 'Enter Qiyamah',
  'action.subscribe': 'Subscribe',
  'action.signInToGenerate': 'Sign in to generate',
  'action.subscribeToGenerate': 'Top up your Balance to generate',
  'action.retryGeneration': 'Try again',
  'action.generateAnother': 'Generate another',
};
