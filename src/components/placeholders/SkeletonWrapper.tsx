import type { ReactNode } from 'react';
import { EmptyState } from '../ui/EmptyState';

type Props<T> = {
  children: ReactNode;
  data: T | undefined | null;
  isLoading: boolean;
  skeleton: ReactNode;
  message?: string;
  /** Optional element (e.g. a button) shown under the empty message */
  emptyAction?: ReactNode;
};

/** Shows the skeleton while loading, an empty state when there's no data, else children. */
export const SkeletonWrapper = <T extends object>({
  data,
  isLoading,
  skeleton,
  message = 'No data found',
  emptyAction,
  children
}: Props<T>) => {
  if (isLoading) return skeleton;

  const isEmpty =
    data == null ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);

  if (isEmpty) return <EmptyState title={message} action={emptyAction} />;

  return <div className="animate-fade-in">{children}</div>;
};
