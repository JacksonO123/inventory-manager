import { DragContextProvider } from '../providers/DragContextProvider';
import { useDragging } from '../hooks/use-dragging';
import { Fragment, useId } from 'react';

type DraggableItemsProps = {
  children: React.ReactElement[];
  dragGhost: React.ReactNode;
  positions: number[];
  wrapperClassName?: string;

  onReorder: (newPositions: number[]) => void;
};

export function DraggableItems({ positions, onReorder, ...props }: DraggableItemsProps) {
  return (
    <DragContextProvider positions={positions} onReorder={onReorder}>
      <DraggableItemsImpl {...props} />
    </DragContextProvider>
  );
}

function DraggableItemsImpl({
  children,
  dragGhost,
  wrapperClassName
}: Omit<DraggableItemsProps, 'positions' | 'onReorder'>) {
  const { dragging, dragHoveringIndex, handleHover } = useDragging();
  const dragImplId = useId();

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 w-full">
        {children.map((child, index) => (
          <Fragment key={`draggable-fragment-${index}-${dragImplId}`}>
            {index === dragHoveringIndex && <DragPlaceholder />}
            {index !== dragging && (
              <div className={wrapperClassName} onMouseEnter={() => handleHover(index)}>
                {child}
              </div>
            )}
          </Fragment>
        ))}
        {children.length > 0 && (dragHoveringIndex ?? -1) >= children.length && <DragPlaceholder />}
      </div>
      {dragGhost}
    </>
  );
}

function DragPlaceholder() {
  return <div className="h-42 w-92 rounded-md bg-primary/25" />;
}
