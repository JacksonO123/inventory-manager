import { tsr } from '../../server/tsr';

export default async function Index() {
  const res = await tsr.debug.query();
  console.log(res);

  const messages = await tsr.messages.getMessages.query();

  return (
    <div>
      <div>start here ({res.status === 200 ? res.body : 'bad'})</div>
      <div>
        {messages.status === 200 ? (
          messages.body.length > 0 ? (
            <ul>
              {messages.body.map((item) => (
                <li key={item.id}>{item.message}</li>
              ))}
            </ul>
          ) : (
            <span>No messages</span>
          )
        ) : (
          <span>Error</span>
        )}
      </div>
    </div>
  );
}
