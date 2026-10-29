import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

type Props = {
  title: string;
  children: React.ReactNode;
  description?: string;
};

export const PageLayout = ({ title, children, description }: Props) => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.history.back();
            } else {
              router.navigate({ to: '/' });
            }
          }}
          aria-label="Back"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-fg-secondary active:bg-surface-muted"
          type="button"
        >
          <FiArrowLeft size={22} aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-fg">{title}</h1>

          {description && (
            <p className="text-sm text-fg-secondary">{description}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
