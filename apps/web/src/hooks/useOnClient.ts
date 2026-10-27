import { useEffect, useState } from 'react';

export function useOnClient() {
  const [onClient, setOnClient] = useState(false);

  useEffect(() => {
    setOnClient(true);
  }, []);

  return onClient;
}
