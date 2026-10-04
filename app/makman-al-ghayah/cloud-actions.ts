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
import {
  getDb, getVaultAsset,
  recordDistribution, listReceiptsForCreator,
} from '@/src/persistent-storage';
import { resolveAssetPath } from '@/src/vault/asset-bytes';
import { readFile } from 'fs/promises';
import {
  listAccountsForCreator,
  revokeCloudAccount,
  readRefreshToken,
  readAccountBinding,
  markAccountUsed,
  linkCloudAccount,
  type LinkedCloudAccount,
} from '@/src/cloud-destinations/cloud-account-repository';
import { googleDriveDestination } from '@/src/cloud-destinations/google-drive-destination';
import { destinationFor } from '@/src/cloud-destinations/destination-for';
import {
  identifyBot, identifyChat, telegramAccountKey, chatFromAccountKey,
} from '@/src/cloud-destinations/telegram-destination';
import { isTokenVaultConfigured } from '@/src/cloud-destinations/token-vault';

const SESSION_COOKIE = 'azma_session';

async function creator(): Promise<string | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return id ? (verifySession(id)?.creatorId ?? null) : null;
}

export interface CloudView {
  /** Whether the Empire can offer Drive linking at all right now. */
  readonly available: boolean;
  /**
   * Whether Telegram can be offered — a SEPARATE condition, and deliberately.
   *
   * Drive needs the Empire's own client secret, which a Creator cannot supply.
   * Telegram needs only the vault that seals the Creator's own bot token. One
   * flag for both would have hidden an open door behind a closed one.
   */
  readonly telegramAvailable: boolean;
  readonly accounts: readonly LinkedCloudAccount[];
}

/** The accounts this Creator has linked. Never a token. */
export async function listCloudAccounts(): Promise<CloudView> {
  const creatorId = await creator();
  if (!creatorId) return { available: false, telegramAvailable: false, accounts: [] };
  const vault = isTokenVaultConfigured();
  const available = googleDriveDestination.identity.configured && vault;
  const telegramAvailable = vault;
  try {
    return { available, telegramAvailable, accounts: listAccountsForCreator(getDb(), creatorId) };
  } catch {
    return { available, telegramAvailable, accounts: [] };
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
 * Send one asset out of the Empire — to whichever provider the account names.
 *
 * ─── IT NO LONGER NAMES A PROVIDER ──────────────────────────────────────────
 *
 *   This door used to call `googleDriveDestination` directly, which was
 *   correct while one provider existed and false the moment a second did: the
 *   account row has always carried `provider`, and the door ignored it. The
 *   dispatch now reads that column and asks `destinationFor` — so a Telegram
 *   account can never be delivered to by Drive's uploader, and a provider with
 *   no implementation is REFUSED rather than guessed at.
 *
 *   The function's name is unchanged on purpose. Renaming an existing
 *   abstraction was outside the scope that authorised this work, and «رفع» vs
 *   «نشر» is a difference the Creator is told in the message, which is where
 *   it matters to them.
 *
 * The grant is opened, spent for one window of access, and used once. A grant
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

  // WHICH provider, and where inside it — from the row, not from the caller.
  const binding = readAccountBinding(db, accountId, creatorId);
  if (!binding) {
    return { ok: false, messageAr: 'هذا الحساب لم يعد مربوطاً — اربطه من جديد.' };
  }
  const destination = destinationFor(binding.provider);
  if (!destination) {
    // A named provider with no implementation behind it. Honest refusal.
    return { ok: false, messageAr: 'هذه الوجهة غير متاحةٍ في الإمبراطوريّة بعد.' };
  }
  const isTelegram = binding.provider === 'telegram';
  const verb = isTelegram ? 'نُشِر' : 'رُفِع';

  const refreshToken = readRefreshToken(db, accountId, creatorId);
  if (!refreshToken) {
    return { ok: false, messageAr: 'هذا الحساب لم يعد مربوطاً — اربطه من جديد.' };
  }

  const accessToken = await destination.refreshAccess(refreshToken);
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

  // For Telegram the chat is the second half of the account key. Drive has no
  // inside and ignores the field entirely.
  const providerTarget = isTelegram ? (chatFromAccountKey(binding.providerAccountId) ?? undefined) : undefined;

  const outcome = await destination.deliver(accessToken, {
    bytes,
    fileName,
    mimeType: MIME_BY_EXT[ext] ?? 'application/octet-stream',
    providerTarget,
  });

  if (outcome.ok) {
    markAccountUsed(db, accountId, creatorId);
    // ── THE RECEIPT ────────────────────────────────────────────────────
    //   A distribution with no recorded receipt cannot be audited, and a
    //   console line is not a record: it cannot be read back, and it does
    //   not survive a restart. The provider's own identifier is written to
    //   the Empire's own table, bound to the sovereign asset it came from
    //   and the account it went to.
    //
    //   It is NOT shown to the Creator: it is a provider's internal handle,
    //   and the Knowledge Source Abstraction Principle keeps a provider's
    //   machinery off a Creator's screen. They are told the file's name,
    //   which is the thing they will look for themselves.
    if (isTelegram) {
      recordDistribution(db, {
        creatorId,
        sourceAssetId: asset.assetId,
        provider: binding.provider,
        accountId,
        providerTarget: providerTarget ?? null,
        providerMessageId: outcome.providerFileId,
        status: 'PUBLISHED',
      });
    }
    console.log('[cloud/upload] delivered:', JSON.stringify({
      sourceAssetId: asset.assetId,
      accountId,
      provider: binding.provider,
      providerFileId: outcome.providerFileId,
      fileName,
    }));
    return { ok: true, messageAr: `${verb} باسم «${fileName}».` };
  }

  // ── A FAILURE IS WRITTEN DOWN TOO ──────────────────────────────────────
  //   A store that records only successes makes a failed publication
  //   indistinguishable from one never attempted, and those two have
  //   different remedies. Only the contract's own reason word is kept —
  //   never the provider's prose, which has passed near a credential.
  if (isTelegram) {
    recordDistribution(db, {
      creatorId,
      sourceAssetId: asset.assetId,
      provider: binding.provider,
      accountId,
      providerTarget: providerTarget ?? null,
      status: 'FAILED',
      failureReason: outcome.reason,
    });
  }

  // The provider's own words never reach a Creator. Each reason has one
  // remedy, and that is what they are told.
  console.error('[cloud/upload] refused:', outcome.reason, outcome.detail.slice(0, 120));
  return {
    ok: false,
    messageAr:
      outcome.reason === 'unauthorised' ? 'لم يُقبل الإذن — اربط حسابك من جديد.'
      : outcome.reason === 'rejected'
        ? (isTelegram ? 'لم تُقبَل هذه الوسيلة في وجهتك. الصور والفيديو فقط، وبحدود المنصّة.'
                      : 'لم يقبل حسابُك هذا الملفّ. تحقّق من مساحتك المتاحة.')
      : 'لم نصل إلى حسابك الآن. أعد المحاولة.',
  };
}

/**
 * ═══ TELEGRAM: THE CREATOR HANDS OVER THEIR OWN BOT ════════════════════════
 *
 * Telegram issues no authorization URL and exchanges no code, so there is no
 * `/api/cloud/telegram/start` and no callback. The Creator pastes a bot token
 * and names a destination, and BOTH are verified against Telegram itself
 * before a single row is written:
 *
 *   `getMe`   — is this a live bot at all?
 *   `getChat` — can this bot actually reach that place?
 *
 * The second is the one that matters in practice: a Creator who forgot to make
 * the bot an admin of their channel learns it here, where the remedy is
 * obvious, instead of from a publication that fails an hour later.
 *
 * ─── WHAT HAPPENS TO THE TOKEN ──────────────────────────────────────────────
 *
 *   It is sealed by `linkCloudAccount` through the existing token vault —
 *   AES-256-GCM, the key only in the server's environment — and this function
 *   returns NOTHING derived from it. It is never logged, never echoed, and the
 *   browser that submitted it receives only a label and an account id.
 */
export async function connectTelegramBot(
  botToken: string,
  chat: string,
): Promise<{ ok: boolean; messageAr: string }> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };

  if (!isTokenVaultConfigured()) {
    // The vault refuses rather than falling back to plaintext, and the Creator
    // is told the truth: the Empire cannot yet hold their credential.
    return { ok: false, messageAr: 'الإمبراطوريّة غير مهيّأةٍ لحفظ اعتمادك بعد.' };
  }

  const token = botToken.trim();
  const target = chat.trim();
  if (token.length === 0 || target.length === 0) {
    return { ok: false, messageAr: 'أدخل رمز البوت ووجهة النشر معاً.' };
  }

  const bot = await identifyBot(token);
  if (!bot) {
    return { ok: false, messageAr: 'لم يقبل تيليجرام هذا الرمز. تحقّق منه من @BotFather.' };
  }

  const found = await identifyChat(token, target);
  if (!found) {
    return {
      ok: false,
      messageAr: 'لم يصل بوتك إلى هذه الوجهة. أضفه إلى القناة واجعله مشرفاً، ثم أعد المحاولة.',
    };
  }

  const account = linkCloudAccount(getDb(), {
    creatorId,
    provider: 'telegram',
    // The pair is the identity: a bot publishes nowhere by itself, and two
    // channels of one bot are two destinations a Creator revokes separately.
    providerAccountId: telegramAccountKey(bot.botId, found.chatId),
    accountLabel: bot.username
      ? `${found.title ?? 'وجهة تيليجرام'} — @${bot.username}`
      : (found.title ?? 'وجهة تيليجرام'),
    refreshToken: token,
    scopes: ['publish'],
  });

  return { ok: true, messageAr: `ارتُبط — سيُنشَر إلى «${account.accountLabel}».` };
}

/**
 * The Creator's own distribution history — the state that survives a refresh.
 *
 * A message shown once after a publication proves nothing an hour later. This
 * is read from the receipts table on every entry to the Chamber, so «نُشِر»
 * on the screen is the database speaking, not a remembered success.
 */
export interface DistributionRecordView {
  readonly receiptId: string;
  readonly sourceAssetId: string;
  readonly providerLabelAr: string;
  readonly whereAr: string;
  readonly status: 'PUBLISHED' | 'FAILED';
  readonly atMs: number;
}

const PROVIDER_LABEL_AR: Readonly<Record<string, string>> = {
  'google-drive': 'جوجل درايف', telegram: 'تيليجرام', dropbox: 'دروبوكس',
};

export async function listDistributionReceipts(): Promise<readonly DistributionRecordView[]> {
  const creatorId = await creator();
  if (!creatorId) return [];
  try {
    const accounts = listAccountsForCreator(getDb(), creatorId);
    const labelFor = new Map(accounts.map((a) => [a.accountId, a.accountLabel]));
    return listReceiptsForCreator(getDb(), creatorId, 20).map((r) => ({
      receiptId: r.receiptId,
      sourceAssetId: r.sourceAssetId,
      providerLabelAr: PROVIDER_LABEL_AR[r.provider] ?? 'وجهة خارجيّة',
      // The account's own label, never the provider's chat id — a Creator
      // reads «قناة أزما», not «-1001234567890».
      whereAr: labelFor.get(r.accountId) ?? 'وجهةٌ فُكَّ ربطها',
      status: r.status,
      atMs: r.createdAtMs,
    }));
  } catch {
    return [];
  }
}

/** A sovereign asset as the distribution panel shows it. Never bytes, never a path. */
export interface DistributableAsset {
  readonly assetId: string;
  readonly labelAr: string;
  readonly kindAr: string;
  /** For a thumbnail the Creator's own browser is already authorised to fetch. */
  readonly previewUri: string;
}

const KIND_AR: Readonly<Record<string, string>> = {
  VISUAL: 'صورة', MOTION: 'فيديو', AUDIO: 'صوت', WRITING: 'نصّ',
};

function describe(asset: {
  assetId: string;
  capabilityTarget: string;
  secureStorageUri: string;
  metadata?: Record<string, unknown>;
}): DistributableAsset {
  const m = asset.metadata ?? {};
  const named =
    (typeof m.reframedForLabel === 'string' && m.reframedForLabel)
    || (typeof m.generationPrompt === 'string' && m.generationPrompt.slice(0, 48))
    || (typeof m.voiceDisplayName === 'string' && m.voiceDisplayName)
    || null;
  return {
    assetId: asset.assetId,
    labelAr: named || 'أصل من خزانتك',
    kindAr: KIND_AR[asset.capabilityTarget] ?? 'أصل',
    previewUri: asset.secureStorageUri,
  };
}

/**
 * The Creator's own assets, for the distribution door.
 *
 * Read through the Vault's existing tenant-scoped listing — no second registry
 * and no second query. The Vault remains the source of truth; this is a view
 * of it, and nothing here can create, alter or remove an asset.
 */
export async function listDistributableAssets(limit = 60): Promise<readonly DistributableAsset[]> {
  const creatorId = await creator();
  if (!creatorId) return [];
  try {
    const { listVaultAssetsForTenant } = await import('@/src/persistent-storage');
    return listVaultAssetsForTenant(getDb(), creatorId)
      .filter((a) => a.assetFamily === 'MEDIA')
      .slice(0, Math.max(1, Math.min(limit, 200)))
      .map(describe);
  } catch {
    return [];
  }
}

export type ResolveOutcome =
  | { readonly ok: true; readonly asset: DistributableAsset }
  | { readonly ok: false; readonly messageAr: string };

/**
 * Turn a dropped sovereign id into an asset — THROUGH THE OWNERSHIP BOUNDARY.
 *
 * ─── THIS IS THE WHOLE POINT OF THE DROP TARGET ─────────────────────────────
 *
 *   A drop carries an id, and an id from a browser is a claim, not a fact.
 *   `getVaultAsset` + the tenant comparison is the same gate every other act
 *   in this Empire passes, and the answer is the same for «no such asset» and
 *   «not yours» so an id cannot be probed.
 *
 *   The panel must not say «قُبِل» before this returns ok — an acceptance
 *   shown ahead of the resolution is a visual animation standing in for an
 *   action, which is exactly what the directive forbids.
 */
export async function resolveAssetForDistribution(assetId: string): Promise<ResolveOutcome> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };
  if (typeof assetId !== 'string' || assetId.trim().length === 0) {
    return { ok: false, messageAr: 'ما أُفلِت ليس أصلاً سياديّاً.' };
  }
  const asset = getVaultAsset(getDb(), assetId.trim());
  if (!asset || asset.subscriberTenantId !== creatorId) {
    return { ok: false, messageAr: 'لا يوجد أصل بهذا المعرّف في خزانتك.' };
  }
  return { ok: true, asset: describe(asset) };
}
