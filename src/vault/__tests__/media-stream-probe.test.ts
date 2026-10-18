import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { probeStreamKinds } from '../media-stream-probe';

const hasFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0 && spawnSync('ffprobe', ['-version']).status === 0;
const describeReal = hasFfmpeg ? describe : describe.skip;

describeReal('probeStreamKinds — what an upload actually carries', () => {
  let dir = '';
  const make = (args: string[]) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { cwd: dir });

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'azma-probe-'));
    make(['-f', 'lavfi', '-i', 'sine=f=440:d=1', '-c:a', 'libopus', 'voice.webm']);
    make(['-f', 'lavfi', '-i', 'color=c=red:s=320x240:d=1', '-f', 'lavfi', '-i', 'sine=d=1', '-pix_fmt', 'yuv420p', '-shortest', 'clip.mp4']);
    make(['-f', 'lavfi', '-i', 'color=c=red:s=320x240:d=1', '-pix_fmt', 'yuv420p', 'silent.mp4']);
    writeFileSync(join(dir, 'broken.webm'), 'not media');
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('tells an audio-only .webm from a video', () => {
    expect(probeStreamKinds(join(dir, 'voice.webm'))).toEqual({ video: false, audio: true });
    expect(probeStreamKinds(join(dir, 'clip.mp4'))).toEqual({ video: true, audio: true });
    expect(probeStreamKinds(join(dir, 'silent.mp4'))).toEqual({ video: true, audio: false });
  });

  it('returns null for a file it cannot read, so the MIME mapping stands', () => {
    expect(probeStreamKinds(join(dir, 'broken.webm'))).toBeNull();
  });
});
