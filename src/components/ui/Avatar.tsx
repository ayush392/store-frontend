import type { AccountType } from '../../shared/schemas/account.schema';
import { accountTone } from '../../shared/theme';

type Props = {
  name?: string;
  accountType?: AccountType;
  size?: 'md' | 'lg';
};

const sizes = {
  md: 'h-10 w-10 rounded-xl text-sm',
  lg: 'h-14 w-14 rounded-2xl text-xl'
};

/** Initial-letter avatar tinted by account type. */
export const Avatar = ({ name, accountType, size = 'md' }: Props) => {
  const initial = name?.trim().charAt(0).toUpperCase() || '?';
  const tone = accountType
    ? accountTone[accountType]
    : 'bg-slate-100 text-slate-600 ring-slate-200';

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center font-bold ring-1 ${sizes[size]} ${tone}`}
    >
      {initial}
    </div>
  );
};
