import React from 'react';
import { DataCategory } from '../types/hydrology';

interface CategoryBadgeProps {
  category: DataCategory | string;
  size?: 'xs' | 'sm';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'xs' }) => {
  const norm = category.toUpperCase();
  const padding = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';

  if (norm.includes('OBSERVATION')) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded border bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35 ${padding}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        OBSERVATION
      </span>
    );
  }

  if (norm.includes('PREVISION') || norm.includes('PRÉVISION')) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded border bg-[#A855F7]/15 text-[#C084FC] border-[#A855F7]/35 ${padding}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
        PRÉVISION
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded border bg-[#0EA5E9]/15 text-[#38BDF8] border-[#0EA5E9]/35 ${padding}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
      MODÈLE
    </span>
  );
};
