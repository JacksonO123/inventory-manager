import { useCallback, useEffect, useRef, useState } from 'react';
import { draggingContext } from '../contexts/dragging-context';

type DragContextProviderProps = {
  children: React.ReactNode | React.ReactNode[];
  positions: number[];

  onReorder: (newOrder: number[]) => void;
};

export function DragContextProvider({ positions, children, onReorder }: DragContextProviderProps) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragHoveringIndex, setDragHoveringIndex] = useState<number | null>(null);

  const draggingRef = useRef(dragging);
  draggingRef.current = dragging;

  const dragHoveringIndexRef = useRef(dragHoveringIndex);
  dragHoveringIndexRef.current = dragHoveringIndex;

  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  function handleSetDragging(dragging: number | null) {
    setDragging(dragging);
  }

  function handleSetDragHoveringIndex(dragHoveringIndex: number | null) {
    setDragHoveringIndex(dragHoveringIndex);
  }

  function handleStartDragging(index: number) {
    setDragging(index);
    setDragHoveringIndex(index);
  }

  const handleEndDragging = useCallback(() => {
    const dragging = draggingRef.current;
    const dragHoveringIndex = dragHoveringIndexRef.current;

    if (dragging !== null && dragHoveringIndex !== null) {
      const adjustedDragHoveringIndex =
        dragHoveringIndex > dragging ? dragHoveringIndex - 1 : dragHoveringIndex;

      if (dragging !== adjustedDragHoveringIndex) {
        const currentPositions = [...positionsRef.current];
        const temp = currentPositions[dragging]!;
        currentPositions[dragging] = currentPositions[adjustedDragHoveringIndex]!;
        currentPositions[adjustedDragHoveringIndex] = temp;
        onReorderRef.current(currentPositions);
      }
    }

    setDragging(null);
    setDragHoveringIndex(null);
  }, []);

  useEffect(() => {
    if (dragging === null) {
      return;
    }

    window.addEventListener('mouseup', handleEndDragging);
    return () => window.removeEventListener('mouseup', handleEndDragging);
  }, [dragging, handleEndDragging]);

  function handleHover(index: number) {
    const dragging = draggingRef.current;
    const dragHoveringIndex = dragHoveringIndexRef.current;
    if (dragging === null || dragHoveringIndex === null) {
      return;
    }

    if (index < dragHoveringIndex) {
      setDragHoveringIndex(index);
    } else {
      setDragHoveringIndex(index + 1);
    }
  }

  return (
    <draggingContext.Provider
      value={{
        dragging,
        dragHoveringIndex,
        setDragging: handleSetDragging,
        setDragHoveringIndex: handleSetDragHoveringIndex,
        handleStartDragging,
        handleEndDragging,
        handleHover
      }}
    >
      {children}
    </draggingContext.Provider>
  );
}
