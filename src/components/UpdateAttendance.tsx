import type { AttendanceType } from '@store/schemas';
import { useState, type JSX } from 'react';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { formatDate, formatEnum } from '../shared/format';

const statusColors: Record<
  AttendanceType,
  { bg: string; text: string; label: string }
> = {
  PRESENT: { bg: 'bg-green-200', text: 'text-green-800', label: 'Present' },
  ABSENT: { bg: 'bg-red-200', text: 'text-red-800', label: 'Absent' },
  HALF: { bg: 'bg-yellow-200', text: 'text-yellow-800', label: 'Half Day' }
};

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
    { type: 'PRESENT', icon: <FiCheckCircle size={20} /> },
    { type: 'ABSENT', icon: <FiXCircle size={20} /> },
    { type: 'HALF', icon: <FiClock size={20} /> }
  ];

  return (
    <div className="p-4 space-y-8">
      <p className="text-gray-700 text-center font-medium text-lg">
        Mark attendance for{' '}
        <span className="font-semibold">{formatDate(selectedDate)}</span>
      </p>

      <div className="grid grid-cols-3 gap-6">
        {options.map(({ type, icon }) => {
          const isSelected = status === type;
          const color = statusColors[type];
          return (
            <button
              key={type}
              onClick={() => setStatus(type)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-transform active:scale-95 shadow-md ${
                isSelected
                  ? `${color.bg} ${color.text}`
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="mb-1">{icon}</div>
              {color.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => status && onSave(status)}
        disabled={currentStatus === status || isLoading}
        className={`w-full py-3 rounded-lg font-semibold transition-colors bg-blue-600 text-white active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
      >
        {isLoading
          ? 'Saving...'
          : status
            ? 'Mark as ' + formatEnum(status)
            : 'Save'}
      </button>
    </div>
  );
}
