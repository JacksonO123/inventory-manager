import { tsrFactory } from '../../../../../server/tsr-factory';
import { InitItems } from '../../../../../stores/client-helpers/InitItems';
import { InitOrgs } from '../../../../../stores/client-helpers/InitOrgs';
import { Item, Org } from '../../../../../types/types';
import { extractBodyOrDefault } from '../../../../../utils/utils';
import { CalendarAndItemsTabGroup } from '../CalendarAndItemsTabGroup';

type AdminContentsProps = {
  org: Org;
};

export async function AdminPage({ org }: AdminContentsProps) {
  const tsr = await tsrFactory();
  const itemsRes = await tsr.organizations.getInfoForAdmin.query();
  const info = extractBodyOrDefault(itemsRes, []);
  const groupedItems = info.reduce(
    (acc, curr) => {
      acc[curr.org.id] = curr.items;
      return acc;
    },
    {} as Record<number, Item[]>
  );

  return (
    <>
      <InitItems items={groupedItems} />
      <InitOrgs orgs={info.map((entry) => entry.org)} />
      <CalendarAndItemsTabGroup org={org} />
    </>
  );
}
