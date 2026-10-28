import type { ReactNode } from 'react';

type Props = {
  label: string;
  htmlFor: string;
  error?: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

/** Label + control + error message. Every form input renders through this. */
export const FormField = ({ label, htmlFor, error, headerAction, children }: Props) => (
  <div>
    <div className="flex min-h-6 items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {headerAction && <div className="mb-1.5">{headerAction}</div>}
    </div>
    {children}
    {error && (
      <p id={`${htmlFor}-error`} role="alert" className="field-error">
        {error}
      </p>
    )}
  </div>
);
