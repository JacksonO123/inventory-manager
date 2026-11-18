import { useEffect, useState } from 'react';

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function setMousePosition(e: MouseEvent) {
    setPosition({ x: e.clientX, y: e.clientY });
  }

  useEffect(() => {
    document.addEventListener('mousemove', setMousePosition);

    return () => {
      document.removeEventListener('mousemove', setMousePosition);
    };
  }, []);

  return position;
}
