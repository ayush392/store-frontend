import { useState, type JSX } from 'react';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { formatDate } from '../shared/format';
import type { AttendanceType } from '../shared/schemas/staff.schema';
import { attendanceTheme } from '../shared/theme';
import { haptics } from '../shared/utils/haptics';

type UpdateAttendanceProps = {
  selectedDate: string;
  currentStatus: AttendanceType | undefined;
  onSave: (status: AttendanceType) => void;
  isLoading: boolean;
};

const options: Array<{ type: AttendanceType; icon: JSX.Element }> = [
  { type: 'PRESENT', icon: <FiCheckCircle size={24} /> },
  { type: 'ABSENT', icon: <FiXCircle size={24} /> },
  { type: 'HALF', icon: <FiClock size={24} /> }
];

export function UpdateAttendance({
  selectedDate,
  currentStatus,
  onSave,
  isLoading
}: UpdateAttendanceProps) {
  const [status, setStatus] = useState<AttendanceType | undefined>(currentStatus);

  return (
    <div className="space-y-5 pt-1">
      <p className="text-center text-sm font-medium text-slate-500">
        Mark attendance for{' '}
        <span className="font-bold text-slate-900">{formatDate(selectedDate)}</span>
      </p>

      <div role="radiogroup" aria-label="Attendance status" className="grid grid-cols-3 gap-3">
        {options.map(({ type, icon }) => {
          const isSelected = status === type;
          const theme = attendanceTheme[type];
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                haptics.selection();
                setStatus(type);
              }}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 text-[13px] font-semibold transition active:scale-95 ${
                isSelected ? theme.selected : 'bg-slate-100 text-slate-600'
              }`}
            >
              {icon}
              {theme.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          if (status) {
            haptics.medium();
            onSave(status);
          }
        }}
        type="button"
        disabled={!status || currentStatus === status || isLoading}
        className="btn btn-lg btn-primary"
      >
        {isLoading ? 'Saving…' : status ? `Mark as ${attendanceTheme[status].label}` : 'Choose a status'}
      </button>
    </div>
  );
}
