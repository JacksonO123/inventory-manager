import { PageContentWrapper } from '../../../../components/PageContentWrapper';
import { RenderClientErrors } from '../../../../components/RenderClientErrors';
import { tsrFactory } from '../../../../server/tsr-factory';
import { SuperAdminContent } from './content';
import { tsrErrorMessage } from '../../../../utils/utils';
import { InitOrgs } from '../../../../stores/client-helpers/InitOrgs';
import { InitOrgPositions } from '../../../../stores/client-helpers/InitOrgPositions';
import { Item } from '../../../../types/types';
import { InitItems } from '../../../../stores/client-helpers/InitItems';

export const dynamic = 'force-dynamic';

export async function SuperAdminPage() {
  const tsr = await tsrFactory();

  const errors: string[] = [];

  const [orgsRes, orgPositionsRes, itemsRes] = await Promise.all([
    tsr.organizations.getAll.query(),
    tsr.organizations.getPositions.query(),
    tsr.item.getAll.query()
  ]);

  if (orgsRes.status !== 200) {
    errors.push(tsrErrorMessage(orgsRes.body, 'Failed to fetch orgs'));
  }

  if (orgPositionsRes.status !== 200) {
    errors.push(tsrErrorMessage(orgPositionsRes.body, 'Failed to fetch org positions'));
  }

  const orgs = orgsRes.status === 200 ? orgsRes.body : [];
  const positions = orgPositionsRes.status === 200 ? orgPositionsRes.body : [];
  const items = itemsRes.status === 200 ? itemsRes.body : [];
  const groupedItems = items.reduce(
    (acc, curr) => {
      acc[curr.orgId] = curr.items;
      return acc;
    },
    {} as Record<number, Item[]>
  );

  return (
    <PageContentWrapper>
      <InitOrgs orgs={orgs} />
      <InitOrgPositions positions={positions} />
      <InitItems items={groupedItems} />

      <SuperAdminContent />
      <RenderClientErrors errors={errors} />
    </PageContentWrapper>
  );
}
