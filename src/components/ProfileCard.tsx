import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { FiEdit3, FiPhone } from 'react-icons/fi';
import { formatAmount, formatDate } from '../shared/format';
import type { Account, Employment } from '../shared/types';
import { haptics } from '../shared/utils/haptics';
import { Avatar } from './ui/Avatar';

type Props = {
  profile: Account;
  employment?: Employment[] | undefined;
};

const getEditLink = (profile: Account) => {
  switch (profile.accountType) {
    case 'STAFF':
      return { to: '/staffs/$staffId/edit', params: { staffId: profile._id } } as const;
    case 'CUSTOMER':
      return { to: '/customers/$customerId/edit', params: { customerId: profile._id } } as const;
    case 'STORE':
      return { to: '/stores/$storeId/edit', params: { storeId: profile._id } } as const;
  }
};

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="shrink-0 text-[13px] font-medium text-slate-500">{label}</span>
    <span className="selectable-text min-w-0 text-right text-sm font-semibold break-words text-slate-800">
      {children}
    </span>
  </div>
);

export const ProfileCard = ({ profile, employment }: Props) => {
  const job = employment?.[0];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3.5">
        <Avatar name={profile.name} accountType={profile.accountType} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold tracking-tight text-slate-900">
            {profile.name}
          </h3>
          {profile.displayName && (
            <p className="truncate text-[13px] font-medium text-slate-500">{profile.displayName}</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={`tel:${profile.phone}`}
          onClick={() => haptics.light()}
          className="btn btn-md btn-tinted"
        >
          <FiPhone size={15} />
          Call
        </a>
        <Link
          {...getEditLink(profile)}
          onClick={() => haptics.selection()}
          className="btn btn-md btn-neutral"
        >
          <FiEdit3 size={15} />
          Edit
        </Link>
      </div>

      {/* Balance */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
        <span className="text-[13px] font-semibold text-slate-500">Current due</span>
        <span
          className={`text-xl font-extrabold tracking-tight tabular-nums ${
            profile.currentOutstanding > 0 ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          {formatAmount(profile.currentOutstanding)}
        </span>
      </div>

      <div className="mt-1 divide-y divide-slate-100">
        <DetailRow label="Phone">{profile.phone}</DetailRow>
        {profile.address && <DetailRow label="Address">{profile.address}</DetailRow>}
        {profile.notes && <DetailRow label="Notes">{profile.notes}</DetailRow>}
        {job && (
          <>
            <DetailRow label="Salary">
              <span className="tabular-nums">
                {formatAmount(job.salary)} / {job.salaryType === 'DAILY' ? 'day' : 'month'}
              </span>
            </DetailRow>
            <DetailRow label="Joined">{formatDate(job.joinDate)}</DetailRow>
          </>
        )}
      </div>
    </div>
  );
};
