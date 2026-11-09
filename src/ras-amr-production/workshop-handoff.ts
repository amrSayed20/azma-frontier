/**
 * AZMA OS — RAS AL AMR: THE ONE DOOR INTO THE PRODUCTION WORKSHOP
 *
 * The workshop container shares one directory tree with this host:
 *
 *     /opt/providers/mpt-runtime/storage  ⟷  /MoneyPrinterTurbo/storage
 *
 * confirmed 2026-11-09 by reading the container's own mount table. Anything
 * the workshop must open is placed inside it, and the workshop is told the
 * name it expects. No mount is added and nothing is exposed over HTTP.
 *
 * ─── WHICH SUBDIRECTORY, AND HOW THAT WAS MEASURED ──────────────────────────
 *
 *   A visual material MUST sit in `storage/local_videos`. This is not a
 *   convention — it is enforced, and this Empire learned it the hard way on
 *   2026-11-09. A real nano-banana-2 picture was handed over in
 *   `storage/azma-commissioned`, the production reached the materials stage,
 *   and the workshop's own log refused it by name:
 *
 *       skip unsafe local material: ./storage/azma-commissioned/scene-hoopoe.png,
 *       local_videos_dir: ./storage/local_videos,
 *       error: path is outside the allowed directory
 *
 *   The workshop resolves every supplied material inside `local_videos` and
 *   skips anything that escapes it — a deliberate guard against turning an
 *   API parameter into an arbitrary file read. It accepts a bare filename or
 *   an absolute path inside that directory; the bare filename is what this
 *   Empire sends, because that is the form proven to pass.
 *
 *   THIS WAS A REGRESSION, NOT A FIRST ATTEMPT. Supplied pictures reached the
 *   workshop through `azma-commissioned` in September. The guard was added by
 *   a later provider build, and nothing in this repository could have seen it:
 *   the directory still exists, the copy still succeeds, and the failure
 *   appears four stages later wearing the words «no valid local video
 *   materials were found». Only a live production found it.
 *
 * WHY THIS FILE EXISTS. The picture road and the narration road both need
 * these paths. A path constant copied into a second file is a drift waiting
 * to happen — the day one moves, the other keeps writing where nobody reads,
 * which is exactly the class of defect above.
 */
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

/** Root of the shared tree on this host. */
const HOST_STORAGE = process.env['MPT_HANDOFF_DIR']
  ?? '/opt/providers/mpt-runtime/storage';

/** The same root as the workshop container sees it. */
const CONTAINER_STORAGE = process.env['MPT_HANDOFF_CONTAINER_DIR']
  ?? '/MoneyPrinterTurbo/storage';

/**
 * The only directory the workshop will resolve a supplied material inside.
 * Changing this name does not relax the workshop's guard — it breaks it.
 */
const MATERIALS_SUBDIR = 'local_videos';

/** Where a handed-over visual material sits on this host. */
export const HOST_HANDOFF_DIR = join(HOST_STORAGE, MATERIALS_SUBDIR);

/** The same directory as the workshop container sees it. */
export const CONTAINER_HANDOFF_DIR = `${CONTAINER_STORAGE}/${MATERIALS_SUBDIR}`;

/**
 * Place a visual material where the workshop can open it, and answer with the
 * reference the workshop must be given.
 *
 * That reference is the BARE FILENAME, which is the form measured to pass the
 * workshop's own path guard. A host path means nothing inside the container,
 * and a container path merely happens to also work — the filename is what
 * this Empire sends because it is what was proven.
 */
export async function placeIntoWorkshop(fileName: string, bytes: Buffer): Promise<string> {
  await mkdir(HOST_HANDOFF_DIR, { recursive: true });
  await writeFile(join(HOST_HANDOFF_DIR, fileName), bytes);
  return fileName;
}
