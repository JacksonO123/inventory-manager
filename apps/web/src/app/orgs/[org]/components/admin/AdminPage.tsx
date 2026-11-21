import { tsrFactory } from '../../../../../server/tsr-factory';
import { Org } from '../../../../../types/types';
import { CalendarAndItemsTabGroup } from '../CalendarAndItemsTabGroup';

type AdminContentsProps = {
  org: Org;
};

export async function AdminPage({ org }: AdminContentsProps) {
  const tsr = await tsrFactory();
  const items = await tsr.item.getItemsFromOrgPath.query({ params: { orgPath: org.path } });

  return <CalendarAndItemsTabGroup org={org} items={items.status === 200 ? items.body : []} />;
}
