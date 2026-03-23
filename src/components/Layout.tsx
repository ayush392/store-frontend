import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

type Props = {
  title: string;
  children: React.ReactNode;
  description?: string;
};

export const PageLayout = ({ title, children, description }: Props) => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.history.back()}
          className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <FiArrowLeft size={20} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
