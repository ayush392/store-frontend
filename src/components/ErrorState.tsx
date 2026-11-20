import { FiAlertCircle } from 'react-icons/fi';
import { Button } from './Button';

type Props = {
  error: Error;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export const ErrorState = ({ error, onRetry, isRetrying = false }: Props) => {
  // fetch() rejects with a TypeError when the network or server is unreachable.
  const network = error.name === 'TypeError';

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl bg-surface p-8 text-center shadow-sm"
    >
      <FiAlertCircle size={32} className="text-error" aria-hidden="true" />
      <div>
        <p className="text-base font-semibold text-fg">
          {network ? "Can't reach the server" : 'Something went wrong'}
        </p>
        <p className="mt-1 text-sm text-fg-secondary">
          {network
            ? 'Check your internet connection and try again.'
            : error.message}
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? 'Retrying...' : 'Try again'}
        </Button>
      )}
    </div>
  );
};
