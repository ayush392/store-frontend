import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FiCheck, FiClock, FiX } from 'react-icons/fi';
import { fetcher } from '../../lib/fetcher';
import { notifyError, notifySuccess } from '../../lib/toast';
import { formatAmount } from '../../shared/format';
import {
  attendanceStatus,
  unmarkedAttendanceClassName
} from '../../shared/attendance';
import { accountDetailLink, newTransactionLink } from '../../shared/accountLinks';
import { ErrorState } from '../../components/ErrorState';
import { Button } from '../../components/Button';
import { buttonClass } from '../../components/buttonClass';
import type { Staff } from '../../shared/types';
import { queryKeys } from '../../shared/queryKeys';
import type {
  AttendanceType,
  BulkAttendance
} from '../../shared/schemas/staff.schema';
import { ListSkeleton } from '../../components/placeholders/ListSkeleton';
import { SkeletonWrapper } from '../../components/placeholders/SkeletonWrapper';
import { FloatingButton } from '../../components/FloatingButton';

export const Route = createFileRoute('/staffs/')({
  component: StaffsPage
});

const bulkActions: Array<{ status: AttendanceType; icon: React.ReactNode }> = [
  { status: 'PRESENT', icon: <FiCheck size={16} aria-hidden="true" /> },
  { status: 'ABSENT', icon: <FiX size={16} aria-hidden="true" /> },
  { status: 'HALF', icon: <FiClock size={16} aria-hidden="true" /> }
];

function StaffsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountList('STAFF'),
    queryFn: () => fetcher<Staff[]>('/staff')
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BulkAttendance) =>
      fetcher('/staff/attendance/bulk', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountList('STAFF')
      });
      // Bulk marking writes today's attendance, which the calendars show too.
      queryClient.invalidateQueries({ queryKey: queryKeys.allCalendars() });
      notifySuccess('Attendance updated');
      setSelectedStaffs(new Set());
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const [selectedStaffs, setSelectedStaffs] = useState<Set<string>>(new Set());

  const handleSelectStaff = (type: 'all' | '', id?: string) => {
    setSelectedStaffs((prev) => {
      const newSet = new Set(prev);

      if (type === 'all') {
        if (newSet.size === data?.length || 0) {
          return new Set(); // clear all
        } else {
          data?.forEach((staff) => newSet.add(staff.employmentId));
        }
      } else if (id) {
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
      }

      return newSet;
    });
  };

  const handleBulkAttendance = (status: AttendanceType) => {
    const staffData = data
      ?.filter((staff) => selectedStaffs.has(staff.employmentId))
      .map((staff) => {
        return {
          accountId: staff.account._id,
          employmentId: staff.employmentId,
          status
        };
      });

    if (staffData && staffData.length > 0) mutate(staffData);
  };

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const selectedCount = selectedStaffs.size;
  const allSelected = !!data?.length && selectedCount === data.length;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line py-2 pl-4 pr-2">
          <h2 className="text-lg font-semibold text-fg">Staff</h2>
          {!!data?.length && (
            <Button
              variant="ghost"
              className="px-3 text-sm"
              onClick={() => handleSelectStaff('all')}
            >
              {allSelected ? 'Deselect all' : 'Select all'}
            </Button>
          )}
        </div>

        <SkeletonWrapper<Staff[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton showButton={true} />}
          data={data}
          message="No staff yet"
        >
          <ul className="divide-y divide-line">
            {data?.map((staff) => {
              const isSelected = selectedStaffs.has(staff.employmentId);
              const status = staff.status
                ? attendanceStatus[staff.status]
                : undefined;
              const due = staff.account.currentOutstanding;

              return (
                <li
                  key={staff.employmentId}
                  className={`flex items-center ${isSelected ? 'bg-primary-soft' : ''}`}
                >
                  {/* 44px tap area around the checkbox */}
                  <label className="flex h-14 w-12 shrink-0 cursor-pointer items-center justify-center pl-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectStaff('', staff.employmentId)}
                      aria-label={`Select ${staff.account.name}`}
                      className="h-5 w-5 rounded border-line-strong"
                    />
                  </label>

                  <Link
                    {...accountDetailLink('STAFF', staff.account._id)}
                    className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-2 active:bg-surface-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">
                        {staff.account.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            status?.className ?? unmarkedAttendanceClassName
                          }`}
                        >
                          {status?.label ?? 'Not marked'}
                        </span>
                        <span className="truncate text-xs font-medium text-fg-secondary">
                          {staff.salaryType === 'DAILY'
                            ? `${formatAmount(staff.salary)}/day`
                            : 'Monthly'}
                        </span>
                      </div>
                    </div>

                    {/* Staff balance labels are pending confirmation, so the
                        existing "Due" label and signed amount are kept. */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-fg-secondary">Due</p>
                      <p
                        className={`font-semibold tabular-nums ${
                          due > 0 ? 'text-outstanding' : 'text-fg-muted'
                        }`}
                      >
                        {formatAmount(due)}
                      </p>
                    </div>
                  </Link>

                  <div className="flex shrink-0 items-center pr-4">
                    <Link
                      {...newTransactionLink('STAFF', staff.account._id)}
                      aria-label={`Pay, ${staff.account.name}`}
                      className={buttonClass({
                        variant: 'secondary',
                        className: 'px-3'
                      })}
                    >
                      Pay
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </SkeletonWrapper>
      </section>

      {selectedCount > 0 ? (
        <>
          {/* Keeps the last row clear of the fixed bar. */}
          <div aria-hidden="true" className="h-28" />
          <div
            role="region"
            aria-label="Mark attendance for selected staff"
            className="fixed inset-x-0 z-40 px-4 bottom-[calc(4.5rem+1px+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]"
          >
            <div className="rounded-xl border border-line bg-surface p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <p aria-live="polite" className="text-sm font-medium text-fg">
                  {selectedCount} selected · today
                </p>
                <Button
                  variant="ghost"
                  className="-my-2 -mr-2 px-3 text-sm"
                  onClick={() => setSelectedStaffs(new Set())}
                  disabled={isPending}
                >
                  Clear
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {bulkActions.map(({ status, icon }) => (
                  <button
                    key={status}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleBulkAttendance(status)}
                    className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold active:opacity-80 disabled:opacity-60 ${attendanceStatus[status].className}`}
                  >
                    {icon}
                    {attendanceStatus[status].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <FloatingButton link="/staffs/new" label="Staff" />
      )}
    </div>
  );
}
