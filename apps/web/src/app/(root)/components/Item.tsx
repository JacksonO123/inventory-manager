import { Item as ItemType } from '../../../types/types';
import { Button } from '../../../components/ui/button';

type ItemProps = {
  item: ItemType;
  onCheckOut: (itemId: number) => void;
  onReturn: (itemId: number) => void;
};

export function Item({ item, onCheckOut, onReturn }: ItemProps) {
  const isSaving = item.id === -1;

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden w-fit hover:scale-102 duration-150 cursor-pointer">
      <div className="w-72 h-32 bg-linear-to-br from-primary to-primary/50">
        {/* image of item goes here */}
      </div>
      <div className="py-2 px-3">
        <div className="font-medium text-lg">{item.name}</div>
        <div className="text-sm">{item.description}</div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{item.status.replaceAll('_', ' ')}</span>
          {!isSaving && item.status === 'available' && (
            <Button size="sm" onClick={() => onCheckOut(item.id)}>
              Check out
            </Button>
          )}
          {!isSaving && item.status === 'booked' && (
            <Button size="sm" variant="outline" onClick={() => onReturn(item.id)}>
              Return
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
