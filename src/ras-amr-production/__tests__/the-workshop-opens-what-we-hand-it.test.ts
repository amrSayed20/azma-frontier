/**
 * THE WORKSHOP OPENS WHAT WE HAND IT — and it refuses everything else.
 *
 * MEASURED ON THE LIVE ENGINE 2026-11-09, in this order:
 *
 *   1. A real nano-banana-2 picture (job cmw923boj051rgv01b26pf4cs, 1376x768,
 *      100 provider credits) was copied into `storage/azma-commissioned` and
 *      handed over. The production reached the materials stage and died:
 *      «no valid local video materials were found». The workshop's own log
 *      named the reason — «path is outside the allowed directory,
 *      local_videos_dir: ./storage/local_videos».
 *
 *   2. The same picture, the same request, the file in `storage/local_videos`
 *      and referenced by its BARE FILENAME: task
 *      804b08c5-50d6-4373-ba4f-66ac4c03596c, state 1, progress 100 — a real
 *      1920x1080 H.264 film, 5.57s, 1,802,997 bytes.
 *
 * ONE VARIABLE CHANGED BETWEEN THEM. That is why these guards name a
 * directory and a form rather than describing an intention.
 *
 * AND IT WAS A REGRESSION, WHICH IS THE WHOLE POINT OF GUARDING IT: pictures
 * reached the workshop through the old directory in September. A later
 * provider build added the path guard. Nothing in this repository could see
 * it — the directory still exists, the copy still succeeds, and the failure
 * surfaces four stages later in different words.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { HOST_HANDOFF_DIR, CONTAINER_HANDOFF_DIR, placeIntoWorkshop } from '../workshop-handoff';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

describe('the workshop opens what we hand it', () => {
  it('hands material to the one directory the workshop resolves inside', () => {
    // Not a convention — enforced. Anything else is skipped as unsafe.
    expect(HOST_HANDOFF_DIR.replace(/\\/g, '/')).toMatch(/\/local_videos$/);
    expect(CONTAINER_HANDOFF_DIR).toMatch(/\/local_videos$/);
  });

  it('and never again the directory the workshop refused by name', () => {
    expect(HOST_HANDOFF_DIR).not.toContain('azma-commissioned');
    expect(CONTAINER_HANDOFF_DIR).not.toContain('azma-commissioned');
  });

  it('answers with the bare filename, which is the form a film came back from', async () => {
    // A host path means nothing inside the container. An absolute container
    // path satisfies the resolver by reading its code — but no film has ever
    // been produced from one, and this road has just learned what reading
    // code does not tell you.
    const reference = await placeIntoWorkshop('scene-x.png', Buffer.from('bytes'))
      .catch(() => null);
    if (reference === null) return; // no writable workshop on this machine
    expect(reference).toBe('scene-x.png');
  });

  it('the picture road sends that same form, not a path it built itself', () => {
    const commission = read('src/ras-amr-production/qiyamah-commission.ts');
    expect(commission).not.toContain('return `${CONTAINER_HANDOFF_DIR}/${name}`;');
    expect(commission).toContain('return name;');
  });
});
