import type { AccountType } from './schemas/account.schema';
import type { AttendanceType } from './schemas/staff.schema';

/** One colour per account type, used for avatars and tiles across the app. */
export const accountTone: Record<AccountType, string> = {
  CUSTOMER: 'bg-blue-50 text-blue-600 ring-blue-500/20',
  STAFF: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
  STORE: 'bg-violet-50 text-violet-600 ring-violet-500/20'
};

/** Attendance colours shared by the staff list, calendar and attendance sheet. */
export const attendanceTheme: Record<
  AttendanceType,
  { label: string; chip: string; cell: string; dot: string; selected: string }
> = {
  PRESENT: {
    label: 'Present',
    chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    cell: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
    selected: 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500'
  },
  ABSENT: {
    label: 'Absent',
    chip: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
    cell: 'bg-rose-100 text-rose-800',
    dot: 'bg-rose-500',
    selected: 'bg-rose-50 text-rose-700 ring-2 ring-rose-500'
  },
  HALF: {
    label: 'Half Day',
    chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    cell: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
    selected: 'bg-amber-50 text-amber-700 ring-2 ring-amber-500'
  }
};

export const neutralChip = 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
