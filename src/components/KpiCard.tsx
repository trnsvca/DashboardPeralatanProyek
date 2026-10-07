import React from 'react';
import { Card } from './Card';

interface KpiCardProps {
  title: string;
  sourceId: string;
  value: string | number;
  subtitle: React.ReactNode;
  isNegative?: boolean;
  isPositive?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  sourceId,
  value,
  subtitle,
  isNegative,
  isPositive,
  className = '',
  icon
}) => {
  return (
    <Card title={title} sourceId={sourceId} chartType="Scorecard" className={className}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
            {value}
          </div>
          <div
            className={`text-[11.5px] mt-1 font-medium ${
              isNegative
                ? 'text-rose-600 dark:text-rose-400'
                : isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {subtitle}
          </div>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
