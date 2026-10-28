import { Link } from '@tanstack/react-router';
import { FiDownload, FiUser } from 'react-icons/fi';
import { haptics } from '../shared/utils/haptics';
import { usePWAInstall } from '../shared/utils/pwa';

/** App bar shown on the top-level tab screens. */
export const Header = () => {
  const { isInstallable, triggerInstall } = usePWAInstall();

  return (
    <header
      className="app-bar sticky top-0 z-40 border-b px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-2"
      style={{ viewTransitionName: 'app-header' }}
    >
      <div className="mx-auto flex h-11 w-full max-w-lg items-center justify-between">
        <Link
          to="/"
          onClick={() => haptics.selection()}
          className="flex items-center gap-2.5 transition-transform active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 shadow-sm shadow-blue-500/25 ring-1 ring-blue-600/20">
            <span className="text-sm font-bold tracking-tight text-white">DB</span>
          </div>
          <div>
            <h1 className="text-base leading-none font-bold tracking-tight text-slate-900">
              Dukaan Book
            </h1>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">Store Manager</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {/* Install prompt while the app is open in a mobile browser */}
          {isInstallable && (
            <button
              onClick={() => {
                haptics.medium();
                triggerInstall();
              }}
              type="button"
              className="btn btn-sm btn-tinted"
            >
              <FiDownload size={13} />
              Install
            </button>
          )}

          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200/80"
            aria-label="Admin account"
            role="img"
          >
            <FiUser size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};
