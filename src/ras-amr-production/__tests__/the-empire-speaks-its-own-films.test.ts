/**
 * THE EMPIRE SPEAKS ITS OWN FILMS.
 *
 * MEASURED ON THE LIVE HOST 2026-11-09: the production workshop cannot
 * speak. Microsoft refuses its speech socket from this server's address —
 * `WSServerHandshakeError 403` in 0.8s, while plain HTTPS from the same
 * container answered 200. Two real production tasks died at the audio stage
 * because of it, with the very voice name the storyboard road already sends.
 *
 * So narration is spoken here and handed over as a finished file. These
 * guards hold the parts of that road a mocked boundary can actually witness:
 * which service is asked, what is handed back, WHICH PATH (the workshop is a
 * container and a host path means nothing inside it), and whether the units
 * a Creator was charged come back when nothing was spoken.
 *
 * What they deliberately do NOT claim: that a film rendered. A mocked
 * process boundary witnesses the arguments, never the artifact. The render
 * is proven on the live engine, not here.
 */
jest.mock('../../chambers/ras-al-amr/speech-provider', () => ({
  generateSpeechViaProvider: jest.fn(),
}));
jest.mock('../../chambers/ras-al-amr/voice-cloning-provider', () => ({
  synthesizeSpeechWithClonedVoice: jest.fn(),
}));
jest.mock('../workshop-handoff', () => ({
  CONTAINER_HANDOFF_DIR: '/MoneyPrinterTurbo/storage/azma-commissioned',
  HOST_HANDOFF_DIR: '/opt/providers/mpt-runtime/storage/azma-commissioned',
  placeIntoWorkshop: jest.fn(),
}));
jest.mock('../../persistent-storage', () => ({ getDb: jest.fn(() => ({})) }));
jest.mock('../../economy/paid-operation-gate', () => ({
  authorisePaidOperation: jest.fn(),
  settleAuthorisedOperation: jest.fn(),
  releaseAuthorisedOperation: jest.fn(),
}));
jest.mock('../../economy/paid-operation-attempts', () => ({
  claimAttempt: jest.fn(() => ({ attemptKey: 'attempt-1' })),
  completeAttempt: jest.fn(),
  failAttempt: jest.fn(),
}));

import { narrateForProduction } from '../sovereign-narration';
import { generateSpeechViaProvider } from '../../chambers/ras-al-amr/speech-provider';
import { synthesizeSpeechWithClonedVoice } from '../../chambers/ras-al-amr/voice-cloning-provider';
import { placeIntoWorkshop } from '../workshop-handoff';
import {
  authorisePaidOperation, settleAuthorisedOperation, releaseAuthorisedOperation,
} from '../../economy/paid-operation-gate';

const preset = generateSpeechViaProvider as jest.Mock;
const cloned = synthesizeSpeechWithClonedVoice as jest.Mock;
const place = placeIntoWorkshop as jest.Mock;
const authorise = authorisePaidOperation as jest.Mock;
const settle = settleAuthorisedOperation as jest.Mock;
const release = releaseAuthorisedOperation as jest.Mock;

const AUDIO = Buffer.from('ID3 pretend-mp3-bytes');
const ask = (text: string, voice: Parameters<typeof narrateForProduction>[0]['voice']) =>
  narrateForProduction({ text, voice, creatorId: 'creator-1', creatorRole: 'creator' });
const PRESET = { kind: 'preset', voice: 'onyx' } as const;

beforeEach(() => {
  jest.clearAllMocks();
  authorise.mockReturnValue({ kind: 'authorised', holdId: 'hold-1' });
  place.mockImplementation(async (name: string) => `/MoneyPrinterTurbo/storage/azma-commissioned/${name}`);
});

describe('the Empire speaks its own films', () => {
  it('hands the workshop the path the WORKSHOP can open, not the host path', async () => {
    // THE DEFECT CLASS THIS CATCHES: the picture road already learned it —
    // the container opens the path it is given on its OWN filesystem.
    preset.mockResolvedValue({ bytes: AUDIO, mimeType: 'audio/mpeg' });
    const out = await ask('قافلة تعبر الصحراء', PRESET);
    expect(out.spoken && out.workshopPath.startsWith('/MoneyPrinterTurbo/storage/')).toBe(true);
  });

  it('asks the clone service when a Creator’s own voice was chosen', async () => {
    cloned.mockResolvedValue({ bytes: AUDIO, mimeType: 'audio/mpeg' });
    await ask('نصّ', { kind: 'cloned', voiceId: 'voice-7' });
    expect(cloned).toHaveBeenCalledWith('نصّ', 'voice-7');
    expect(preset).not.toHaveBeenCalled();
  });

  it('takes the hold BEFORE the provider is called, never after', async () => {
    // The order is the safety. A provider reached before the gate is a
    // provider the Creator never agreed to pay.
    const order: string[] = [];
    authorise.mockImplementation(() => { order.push('gate'); return { kind: 'authorised' }; });
    preset.mockImplementation(async () => { order.push('provider'); return { bytes: AUDIO, mimeType: 'audio/mpeg' }; });
    await ask('نصّ', PRESET);
    expect(order).toEqual(['gate', 'provider']);
  });

  it('a refused gate never reaches the provider at all', async () => {
    authorise.mockReturnValue({ kind: 'refused', reason: 'payment-required' });
    const out = await ask('نصّ', PRESET);
    expect(preset).not.toHaveBeenCalled();
    expect(out.spoken === false && out.reason).toBe('NO_BALANCE');
  });

  it('a provider that answers with no bytes has not spoken, and the units go back', async () => {
    // AN INSTRUMENT RETURNING NOTHING IS NOT RETURNING A ZERO. A zero-byte
    // file handed over would fail at render, far from here, wearing the face
    // of a different defect — and the Creator would have paid for silence.
    preset.mockResolvedValue({ bytes: Buffer.alloc(0), mimeType: 'audio/mpeg' });
    const out = await ask('نصّ', PRESET);
    expect(out.spoken).toBe(false);
    expect(place).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalled();
    expect(settle).not.toHaveBeenCalled();
  });

  it('a missing credential is told apart from a provider that answered badly', async () => {
    // One of these is ours to fix and the other is not, and the Creator is
    // owed the difference rather than one message for both.
    cloned.mockRejectedValue(new Error('VOICE_CLONING_API_KEY is not configured — …'));
    const missing = await ask('نصّ', { kind: 'cloned', voiceId: 'v' });
    cloned.mockRejectedValue(new Error('502 from upstream'));
    const broken = await ask('نصّ', { kind: 'cloned', voiceId: 'v' });
    expect(missing.spoken === false && missing.reason).toBe('VOICE_UNAVAILABLE');
    expect(broken.spoken === false && broken.reason).toBe('SYNTHESIS_FAILED');
  });

  it('empty narration asks no provider and takes no hold', async () => {
    const out = await ask('   ', PRESET);
    expect(out.spoken).toBe(false);
    expect(preset).not.toHaveBeenCalled();
    expect(authorise).not.toHaveBeenCalled();
  });

  it('every refusal speaks Arabic and names nothing outside the Empire', async () => {
    preset.mockRejectedValue(new Error('elevenlabs 429'));
    const out = await ask('نصّ', PRESET);
    expect(out.spoken).toBe(false);
    if (out.spoken) return;
    expect(out.messageAr).toMatch(/[؀-ۿ]/);
    expect(out.messageAr).not.toMatch(/eleven|openai|bing|microsoft|edge|MoneyPrinter/i);
  });
});
