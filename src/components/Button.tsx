import type { ButtonHTMLAttributes } from 'react';
import { buttonClass, type ButtonVariant } from './buttonClass';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export const Button = ({
  variant = 'primary',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: Props) => (
  <button
    type={type}
    className={buttonClass({ variant, fullWidth, className })}
    {...props}
  />
);
