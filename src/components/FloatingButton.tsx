import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FiPlus } from 'react-icons/fi';
import { haptics } from '../shared/utils/haptics';

type Props = {
  label: string;
  link: string;
  icon?: IconType;
  hidden?: boolean;
};

/** Collapses to icon-only while scrolling down, expands again on scroll up. */
const useCollapseOnScroll = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - lastY) > 8) {
          setCollapsed(y > lastY && y > 40);
          lastY = y;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return collapsed;
};

/* Extended Floating Action Button, pinned above the tab bar */
export const FloatingButton = ({ label, link, icon: Icon = FiPlus, hidden = false }: Props) => {
  const collapsed = useCollapseOnScroll();

  return (
    <>
      {/* Reserves room so the FAB never covers the last list row */}
      <div aria-hidden="true" className="h-16" />

      <Link
        to={link}
        onClick={() => haptics.medium()}
        aria-label={label}
        className={`fixed right-4 bottom-[calc(var(--tab-bar-h)+1rem)] z-30 flex h-14 items-center rounded-2xl bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition-all duration-200 ease-out select-none active:scale-95 active:bg-blue-700 ${
          collapsed ? 'w-14 justify-center px-0' : 'gap-2 px-5'
        } ${hidden ? 'pointer-events-none translate-y-24 opacity-0' : ''}`}
      >
        <Icon size={22} strokeWidth={2.5} className="shrink-0" />
        <span
          className={`overflow-hidden text-[15px] font-semibold whitespace-nowrap transition-all duration-200 ${
            collapsed ? 'max-w-0 opacity-0' : 'max-w-32 opacity-100'
          }`}
        >
          {label}
        </span>
      </Link>
    </>
  );
};
