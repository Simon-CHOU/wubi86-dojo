import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, title, titleAction }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
        className,
      )}
    >
      {(title || titleAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {titleAction && <div>{titleAction}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
};

export default Card;
