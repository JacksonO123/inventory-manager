import { headers } from 'next/headers';
import { PageContentWrapper } from '../../components/PageContentWrapper';
import { PageHeader } from '../../components/PageHeader';
import { PageWrapper } from '../../components/PageWrapper';
import { Card, CardHeader, CardTitle } from '../../components/ui/card';
import { auth } from '../../server/auth';
import { tsrFactory } from '../../server/tsr-factory';
import { ErrorCardPage } from '../../components/ErrorCardPage';
import { SuperAdminPage } from './components/super-admin/SuperAdminPage';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Index() {
  const tsr = await tsrFactory();
  const [session, adminStatusRes] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    tsr.user.getAdminStatus.query()
  ]);

  if (session === null) {
    return (
      <PageWrapper>
        <PageHeader />
        <PageContentWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Sign in to get access to items and orgs</CardTitle>
            </CardHeader>
          </Card>
        </PageContentWrapper>
      </PageWrapper>
    );
  }

  if (adminStatusRes.status !== 200) {
    return (
      <ErrorCardPage title="Failed to fetch admin status">
        There was a problem requesting your admin status
      </ErrorCardPage>
    );
  }

  if (adminStatusRes.body.admin && !adminStatusRes.body.superAdmin) {
    redirect('/orgs');
  }

  return (
    <PageWrapper>
      <PageHeader />
      <SuperAdminPage />
    </PageWrapper>
  );
}
