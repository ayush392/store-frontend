import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FiInbox } from 'react-icons/fi';

type Props = {
  title: string;
  description?: string;
  icon?: IconType;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, icon: Icon = FiInbox, action }: Props) => (
  <div className="flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Icon size={28} />
    </div>
    <h3 className="text-[15px] font-semibold text-slate-700">{title}</h3>
    {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
