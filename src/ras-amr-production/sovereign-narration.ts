/**
 * AZMA OS — RAS AL AMR: THE EMPIRE SPEAKS ITS OWN FILMS
 *
 * ─── THE DEFECT THIS CLOSES, MEASURED ON THE LIVE HOST 2026-11-09 ───────────
 *
 *   Two real production tasks were submitted to the workshop. Both failed at
 *   the same stage, and the workshop's own log named it:
 *
 *       azure_tts_v1 - failed, error: edge_tts stream timed out after 30s
 *
 *   The voice name was not at fault — `ar-EG-SalmaNeural` is exactly what the
 *   storyboard road already sends. Calling the library directly inside the
 *   container gave the real answer in 0.8s:
 *
 *       WSServerHandshakeError 403 … wss://speech.platform.bing.com/…/edge/v1
 *
 *   AND THE CONTROL THAT MAKES THAT READING SAFE: from the same container,
 *   plain HTTPS to google.com answered 200, and api.pexels.com and
 *   speech.platform.bing.com both answered at the application layer (403 and
 *   400) in a tenth of a second. Egress is healthy. Microsoft refuses this
 *   datacenter address on the speech socket, and no setting changes that —
 *   it is a free endpoint declining to serve a server.
 *
 *   So the workshop cannot speak. This Empire can: it already owns a preset
 *   provider voice and a Creator's own cloned voice, both real and both
 *   priced. Narration becomes sovereign, which is both the repair and the
 *   better architecture — a film no longer depends on a free third-party
 *   endpoint for its voice.
 *
 * ─── THIS FILE HOLDS MONEY, AND A GUARD MADE SURE OF IT ─────────────────────
 *
 *   The first draft called both providers with no economic hold at all, and
 *   `no-door-to-a-paid-provider` failed within minutes of it being written:
 *   «كلُّ مستدعٍ لمزوِّدٍ مدفوعٍ يَحمِل مالًا». The guard was right. Speech is
 *   a priced capability, the hold is taken BEFORE the provider is called, and
 *   both exits exist — a narration that was never spoken gives its units back.
 *
 * ─── WHAT THIS IS NOT ───────────────────────────────────────────────────────
 *
 *   Not a fallback that hides a missing capability. If no narration can be
 *   spoken, this says so plainly and the caller decides — it never returns
 *   silence dressed as speech, and never substitutes a different voice for
 *   the one that was asked for.
 */
import { createHash } from 'crypto';
import type { CreatorRole } from '../authentication';
import { getDb } from '../persistent-storage';
import {
  authorisePaidOperation, settleAuthorisedOperation, releaseAuthorisedOperation,
} from '../economy/paid-operation-gate';
import { claimAttempt, completeAttempt, failAttempt } from '../economy/paid-operation-attempts';
import { SPEECH_CAPABILITY } from '../economy/pricing/sovereign-price-authority';
import { priceSpeechFromCredits } from '../economy/pricing/speech-pricing';
import { generateSpeechViaProvider, type TtsProviderVoice } from '../chambers/ras-al-amr/speech-provider';
import { synthesizeSpeechWithClonedVoice } from '../chambers/ras-al-amr/voice-cloning-provider';
import { placeIntoWorkshop } from './workshop-handoff';

/** The namespace this road's narration submissions live in. */
const NARRATION_SCOPE = 'ras-amr:film-narration';

/** Which voice speaks this film. A Creator's own clone, or a preset. */
export type NarrationVoice =
  | { readonly kind: 'cloned'; readonly voiceId: string }
  | { readonly kind: 'preset'; readonly voice: TtsProviderVoice };

export interface NarrationRequest {
  readonly text: string;
  readonly voice: NarrationVoice;
  readonly creatorId: string;
  /** Read from the session by the route and carried here, never inferred. */
  readonly creatorRole: CreatorRole;
}

export type NarrationOutcome =
  | { readonly spoken: true; readonly workshopPath: string; readonly bytes: number }
  | { readonly spoken: false; readonly reason: NarrationFailure; readonly messageAr: string };

export type NarrationFailure =
  | 'NO_TEXT'
  | 'NO_BALANCE'
  | 'NOT_PRICED'
  | 'VOICE_UNAVAILABLE'
  | 'SYNTHESIS_FAILED'
  | 'HANDOFF_FAILED';

/** Arabic, and naming nothing outside the Empire — no provider, no host. */
const MESSAGES_AR: Record<NarrationFailure, string> = {
  NO_TEXT: 'لا يوجد نصٌّ يُقرأ على هذا العمل.',
  NO_BALANCE: 'رصيدُك لا يكفي لنُطق هذا السرد.',
  NOT_PRICED: 'نُطقُ السرد غير مُسعَّرٍ بعد.',
  VOICE_UNAVAILABLE: 'الصوتُ المختار غير متاحٍ الآن.',
  SYNTHESIS_FAILED: 'تعذّر نطقُ السرد. حاوِل بعد قليل.',
  HANDOFF_FAILED: 'تعذّر تسليمُ الصوت إلى ورشة الإنتاج.',
};

const refuse = (reason: NarrationFailure): NarrationOutcome =>
  ({ spoken: false, reason, messageAr: MESSAGES_AR[reason] });

/**
 * Speak the narration and place it where the workshop can open it.
 *
 * Answers the CONTAINER-side path, which is what a production request's
 * `custom_audio_file` must carry — a host path means nothing in there.
 */
export async function narrateForProduction(request: NarrationRequest): Promise<NarrationOutcome> {
  const script = request.text.trim();
  // Before any hold is taken: nothing to speak is not an economic event.
  if (script.length === 0) return refuse('NO_TEXT');

  const db = getDb();
  const claim = claimAttempt({
    db, creatorId: request.creatorId, scope: NARRATION_SCOPE, clientKey: null,
  });

  // The charge follows the characters actually spoken, which is the same unit
  // the Empire's own speech road already holds against. The figure is never
  // written here — it is read at call time from the one pricing authority.
  const gate = authorisePaidOperation({
    db,
    creatorId: request.creatorId,
    role: request.creatorRole,
    capability: null,
    gatewayId: request.voice.kind === 'cloned' ? 'elevenlabs' : 'openai',
    attemptKey: claim.attemptKey,
    sovereignCapability: SPEECH_CAPABILITY,
    quantity: script.length,
    metadata: { characters: script.length, voice: request.voice.kind },
  });

  if (gate.kind === 'refused') {
    failAttempt(db, claim.attemptKey, `gate:${gate.reason}`);
    return refuse(gate.reason === 'payment-required' ? 'NO_BALANCE' : 'NOT_PRICED');
  }

  let bytes: Buffer;
  // What the PROVIDER says this one call cost, in its own credits. The
  // Creator’s text length is an upper bound on it, never a measure of it.
  let meteredCredits: number | null = null;
  try {
    if (request.voice.kind === 'cloned') {
      const spoken = await synthesizeSpeechWithClonedVoice(script, request.voice.voiceId);
      bytes = spoken.bytes;
      meteredCredits = spoken.meteredCredits ?? null;
    } else {
      // The preset road states no cost, so its hold stands. Recorded as a
      // known difference rather than a silent one.
      bytes = (await generateSpeechViaProvider(script, request.voice.voice)).bytes;
    }
  } catch (error) {
    // A missing credential is a different fact from a provider that answered
    // badly, and the Creator is owed the difference: one is ours to fix.
    const message = error instanceof Error ? error.message : '';
    const reason: NarrationFailure = message.includes('not configured')
      ? 'VOICE_UNAVAILABLE'
      : 'SYNTHESIS_FAILED';
    releaseAuthorisedOperation(db, request.creatorId, gate, `narration_${reason}`);
    failAttempt(db, claim.attemptKey, reason);
    return refuse(reason);
  }

  // AN INSTRUMENT RETURNING NOTHING IS NOT RETURNING A ZERO. A provider that
  // answers 200 with an empty body has not spoken, and handing the workshop a
  // zero-byte file would fail far from here, at render, looking like a
  // different defect entirely. Unspoken units go back.
  if (bytes.length === 0) {
    releaseAuthorisedOperation(db, request.creatorId, gate, 'narration_empty');
    failAttempt(db, claim.attemptKey, 'SYNTHESIS_FAILED');
    return refuse('SYNTHESIS_FAILED');
  }

  try {
    // Named by the content, so the same narration spoken twice does not pile
    // up copies, and two different narrations can never collide.
    const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const workshopPath = await placeIntoWorkshop(`narration-${digest}.mp3`, bytes);
    // ── SETTLED ON WHAT THE PROVIDER SAID IT COST ──────────────────────
    //
    //   «التسوية وفق الاستهلاك الفعلي الموثوق من المزود، وليس مجرد تقدير
    //    عدد الحروف» — the Founder, 2026-11-09.
    //
    //   Capped at the hold, and never above it: a provider that reported
    //   more than was held does not get to charge more than the Creator
    //   agreed to. When it reported nothing the hold stands — a provider
    //   that declined to state a cost is not a refund, and the Creator
    //   has their narration either way.
    const measured = priceSpeechFromCredits(meteredCredits);
    // An ENTITLED verdict held no units at all (a Founder, a trial, a free
    // operation), so there is no ceiling to cap against and nothing to settle
    // down to. Only a reservation can be settled, and only below its own hold.
    const settledUnits = measured.ok && gate.kind === 'reserved'
      ? Math.min(measured.chargedUnits, gate.units)
      : undefined;
    settleAuthorisedOperation(db, request.creatorId, gate, settledUnits, {
      bytes: bytes.length,
      meteredCredits,
      settledOn: measured.ok ? 'provider-metered' : 'hold',
    });
    completeAttempt(db, claim.attemptKey, { bytes: bytes.length });
    return { spoken: true, workshopPath, bytes: bytes.length };
  } catch {
    // The provider was paid and did speak; the Empire failed to carry it. The
    // hold is settled, because the charge was genuinely incurred — a failure
    // on our side of the boundary is not the Creator's to absorb twice, and
    // releasing here would give back units the provider has already billed.
    settleAuthorisedOperation(db, request.creatorId, gate, undefined, { handoff: 'failed' });
    failAttempt(db, claim.attemptKey, 'HANDOFF_FAILED');
    return refuse('HANDOFF_FAILED');
  }
}
