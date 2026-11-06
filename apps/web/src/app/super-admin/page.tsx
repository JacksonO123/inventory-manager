import { tsrFactory } from '../../server/tsrFactory';
import { SuperAdminPageContent } from './content';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const tsr = await tsrFactory();
  const [orgs, positions] = await Promise.all([
    tsr.organizations.getAll.query(),
    tsr.organizations.getPositions.query()
  ]);

  return (
    <SuperAdminPageContent
      orgs={orgs.status === 200 ? orgs.body : []}
      positions={positions.status === 200 ? positions.body : []}
    />
  );
}
