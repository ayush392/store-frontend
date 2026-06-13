import { Link } from '@tanstack/react-router';
import { FiPlus } from 'react-icons/fi';

type Props = {
  label: string;
  link: string;
};

/* Floating Add Button */
export const FloatingButton = ({ label, link }: Props) => {
  return (
    <Link
      to={link}
      className="fixed right-5 bottom-24 z-50 rounded-full bg-blue-600 text-white shadow-lg px-4 py-3 flex items-center gap-2 border border-blue-500/40 active:bg-blue-700 active:scale-95 transition-all"
      aria-label={label}
    >
      <FiPlus size={18} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
};
