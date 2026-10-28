import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { haptics } from '../../shared/utils/haptics';

type Props = {
  message?: string;
  onRetry?: () => void;
};

/** Inline error card with an optional retry action. */
export const ErrorState = ({ message = 'Something went wrong', onRetry }: Props) => (
  <div role="alert" className="card flex flex-col items-center px-6 py-10 text-center animate-fade-in">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
      <FiAlertCircle size={26} />
    </div>
    <h3 className="text-[15px] font-semibold text-slate-800">Couldn't load this</h3>
    <p className="mt-1 max-w-xs text-sm text-slate-500">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={() => {
          haptics.light();
          onRetry();
        }}
        className="btn btn-md btn-tinted mt-4"
      >
        <FiRefreshCw size={15} />
        Try again
      </button>
    )}
  </div>
);
