import { tsrFactory } from '../../server/tsrFactory';
import { SuperAdminPageContent } from './content';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const tsr = await tsrFactory();
  const orgs = await tsr.orgRouter.getAll.query();

  return <SuperAdminPageContent orgs={orgs.status === 200 ? orgs.body : []} />;
}
