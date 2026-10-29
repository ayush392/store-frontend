import { describe, expect, it } from 'vitest';
import { buttonClass } from './buttonClass';

describe('buttonClass', () => {
  it('defaults to the primary variant at 44px height', () => {
    const cls = buttonClass();
    expect(cls).toContain('bg-primary');
    expect(cls).toContain('h-11');
    expect(cls).not.toContain('w-full');
  });

  it('applies each variant', () => {
    expect(buttonClass({ variant: 'secondary' })).toContain('border-line-strong');
    expect(buttonClass({ variant: 'ghost' })).toContain('text-primary');
    expect(buttonClass({ variant: 'destructive' })).toContain('bg-danger');
  });

  it('adds full width and extra classes', () => {
    const cls = buttonClass({ fullWidth: true, className: 'mt-3' });
    expect(cls).toContain('w-full');
    expect(cls.endsWith(' mt-3')).toBe(true);
  });
});
