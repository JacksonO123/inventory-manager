'use client';

import { useEffect, useMemo, useRef } from 'react';
import { toast } from './ui/toast';

type RenderClientErrorsProps = {
  errors: string[];
};

export function RenderClientErrors({ errors }: RenderClientErrorsProps) {
  const memoErrors = useMemo(() => errors, []);
  const errorsRef = useRef(memoErrors);

  useEffect(() => {
    console.log(errors);
    setTimeout(() => {
      errorsRef.current.forEach((error) => {
        toast.add({
          title: error,
          type: 'error'
        });
      });
    }, 10);
  }, []);

  return null;
}
