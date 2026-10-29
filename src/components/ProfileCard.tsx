import { FiEdit3 } from 'react-icons/fi';
import { Link } from '@tanstack/react-router';
import { formatAmount, formatDate } from '../shared/format';
import { accountEditLink } from '../shared/accountLinks';
import { getBalanceDisplay } from '../shared/balance';
import type { Account, Employment } from '../shared/types';

type Props = {
  profile: Account;
  employment?: Employment[] | undefined;
};

export const ProfileCard = ({ profile, employment }: Props) => {
  const balance = getBalanceDisplay(
    profile.accountType,
    profile.currentOutstanding
  );
  const job = employment?.[0];
  const initial = profile.name.trim().charAt(0).toUpperCase();

  return (
    <section className="rounded-xl bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary"
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-fg">
            {profile.name}
          </h2>
          {profile.displayName && (
            <p className="truncate text-sm text-fg-secondary">
              {profile.displayName}
            </p>
          )}
        </div>
        <Link
          {...accountEditLink(profile.accountType, profile._id)}
          aria-label="Edit profile"
          className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary active:bg-primary-soft"
        >
          <FiEdit3 size={20} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 rounded-lg bg-surface-muted px-4 py-3">
        <p className="text-sm text-fg-secondary">{balance.label}</p>
        <p
          className={`text-2xl font-semibold tabular-nums ${balance.className}`}
        >
          {balance.amount}
        </p>
      </div>

      <dl className="mt-2 divide-y divide-line text-sm">
        <Row label="Phone">
          <span className="tabular-nums">{profile.phone}</span>
        </Row>
        <Row label="Address">{profile.address}</Row>
        {profile.notes && <Row label="Notes">{profile.notes}</Row>}
        {job && (
          <>
            <Row label="Salary">
              <span className="tabular-nums">
                {formatAmount(job.salary)}/
                {job.salaryType === 'DAILY' ? 'day' : 'month'}
              </span>
            </Row>
            <Row label="Joining date">{formatDate(job.joinDate)}</Row>
          </>
        )}
      </dl>
    </section>
  );
};

const Row = ({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex justify-between gap-4 py-2.5">
    <dt className="shrink-0 text-fg-secondary">{label}</dt>
    <dd className="min-w-0 text-right font-medium break-words text-fg">
      {children}
    </dd>
  </div>
);
