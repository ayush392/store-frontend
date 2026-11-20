// Button styles, shared by <Button> and by links that look like buttons.
// Hierarchy: at most one `primary` per screen; `secondary` for supporting
// actions (row Pay, Cancel, Today); `ghost` for low-emphasis actions
// (Select all, Edit); `destructive` for Delete.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

const base =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 ' +
  'text-base font-semibold transition-colors select-none ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary active:bg-primary-pressed',
  secondary:
    'border border-line-strong bg-surface text-fg active:bg-surface-muted',
  ghost: 'text-primary active:bg-primary-soft',
  destructive: 'bg-danger text-on-danger active:bg-danger-pressed'
};

export const buttonClass = ({
  variant = 'primary',
  fullWidth = false,
  className = ''
}: {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
} = {}) =>
  `${base} ${variants[variant]}${fullWidth ? ' w-full' : ''}${className ? ' ' + className : ''}`;
