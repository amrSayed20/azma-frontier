import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { QiyamahChamberExperience } from '@/src/imperial-experience-engine';
import { QiyamahChamberClient } from './QiyamahChamberClient';
import { getVisionDocument } from '@/src/chamber-vision';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';

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
    .map((m) => ({
      modelId: m.modelId,
      displayName: m.displayName,
      durationSeconds: m.supportedDurationsSeconds?.[0] ?? Math.min(5, m.maxDurationSeconds ?? 5),
    }));
  return (
    <QiyamahChamberExperience dict={dict} locale={locale}>
      <QiyamahChamberClient
        dict={dict}
        chamberVision={chamberVision}
        generationAvailable={generationAvailable}
        animationModels={animationModels}
      />
    </QiyamahChamberExperience>
  );
}
