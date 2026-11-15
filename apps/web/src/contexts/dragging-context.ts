import { createContext } from 'react';

type draggingContextType = {
  dragging: number | null;
  dragHoveringIndex: number | null;

  setDragging: (dragging: number | null) => void;
  setDragHoveringIndex: (dragHoveringIndex: number | null) => void;

  handleStartDragging: (index: number) => void;
  handleEndDragging: () => void;
  handleHover: (index: number) => void;
};

export const draggingContext = createContext<draggingContextType>({
  dragging: null,
  dragHoveringIndex: null,

  setDragging: () => {},
  setDragHoveringIndex: () => {},

  handleStartDragging: () => {},
  handleEndDragging: () => {},
  handleHover: () => {}
});
