import { useEffect, useState } from 'react';
import { SelectorStyles, tabsContext } from '../contexts/tabs';

type TabsContextProviderProps = {
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
  tab?: string | null;
};

export function TabsContextProvider({
  children,
  onTabChange,
  tab: inputTab
}: TabsContextProviderProps) {
  const [tabs, setTabs] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [styles, setStyles] = useState<SelectorStyles | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (inputTab !== undefined && inputTab !== null && inputTab !== active) {
      setActive(inputTab);
      setShouldAnimate(styles !== null);
    }
  }, [inputTab]);

  function addTab(tab: string) {
    if (tabs.length === 0) {
      if (inputTab !== undefined && inputTab !== null) {
        setActive(inputTab);
      } else {
        setActive((prev) => (prev ? prev : tab));
      }
    }

    setTabs((prev) => [...prev, tab]);
  }

  function setActiveTab(tab: string, newStyles: SelectorStyles) {
    setStyles(newStyles);
    setActive(tab);
    setShouldAnimate(styles !== null);
    onTabChange?.(tab);
  }

  return (
    <tabsContext.Provider
      value={{
        tabs,
        active,
        styles,
        shouldAnimate,
        addTab,
        setStyles,
        setActive: setActiveTab
      }}
    >
      {children}
    </tabsContext.Provider>
  );
}
