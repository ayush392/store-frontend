import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { formatEnum } from '../shared/format';

type Props = {
  title: string;
  filterOptions: string[];
};

export const SectionHeader = ({ title, filterOptions }: Props) => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="p-4 py-3.5 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white text-sm border border-gray-300 rounded-lg px-2.5 py-2 pr-8 min-w-28"
              style={{ cursor: 'pointer' }}
              name={title}
            >
              {filterOptions.map((optionText: string) => {
                const formatted = formatEnum(optionText);
                return (
                  <option key={formatted} value={formatted}>
                    {formatted}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FiChevronDown className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
