import { Item, Org } from '../../../../../types/types';
import { ItemsManager } from '../ItemsManager.tsx';

type AdminContentsProps = {
  items: Item[];
  org: Org;
};

export function AdminContents(props: AdminContentsProps) {
  return <ItemsManager {...props} />;
}
