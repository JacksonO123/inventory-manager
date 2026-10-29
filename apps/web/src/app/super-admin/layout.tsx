'server only';

import { redirect } from 'next/navigation';
import { auth } from '../../server/auth';
import { headers } from 'next/headers';
import { tsrFactory } from '../../server/tsrFactory';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session === null) {
    redirect('/');
  }

  const tsr = await tsrFactory();
  const isSuperAdminRes = await tsr.superAdmin.isSuperAdmin.mutate({
    body: { id: session.user.id }
  });
  if (isSuperAdminRes.status !== 200 || !isSuperAdminRes.body.isAdmin) {
    redirect('/');
  }

  return children;
}
