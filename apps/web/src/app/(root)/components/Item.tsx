import { ItemAndBasicUserBorrower } from '../../../types/types';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { useBasicAuth } from '../../../hooks/useBasicAuth';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../components/ui/dialog';

type ItemProps = {
  item: ItemAndBasicUserBorrower;
  allowCheckInOut: boolean;
  onCheckOut: () => void;
  onReturn: () => void;
};

export function Item({ item, allowCheckInOut, onCheckOut, onReturn }: ItemProps) {
  const { basicUser } = useBasicAuth();
  const isSaving = item.id === -1;

  const returnButton = (
    <Button size="xs" variant="outline" onClick={onReturn}>
      Return
    </Button>
  );

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden w-fit">
      <div className="w-72 h-32 bg-linear-to-br from-primary to-primary/50">
        {/* image of item goes here */}
      </div>
      <div className="py-2 px-3">
        <div className="flex gap-4 justify-between items-center">
          <h1 className="font-medium text-lg">{item.name}</h1>
          <div className="flex items-center justify-between pt-2">
            {isSaving ? (
              <LoadingSpinner />
            ) : !allowCheckInOut ? null : item.status === 'available' ? (
              <Button size="xs" onClick={onCheckOut}>
                Check out
              </Button>
            ) : item.status === 'booked' ? (
              item.borrower === basicUser?.id ? (
                returnButton
              ) : (
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button size="xs" variant="outline">
                        Return
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure you want to return?</DialogTitle>
                      <DialogDescription>You are not the borrower of this item</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4">
                      <DialogClose
                        render={
                          <Button className="flex-1" variant="outline">
                            Cancel
                          </Button>
                        }
                      />
                      <Button onClick={onReturn} className="flex-1">
                        Yes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )
            ) : (
              item.status === 'out_of_service' && (
                <span className="text-sm text-muted-foreground">Out of service</span>
              )
            )}
          </div>
        </div>
        <p className="text-sm">{item.description}</p>
      </div>
    </div>
  );
}
