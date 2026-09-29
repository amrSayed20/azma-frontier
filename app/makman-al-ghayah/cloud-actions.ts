'use server';

/**
 * AZMA OS — مكمن الغاية: delivering a file to the Creator's own cloud.
 *
 * Constitution v1.1: مكمن is the only centre of external distribution, «سواء
 * بالرفع أو النشر أو التحميل لجهاز صاحب الأصل». This is the upload door.
 *
 * ─── THE EMPIRE OWNS NOTHING IN THAT ACCOUNT ────────────────────────────────
 *
 *   It holds one permission the Creator granted and may withdraw. The file is
 *   read from the Vault, handed to the provider, and forgotten; no copy is
 *   kept anywhere new, and the Empire never lists, reads or touches anything
 *   else in that Drive — `drive.file` cannot see it.
 *
 * ─── AND NO BALANCE IS EVER TOUCHED HERE ────────────────────────────────────
 *
 *   FOUNDER, 2026-09-29: «ولن يكون بمكمن الغايه ايه معاملات من الرصيد بخلاف
 *   اعاده التاطير». Uploading costs nothing, and this module imports no ledger
 *   at all, so no future edit can quietly add a charge to it.
 */

import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { getDb, getVaultAsset } from '@/src/persistent-storage';
import { resolveAssetPath } from '@/src/vault/asset-bytes';
import { readFile } from 'fs/promises';
import {
  listAccountsForCreator,
  revokeCloudAccount,
  readRefreshToken,
  markAccountUsed,
  type LinkedCloudAccount,
} from '@/src/cloud-destinations/cloud-account-repository';
import { googleDriveDestination } from '@/src/cloud-destinations/google-drive-destination';
import { isTokenVaultConfigured } from '@/src/cloud-destinations/token-vault';

const SESSION_COOKIE = 'azma_session';

async function creator(): Promise<string | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return id ? (verifySession(id)?.creatorId ?? null) : null;
}

export interface CloudView {
  /** Whether the Empire can offer linking at all right now. */
  readonly available: boolean;
  readonly accounts: readonly LinkedCloudAccount[];
}

/** The accounts this Creator has linked. Never a token. */
export async function listCloudAccounts(): Promise<CloudView> {
  const creatorId = await creator();
  if (!creatorId) return { available: false, accounts: [] };
  const available = googleDriveDestination.identity.configured && isTokenVaultConfigured();
  try {
    return { available, accounts: listAccountsForCreator(getDb(), creatorId) };
  } catch {
    return { available, accounts: [] };
  }
}

/** Withdraw a grant. The record survives; the power does not. */
export async function unlinkCloudAccount(accountId: string): Promise<{ ok: boolean; messageAr: string }> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };
  const done = revokeCloudAccount(getDb(), accountId, creatorId);
  return done
    ? { ok: true, messageAr: 'فُكَّ الربط — لم يعد للإمبراطورية وصولٌ إلى حسابك.' }
    : { ok: false, messageAr: 'لا يوجد ربطٌ قائمٌ بهذا المعرّف.' };
}

const MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4',
  '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};

/**
 * Put one asset in the Creator's own Drive.
 *
 * The grant is opened, spent for one hour of access, and used once. A grant
 * that no longer works is reported as such with the one remedy that exists —
 * link it again — rather than as a failure with no way forward.
 */
export async function uploadAssetToCloud(
  assetId: string,
  accountId: string,
): Promise<{ ok: boolean; messageAr: string }> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };

  const db = getDb();
  const asset = getVaultAsset(db, assetId);
  if (!asset || asset.subscriberTenantId !== creatorId) {
    return { ok: false, messageAr: 'لا يوجد أصل بهذا المعرّف في خزانتك.' };
  }

  const refreshToken = readRefreshToken(db, accountId, creatorId);
  if (!refreshToken) {
    return { ok: false, messageAr: 'هذا الحساب لم يعد مربوطاً — اربطه من جديد.' };
  }

  const accessToken = await googleDriveDestination.refreshAccess(refreshToken);
  if (!accessToken) {
    return { ok: false, messageAr: 'انتهت صلاحية الإذن الذي منحتَه — اربط حسابك من جديد.' };
  }

  // The whole file, not a head: a delivery is the bytes themselves.
  let bytes: Buffer;
  try {
    bytes = await readFile(resolveAssetPath(asset.secureStorageUri));
  } catch {
    return { ok: false, messageAr: 'لم نجد بايتات هذا الأصل على الخادم.' };
  }

  const uri = asset.secureStorageUri;
  const dot = uri.lastIndexOf('.');
  const ext = dot >= 0 ? uri.slice(dot).toLowerCase() : '';
  const label = typeof asset.metadata?.reframedForLabel === 'string' ? asset.metadata.reframedForLabel : null;
  const fileName = label ? `AZMA — ${label}${ext}` : `AZMA — ${asset.assetId}${ext}`;

  const outcome = await googleDriveDestination.deliver(accessToken, {
    bytes,
    fileName,
    mimeType: MIME_BY_EXT[ext] ?? 'application/octet-stream',
  });

  if (outcome.ok) {
    markAccountUsed(db, accountId, creatorId);
    return { ok: true, messageAr: `رُفِع إلى حسابك باسم «${fileName}».` };
  }

  // The provider's own words never reach a Creator. Each reason has one
  // remedy, and that is what they are told.
  console.error('[cloud/upload] refused:', outcome.reason, outcome.detail.slice(0, 120));
  return {
    ok: false,
    messageAr:
      outcome.reason === 'unauthorised' ? 'لم يُقبل الإذن — اربط حسابك من جديد.'
      : outcome.reason === 'rejected' ? 'لم يقبل حسابُك هذا الملفّ. تحقّق من مساحتك المتاحة.'
      : 'لم نصل إلى حسابك الآن. أعد المحاولة.',
  };
}
