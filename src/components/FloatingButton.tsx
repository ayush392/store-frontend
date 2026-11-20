import { Link } from '@tanstack/react-router';
import { FiPlus } from 'react-icons/fi';

type Props = {
  label: string;
  link: string;
};

/* Floating Add Button */
export const FloatingButton = ({ label, link }: Props) => {
  return (
    <>
      {/* Keeps the last row of the page clear of the fixed button. Render the
          button as the last child of the page content. */}
      <div aria-hidden="true" className="h-20" />
      {/* bottom: footer height (72px) + 16px gap + the home-indicator inset */}
      <Link
        to={link}
        className="fixed right-[calc(1.25rem+env(safe-area-inset-right))] bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 text-base font-semibold text-on-primary shadow-lg transition-transform active:scale-95 active:bg-primary-pressed"
        aria-label={label}
      >
        <FiPlus size={20} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    </>
  );
};
