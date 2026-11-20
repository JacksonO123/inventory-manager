import { tsrFactory } from '../../../server/tsr-factory';
import { ErrorCardPage } from '../../../components/ErrorCardPage';
import { PageContentWrapper } from '../../../components/PageContentWrapper';
import { PageHeader } from '../../../components/PageHeader';
import { AdminContents } from './components/admin/AdminContents';
import { redirect } from 'next/navigation';
import { SuperAdminPage } from './components/super-admin/SuperAdminPage';
import { PageWrapper } from '../../../components/PageWrapper';
import { SuperAdminSidebar } from './components/super-admin/SuperAdminSidebar';
import { AdminSidebar } from './components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

type OrgPageProps = {
  params: Promise<{ org: string }>;
};

export default async function OrgPage({ params }: OrgPageProps) {
  const { org: orgPath } = await params;
  const tsr = await tsrFactory();

  const [org, items, adminStatus] = await Promise.all([
    tsr.organizations.getByPath.query({ params: { path: orgPath } }),
    tsr.item.getItemsFromOrgPath.query({ params: { orgPath } }),
    tsr.user.getAdminStatus.query()
  ]);

  console.log(org);
  if (org.status !== 200) {
    return (
      <ErrorCardPage title="Error fetching organization">
        Failed fetch for org at <span className="font-mono">/org/{orgPath}</span>.
      </ErrorCardPage>
    );
  } else if (org.body.org === null) {
    return (
      <ErrorCardPage title="Organization not found">
        Organization does not exists at <span className="font-mono">/org/{orgPath}</span>.
      </ErrorCardPage>
    );
  }

  if (items.status !== 200) {
    return (
      <ErrorCardPage title="Error fetching items">
        There was an error looking up the items
      </ErrorCardPage>
    );
  }

  if (adminStatus.status !== 200) {
    return (
      <ErrorCardPage title="Error fetching admin status">
        There was an error while fetching your admin status
      </ErrorCardPage>
    );
  }

  if (!adminStatus.body.superAdmin && !adminStatus.body.admin) {
    redirect('/');
  }

  return (
    <PageWrapper>
      <PageHeader />
      <div className="flex-1 min-h-0 flex">
        {adminStatus.body.superAdmin ? (
          <SuperAdminSidebar current={orgPath} />
        ) : (
          adminStatus.body.admin && <AdminSidebar current={orgPath} />
        )}
        <PageContentWrapper>
          {adminStatus.body.superAdmin ? (
            <SuperAdminPage org={org.body.org} />
          ) : adminStatus.body.admin ? (
            <AdminContents org={org.body.org} items={items.body} />
          ) : (
            <></>
          )}
        </PageContentWrapper>
      </div>
    </PageWrapper>
  );
}
