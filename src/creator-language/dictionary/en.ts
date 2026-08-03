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
  'gate.companionMessageReturning': 'The Empire still sees you',
  'gate.companionMessageIdle': 'Take your time — the Empire does not rush',
  'gate.companionMessageExiting': 'The Empire walks with you',

  'signup.kicker': 'The Sovereign Passage',
  'signup.companionMessage': 'You have not left the Empire',
  'signup.companionMessageBorn': 'You are born a Creator — come',
  'signup.title': 'Create your account',
  'signup.subtitle': 'Sign up to generate with Qiyamah.',
  'signup.emailLabel': 'Email',
  'signup.displayNameLabel': 'Display name (optional)',
  'signup.passwordLabel': 'Password',
  'signup.confirmPasswordLabel': 'Confirm password',
  'signup.submitIdle': 'Sign up',
  'signup.submitBusy': 'Creating account…',
  'signup.footerPrompt': 'Already have an account?',
  'signup.footerLink': 'Sign in',
  'signup.errorPasswordMismatch': 'Passwords do not match.',
  'signup.errorUnreachable': 'Could not reach the server. Please try again.',
  'signup.errorFallback': 'Sign up failed.',

  'login.kicker': 'The Sovereign Passage',
  'login.companionMessage': 'The Empire knows you',
  // Deliberately the exact same phrase as gate.titleKnownDefault.
  'login.companionMessageRecognized': 'Welcome back',
  'login.title': 'Sign in',
  'login.subtitle': 'Welcome back to AZMA OS.',
  'login.emailLabel': 'Email',
  'login.passwordLabel': 'Password',
  'login.submitIdle': 'Sign in',
  'login.submitBusy': 'Signing in…',
  'login.footerPrompt': "Don't have an account?",
  'login.footerLink': 'Sign up',
  'login.errorUnreachable': 'Could not reach the server. Please try again.',
  'login.errorFallback': 'Sign in failed.',

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
  'action.subscribeToGenerate': 'Subscribe to generate',
  'action.retryGeneration': 'Try again',
  'action.generateAnother': 'Generate another',
};
