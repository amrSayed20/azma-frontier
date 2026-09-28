/**
 * AZMA OS — where a Creator meets the price, 2026-09-28.
 *
 *   The gate carries none: «لا اريد ان تكون صفحه الاشتراكات والباقات (الميزان)
 *   فى بدايه دخول الزائر للمنصه — انها تظهر له عند طلب اجراء عمليه انتاجيه
 *   وتوجد فى نهايه المنصه».
 *
 *   And the pricing module imports the cost-truth table, so a `'use client'`
 *   import of it would publish provider rates in a bundle any visitor opens.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  creatorFacingPackages, SOVEREIGN_PACKAGES, BALANCE_NOTICES_AR, GIFT_BALANCE,
} from '../pricing/sovereign-value-balance';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const ARRIVAL = read('src/imperial-experience-engine/experiences/arrival/ArrivalExperience.tsx');
const CHAMBER = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');
const BALANCE = read('app/sovereign-balance/SovereignBalanceClient.tsx');

it('the projection carries what a Creator sees and nothing beneath it', () => {
  expect(creatorFacingPackages().map((p) => p.packageId))
    .toEqual(SOVEREIGN_PACKAGES.map((p) => p.packageId));
  expect(Object.keys(creatorFacingPackages()[0]!).sort())
    .toEqual(['balanceUnits', 'nameAr', 'packageId', 'priceEgp', 'validityAr']);
});

it.each([
  ['the gate', ARRIVAL],
  ['the Chamber', CHAMBER],
  ['the Balance surface', BALANCE],
])('%s never imports the cost truth', (_name, src) => {
  expect(src).toContain("'use client'");
  expect(src).not.toContain('sovereign-value-balance');
});

it('the gate carries no price at all', () => {
  expect(ARRIVAL).not.toContain('className="arrival-value"');
  expect(read('app/page.tsx')).not.toContain('creatorFacingPackages()');
});

it('the packages stand at the request to produce', () => {
  expect(CHAMBER).toContain('className="chamber-packages"');
  expect(read('app/qiyamah-chamber/page.tsx')).toContain('creatorFacingPackages()');
});

it('the end of the platform is at the foot of the Foyer', () => {
  const foyer = read('app/imperial-foyer/page.tsx');
  expect(foyer).toContain('href="/sovereign-balance"');
  expect(foyer).toContain('href="/policies"');
  expect(foyer.indexOf('foyer-chambers')).toBeLessThan(foyer.indexOf('foyer-ledger'));
});

it('no surface promises an ending, and none softens what did not change', () => {
  const joined = Object.values(BALANCE_NOTICES_AR).join(' ');
  expect(joined).toContain('رصيدك لا ينتهي');
  expect(joined).not.toContain('ثمانية وعشرون يوماً');
  // The Balance is still not cash, and still not a subscription.
  expect(joined).toContain('لا يُردّ الرصيد نقداً');
  expect(joined).toContain('وليس هذا اشتراكاً');
});

it('the gift is a discretion that names no amount', () => {
  expect(GIFT_BALANCE.isEntitlement).toBe(false);
  expect(GIFT_BALANCE.noticeAr).not.toMatch(/[0-9]/);
});

it('no surface calls الريادة’s composition a bonus or a discount', () => {
  // 1,200 EGP buys 16,670 units at the ordinary rate: nothing is given above
  // the price, so nothing may be advertised as given.
  for (const src of [ARRIVAL, CHAMBER, BALANCE]) {
    for (const claim of ['مكافأة', 'bonus', 'خصماً', 'مجاناً']) expect(src).not.toContain(claim);
  }
});
