import { PageContentWrapper } from '../../../../components/PageContentWrapper';
import { RenderClientErrors } from '../../../../components/RenderClientErrors';
import { tsrFactory } from '../../../../server/tsr-factory';
import { Org } from '../../../../types/types';
import { SuperAdminContent } from './content';
import { tsrErrorMessage } from '../../../../utils/utils';

export const dynamic = 'force-dynamic';

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
    errors.push(tsrErrorMessage(orgsRes.body, 'Failed to fetch orgs'));
  }

  if (orgPositionsRes.status !== 200) {
    errors.push(tsrErrorMessage(orgPositionsRes.body, 'Failed to fetch org positions'));
  }

  if (orgsRes.status === 200 && orgPositionsRes.status === 200) {
    orgs = orgsRes.body;
    positions = orgPositionsRes.body;
  }

  return (
    <PageContentWrapper>
      <SuperAdminContent orgs={orgs} positions={positions} />
      <RenderClientErrors errors={errors} />
    </PageContentWrapper>
  );
}
