import React from 'react';
import { SourceBadge } from './SourceBadge';
import { SOURCE_CATALOG } from '../data/initialData';

interface CardProps {
  title: string;
  sourceId?: string;
  chartType?: string;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  sourceId,
  chartType,
  className = '',
  children,
  action
}) => {
  const sourceText = sourceId ? SOURCE_CATALOG[sourceId] : undefined;

  return (
    <div className={`card-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-3.5 shadow-sm transition-all duration-200 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 m-0">
              {title}
            </h4>
            {sourceId && <SourceBadge id={sourceId} />}
            {chartType && (
              <span className="chart-type-tag text-[10px] font-medium text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/50 px-1.5 py-0.5 rounded">
                {chartType}
              </span>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
        <div className="card-content">{children}</div>
      </div>
      {sourceText && (
        <small className="block text-[10.5px] text-slate-400 dark:text-slate-500 mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
          Sumber: <span className="text-slate-500 dark:text-slate-400 font-medium">{sourceText}</span>
        </small>
      )}
    </div>
  );
};
