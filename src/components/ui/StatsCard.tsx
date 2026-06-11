import React from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

type Trend = 'up' | 'down' | 'neutral';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: Trend;
  className?: string;
}

const trendIconColors: Record<Trend, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-400 dark:text-gray-500',
};

const trendBgColors: Record<Trend, string> = {
  up: 'bg-emerald-100 dark:bg-emerald-900/30',
  down: 'bg-red-100 dark:bg-red-900/30',
  neutral: 'bg-gray-100 dark:bg-gray-800',
};

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  suffix,
  trend = 'neutral',
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
            {suffix && (
              <span className="ml-0.5 text-sm font-medium text-gray-400 dark:text-gray-500">
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div
          className={cn(
            'flex-shrink-0 rounded-md p-2',
            trendBgColors[trend],
          )}
        >
          <Icon
            className={cn('w-5 h-5', trendIconColors[trend])}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
