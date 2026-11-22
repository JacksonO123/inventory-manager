'use client';

import { Item, Org } from '../../../../types/types';

type AdminContentProps = {
  orgInfo: {
    org: Org;
    items: Item[];
  }[];
};

export function AdminContent({ orgInfo }: AdminContentProps) {
  return <div className="w-full h-full"></div>;
}
