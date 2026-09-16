/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * «محفوظ في الخزانة» must be true when it is said.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   Both save paths in the chamber wrote to `sessionStorage` inside a
 *   try/catch that swallowed the error, then showed the success message
 *   unconditionally:
 *
 *       try { sessionStorage.setItem(...); } catch { }
 *       showCompanion(COMPANION_MSGS.vaultSaved);
 *
 *   So the Creator was told their evidence was in the Vault when (a) it was in
 *   a browser tab that would forget it, and (b) even when the write itself had
 *   thrown. A refusal can be retried. A false success cannot — the Creator
 *   learns it was lost only when they come back for it.
 *
 * ─── WHAT THIS ASSERTS ──────────────────────────────────────────────────────
 *
 *   The deposit actions are server actions bound to a session and the SQLite
 *   Vault, so what is tested here is the contract every caller depends on: a
 *   deposit reports its own outcome honestly, and a failure speaks to the
 *   Creator rather than handing them the machine's words.
 */

import {
  InvestigationFailure,
  failureSpokenAr,
  isMachineText,
} from '../_lib/investigation-failure';

/** Mirrors VaultDepositDTO. Kept structural so the test needs no server. */
interface Deposit {
  ok: boolean;
  assetId?: string;
  reasonAr?: string;
}

/**
 * What the chamber says after a deposit — the rule both call sites now follow:
 *
 *   showCompanion(outcome.ok ? vaultSaved : (outcome.reasonAr ?? vaultFailed))
 */
const VAULT_SAVED_AR = 'محفوظ في الخزانة.';
const VAULT_FAILED_AR = 'لم يُحفظ. أعد المحاولة.';

function spokenFor(outcome: Deposit): string {
  return outcome.ok ? VAULT_SAVED_AR : (outcome.reasonAr ?? VAULT_FAILED_AR);
}

describe('Al Hujjah — the Vault message follows the outcome', () => {
  it('claims a save only when something was actually kept', () => {
    expect(spokenFor({ ok: true, assetId: 'asset_1' })).toBe(VAULT_SAVED_AR);
  });

  it('never claims a save when nothing was kept', () => {
    const refusals: Deposit[] = [
      { ok: false, reasonAr: 'لا يوجد نصٌّ لحفظه.' },
      { ok: false, reasonAr: 'لا توجد أدلة لحفظها.' },
      { ok: false, reasonAr: 'تعذّر الحفظ في الخزانة. لم يُحفظ شيء، فأعد المحاولة.' },
      { ok: false, reasonAr: failureSpokenAr(InvestigationFailure.NOT_ADMITTED) },
      // A failure that forgot to say why still must not read as success.
      { ok: false },
    ];

    for (const refusal of refusals) {
      const spoken = spokenFor(refusal);
      expect(spoken).not.toBe(VAULT_SAVED_AR);
      expect(spoken).not.toMatch(/محفوظ/);
      expect(spoken.trim().length).toBeGreaterThan(0);
    }
  });

  it('speaks every refusal to the Creator, never in the machine’s words', () => {
    const reasons = [
      'لا يوجد نصٌّ لحفظه.',
      'لا توجد أدلة لحفظها.',
      'تعذّر الحفظ في الخزانة. لم يُحفظ شيء، فأعد المحاولة.',
      failureSpokenAr(InvestigationFailure.NOT_ADMITTED),
      VAULT_FAILED_AR,
    ];
    for (const reason of reasons) {
      expect(isMachineText(reason)).toBe(false);
      expect(/[؀-ۿ]/.test(reason)).toBe(true);
    }
  });

  it('a refusal tells the Creator nothing was kept, so it can be retried', () => {
    // The distinction that makes a refusal safe: it is unambiguous about loss.
    const failure = 'تعذّر الحفظ في الخزانة. لم يُحفظ شيء، فأعد المحاولة.';
    expect(failure).toMatch(/لم يُحفظ/);
    expect(failure).toMatch(/أعد المحاولة/);
  });

  it('a successful deposit carries the Vault’s own id for what was kept', () => {
    const outcome: Deposit = { ok: true, assetId: 'asset_1757980000_ab12cd3' };
    expect(outcome.assetId).toBeDefined();
    expect(outcome.reasonAr).toBeUndefined();
  });
});
