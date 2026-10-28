import type { ReactNode } from 'react';
import { useState } from 'react';
import { formatEnum } from '../shared/format';
import { haptics } from '../shared/utils/haptics';

type Props = {
  title: string;
  /** Optional count shown next to the title */
  count?: number;
  filterOptions?: string[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  /** Optional trailing action (e.g. "Select") */
  action?: ReactNode;
};

/** Card header with a title and optional filter pills. */
export const SectionHeader = ({
  title,
  count,
  filterOptions = [],
  activeFilter: controlledFilter,
  onFilterChange,
  action
}: Props) => {
  const [internalFilter, setInternalFilter] = useState(
    filterOptions[0]?.toLowerCase() || 'all'
  );

  const currentFilter = controlledFilter ?? internalFilter;

  const handleSelect = (option: string) => {
    const val = option.toLowerCase();
    if (val === currentFilter) return;
    haptics.selection();
    setInternalFilter(val);
    onFilterChange?.(val);
  };

  return (
    <div className="border-b border-slate-100">
      <div className="flex min-h-12 items-center justify-between gap-2 px-4 py-2.5">
        <h3 className="card-title">
          {title}
          {count !== undefined && (
            <span className="ml-1.5 text-sm font-semibold text-slate-400 tabular-nums">
              {count}
            </span>
          )}
        </h3>
        {action}
      </div>

      {filterOptions.length > 1 && (
        <div className="no-scrollbar -mt-1 flex gap-1.5 overflow-x-auto px-4 pb-3">
          {filterOptions.map((optionText) => {
            const isSelected = currentFilter === optionText.toLowerCase();
            return (
              <button
                key={optionText}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelect(optionText)}
                className={`pill ${isSelected ? 'pill-active' : 'pill-idle'}`}
              >
                {formatEnum(optionText)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
