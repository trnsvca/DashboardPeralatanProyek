import React, { useState } from 'react';
import { SOURCE_CATALOG } from '../data/initialData';

interface SourceBadgeProps {
  id: string;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ id, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const text = SOURCE_CATALOG[id] || 'Sumber data internal';

  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-700/80 text-white dark:bg-blue-900/90 dark:text-blue-200 cursor-help transition-transform hover:scale-105 select-none ${className}`}
        title={`Sumber ${id}: ${text}`}
      >
        {id}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 text-[11px] font-normal leading-tight text-white bg-slate-900/95 dark:bg-slate-800 border border-slate-700 rounded shadow-xl z-50 whitespace-nowrap pointer-events-none">
          <span className="font-semibold text-blue-300">{id}:</span> {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </span>
      )}
    </span>
  );
};
