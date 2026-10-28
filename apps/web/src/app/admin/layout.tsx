'server only';

import { headers } from 'next/headers';
import { auth } from '../../server/auth';
import { tsr } from '../../server/tsr';
import { env } from '../../env';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (session === null) {
    redirect('/');
  }

  const isAdminRes = await tsr.admin.isAdmin.query({
    query: { id: session.user.id },
    extraHeaders: { authorization: env.SERVER_PROTECTED_KEY }
  });
  if (isAdminRes.status !== 200 || !isAdminRes.body.isAdmin) {
    redirect('/');
  }

  return children;
}
