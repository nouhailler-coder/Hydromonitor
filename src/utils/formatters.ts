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

export function formatNumberFr(value: number | undefined, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
