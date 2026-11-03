import { Button } from '../../../components/ui/button';
import { BasicUser } from '../../../types/types';

type BorrowerProps = {
  borrower: BasicUser | null;
  onChange: () => void;
};

export function Borrower({ borrower, onChange }: BorrowerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">
        {borrower === null ? (
          'No borrower selected'
        ) : (
          <>
            Borrowing as <span className="font-medium">{borrower.name}</span> ({borrower.email})
          </>
        )}
      </span>
      <Button size="sm" variant="outline" onClick={onChange}>
        {borrower === null ? 'Select borrower' : 'Change borrower'}
      </Button>
    </div>
  );
}
