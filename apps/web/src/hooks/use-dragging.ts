import { useContext } from 'react';
import { draggingContext } from '../contexts/dragging-context';

export function useDragging() {
  const context = useContext(draggingContext);
  if (context === undefined) {
    throw new Error('Expected to be called in dragging context');
  }

  const { dragging, dragHoveringIndex, handleStartDragging, handleEndDragging, handleHover } =
    context;

  return {
    dragging,
    dragHoveringIndex,
    handleStartDragging,
    handleEndDragging,
    handleHover
  };
}
