import { RenderClientErrors } from '../../components/RenderClientErrors';
import { tsr } from '../../server/tsr';
import { Content } from './content';

export default async function Index() {
  const itemsRes = await tsr.item.getItems.query();

  return (
    <>
      <Content items={itemsRes.status === 200 ? itemsRes.body : []} />
      <RenderClientErrors errors={itemsRes.status === 500 ? [itemsRes.body.message] : []} />
    </>
  );
}
