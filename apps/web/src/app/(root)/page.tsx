import { tsr } from '../../server/tsr';

export default async function Index() {
  const res = await tsr.debug.query();
  console.log(res);

  return <div>start here ({res.status === 200 ? res.body : 'bad'})</div>;
}
