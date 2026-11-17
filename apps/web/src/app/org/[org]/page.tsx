import { tsrFactory } from '../../../server/tsrFactory';
import { OrgPageContent } from './content';
import { ErrorCardPage } from '../../../components/ErrorCardPage';

export const dynamic = 'force-dynamic';

type OrgPageProps = {
  params: Promise<{ org: string }>;
};

export default async function OrgPage({ params }: OrgPageProps) {
  const { org: orgPath } = await params;
  const tsr = await tsrFactory();

  const [org, items] = await Promise.all([
    tsr.organizations.getByPath.query({ params: { path: orgPath } }),
    tsr.item.getItemsFromOrgPath.query({ params: { orgPath } })
  ]);

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

  console.log(items);

  if (items.status !== 200) {
    return <ErrorCardPage title="Error fetching items">asdf</ErrorCardPage>;
  }

  return <OrgPageContent path={orgPath} org={org.body.org} items={items.body} />;
}
