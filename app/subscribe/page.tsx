import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { SubscribeForm } from './SubscribeForm';

export default async function SubscribePage() {
  const locale = await resolveRequestLocale();
  return <SubscribeForm dict={getDictionary(locale)} />;
}
