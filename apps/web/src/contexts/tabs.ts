import { createContext } from 'react';

export type SelectorStyles = {
  left: number;
  width: number;
};

type TabsContextType = {
  tabs: string[];
  active: string | null;
  styles: SelectorStyles | null;
  shouldAnimate: boolean;

  addTab: (tab: string) => void;
  setStyles: (styles: SelectorStyles) => void;
  setActive: (tab: string, styles: SelectorStyles) => void;
};

export const tabsContext = createContext<TabsContextType>({
  tabs: [],
  active: null,
  styles: null,
  shouldAnimate: false,

  addTab: () => {},
  setStyles: () => {},
  setActive: () => {}
});
