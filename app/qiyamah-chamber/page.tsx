import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { QiyamahChamberExperience } from '@/src/imperial-experience-engine';
import { QiyamahChamberClient } from './QiyamahChamberClient';

/**
 * QIYAMAH CHAMBER, PACKAGE I: wrapped in its own IXE Experience Pipeline
 * (see src/imperial-experience-engine/experiences/qiyamah-chamber/). No
 * render-prop needed here — unlike Signup/Login, entering the Chamber
 * has no single success handoff — so plain JSX children cross the
 * Server->Client boundary without the client-glue pattern those pages
 * required.
 */
export default async function QiyamahChamberPage() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);
  return (
    <QiyamahChamberExperience dict={dict} locale={locale}>
      <QiyamahChamberClient dict={dict} />
    </QiyamahChamberExperience>
  );
}
