import { RenderClientErrors } from '../../../../components/RenderClientErrors';
import { tsrFactory } from '../../../../server/tsr-factory';
import { Org } from '../../../../types/types';
import { SuperAdminContent } from './content';

export async function SuperAdminPage() {
  const tsr = await tsrFactory();

  let orgs: Org[] = [];
  let positions: number[] = [];
  const errors: string[] = [];

  const [orgsRes, orgPositionsRes] = await Promise.all([
    tsr.organizations.getAll.query(),
    tsr.organizations.getPositions.query()
  ]);

  if (orgsRes.status !== 200) {
    errors.push(orgsRes.status === 500 ? orgsRes.body.message : 'Failed to fetch orgs');
  }

  if (orgPositionsRes.status !== 200) {
    errors.push(
      orgPositionsRes.status === 500
        ? orgPositionsRes.body.message
        : 'Failed to fetch org positions'
    );
  }

  if (orgsRes.status === 200 && orgPositionsRes.status === 200) {
    orgs = orgsRes.body;
    positions = orgPositionsRes.body;
  }

  return (
    <>
      <SuperAdminContent orgs={orgs} positions={positions} />
      <RenderClientErrors errors={errors} />
    </>
  );
}
