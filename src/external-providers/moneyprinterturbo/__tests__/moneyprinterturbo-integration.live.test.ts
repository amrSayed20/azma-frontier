/**
 * MoneyPrinterTurbo — LIVE integration proof.
 *
 * Opt-in only: skipped unless MONEYPRINTERTURBO_LIVE=1, because it renders a
 * real video through the real provider and costs real narration credits.
 *
 * It proves the one link the unit tests cannot: that this adapter, against the
 * actual pinned service, produces a real MP4 and that the Vault records it as
 * an independent, honestly-attributed sovereign asset.
 */

import { execFileSync } from 'child_process';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const LIVE = process.env['MONEYPRINTERTURBO_LIVE'] === '1';
const describeLive = LIVE ? describe : describe.skip;

// persistUploadedAsset reads UPLOADS_DIR once, at module load, so the redirect
// has to happen before the import below. It is guarded on LIVE because
// process.env is shared by every suite in a Jest worker: setting it
// unconditionally would silently repoint other suites' storage.
const scratch = LIVE ? mkdtempSync(join(tmpdir(), 'mpt-live-')) : '';
if (LIVE) process.env['UPLOADS_DIR'] = scratch;

import { MoneyPrinterTurboAdapter } from '../moneyprinterturbo-adapter';
import { depositProductionIntoVault } from '../moneyprinterturbo-vault-deposit';

jest.setTimeout(45 * 60 * 1000);

describeLive('live production and vault deposit', () => {
  it('is reachable', async () => {
    await expect(new MoneyPrinterTurboAdapter().checkHealth()).resolves.toBe(true);
  });

  it('produces a real MP4 and deposits it as a sovereign asset', async () => {
    const adapter = new MoneyPrinterTurboAdapter();
    const request = {
      subject: 'عسل سدر جبلي طبيعي',
      language: 'Arabic',
      paragraphCount: 1,
      voiceName: 'elevenlabs:JBFqnCBsd6RMkjVDRZzb:George',
      aspect: '9:16' as const,
    };

    const production = await adapter.produce(request);

    expect(production.providerId).toBe('moneyprinterturbo');
    expect(production.taskId).toMatch(/[0-9a-f-]{36}/);
    expect(production.bytes.length).toBeGreaterThan(200_000);
    expect(production.bytes.subarray(4, 8).toString()).toBe('ftyp');

    // Independently confirm it is a playable video, where ffprobe exists. The
    // ftyp signature above already establishes it is an MP4 container, so a
    // machine without ffmpeg reports less rather than failing the proof.
    const probeTarget = join(scratch, 'probe.mp4');
    writeFileSync(probeTarget, production.bytes);
    let probe: { streams: { codec_type: string; codec_name: string; width?: number; height?: number }[]; format: { duration: string } } | null = null;
    try {
      probe = JSON.parse(
        execFileSync('ffprobe', [
          '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', probeTarget,
        ]).toString(),
      );
    } catch {
      // eslint-disable-next-line no-console
      console.warn('ffprobe unavailable on this host — container checks skipped');
    }
    if (probe) {
      const video = probe.streams.find((s) => s.codec_type === 'video');
      const audio = probe.streams.find((s) => s.codec_type === 'audio');
      expect(video?.codec_name).toBe('h264');
      expect(audio).toBeDefined();
      expect(Number(probe.format.duration)).toBeGreaterThan(5);
    }

    const asset = await depositProductionIntoVault({
      creatorId: 'live-integration-creator',
      production,
      request,
    });

    expect(asset.assetId).toMatch(/^asset_/);
    expect(asset.capabilityTarget).toBe('MOTION');
    expect(asset.assetFamily).toBe('MEDIA');
    expect(asset.secureStorageUri).toMatch(/\.mp4$/);
    expect(asset.metadata.providerId).toBe('moneyprinterturbo');
    expect(asset.metadata.providerTaskId).toBe(production.taskId);
    expect(asset.metadata.generationSubject).toBe('عسل سدر جبلي طبيعي');

    expect(JSON.stringify(asset)).not.toContain(process.env['MONEYPRINTERTURBO_API_KEY']);

    const probedVideo = probe?.streams.find((s) => s.codec_type === 'video');
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
      taskId: production.taskId,
      bytes: production.bytes.length,
      durationSeconds: probe ? Number(probe.format.duration) : 'ffprobe-unavailable',
      resolution: probedVideo ? `${probedVideo.width}x${probedVideo.height}` : 'ffprobe-unavailable',
      elapsedMs: production.usage.elapsedMs,
      assetId: asset.assetId,
      secureStorageUri: asset.secureStorageUri,
      providerId: asset.metadata.providerId,
    }, null, 2));
  });
});
