import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { MdCurrencyRupee } from 'react-icons/md';
import { formatAmount } from '../shared/format';
import type { AccountType } from '../shared/schemas/account.schema';
import { haptics } from '../shared/utils/haptics';
import { Avatar } from './ui/Avatar';

type Props = {
  name: string;
  accountType: AccountType;
  due: number;
  detailLink: string;
  payLink: string;
  /** Secondary line under the name */
  subtitle?: ReactNode;
  /** Replaces the avatar (e.g. a selection circle) */
  leading?: ReactNode;
  selected?: boolean;
};

/** Standard account list row: avatar · name · due amount · Pay. Used by every account list. */
export const AccountRow = ({
  name,
  accountType,
  due,
  detailLink,
  payLink,
  subtitle,
  leading,
  selected = false
}: Props) => (
  <div
    className={`flex items-center gap-3 transition-colors ${selected ? 'bg-blue-50/70' : ''}`}
  >
    <Link
      to={detailLink}
      onClick={() => haptics.selection()}
      className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4 transition-colors active:bg-slate-100"
    >
      {leading ?? <Avatar name={name} accountType={accountType} />}

      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
          {name}
        </div>
        {subtitle && <div className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</div>}
      </div>

      <div className="shrink-0 text-right">
        <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Due</div>
        <div
          className={`text-sm font-bold tracking-tight tabular-nums ${
            due > 0 ? 'text-rose-600' : 'text-slate-400'
          }`}
        >
          {formatAmount(due)}
        </div>
      </div>
    </Link>

    <Link
      to={payLink}
      onClick={() => haptics.medium()}
      className="btn btn-sm btn-success mr-4"
      aria-label={`Record payment for ${name}`}
    >
      <MdCurrencyRupee size={14} />
      Pay
    </Link>
  </div>
);
