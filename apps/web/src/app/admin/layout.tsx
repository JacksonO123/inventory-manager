'server only';

import { headers } from 'next/headers';
import { auth } from '../../server/auth';
import { tsr } from '../../server/tsr';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (session === null) {
    redirect('/');
  }

  const isAdminRes = await tsr.admin.isAdmin.mutate({
    body: { id: session.user.id }
  });
  if (isAdminRes.status !== 200 || !isAdminRes.body.isAdmin) {
    redirect('/');
  }

  return children;
}
