/**
 * AZMA OS — RAS AL AMR: THE ONE DOOR INTO THE PRODUCTION WORKSHOP
 *
 * The workshop container shares exactly one directory with this host:
 *
 *     /opt/providers/mpt-runtime/storage  ⟷  /MoneyPrinterTurbo/storage
 *
 * proven 2026-09-25 by writing on one side and reading on the other, and
 * confirmed again 2026-11-09 by reading the container's own mount table.
 * Anything the workshop must open — a commissioned picture, a narration the
 * Empire spoke — is placed there, and the CONTAINER-side path is what the
 * workshop is told. No mount is added and nothing is exposed over HTTP.
 *
 * WHY THIS FILE EXISTS. The picture road already knew these two paths and
 * kept them to itself. The narration road needs the same two, and a path
 * constant copied into a second file is a drift waiting to happen — the day
 * one moves, the other keeps writing where nobody reads. So the pair lives
 * here once, and both roads import it.
 */
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

/** Where a handed-over file actually sits on this host. */
export const HOST_HANDOFF_DIR = process.env['MPT_HANDOFF_DIR']
  ?? '/opt/providers/mpt-runtime/storage/azma-commissioned';

/** The same directory as the workshop container sees it. */
export const CONTAINER_HANDOFF_DIR = process.env['MPT_HANDOFF_CONTAINER_DIR']
  ?? '/MoneyPrinterTurbo/storage/azma-commissioned';

/**
 * Place bytes where the workshop can open them, and answer with the path the
 * workshop must be given — never the host path, which means nothing there.
 */
export async function placeIntoWorkshop(fileName: string, bytes: Buffer): Promise<string> {
  await mkdir(HOST_HANDOFF_DIR, { recursive: true });
  await writeFile(join(HOST_HANDOFF_DIR, fileName), bytes);
  // POSIX join: the container is Linux whatever this host is. `join` on
  // Windows would answer a backslash path the workshop cannot open — the
  // exact class of defect this file exists to prevent.
  return `${CONTAINER_HANDOFF_DIR}/${fileName}`;
}
