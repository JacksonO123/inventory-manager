import { Org, Item as ItemType } from '../../../types/types';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import Link from 'next/link';

type ItemProps = {
  item: ItemType;
  org: Org;
  allowCheckInOut: boolean;
};

export function Item({ item, org, allowCheckInOut }: ItemProps) {
  const isSaving = item.id === -1;

  return (
    <Link href={`/item/${org.id}/${item.id}`}>
      <div className="flex flex-col border rounded-lg overflow-hidden w-fit max-w-72 duration-150 hover:scale-105">
        <div className="w-72 h-32 max-h-32 bg-linear-to-br from-primary to-primary/50">
          {/* image of item goes here */}
        </div>
        <div className="py-2 px-3">
          <div className="flex gap-4 justify-between items-center">
            <h1 className="font-medium text-lg text-ellipsis truncate" title={item.name}>
              {item.name}
            </h1>
            <div className="flex items-center justify-between">
              {isSaving ? (
                <LoadingSpinner />
              ) : !allowCheckInOut ? null : item.status === 'available' ? (
                // TODO - do this
                <Button size="xs">Check out</Button>
              ) : item.status === 'booked' ? (
                // TODO - do this
                <span>booked</span>
              ) : (
                item.status === 'out_of_service' && (
                  <span className="text-sm text-muted-foreground">Out of service</span>
                )
              )}
            </div>
          </div>
          <p className="text-sm text-ellipsis truncate" title={item.description ?? undefined}>
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
