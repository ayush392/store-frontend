import { FiInbox } from 'react-icons/fi';

type Props<T> = {
  children: React.ReactNode;
  data: T | undefined | null;
  isLoading: boolean;
  skeleton: React.ReactNode;
  message?: string;
};

export const SkeletonWrapper = <T extends object>({
  data,
  isLoading,
  skeleton,
  message = 'No data found',
  children
}: Props<T>) => {
  if (isLoading) return skeleton;

  // console.log({ skeletonData: data });

  const isEmpty =
    data == null ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.keys(data).length === 0);

  if (isEmpty)
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="flex items-center justify-center w-20 h-20 bg-surface-muted rounded-full">
          <FiInbox size={36} className="text-fg-muted" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-fg-secondary text-center">
          {message}
        </p>
      </div>
    );

  return children;
};
