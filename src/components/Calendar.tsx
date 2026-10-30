import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { UpdateAttendance } from './UpdateAttendance';
import type { AttendanceType } from '../shared/schemas/staff.schema';
import { queryKeys } from '../shared/queryKeys';
import {
  attendanceStatus,
  unmarkedAttendanceClassName
} from '../shared/attendance';

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

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const weekdays = [
  ['Sun', 'Sunday'],
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday']
] as const;

export const Calendar = ({ accountId, employmentId }: Props) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));

  const queryClient = useQueryClient();

  const { data: attendance = [] } = useQuery({
    queryKey: queryKeys.calendar(accountId, currentMonth, currentYear),
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
        queryKey: queryKeys.calendar(accountId, currentMonth, currentYear)
      });
      // The staff list shows today's status for each person.
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountList('STAFF')
      });
      notifySuccess('Attendance updated');
      setIsOpen(false);
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const handleAttendanceUpdate = (newStatus: AttendanceType) => {
    if (!employmentId) {
      notifyError('Employment ID is required to update attendance');
      return;
    }
    const payload: Attendance = {
      employmentId,
      accountId,
      date: selectedDate,
      status: newStatus
    };
    mutate(payload);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const monthLabel = new Date(currentYear, currentMonth).toLocaleString(
    'default',
    { month: 'long', year: 'numeric' }
  );

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
    <div className="mx-auto w-full max-w-md p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="flex h-11 w-11 items-center justify-center rounded-full text-fg-secondary active:bg-surface-muted"
          >
            <FiChevronLeft size={22} aria-hidden="true" />
          </button>

          <h3
            aria-live="polite"
            className="min-w-32 text-center text-lg font-semibold text-fg"
          >
            {monthLabel}
          </h3>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="flex h-11 w-11 items-center justify-center rounded-full text-fg-secondary active:bg-surface-muted"
          >
            <FiChevronRight size={22} aria-hidden="true" />
          </button>
        </div>

        <Button variant="secondary" className="px-3 text-sm" onClick={jumpToToday}>
          Today
        </Button>
      </div>

      <div className="rounded-lg bg-surface-muted p-2">
        {/* Days of week */}
        <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-fg-secondary">
          {weekdays.map(([short, full]) => (
            <abbr key={short} title={full} className="py-1 no-underline">
              {short}
            </abbr>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const dateObj = new Date(currentYear, currentMonth, i + 1);
            const isFuture = dateObj > today;
            const dateKey = formatDateKey(dateObj);
            const status = attendanceMap[dateKey];
            const isSelected = selectedDate === dateKey;
            const isToday = dateKey === formatDateKey(today);

            const colorClass = status
              ? attendanceStatus[status].className
              : unmarkedAttendanceClassName;
            const dateLabel = dateObj.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            });

            return (
              <div key={i} className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleDateClick(dateKey)}
                  aria-label={`${dateLabel}: ${
                    status ? attendanceStatus[status].label : 'Not marked'
                  }`}
                  aria-current={isToday ? 'date' : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium tabular-nums ${colorClass} ${
                    isSelected ? 'ring-2 ring-focus' : ''
                  } ${isToday ? 'font-bold underline underline-offset-2' : ''} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {i + 1}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isOpen && selectedDate && (
        <BottomSheet
          title="Update Attendance"
          onClose={() => setIsOpen(false)}
          dismissible={!isPending}
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
      <div className="mt-3 flex flex-wrap items-center justify-around gap-2 text-sm">
        {(['PRESENT', 'ABSENT', 'HALF'] as AttendanceType[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className={`h-3 w-3 rounded-full ${attendanceStatus[status].dotClassName}`}
              aria-hidden="true"
            />
            <span className="font-medium text-fg-secondary">
              {attendanceStatus[status].label}: {counts[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
