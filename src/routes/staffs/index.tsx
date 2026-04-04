import type { AttendanceType, BulkAttendance } from '@store/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FiCheck, FiClock, FiDollarSign, FiX } from 'react-icons/fi';
import { fetcher } from '../../lib/fetcher';
import { notifyError, notifySuccess } from '../../lib/toast';
import { formatAmount, formatEnum } from '../../shared/format';
import type { Staff } from '../../shared/types';

export const Route = createFileRoute('/staffs/')({
  component: StaffsPage
});

function StaffsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['staffs'],
    queryFn: () => fetcher<Staff[]>('/staff')
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BulkAttendance) =>
      fetcher('/staff/attendance/bulk', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      notifySuccess('Attendance updated');
      setSelectedStaffs(new Set());
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const [selectedStaffs, setSelectedStaffs] = useState<Set<string>>(new Set());

  const getStatusColor = (status: AttendanceType) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'HALF':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (isLoading) return <div>Loading</div>;
  if (error) {
    console.log(setSelectedStaffs); //Remove it;
    console.log(error);
    return <div>{error.message}</div>;
  }
  if (!data) return <div>No staff found!</div>;

  return (
    <div className="">
      {/* Header with bulk actions */}
      {selectedStaffs.size > 0 && (
        <div className="flex items-center space-x-2 pb-4">
          <span className="text-sm text-gray-600">
            {selectedStaffs.size} selected
          </span>
          <div className="flex space-x-2">
            <button
              disabled={isPending}
              onClick={() => handleBulkAttendance('PRESENT')}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 disabled:opacity-60"
            >
              <FiCheck size={14} />
              <span>Present</span>
            </button>
            <button
              disabled={isPending}
              onClick={() => handleBulkAttendance('ABSENT')}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 disabled:opacity-60"
            >
              <FiX size={14} />
              <span>Absent</span>
            </button>
            <button
              disabled={isPending}
              onClick={() => handleBulkAttendance('HALF')}
              className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 disabled:opacity-60"
            >
              <FiClock size={14} />
              <span>Half Day</span>
            </button>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Staffs</h3>
            <button
              onClick={() => handleSelectStaff('all')}
              className="text-sm text-blue-600 font-medium"
            >
              {selectedStaffs.size === data.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {data.map((staff) => {
            const isSelected = selectedStaffs.has(staff.employmentId);

            return (
              <div
                key={staff.employmentId}
                className={`p-4 border-b border-gray-100 last:border-b-0 ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectStaff('', staff.employmentId)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    {/* Staff Card Content */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Link
                          to="/staffs/$staffId"
                          params={{ staffId: staff.account._id }}
                          className="flex-1"
                        >
                          <div className="font-semibold text-gray-800 text-left hover:text-blue-600 transition-colors ">
                            {staff.account.name}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                staff.status
                              )}`}
                            >
                              {formatEnum(staff.status) || 'None'}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                              {staff.salaryType === 'DAILY'
                                ? `${formatAmount(staff.salary)}/day`
                                : 'Monthly'}
                            </span>
                          </div>
                        </Link>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Due</div>
                          <div
                            className={`font-bold text-sm ${
                              staff.account.currentOutstanding > 0
                                ? 'text-red-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {formatAmount(staff.account.currentOutstanding)}
                          </div>
                        </div>

                        {/* Pay Button */}
                        <Link
                          to="/staffs/$staffId/transactions/new"
                          params={{ staffId: staff.account._id }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
                        >
                          <FiDollarSign size={14} />
                          <span>Pay</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
