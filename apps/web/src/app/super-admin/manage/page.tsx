import { PageContentWrapper } from '../../../components/PageContentWrapper';
import { PageHeader } from '../../../components/PageHeader';
import { PageWrapper } from '../../../components/PageWrapper';
import { tsrFactory } from '../../../server/tsr-factory';
import Content from './content';

export default async function ManageSuperAdminPage() {
  const tsr = await tsrFactory();

  const [initialSuperAdmins, initialAdmins] = await Promise.all([
    tsr.superAdmin.getAllWithEmail.query(),
    tsr.admin.getAllWithEmail.query()
  ]);

  return (
    <PageWrapper>
      <PageHeader />
      <PageContentWrapper>
        <Content
          initialSuperAdmins={
            initialSuperAdmins.status === 200 ? initialSuperAdmins.body.admins : []
          }
          initialAdmins={initialAdmins.status === 200 ? initialAdmins.body.admins : []}
        />
      </PageContentWrapper>
    </PageWrapper>
  );
}
