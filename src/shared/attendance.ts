import type { AttendanceType } from './schemas/staff.schema';

// Single source for attendance labels and colors (badges, calendar days,
// legend dots and the update sheet). Always show the label or a legend next
// to the color.
export const attendanceStatus: Record<
  AttendanceType,
  { label: string; className: string; dotClassName: string }
> = {
  PRESENT: {
    label: 'Present',
    className: 'bg-success-soft text-success-soft-fg',
    dotClassName: 'bg-success'
  },
  ABSENT: {
    label: 'Absent',
    className: 'bg-error-soft text-error-soft-fg',
    dotClassName: 'bg-error'
  },
  HALF: {
    label: 'Half Day',
    className: 'bg-warning-soft text-warning-soft-fg',
    dotClassName: 'bg-warning'
  }
};

export const unmarkedAttendanceClassName = 'bg-surface-muted text-fg-secondary';
