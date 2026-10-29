import { useState, type JSX } from 'react';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { formatDate } from '../shared/format';
import type { AttendanceType } from '../shared/schemas/staff.schema';
import {
  attendanceStatus,
  unmarkedAttendanceClassName
} from '../shared/attendance';
import { Button } from './Button';

type UpdateAttendanceProps = {
  selectedDate: string;
  currentStatus: AttendanceType | undefined;
  onSave: (status: AttendanceType) => void;
  isLoading: boolean;
};

export function UpdateAttendance({
  selectedDate,
  currentStatus,
  onSave,
  isLoading
}: UpdateAttendanceProps) {
  const [status, setStatus] = useState<AttendanceType | undefined>(
    currentStatus
  );

  const options: Array<{ type: AttendanceType; icon: JSX.Element }> = [
    { type: 'PRESENT', icon: <FiCheckCircle size={20} aria-hidden="true" /> },
    { type: 'ABSENT', icon: <FiXCircle size={20} aria-hidden="true" /> },
    { type: 'HALF', icon: <FiClock size={20} aria-hidden="true" /> }
  ];

  return (
    <div className="p-4 space-y-8">
      <p className="text-fg text-center font-medium text-lg">
        Mark attendance for{' '}
        <span className="font-semibold">{formatDate(selectedDate)}</span>
      </p>

      <div className="grid grid-cols-3 gap-6">
        {options.map(({ type, icon }) => {
          const isSelected = status === type;
          const { label, className } = attendanceStatus[type];
          return (
            <button
              key={type}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setStatus(type)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-transform active:scale-95 ${
                isSelected
                  ? `${className} ring-2 ring-inset ring-current`
                  : unmarkedAttendanceClassName
              }`}
            >
              <div className="mb-1">{icon}</div>
              {label}
            </button>
          );
        })}
      </div>

      <Button
        fullWidth
        onClick={() => status && onSave(status)}
        disabled={!status || currentStatus === status || isLoading}
      >
        {isLoading
          ? 'Saving...'
          : status
            ? 'Mark as ' + attendanceStatus[status].label
            : 'Save'}
      </Button>
    </div>
  );
}
