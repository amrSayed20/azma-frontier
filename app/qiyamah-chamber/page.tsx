import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { QiyamahChamberExperience } from '@/src/imperial-experience-engine';
import { QiyamahChamberClient } from './QiyamahChamberClient';
import { getVisionDocument } from '@/src/chamber-vision';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';
import { IMAGE_MODEL_FLEET } from '@/src/sovereign-model-selection/image-model-fleet';
import { creatorFacingPackages } from '@/src/economy/pricing/sovereign-value-balance';

/**
 * QIYAMAH CHAMBER, PACKAGE I: wrapped in its own IXE Experience Pipeline
 * (see src/imperial-experience-engine/experiences/qiyamah-chamber/). No
 * render-prop needed here — unlike Signup/Login, entering the Chamber
 * has no single success handoff — so plain JSX children cross the
 * Server->Client boundary without the client-glue pattern those pages
 * required.
 *
 * Phase 3B Package II — N-4: chamberVision (static data, safe to pass as
 * server component prop) and generationAvailable (truthful capability check,
 * MAGIC_HOUR_API_KEY presence — the boolean never exposes the key itself)
 * are passed to the client so the interface can state what it actually does.
 */
export default async function QiyamahChamberPage() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);
  const chamberVision = getVisionDocument('qiyamah-chamber');
  const generationAvailable = !!process.env.MAGIC_HOUR_API_KEY;
  // The models a Creator may animate an image with — derived from the fleet
  // at render time, never written in the interface: production-authorized,
  // active, and VERIFIED to take an image. Today that is Seedance 2.0 alone;
  // Veo joins when its own proof activates it. Zero models → no control.
  // Each model's duration is the fleet's, not the interface's: the first of
  // the provider's discrete list when it has one, else a short duration
  // inside its range. Veo refuses 5 s; Seedance has taken it.
  const animationModels = VIDEO_MODEL_FLEET
    .filter((m) => m.productionAuthorized && m.active && m.supportsImageToVideo === true)
    // FOUND 2026-09-25: this passed `displayName` — the provider's own product
    // name — straight to the Creator, and the Founder read two of them on his
    // screen. The Empire never exposes a provider. What crosses is the
    // sovereign name and what choosing it means for the work.
    .map((m) => ({
      modelId: m.modelId,
      nameAr: m.sovereignNameAr,
      noteAr: m.sovereignNoteAr,
      durationSeconds: m.supportedDurationsSeconds?.[0] ?? Math.min(5, m.maxDurationSeconds ?? 5),
    }));
  // ── WHAT THE DESIGNATED MODELS ACTUALLY ALLOW ──────────────────────
  //
  //   The Founder, 2026-09-25: «تدرّج في زيادة مدة الفيديو حتى تصل لأقصى
  //   مدة لدى المزودين، وكذلك حقل تحديد الامتداد أفقي أو رأسي.»
  //
  //   MEASURED that day: the Chamber offered three durations — 4, 6, 8 — written
  //   by hand in the interface, while the designated cinematic model is VERIFIED
  //   to 56 seconds. And no aspect could be chosen at all, though both models
  //   declare which they accept. A list written by hand lies the moment the
  //   fleet changes; these are read from the fleet, so they cannot.
  const videoModels = VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active);

  //   Every duration any designated model can actually produce, in order. A
  //   model with a discrete list contributes exactly those; one with a range
  //   contributes whole seconds inside it.
  const durationLadder = [...new Set(
    videoModels.flatMap((m) => m.supportedDurationsSeconds
      ?? Array.from(
        { length: Math.max(0, (m.maxDurationSeconds ?? 0) - (m.minDurationSeconds ?? 1) + 1) },
        (_, i) => (m.minDurationSeconds ?? 1) + i,
      )),
  )].sort((x, y) => x - y);

  //   Only the shapes every designated model accepts — offering one that half
  //   of them refuse would be offering a refusal.
  const SHAPES = ['16:9', '9:16', '1:1'] as const;
  const shapesEveryModelAccepts = (fleet: { supportedAspectRatios?: readonly string[] }[]) =>
    SHAPES.filter((r) => fleet.length > 0 && fleet.every((m) => m.supportedAspectRatios?.includes(r)));

  const aspectOptions = shapesEveryModelAccepts(videoModels);

  //   MEASURED 2026-09-26: the shapes were read from the VIDEO fleet alone, so
  //   the chooser appeared for a clip and never for a picture — while the
  //   designated image model is VERIFIED to accept all three, and the whole
  //   chain behind it (route → generation service → adapter's `aspect_ratio`)
  //   was already carrying the value. A Creator could not make a vertical or a
  //   square picture: a finished engine behind a shut door. Same derivation,
  //   the picture's own fleet.
  const imageAspectOptions = shapesEveryModelAccepts(
    IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active),
  );

  return (
    <QiyamahChamberExperience dict={dict} locale={locale}>
      <QiyamahChamberClient
        dict={dict}
        chamberVision={chamberVision}
        generationAvailable={generationAvailable}
        animationModels={animationModels}
        durationLadder={durationLadder}
        aspectOptions={aspectOptions}
        imageAspectOptions={imageAspectOptions}
        /* Read on the SERVER. The pricing module carries the Empire's cost
           truth — provider rates, the dollar basis, the FX rate — and a
           `'use client'` import of it would publish all of it in a bundle.
           Four names, four prices, four balances, an Arabic validity. */
        packages={creatorFacingPackages()}
      />
    </QiyamahChamberExperience>
  );
}
