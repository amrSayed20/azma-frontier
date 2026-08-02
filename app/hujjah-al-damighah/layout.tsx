import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/src/authentication';

export default async function HujjahAlDamighahLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const sessionId = jar.get('azma_session')?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) redirect('/login');
  return <>{children}</>;
}
