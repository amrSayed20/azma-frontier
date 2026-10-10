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
  getDb, getVaultAsset, getCreator,
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
import { youtubeDestination } from '@/src/cloud-destinations/youtube-destination';
import { metaIsConfigured } from '@/src/cloud-destinations/meta-destination';
import { tiktokIsConfigured } from '@/src/cloud-destinations/tiktok-destination';
import {
  destinationAccessFor, offerKeyOfProvider, type DestinationAccessState,
} from '@/src/cloud-destinations/destination-eligibility';
import { mintMediaGrant } from '@/src/cloud-destinations/fetchable-media-grant';
import {
  telegramAppCredentials,
  telegramUserIsConfigured,
  telegramUserAccountKey,
  peerFromAccountKey,
  looksLikeTelegramSession,
} from '@/src/cloud-destinations/telegram-user-destination';

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
  /**
   * Whether the Creator's OWN Telegram account can be linked.
   *
   * A third separate condition, and deliberately so. It depends on neither the
   * Empire's Google secret nor its token vault — the vault holds nothing for
   * this provider — but only on whether Telegram has registered AZMA as an
   * application at all.
   */
  readonly telegramUserAvailable: boolean;
  /**
   * WHAT THIS CREATOR CAN ACTUALLY COMPLETE — not what the Empire holds keys for.
   *
   * ─── IT USED TO BE A BOOLEAN, AND THE BOOLEAN WAS A PROMISE WE BROKE ──────
   *
   *   `offers[key] === true` meant «the Empire holds a client key», and the
   *   Chamber drew «+ اربط تيك توك» from it. The platform then refused the
   *   Creator at its own door. One fact was standing in for another.
   *
   *   So the answer is a NAMED STATE carrying its own reason, computed per
   *   Creator by `destinationAccessFor`. Keyed by the linking flow, not by
   *   provider, because one Meta consent opens both a Page and an Instagram
   *   professional account.
   */
  readonly destinations: Readonly<Record<string, DestinationAccessState>>;
  readonly accounts: readonly LinkedCloudAccount[];
  /**
   * The Creator's OWN linked accounts whose platform refuses them right now,
   * as accountId → the true reason.
   *
   * ─── THE SECOND HALF OF THE SAME DEBT, AND THE WORSE HALF ─────────────────
   *
   *   An account linked while a door was open stays linked after the platform
   *   narrows it. Hiding only the LINK button would still leave a «انشره في»
   *   button that fails AFTER the promise — a refusal paid for with the
   *   Creator's time and their belief that it worked.
   *
   *   A key present here means: do not offer the publication. Say this.
   */
  readonly accountRefusals: Readonly<Record<string, string>>;
}

/** The accounts this Creator has linked. Never a token. */
export async function listCloudAccounts(): Promise<CloudView> {
  const creatorId = await creator();
  const shut = { available: false, telegramAvailable: false, telegramUserAvailable: false, destinations: {}, accounts: [], accountRefusals: {} };
  if (!creatorId) return shut;
  const vault = isTokenVaultConfigured();
  const available = googleDriveDestination.identity.configured && vault;
  const telegramAvailable = vault;
  const telegramUserAvailable = telegramUserIsConfigured();

  // ── THE EMPIRE'S READINESS, STILL ASKED — BUT NO LONGER ALONE ──────────
  const holds: Readonly<Record<string, boolean>> = {
    youtube: youtubeDestination.identity.configured && vault,
    meta: metaIsConfigured() && vault,
    tiktok: tiktokIsConfigured() && vault,
  };

  let creatorEmail: string | null = null;
  let accounts: readonly LinkedCloudAccount[] = [];
  try {
    const db = getDb();
    // WHO is asking — because the platform's answer is about THEM, not about us.
    creatorEmail = getCreator(db, creatorId)?.email ?? null;
    accounts = listAccountsForCreator(db, creatorId);
  } catch {
    // A database that cannot be read must not be reported as an open door.
    // `creatorEmail` stays null, so every governed destination reads as
    // awaiting rather than open, and no button is drawn that cannot work.
  }

  const destinations: Record<string, DestinationAccessState> = {};
  for (const offerKey of Object.keys(holds)) {
    destinations[offerKey] = destinationAccessFor({
      offerKey, empireHoldsCredential: holds[offerKey] === true, creatorEmail,
    });
  }

  const accountRefusals: Record<string, string> = {};
  for (const account of accounts) {
    const offerKey = offerKeyOfProvider(account.provider);
    if (!offerKey) continue; // Drive and Telegram answer to nobody's review.
    const state = destinations[offerKey];
    if (state && state.access !== 'OPEN') accountRefusals[account.accountId] = state.reasonAr;
  }

  return { available, telegramAvailable, telegramUserAvailable, destinations, accounts, accountRefusals };
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
    // TWO DIFFERENT REFUSALS, AND THEY MUST NOT SHARE A SENTENCE.
    //
    //   `dropbox` is a name with no implementation — «not available yet» is
    //   true of it. `telegram-user` is fully implemented and reachable, and
    //   the server simply holds no session with which to deliver it; saying
    //   «not available yet» about a working destination would be a lie told
    //   by a message, which is still a lie.
    return {
      ok: false,
      messageAr: binding.provider === 'telegram-user'
        ? 'هذه الوجهة تُنشَر من متصفّحك أنت، لا من الخادم. افتح الحجرة وانشر منها.'
        : 'هذه الوجهة غير متاحةٍ في الإمبراطوريّة بعد.',
    };
  }
  // ── THE GATE, ON THE PUBLISHING DOOR TOO ───────────────────────────────
  //   Hiding the button is not closing the door: this action is callable by
  //   anything that holds the Creator's cookie, and an account linked while a
  //   platform was open stays linked after it narrows. So the SAME verdict is
  //   asked again here, before a single byte is read or a grant is opened —
  //   and a Creator the platform refuses is told so instead of watching a
  //   publication fail after it was promised.
  //
  //   Drive, a Telegram bot and the Creator's own Telegram account are not
  //   governed by any review: `offerKeyOfProvider` returns null for them and
  //   this gate never judges them.
  const governedBy = offerKeyOfProvider(binding.provider);
  if (governedBy) {
    const verdict = destinationAccessFor({
      offerKey: governedBy,
      empireHoldsCredential: true, // The grant exists, so the credential did.
      creatorEmail: getCreator(db, creatorId)?.email ?? null,
    });
    if (verdict.access !== 'OPEN') {
      return { ok: false, messageAr: verdict.reasonAr };
    }
  }

  const isTelegram = binding.provider === 'telegram';
  // ── THE VERB IS A TRUTH CLAIM ──────────────────────────────────────────
  //   «رُفِع» for a drive. «نُشِر» for a destination that makes the work
  //   visible. And TikTok gets NEITHER: without its audit the file lands in
  //   the Creator's own inbox as a draft that a hand must finish, and calling
  //   that «نُشِر» would be the system lying about what it did.
  const verb = binding.provider === 'google-drive' ? 'رُفِع'
    : binding.provider === 'tiktok' ? 'وصل مسوّدةً إلى تيك توك — أتمِمه من التطبيق:'
    : 'نُشِر';

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

  // WHERE INSIDE THE PROVIDER. Telegram keeps the chat in the second half of
  // its account key; the social destinations ARE their provider account id —
  // a Page id, an Instagram professional account id. Drive has no inside and
  // ignores the field entirely.
  const providerTarget = isTelegram
    ? (chatFromAccountKey(binding.providerAccountId) ?? undefined)
    : (binding.provider === 'facebook-page' || binding.provider === 'instagram-business')
      ? binding.providerAccountId
      : undefined;

  // ── THE ONE PROVIDER THAT REFUSES BYTES ────────────────────────────────
  //   Instagram fetches the file with Meta's own servers, so a grant is
  //   minted for this delivery alone: one asset, one owner, ten minutes,
  //   sealed with the Empire's key. Every other provider is handed the bytes
  //   and never sees a URL.
  let publicMediaUrl: string | undefined;
  if (binding.provider === 'instagram-business') {
    const token = mintMediaGrant(asset.assetId, creatorId);
    if (!token) {
      return { ok: false, messageAr: 'الإمبراطوريّة غير مهيّأةٍ لفتح هذا الأصل لإنستجرام.' };
    }
    publicMediaUrl = `https://azmaos.com/m/${token}`;
  }

  const outcome = await destination.deliver(accessToken, {
    bytes,
    fileName,
    mimeType: MIME_BY_EXT[ext] ?? 'application/octet-stream',
    providerTarget,
    publicMediaUrl,
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
    // ── EVERY EXTERNAL DISTRIBUTION LEAVES A RECEIPT ───────────────────
    //   Drive was left on a console line by an older package and stays as it
    //   is under a standing seal. Every provider added since writes here.
    if (binding.provider !== 'google-drive') {
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
  if (binding.provider !== 'google-drive') {
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
  'telegram-user': 'تيليجرام — حسابك', youtube: 'يوتيوب',
  'facebook-page': 'صفحة فيسبوك', 'instagram-business': 'إنستجرام', tiktok: 'تيك توك',
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

/**
 * ═══ TELEGRAM BY THE CREATOR'S OWN ACCOUNT ═════════════════════════════════
 *
 * FOUNDER'S RULING, 2026-10-04 — PARTIAL ZERO-CUSTODY, accepted in those
 * words and never to be described as zero-custody:
 *
 *   «Telegram user sessions MUST NOT be stored on the AZMA server… MUST NOT
 *    enter cloud_accounts, distribution_receipts, backups, logs, API
 *    responses, or server-side persistence.»
 *
 * So the three actions below are the WHOLE of this provider's server side,
 * and not one of them takes a credential:
 *
 *   `telegramAppCredentialsForBrowser` — hands the Creator's own browser the
 *       APPLICATION's api_id/api_hash. Not any account's secret; what Telegram
 *       requires of any client before it may speak MTProto at all.
 *   `linkTelegramUserAccount`          — records WHICH account and WHERE,
 *       with no secret of any kind.
 *   `recordTelegramUserPublication`    — writes the receipt for a publication
 *       the browser performed.
 *
 * ─── WHAT THE SERVER CANNOT DO HERE, AND WHY THAT IS THE DESIGN ─────────────
 *
 *   It cannot verify the Telegram identity, and it cannot witness the message.
 *   Both would require the session it has agreed never to hold. What it CAN
 *   do, it does without exception: the AZMA session, the Vault's ownership
 *   boundary, and the account's ownership are all checked on every call, so a
 *   browser's claim can only ever be written against the Creator's own asset
 *   and the Creator's own destination.
 */

/**
 * The application credentials, for an authenticated Creator's browser only.
 *
 * Never baked into the client bundle: a static build is a file anyone may
 * fetch, and a leaked api_hash is used for someone else's automation until
 * Telegram bans it — which would take this path away from every Creator at
 * once.
 */
export async function telegramAppCredentialsForBrowser(): Promise<
  { ok: true; apiId: number; apiHash: string } | { ok: false; messageAr: string }
> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };
  const app = telegramAppCredentials();
  if (!app) return { ok: false, messageAr: 'تيليجرام غير مهيّأ في الإمبراطوريّة بعد.' };
  return { ok: true, apiId: app.apiId, apiHash: app.apiHash };
}

/**
 * Record a destination the Creator's browser authorised — WITHOUT A SECRET.
 *
 * Every argument is routing or a label. If anything session-shaped ever
 * arrives at this door — through a widened parameter, or a «convenience» a
 * future engineer adds — `looksLikeTelegramSession` refuses the whole call
 * rather than storing it. That guard is the ruling made executable.
 */
export async function linkTelegramUserAccount(input: {
  telegramUserId: string;
  username: string | null;
  peerId: string;
  peerTitle: string;
}): Promise<{ ok: boolean; messageAr: string }> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };
  if (!telegramUserIsConfigured()) {
    return { ok: false, messageAr: 'تيليجرام غير مهيّأ في الإمبراطوريّة بعد.' };
  }

  const telegramUserId = String(input.telegramUserId ?? '').trim();
  const peerId = String(input.peerId ?? '').trim();
  const peerTitle = String(input.peerTitle ?? '').trim();
  if (!telegramUserId || !peerId) {
    return { ok: false, messageAr: 'لم تصل هويّة الحساب أو الوجهة.' };
  }

  // THE RULING, MADE EXECUTABLE. Checked on every field, not only the ones a
  // session would plausibly arrive in.
  for (const value of [telegramUserId, peerId, peerTitle, input.username ?? '']) {
    if (looksLikeTelegramSession(value)) {
      console.error('[telegram-user] refused: a session-shaped value reached the server');
      return { ok: false, messageAr: 'رُفِض الربط — وصل إلى الخادم ما لا يجوز أن يصله.' };
    }
  }

  const account = linkCloudAccount(getDb(), {
    creatorId,
    provider: 'telegram-user',
    providerAccountId: telegramUserAccountKey(telegramUserId, peerId),
    accountLabel: input.username
      ? `${peerTitle || 'وجهة تيليجرام'} — @${input.username}`
      : (peerTitle || 'وجهة تيليجرام'),
    // ── THE WHOLE RULING, IN ONE ARGUMENT ──────────────────────────────
    //   No token is sealed because no token exists here. The row records
    //   which destination a Creator may publish to and holds no power to
    //   do it; the power never left their browser.
    refreshToken: null,
    scopes: ['client-publish'],
  });

  return { ok: true, messageAr: `ارتُبط — سيُنشَر إلى «${account.accountLabel}» بحسابك أنت.` };
}

/**
 * Write the receipt for a publication the Creator's browser performed.
 *
 * ─── THE MESSAGE ID IS A CLAIM, AND IS RECORDED AS ONE ──────────────────────
 *
 *   The server did not witness this send and cannot check it: checking would
 *   need the session it does not hold. What it checks instead is everything
 *   within its reach — that the Creator is who the cookie says, that the asset
 *   is theirs, that the account is theirs and is a `telegram-user` account —
 *   so a false id can still only ever be attached to the claimant's own asset
 *   and their own destination.
 *
 *   The receipt's `provider` column carries the distinction permanently: a row
 *   reading `telegram-user` was reported by a browser, and a row reading
 *   `telegram` was observed by this server. No extra column states it, because
 *   the provider name already does, exactly and for every row.
 */
export async function recordTelegramUserPublication(input: {
  assetId: string;
  accountId: string;
  providerMessageId: string;
  failureReason?: 'unauthorised' | 'rejected' | 'unreachable';
}): Promise<{ ok: boolean; messageAr: string }> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };

  const db = getDb();
  const asset = getVaultAsset(db, String(input.assetId ?? '').trim());
  if (!asset || asset.subscriberTenantId !== creatorId) {
    return { ok: false, messageAr: 'لا يوجد أصل بهذا المعرّف في خزانتك.' };
  }

  const accountId = String(input.accountId ?? '').trim();
  const binding = readAccountBinding(db, accountId, creatorId);
  if (!binding || binding.provider !== 'telegram-user') {
    return { ok: false, messageAr: 'لا توجد وجهة تيليجرام بهذا المعرّف في حسابك.' };
  }

  const messageId = String(input.providerMessageId ?? '').trim();
  // A session must not reach the receipt either — the Founder named
  // `distribution_receipts` explicitly among the places it may not enter.
  if (looksLikeTelegramSession(messageId)) {
    console.error('[telegram-user] refused: a session-shaped value reached the receipt');
    return { ok: false, messageAr: 'رُفِض التسجيل — وصل إلى الخادم ما لا يجوز أن يصله.' };
  }

  const failed = input.failureReason !== undefined;
  if (!failed && !/^\d+$/.test(messageId)) {
    // A Telegram message id is a positive integer. Anything else is not a
    // publication, and a receipt is never written for one.
    return { ok: false, messageAr: 'لم يصل معرّف رسالةٍ حقيقيّ — لم يُسجَّل نشر.' };
  }

  recordDistribution(db, {
    creatorId,
    sourceAssetId: asset.assetId,
    provider: 'telegram-user',
    accountId,
    providerTarget: peerFromAccountKey(binding.providerAccountId),
    providerMessageId: failed ? null : messageId,
    status: failed ? 'FAILED' : 'PUBLISHED',
    failureReason: input.failureReason ?? null,
  });

  if (!failed) markAccountUsed(db, accountId, creatorId);
  return failed
    ? { ok: true, messageAr: 'سُجِّل أنّ النشر لم يتمّ.' }
    : { ok: true, messageAr: 'نُشِر بحسابك، وسُجِّل الإيصال.' };
}
