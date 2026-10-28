import { useRouter, useRouterState } from '@tanstack/react-router';
import React from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { haptics } from '../shared/utils/haptics';

type Props = {
  title: string;
  children: React.ReactNode;
  description?: string;
  rightAction?: React.ReactNode;
};

/** Where "back" goes when the screen was opened directly (no history to pop). */
const getParentPath = (pathname: string) => {
  const withoutTx = pathname.replace(/\/transactions\/.*$/, '');
  if (withoutTx !== pathname) return withoutTx;
  const parent = pathname.replace(/\/+$/, '').split('/').slice(0, -1).join('/');
  return parent || '/';
};

/**
 * Screen pushed on top of a tab: sticky nav bar with back button and centred
 * title, then the page body. Used by every detail and form screen.
 */
export const PageLayout = ({ title, children, description, rightAction }: Props) => {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleBack = () => {
    haptics.selection();
    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      router.navigate({ to: getParentPath(pathname), replace: true });
    }
  };

  return (
    <div className="pb-2">
      <div className="app-bar sticky top-0 z-40 -mx-4 -mt-3 mb-4 border-b px-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-2">
        <div className="mx-auto grid h-11 max-w-lg grid-cols-[3rem_1fr_3rem] items-center">
          <button
            onClick={handleBack}
            className="icon-btn text-blue-600"
            type="button"
            aria-label="Go back"
          >
            <FiChevronLeft size={26} />
          </button>

          <div className="min-w-0 text-center">
            <h2 className="truncate text-[17px] leading-tight font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
            {description && (
              <p className="truncate text-xs font-medium text-slate-500">{description}</p>
            )}
          </div>

          <div className="flex justify-end">{rightAction}</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
};
