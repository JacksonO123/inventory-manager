'use client';

import { useEffect } from 'react';
import { useOrgs } from '../orgs';
import { Org } from '../../types/types';

type InitOrgsProps = {
  orgs: Org[];
};

export function InitOrgs({ orgs }: InitOrgsProps) {
  const { setOrgs } = useOrgs();

  useEffect(() => {
    setOrgs(orgs);
  }, []);

  return null;
}
