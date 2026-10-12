export type FreshnessStatus = 'recent' | 'aging' | 'obsolete' | 'unavailable';

export interface FreshnessInfo {
  status: FreshnessStatus;
  statusLabel: string;
  statusShortLabel: string; // 'récente' | 'ancienne' | 'obsolète' | 'indisponible'
  relativeTime: string;
  ageHours: number;
  icon: string; // '🟢' | '🟠' | '🔴' | '⚪'
  textColor: string;
  dotColor: string;
  badgeBg: string;
  borderColor: string;
}

export function getDataFreshness(
  isoTimestamp: string | undefined | null,
  isObservation = false
): FreshnessInfo {
  if (!isoTimestamp) {
    return {
      status: 'unavailable',
      statusLabel: 'indisponible',
      statusShortLabel: 'indisponible',
      relativeTime: 'aucune mesure transmise',
      ageHours: Infinity,
      icon: '⚪',
      textColor: 'text-slate-400',
      dotColor: 'bg-slate-400',
      badgeBg: 'bg-slate-900/60',
      borderColor: 'border-slate-700/60',
    };
  }

  const target = new Date(isoTimestamp).getTime();
  if (isNaN(target)) {
    return {
      status: 'unavailable',
      statusLabel: 'indisponible',
      statusShortLabel: 'indisponible',
      relativeTime: 'date invalide',
      ageHours: Infinity,
      icon: '⚪',
      textColor: 'text-slate-400',
      dotColor: 'bg-slate-400',
      badgeBg: 'bg-slate-900/60',
      borderColor: 'border-slate-700/60',
    };
  }

  const diffMs = Math.max(0, Date.now() - target);
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  // Status mapping
  // 🟢 récente : < 24 heures (donnée récente / mesure récente)
  // 🟠 ancienne : 24h - 72h (dernière mesure / donnée ancienne, ex. il y a 31 heures)
  // 🔴 obsolète : >= 72h (donnée obsolète)
  if (diffHours < 24) {
    let relativeStr = '';
    if (diffMinutes < 60) {
      relativeStr = `il y a ${Math.max(1, diffMinutes)} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      relativeStr = `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }

    return {
      status: 'recent',
      statusLabel: isObservation ? 'mesure récente' : 'donnée récente',
      statusShortLabel: 'récente',
      relativeTime: relativeStr,
      ageHours: diffHours,
      icon: '🟢',
      textColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      badgeBg: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/30',
    };
  }

  if (diffHours < 72) {
    return {
      status: 'aging',
      statusLabel: isObservation ? 'dernière mesure' : 'donnée ancienne',
      statusShortLabel: 'ancienne',
      relativeTime: `il y a ${diffHours} heures`,
      ageHours: diffHours,
      icon: '🟠',
      textColor: 'text-amber-400',
      dotColor: 'bg-amber-400',
      badgeBg: 'bg-amber-950/40',
      borderColor: 'border-amber-500/30',
    };
  }

  return {
    status: 'obsolete',
    statusLabel: 'donnée obsolète',
    statusShortLabel: 'obsolète',
    relativeTime: `il y a ${diffDays} jours`,
    ageHours: diffHours,
    icon: '🔴',
    textColor: 'text-rose-400',
    dotColor: 'bg-rose-400',
    badgeBg: 'bg-rose-950/40',
    borderColor: 'border-rose-500/30',
  };
}

export function formatRelativeFreshness(isoTimestamp: string | undefined): string {
  if (!isoTimestamp) return 'Date inconnue';
  const target = new Date(isoTimestamp).getTime();
  if (isNaN(target)) return isoTimestamp;

  const diffSeconds = Math.max(0, Math.floor((Date.now() - target) / 1000));
  if (diffSeconds < 60) return "Mis à jour à l'instant";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Mis à jour il y a ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Mis à jour il y a ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Mis à jour il y a ${diffDays} j`;
}

export function formatExactDateTime(isoTimestamp: string | undefined): string {
  if (!isoTimestamp) return '—';
  const d = new Date(isoTimestamp);
  if (isNaN(d.getTime())) return isoTimestamp;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumberFr(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatSignedPercentFr(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
}

export function formatPercentileFr(percentile: number | undefined | null): string {
  if (percentile === undefined || percentile === null || isNaN(percentile)) return '—';
  const rounded = Math.round(percentile);
  return rounded === 1 ? '1er percentile' : `${rounded}e percentile`;
}
