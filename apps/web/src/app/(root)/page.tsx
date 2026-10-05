import { tsr } from '../../server/tsr';
import { Content } from './content';

export default async function Index() {
  const res = await tsr.debug.query();
  console.log(res);

  const messages = await tsr.messages.getMessages.query();

  return <Content messages={messages.status === 200 ? messages.body : []} />;
}
