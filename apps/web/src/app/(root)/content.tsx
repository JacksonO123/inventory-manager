'use client';

import { authClient } from '../../client/auth-client';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/button';

type ContentProps = {
  messages: { id: number; message: string }[];
};

export function Content({ messages }: ContentProps) {
  const session = authClient.useSession();

  return (
    <main>
      <Header>
        {session.isPending ? (
          <LoadingSpinner />
        ) : session.data ? (
          session.data.user.email
        ) : (
          <Button
            onClick={() =>
              authClient.signIn.social({
                provider: 'google',
                callbackURL: '/',
                errorCallbackURL: '/auth-error'
              })
            }
          >
            Sign In
          </Button>
        )}
      </Header>
      <div>start here ({messages.map((item) => item.message).join(', ')})</div>
      <div>
        {messages.length > 0 ? (
          <ul>
            {messages.map((item) => (
              <li key={item.id}>{item.message}</li>
            ))}
          </ul>
        ) : (
          <span>No messages</span>
        )}
      </div>
    </main>
  );
}
