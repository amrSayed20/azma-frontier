/**
 * NO PAID VOICE ESCAPES THE SOVEREIGN GATE.
 *
 * ─── THE HOLE, MEASURED ON THE LIVE ENGINE 2026-11-09 ───────────────────────
 *
 *   Given a provider voice name, the production workshop calls that provider
 *   with ITS OWN credential. It was proven doing exactly that: real
 *   Egyptian-Arabic speech in the Founder's cloned identity
 *   (voice e27gQTEgHG16Uv4f8hbx), a finished film (task c23bc38a) — and not
 *   one unit held, settled or returned. The Empire paid, silently, outside
 *   its own economy.
 *
 *   «لا يُسمح بأي مسار بديل يستدعي المزود ويتجاوز البوابة» — the Founder.
 *
 *   A rule in a document cannot close that. The REQUEST can: the workshop is
 *   asked for pictures and silence, and the Empire speaks its own films
 *   through the gate. These guards hold the shape of the request, because
 *   that is where the closure actually lives.
 *
 * ─── AND WHAT THEY DO NOT CLAIM ─────────────────────────────────────────────
 *
 *   Not that a film was produced, and not that a Creator was charged
 *   correctly. A mocked boundary witnesses arguments, never artifacts. The
 *   silent render is proven on the live engine (task 804b08c5); the charge is
 *   proven by the economy's own suites.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { SILENT_PRODUCTION } from '../../external-providers/moneyprinterturbo/moneyprinterturbo-adapter';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const ADAPTER = 'src/external-providers/moneyprinterturbo/moneyprinterturbo-adapter.ts';

describe('no paid voice escapes the sovereign gate', () => {
  it('the workshop is asked for silence, never for a provider voice', () => {
    const adapter = read(ADAPTER);
    expect(adapter).toContain('voice_name: SILENT_PRODUCTION,');
    // The caller's voiceName must no longer reach the request at all — a
    // field that is merely ignored today is a field restored tomorrow.
    expect(adapter).not.toContain("voice_name: request.voiceName");
  });

  it('and the sentinel is the workshop’s own word for silence, not an empty string', () => {
    // MEASURED: an empty voice is rejected as «Invalid voice» on purpose, so
    // that a lost setting cannot disguise itself as a deliberate choice.
    expect(SILENT_PRODUCTION).toBe('none');
    expect(SILENT_PRODUCTION).not.toBe('');
  });

  it('no road hands the workshop a cloned identity to speak with', () => {
    // The identity belongs to the Creator and the charge belongs to the
    // Empire's gate. A voice id crossing this boundary is both leaving.
    for (const f of [
      ADAPTER,
      'app/api/ras-amr/storyboard/[storyboardId]/produce/route.ts',
      'app/api/ras-amr/scene/produce/route.ts',
    ]) {
      expect(read(f)).not.toMatch(/elevenlabs:/);
    }
  });

  it('the Empire’s own narration settles on what the provider metered', () => {
    // «التسوية وفق الاستهلاك الفعلي الموثوق من المزود، وليس مجرد تقدير عدد
    //  الحروف» — the hold is the ceiling, the provider's own figure is the
    //  settlement, and a silent provider leaves the hold standing.
    const narration = read('src/ras-amr-production/sovereign-narration.ts');
    expect(narration).toContain('priceSpeechFromCredits(meteredCredits)');
    expect(narration).toContain('Math.min(measured.chargedUnits, gate.units)');
    expect(narration).toContain("settledOn: measured.ok ? 'provider-metered' : 'hold'");
  });

  it('and it still takes the hold BEFORE the provider is reached', () => {
    // The order is the whole safety. Re-asserted here because the settlement
    // rewrite touched the lines around it.
    const narration = read('src/ras-amr-production/sovereign-narration.ts');
    expect(narration.indexOf('authorisePaidOperation('))
      .toBeLessThan(narration.indexOf('synthesizeSpeechWithClonedVoice(script'));
  });
});
