'use client';

import { useEffect } from 'react';
import { useOrgPositions } from '../orgs';

type InitOrgPositionsProps = {
  positions: number[];
};

export function InitOrgPositions({ positions }: InitOrgPositionsProps) {
  const { setPositions } = useOrgPositions();

  useEffect(() => {
    setPositions(positions);
  }, []);

  return null;
}
