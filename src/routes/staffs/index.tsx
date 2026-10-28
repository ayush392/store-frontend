import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FiCheck, FiClock, FiX } from 'react-icons/fi';
import { AccountRow } from '../../components/AccountRow';
import { FloatingButton } from '../../components/FloatingButton';
import { ListSkeleton } from '../../components/placeholders/ListSkeleton';
import { SkeletonWrapper } from '../../components/placeholders/SkeletonWrapper';
import { PullToRefresh } from '../../components/PullToRefresh';
import { SectionHeader } from '../../components/SectionHeader';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetcher } from '../../lib/fetcher';
import { notifyError, notifySuccess } from '../../lib/toast';
import { formatAmount } from '../../shared/format';
import type { AttendanceType, BulkAttendance } from '../../shared/schemas/staff.schema';
import { attendanceTheme, neutralChip } from '../../shared/theme';
import type { Staff } from '../../shared/types';
import { haptics } from '../../shared/utils/haptics';

export const Route = createFileRoute('/staffs/')({
  component: StaffsPage
});

const bulkActions: Array<{ status: AttendanceType; label: string; icon: typeof FiCheck; className: string }> = [
  { status: 'PRESENT', label: 'Present', icon: FiCheck, className: 'btn-success' },
  { status: 'ABSENT', label: 'Absent', icon: FiX, className: 'btn-danger' },
  { status: 'HALF', label: 'Half', icon: FiClock, className: 'btn-warning' }
];

/** iOS-style round selection indicator. */
const SelectionCircle = ({ checked }: { checked: boolean }) => (
  <span
    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
      checked ? 'scale-105 border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
    }`}
  >
    {checked && <FiCheck size={14} strokeWidth={3.5} />}
  </span>
);

function StaffsPage() {
  const queryClient = useQueryClient();
  const [selectedStaffs, setSelectedStaffs] = useState<Set<string>>(new Set());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['staffs'],
    queryFn: () => fetcher<Staff[]>('/staff')
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (attendanceData: BulkAttendance) =>
      fetcher('/staff/attendance/bulk', 'PATCH', attendanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notifySuccess('Attendance updated');
      haptics.success();
      setSelectedStaffs(new Set());
    },
    onError: (err) => {
      notifyError(err.message);
      haptics.error();
    }
  });

  const total = data?.length ?? 0;
  const allSelected = total > 0 && selectedStaffs.size === total;
  const isSelecting = selectedStaffs.size > 0;

  const toggleStaff = (id: string) => {
    haptics.selection();
    setSelectedStaffs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    haptics.selection();
    setSelectedStaffs(allSelected ? new Set() : new Set(data?.map((s) => s.employmentId)));
  };

  const handleBulkAttendance = (status: AttendanceType) => {
    haptics.medium();
    const staffData = data
      ?.filter((staff) => selectedStaffs.has(staff.employmentId))
      .map((staff) => ({
        accountId: staff.account._id,
        employmentId: staff.employmentId,
        status
      }));

    if (staffData && staffData.length > 0) mutate(staffData);
  };

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <PullToRefresh onRefresh={() => refetch()}>
      <div className="card-list">
        <SectionHeader
          title="Staff"
          count={data?.length}
          action={
            total > 0 && (
              <button type="button" onClick={toggleAll} className="btn btn-sm btn-tinted">
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            )
          }
        />

        <SkeletonWrapper<Staff[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton showButton />}
          data={data}
          message="No staff yet"
        >
          <div className="list-divider">
            {data?.map((staff) => {
              const isSelected = selectedStaffs.has(staff.employmentId);
              const theme = staff.status ? attendanceTheme[staff.status] : undefined;

              return (
                <div key={staff.employmentId} className="flex items-center">
                  {/* Selection toggle sits outside the row link so it doesn't navigate */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`Select ${staff.account.name}`}
                    onClick={() => toggleStaff(staff.employmentId)}
                    className={`flex h-full items-center self-stretch pr-1 pl-4 transition-colors ${
                      isSelected ? 'bg-blue-50/70' : 'active:bg-slate-100'
                    }`}
                  >
                    <SelectionCircle checked={isSelected} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <AccountRow
                      name={staff.account.name}
                      accountType="STAFF"
                      due={staff.account.currentOutstanding}
                      detailLink={`/staffs/${staff.account._id}`}
                      payLink={`/staffs/${staff.account._id}/transactions/new`}
                      selected={isSelected}
                      subtitle={
                        <span className="flex items-center gap-2">
                          <span className={`chip ${theme?.chip ?? neutralChip}`}>
                            {theme?.label ?? 'Not marked'}
                          </span>
                          <span className="font-medium text-slate-400">
                            {staff.salaryType === 'DAILY'
                              ? `${formatAmount(staff.salary)}/day`
                              : 'Monthly'}
                          </span>
                        </span>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SkeletonWrapper>
      </div>

      <FloatingButton link="/staffs/new" label="Staff" hidden={isSelecting} />
      {/* Extra room so the taller toolbar doesn't cover the last rows */}
      {isSelecting && <div aria-hidden="true" className="h-14" />}

      {/* Bulk attendance toolbar replaces the FAB while staff are selected */}
      {isSelecting && (
        <div
          role="toolbar"
          aria-label="Mark attendance for selected staff"
          className="card fixed right-3 bottom-[calc(var(--tab-bar-h)+0.75rem)] left-3 z-30 mx-auto max-w-lg p-2.5 shadow-lg animate-rise-in"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[13px] font-semibold text-slate-700">
              Mark {selectedStaffs.size} as
            </span>
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setSelectedStaffs(new Set());
              }}
              className="text-[13px] font-semibold text-blue-600"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {bulkActions.map(({ status, label, icon: Icon, className }) => (
              <button
                key={status}
                type="button"
                disabled={isPending}
                onClick={() => handleBulkAttendance(status)}
                className={`btn btn-md ${className}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </PullToRefresh>
  );
}
