import React from 'react';
import { FreshnessStatus, FreshnessInfo, getDataFreshness } from '../utils/formatters';

export interface DataFreshnessBadgeProps {
  timestamp?: string | null;
  isObservation?: boolean;
  customStatus?: FreshnessStatus;
  customLabel?: string;
  customRelativeTime?: string;
  variant?: 'stacked' | 'badge' | 'inline' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  timestamp,
  isObservation = false,
  customStatus,
  customLabel,
  customRelativeTime,
  variant = 'stacked',
  size = 'md',
  className = '',
}) => {
  const calculated = getDataFreshness(timestamp, isObservation);

  const status: FreshnessStatus = customStatus || calculated.status;
  const statusLabel = customLabel || (customStatus ? getStatusLabel(status, isObservation) : calculated.statusLabel);
  const relativeTime = customRelativeTime || calculated.relativeTime;
  const icon = getStatusIcon(status);
  const colors = getStatusColors(status);

  // Stacked variant - exact layout from the user specification:
  // 🟢 donnée récente
  // il y a 4 heures
  // OR:
  // 🟠 dernière mesure
  // il y a 31 heures
  if (variant === 'stacked') {
    return (
      <div
        className={`inline-flex flex-col font-mono text-left select-none ${className}`}
        title={`Statut de fraîcheur : ${statusLabel} (${relativeTime})`}
      >
        <div className={`flex items-center gap-1.5 font-bold ${colors.textColor} ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
          <span className="leading-none text-xs" aria-hidden="true">
            {icon}
          </span>
          <span className="capitalize-first">{statusLabel}</span>
        </div>
        <div className={`text-slate-400 font-normal pl-4 ${size === 'sm' ? 'text-[10px]' : 'text-[11px]'}`}>
          {relativeTime}
        </div>
      </div>
    );
  }

  // Pill variant - minimal single-line indicator:
  // 🟢 récente
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${colors.badgeBg} ${colors.borderColor} ${colors.textColor} ${className}`}
        title={`${statusLabel} · ${relativeTime}`}
      >
        <span aria-hidden="true" className="text-xs leading-none">
          {icon}
        </span>
        <span>{status === 'recent' ? 'récente' : status === 'aging' ? 'ancienne' : status === 'obsolete' ? 'obsolète' : 'indisponible'}</span>
      </span>
    );
  }

  // Badge variant - single line with both status and relative time:
  // 🟢 donnée récente · il y a 4 heures
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg font-mono text-xs border ${colors.badgeBg} ${colors.borderColor} ${className}`}
        title={`Fraîcheur : ${statusLabel} (${relativeTime})`}
      >
        <div className="flex items-center gap-1.5 font-bold">
          <span aria-hidden="true" className="text-xs leading-none">
            {icon}
          </span>
          <span className={colors.textColor}>{statusLabel}</span>
        </div>
        <span className="text-slate-500 font-sans">·</span>
        <span className="text-slate-300 text-[11px]">{relativeTime}</span>
      </div>
    );
  }

  // Inline variant
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}
      title={`${statusLabel} · ${relativeTime}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className={`font-semibold ${colors.textColor}`}>{statusLabel}</span>
      <span className="text-slate-500">·</span>
      <span className="text-slate-400 text-[11px]">{relativeTime}</span>
    </span>
  );
};

function getStatusIcon(status: FreshnessStatus): string {
  switch (status) {
    case 'recent':
      return '🟢';
    case 'aging':
      return '🟠';
    case 'obsolete':
      return '🔴';
    case 'unavailable':
    default:
      return '⚪';
  }
}

function getStatusLabel(status: FreshnessStatus, isObservation: boolean): string {
  switch (status) {
    case 'recent':
      return isObservation ? 'mesure récente' : 'donnée récente';
    case 'aging':
      return isObservation ? 'dernière mesure' : 'donnée ancienne';
    case 'obsolete':
      return 'donnée obsolète';
    case 'unavailable':
    default:
      return 'indisponible';
  }
}

function getStatusColors(status: FreshnessStatus) {
  switch (status) {
    case 'recent':
      return {
        textColor: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
        badgeBg: 'bg-emerald-950/40',
        borderColor: 'border-emerald-500/30',
      };
    case 'aging':
      return {
        textColor: 'text-amber-400',
        dotColor: 'bg-amber-400',
        badgeBg: 'bg-amber-950/40',
        borderColor: 'border-amber-500/30',
      };
    case 'obsolete':
      return {
        textColor: 'text-rose-400',
        dotColor: 'bg-rose-400',
        badgeBg: 'bg-rose-950/40',
        borderColor: 'border-rose-500/30',
      };
    case 'unavailable':
    default:
      return {
        textColor: 'text-slate-400',
        dotColor: 'bg-slate-400',
        badgeBg: 'bg-slate-900/60',
        borderColor: 'border-slate-700/60',
      };
  }
}
