import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import type { AttendanceType } from '../shared/schemas/staff.schema';
import { attendanceTheme } from '../shared/theme';
import { haptics } from '../shared/utils/haptics';
import { BottomSheet } from './BottomSheet';
import { UpdateAttendance } from './UpdateAttendance';

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

const STATUSES: AttendanceType[] = ['PRESENT', 'ABSENT', 'HALF'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

/** Monthly attendance grid. Tap a day to mark it; swipe sideways to change month. */
export const Calendar = ({ accountId, employmentId }: Props) => {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const swipeStartX = useRef<number | null>(null);

  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['calendar', accountId, currentMonth, currentYear],
    queryFn: () =>
      fetcher<Attendance[]>(
        `/staff/${accountId}/attendance?month=${currentMonth + 1}&year=${currentYear}`
      ),
    staleTime: 10 * 60 * 1000
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Attendance) => fetcher('/staff/attendance', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calendar', accountId, currentMonth, currentYear]
      });
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      notifySuccess('Attendance updated');
      haptics.success();
      setIsOpen(false);
    },
    onError: (error) => {
      notifyError(error.message);
      haptics.error();
    }
  });

  const handleAttendanceUpdate = (newStatus: AttendanceType) => {
    if (!employmentId) {
      notifyError('Employment ID is required to update attendance');
      return;
    }
    mutate({ employmentId, accountId, date: selectedDate, status: newStatus });
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const isCurrentMonth =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceType> = {};
    attendance.forEach((item) => {
      map[formatDateKey(new Date(item.date))] = item.status;
    });
    return map;
  }, [attendance]);

  const counts = useMemo(() => {
    const count: Record<AttendanceType, number> = { PRESENT: 0, ABSENT: 0, HALF: 0 };
    attendance.forEach((a) => count[a.status]++);
    return count;
  }, [attendance]);

  const shiftMonth = (delta: 1 | -1) => {
    haptics.selection();
    const next = new Date(currentYear, currentMonth + delta, 1);
    setCurrentMonth(next.getMonth());
    setCurrentYear(next.getFullYear());
  };

  const jumpToToday = () => {
    haptics.selection();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayKey);
  };

  const handleDateClick = (dateKey: string) => {
    haptics.selection();
    setSelectedDate(dateKey);
    setIsOpen(true);
  };

  return (
    <div className="p-4">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          type="button"
          className="icon-btn"
          aria-label="Previous month"
        >
          <FiChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold tracking-tight text-slate-900">
            {new Date(currentYear, currentMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric'
            })}
          </h3>
          {!isCurrentMonth && (
            <button onClick={jumpToToday} type="button" className="btn btn-sm btn-tinted h-7">
              Today
            </button>
          )}
        </div>

        <button
          onClick={() => shiftMonth(1)}
          type="button"
          className="icon-btn"
          aria-label="Next month"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1.5 grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div
        className={`grid grid-cols-7 gap-1.5 transition-opacity ${isLoading ? 'opacity-50' : ''}`}
        onTouchStart={(e) => (swipeStartX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          const start = swipeStartX.current;
          const end = e.changedTouches[0]?.clientX;
          swipeStartX.current = null;
          if (start == null || end == null) return;
          if (end - start > 60) shiftMonth(-1);
          else if (start - end > 60) shiftMonth(1);
        }}
      >
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const dateObj = new Date(currentYear, currentMonth, i + 1);
          const dateKey = formatDateKey(dateObj);
          const isFuture = dateObj > today;
          const isToday = dateKey === todayKey;
          const status = attendanceMap[dateKey];

          const tone = isFuture
            ? 'text-slate-300'
            : status
              ? attendanceTheme[status].cell
              : 'bg-slate-100 text-slate-700';

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isFuture}
              onClick={() => handleDateClick(dateKey)}
              aria-label={`${dateObj.toDateString()}${status ? `, ${attendanceTheme[status].label}` : ''}`}
              className={`mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-xl text-[13px] font-semibold tabular-nums transition active:scale-90 ${tone} ${
                isToday ? 'ring-2 ring-blue-600 ring-offset-1' : ''
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Legend with counts */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="flex flex-col items-center rounded-xl bg-slate-50 py-2 ring-1 ring-slate-100"
          >
            <span className="text-lg font-bold text-slate-900 tabular-nums">{counts[status]}</span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className={`h-2 w-2 rounded-full ${attendanceTheme[status].dot}`} />
              {attendanceTheme[status].label}
            </span>
          </div>
        ))}
      </div>

      {isOpen && selectedDate && (
        <BottomSheet title="Update Attendance" onClose={() => setIsOpen(false)}>
          <UpdateAttendance
            selectedDate={selectedDate}
            currentStatus={attendanceMap[selectedDate]}
            onSave={handleAttendanceUpdate}
            isLoading={isPending}
          />
        </BottomSheet>
      )}
    </div>
  );
};
