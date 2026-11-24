'use client';

import { useEffect, useRef } from 'react';
import { useTabs } from '../hooks/use-tabs';
import { TabsContextProvider } from '../providers/TabsProvider';
import { cn } from 'cn';

type TabsProps = {
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
  tab?: string | null;
};

export function Tabs(props: TabsProps) {
  return <TabsContextProvider {...props} />;
}

type TabContentProps = {
  tab: string;
  children: React.ReactNode;
};

export function TabContent({ tab, children }: TabContentProps) {
  const { active } = useTabs();
  return <>{active === tab ? children : null}</>;
}

type TabGroupProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

export function TabGroup({ children, className, ref, ...others }: TabGroupProps) {
  const { styles, shouldAnimate } = useTabs();

  function computeStyles() {
    if (!styles) return {};
    return {
      left: `${styles.left}px`,
      width: `${styles.width}px`
    };
  }

  return (
    <div className={cn(className, 'p-0.75 bg-zinc-100 w-fit rounded-lg')} {...others} ref={ref}>
      <div className="flex relative gap-2 w-fit">
        {children}
        <div
          className={cn(
            'absolute z-10 bg-white h-full rounded-md shadow-md',
            shouldAnimate && 'duration-150'
          )}
          style={computeStyles()}
        />
      </div>
    </div>
  );
}

type TabProps = React.ComponentProps<'button'> & {
  value: string;
};

export function Tab({ value, className, ...props }: TabProps) {
  const { addTab, active, setStyles, setActive } = useTabs();
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    addTab(value);
  }, []);

  useEffect(() => {
    if (active === value && ref.current) {
      setStylesFromEl(ref.current);
    }
  }, [active, ref]);

  function setStylesFromEl(el: HTMLButtonElement) {
    const rect = el.getBoundingClientRect();
    setStyles({ left: el.offsetLeft, width: rect.width });
  }

  function handleClick(el: HTMLButtonElement) {
    setStylesFromEl(el);
    const rect = el.getBoundingClientRect();
    setActive(value, { left: el.offsetLeft, width: rect.width });
  }

  return (
    <button
      ref={ref}
      className={cn(
        'z-20 px-2 py-0.5 cursor-pointer text-foreground hover:text-foreground duration-150',
        active !== value && 'text-muted-foreground',
        className
      )}
      onClick={(e) => handleClick(e.currentTarget)}
      {...props}
    />
  );
}
