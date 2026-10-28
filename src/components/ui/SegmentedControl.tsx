import type { IconType } from 'react-icons';
import { haptics } from '../../shared/utils/haptics';

type Option<T extends string> = { value: T; label: string; icon?: IconType };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** iOS-style segmented picker. */
export const SegmentedControl = <T extends string>({ options, value, onChange }: Props<T>) => (
  <div role="tablist" className="flex gap-1 rounded-xl bg-slate-100 p-1">
    {options.map(({ value: optionValue, label, icon: Icon }) => {
      const isActive = optionValue === value;
      return (
        <button
          key={optionValue}
          role="tab"
          type="button"
          aria-selected={isActive}
          onClick={() => {
            if (isActive) return;
            haptics.selection();
            onChange(optionValue);
          }}
          className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold transition duration-150 ${
            isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 active:text-slate-700'
          }`}
        >
          {Icon && <Icon size={15} />}
          {label}
        </button>
      );
    })}
  </div>
);
