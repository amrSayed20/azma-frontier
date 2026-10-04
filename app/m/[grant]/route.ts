/**
 * AZMA OS — the one door a provider's fetcher may use.
 *
 * It answers 404 to everything except a live, sealed grant naming an asset its
 * sealed owner still owns. No session, because the caller is Meta's server and
 * has none; no listing, no directory, no second asset — a grant opens exactly
 * what it names and nothing beside it.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { getDb, getVaultAsset } from '@/src/persistent-storage';
import { resolveAssetPath } from '@/src/vault/asset-bytes';
import { openMediaGrant } from '@/src/cloud-destinations/fetchable-media-grant';

export const dynamic = 'force-dynamic';

const MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
};

/** Expired, forged, revoked and absent all answer alike. */
const refuse = () => new NextResponse(null, { status: 404 });

export async function GET(_request: NextRequest, context: { params: Promise<{ grant: string }> }) {
  const { grant } = await context.params;
  if (typeof grant !== 'string' || grant.length < 16 || grant.length > 4096) return refuse();

  const opened = openMediaGrant(grant);
  if (!opened) return refuse();

  const asset = getVaultAsset(getDb(), opened.assetId);
  // The ownership sealed into the grant must STILL hold. A grant cannot
  // outlive a change of hands.
  if (!asset || asset.subscriberTenantId !== opened.ownerId) return refuse();

  let bytes: Buffer;
  try {
    bytes = await readFile(resolveAssetPath(asset.secureStorageUri));
  } catch {
    return refuse();
  }

  const uri = asset.secureStorageUri;
  const dot = uri.lastIndexOf('.');
  const ext = dot >= 0 ? uri.slice(dot).toLowerCase() : '';
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': MIME_BY_EXT[ext] ?? 'application/octet-stream',
      'Content-Length': String(bytes.length),
      // Never cached anywhere: the grant is minutes long and an edge copy
      // would outlive it.
      'Cache-Control': 'private, no-store',
    },
  });
}
