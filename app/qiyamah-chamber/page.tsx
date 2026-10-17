import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { QiyamahChamberExperience } from '@/src/imperial-experience-engine';
import { QiyamahChamberClient } from './QiyamahChamberClient';
import { getVisionDocument } from '@/src/chamber-vision';
import { getCatalogEntry } from '@/src/economy/cost-engine/provider-cost-catalog';

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
  // Same catalog lookup the generate route makes; video stays founder-only until priced.
  const videoPriced = getCatalogEntry('magic-hour', 'video-generation')?.availability === 'available';
  return (
    <QiyamahChamberExperience dict={dict} locale={locale}>
      <QiyamahChamberClient
        dict={dict}
        chamberVision={chamberVision}
        generationAvailable={generationAvailable}
        videoPriced={videoPriced}
      />
    </QiyamahChamberExperience>
  );
}
