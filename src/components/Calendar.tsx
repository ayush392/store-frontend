import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import { BottomSheet } from './BottomSheet';
import { UpdateAttendance } from './UpdateAttendance';

type AttendanceType = 'PRESENT' | 'ABSENT' | 'HALF';

type Attendance = {
  accountId: string;
  employmentId: string;
  date: string; // ISO string
  status: AttendanceType;
};

type Props = {
  accountId: string;
  employmentId: string | undefined;
};

const statusColors: Record<
  AttendanceType,
  { bg: string; text: string; label: string }
> = {
  PRESENT: { bg: 'bg-green-200', text: 'text-green-800', label: 'Present' },
  ABSENT: { bg: 'bg-red-200', text: 'text-red-800', label: 'Absent' },
  HALF: { bg: 'bg-yellow-200', text: 'text-yellow-800', label: 'Half Day' }
};

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

export const Calendar = ({ accountId, employmentId }: Props) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));

  const queryClient = useQueryClient();

  const { data: attendance = [] } = useQuery({
    queryKey: ['calendar', accountId, currentMonth, currentYear],
    queryFn: () =>
      fetcher<Attendance[]>(
        `/staff/${accountId}/attendance?month=${currentMonth + 1}&year=${currentYear}`
      ),
    staleTime: 10 * 60 * 1000
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Attendance) =>
      fetcher('/staff/attendance', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calendar', accountId, currentMonth, currentYear]
      });
      notifySuccess('Attendance updated');
      setIsOpen(false);
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const handleAttendanceUpdate = (newStatus: AttendanceType) => {
    const payload: Attendance = {
      employmentId: employmentId || '',
      accountId,
      date: selectedDate,
      status: newStatus
    };
    mutate(payload);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();

  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceType> = {};
    attendance.forEach((item) => {
      const d = new Date(item.date);
      const key = formatDateKey(d);
      map[key] = item.status;
    });
    return map;
  }, [attendance]);

  const counts = useMemo(() => {
    const count: Record<AttendanceType, number> = {
      PRESENT: 0,
      ABSENT: 0,
      HALF: 0
    };
    attendance.forEach((a) => {
      count[a.status]++;
    });
    return count;
  }, [attendance]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(formatDateKey(today));
  };

  const handleDateClick = (dateKey: string) => {
    setSelectedDate(dateKey);
    setIsOpen(true);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Month navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={prevMonth}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiChevronLeft size={20} />
          </button>

          <h3 className="text-lg font-semibold text-gray-800">
            {new Date(currentYear, currentMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric'
            })}
          </h3>

          <button
            onClick={nextMonth}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Today button */}
        <button
          onClick={jumpToToday}
          className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded-full hover:bg-blue-200 transition-colors text-sm sm:text-base"
        >
          Today
        </button>
      </div>

      <div className=" bg-gray-50 p-4 rounded-lg">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-4 text-center font-medium mb-4 text-gray-700 text-sm sm:text-base">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-3.5 text-center">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const dateObj = new Date(currentYear, currentMonth, i + 1);
            const dateKey = formatDateKey(dateObj);
            const status = attendanceMap[dateKey];

            const isSelected = selectedDate === dateKey;
            const bgColor = status ? statusColors[status].bg : 'bg-gray-200';
            const textColor = status
              ? statusColors[status].text
              : 'text-gray-800';
            const selectedClass = isSelected ? 'ring-2 ring-blue-500' : '';

            return (
              <div
                key={i}
                onClick={() => handleDateClick(dateKey)}
                className={`h-8 w-8 flex font-medium items-center justify-center rounded-full ${bgColor} ${textColor} ${selectedClass} text-sm sm:text-base`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {isOpen && selectedDate && (
        <BottomSheet
          title={`Update Attendance`}
          onClose={() => setIsOpen(false)}
        >
          <UpdateAttendance
            selectedDate={selectedDate}
            currentStatus={attendanceMap[selectedDate]}
            onSave={handleAttendanceUpdate}
            isLoading={isPending}
          />
        </BottomSheet>
      )}

      {/* Attendance legend and counts */}
      <div className="flex mt-4 items-center justify-around text-sm sm:text-base">
        {(['PRESENT', 'ABSENT', 'HALF'] as AttendanceType[]).map((status) => (
          <div key={status} className="flex items-center space-x-1">
            <span
              className={`h-4 w-4 rounded-full ${statusColors[status].bg}`}
            />
            <span className="text-gray-500 font-medium">
              {statusColors[status].label}: {counts[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
