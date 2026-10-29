import { useState } from 'react';
import { SelectorStyles, tabsContext } from '../contexts/tabs';

type TabsContextProviderProps = {
  children: React.ReactNode | React.ReactNode[];
  onTabChange?: (tab: string) => void;
};

export function TabsContextProvider({ children, onTabChange }: TabsContextProviderProps) {
  const [tabs, setTabs] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [styles, setStyles] = useState<SelectorStyles | null>(null);

  function addTab(tab: string) {
    if (tabs.length === 0) {
      setActive((prev) => (prev ? prev : tab));
    }

    setTabs((prev) => [...prev, tab]);
  }

  function setActiveTab(tab: string, styles: SelectorStyles) {
    setStyles(styles);
    setActive(tab);
    onTabChange?.(tab);
  }

  return (
    <tabsContext.Provider
      value={{
        addTab,
        tabs,
        active,
        styles,
        setStyles,
        setActive: setActiveTab
      }}
    >
      {children}
    </tabsContext.Provider>
  );
}
