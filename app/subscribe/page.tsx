import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { CREDIT_PACKS } from '@/src/economy/payment/credit-packs';
import { SubscribeForm } from './SubscribeForm';

export default async function SubscribePage() {
  const locale = await resolveRequestLocale();
  // Only what the picker shows; amounts are re-derived server-side at checkout.
  const packs = CREDIT_PACKS.map(({ packId, displayName, azmaUnits, priceEgp }) => ({ packId, displayName, azmaUnits, priceEgp }));
  return <SubscribeForm dict={getDictionary(locale)} packs={packs} />;
}
