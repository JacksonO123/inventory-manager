import { tsrFactory } from '../../../server/tsrFactory';
import Content from './content';

export default async function ManageSuperAdminPage() {
  const tsr = await tsrFactory();

  const [initialSuperAdmins, initialAdmins] = await Promise.all([
    tsr.superAdmin.getAllWithEmail.query(),
    tsr.admin.getAllWithEmail.query()
  ]);

  return (
    <Content
      initialSuperAdmins={initialSuperAdmins.status === 200 ? initialSuperAdmins.body.admins : []}
      initialAdmins={initialAdmins.status === 200 ? initialAdmins.body.admins : []}
    />
  );
}
