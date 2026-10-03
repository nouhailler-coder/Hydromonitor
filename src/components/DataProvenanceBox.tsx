import React from 'react';
import {
  Database,
  Radio,
  Cpu,
  Info,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { formatExactDateTime } from '../utils/formatters';

export type ProvenanceType = 'modèle' | 'observation in situ' | 'modèle probabiliste' | 'réanalyse';

export interface DataProvenanceProps {
  source: string; // e.g. "Copernicus CEMS GloFAS" or "Hub'Eau"
  type: ProvenanceType;
  version?: string; // e.g. "5.0"
  station?: string; // e.g. "Station Paris Austerlitz (03174000)"
  stationCode?: string;
  lastUpdated?: string; // e.g. "30/09/2026 06:00"
  measuredAt?: string; // e.g. "30/09/2026 08:00"
  metricName?: string; // e.g. "Débit" or "Température"
  metricValue?: string; // e.g. "425 m³/s" or "18,7 °C"
  variant?: 'block' | 'card' | 'inline' | 'pill';
  className?: string;
  notes?: string;
}

export const DataProvenanceBox: React.FC<DataProvenanceProps> = ({
  source,
  type,
  version = '5.0',
  station,
  stationCode,
  lastUpdated = '30/09/2026 06:00',
  measuredAt = '30/09/2026 08:00',
  metricName,
  metricValue,
  variant = 'block',
  className = '',
  notes,
}) => {
  const isModel = type.includes('modèle') || type.includes('réanalyse');
  const isObs = type.includes('in situ') || type.includes('observation');

  // Format date helper: if it's already "30/09/2026 06:00" keep it, if ISO format it
  const formatTimestamp = (ts: string | undefined, defaultFallback: string) => {
    if (!ts) return defaultFallback;
    if (ts.includes('/') && ts.includes(':')) return ts;
    const formatted = formatExactDateTime(ts);
    return formatted === '—' ? defaultFallback : formatted;
  };

  const formattedUpdate = formatTimestamp(lastUpdated, '30/09/2026 06:00');
  const formattedMeasure = formatTimestamp(measuredAt, '30/09/2026 08:00');

  // Inline / pill variant
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${
          isModel
            ? 'bg-[#0284C7]/10 text-[#38BDF8] border-[#0284C7]/30'
            : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
        } ${className}`}
        title={`Source : ${source} · Type : ${type}`}
      >
        {isModel ? <Cpu className="w-3 h-3 text-[#38BDF8]" /> : <Radio className="w-3 h-3 text-emerald-400" />}
        <span className="font-semibold">{source}</span>
        <span className="text-slate-400">({type})</span>
      </span>
    );
  }

  // Inline summary variant
  if (variant === 'inline') {
    return (
      <div
        className={`text-[11px] font-mono flex flex-wrap items-center gap-x-2 gap-y-1 p-2 rounded-lg border ${
          isModel
            ? 'bg-[#070D17] border-slate-800 text-slate-300'
            : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
        } ${className}`}
      >
        <span className="text-slate-400">Source :</span>
        <span className="font-bold text-white">{source}</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400">Type :</span>
        <span
          className={`font-semibold ${
            isModel ? 'text-[#38BDF8]' : 'text-emerald-400'
          }`}
        >
          {type}
        </span>
        {isModel && version && (
          <>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Version :</span>
            <span className="text-slate-200">{version}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Màj :</span>
            <span className="text-slate-200">{formattedUpdate}</span>
          </>
        )}
        {isObs && (
          <>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Station :</span>
            <span className="text-slate-200">{station || stationCode || '03174000'}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Mesure :</span>
            <span className="text-slate-200">{formattedMeasure}</span>
          </>
        )}
      </div>
    );
  }

  // Full canonical block matching the exact user specification:
  // Source : Copernicus CEMS GloFAS
  // Type : modèle
  // Version : 5.0
  // Dernière mise à jour : 30/09/2026 06:00
  // OR:
  // Source : Hub'Eau
  // Type : observation in situ
  // Station : XXXXX
  // Mesure : 30/09/2026 08:00
  return (
    <div
      className={`rounded-lg border p-3 font-mono text-xs transition shadow-sm ${
        isModel
          ? 'bg-slate-950/70 border-sky-900/40 text-slate-300 hover:border-sky-700/50'
          : 'bg-slate-950/70 border-emerald-900/40 text-slate-300 hover:border-emerald-700/50'
      } ${className}`}
    >
      {/* Top Header / Badge */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {isModel ? (
            <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
          ) : (
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Traçabilité &amp; Provenance
          </span>
          {metricName && (
            <span className="text-slate-400 text-[10px]">
              — {metricName} {metricValue ? `(${metricValue})` : ''}
            </span>
          )}
        </div>

        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
            isModel
              ? 'bg-[#0284C7]/15 text-[#38BDF8] border-[#0284C7]/40'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {isModel ? 'Modèle numérique' : 'Observation in situ'}
        </span>
      </div>

      {/* Exact canonical key/value table as requested */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-slate-400 shrink-0">Source :</span>
          <span className="font-bold text-white text-right truncate">{source}</span>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <span className="text-slate-400 shrink-0">Type :</span>
          <span
            className={`font-semibold text-right ${
              isModel ? 'text-[#38BDF8]' : 'text-emerald-400'
            }`}
          >
            {type}
          </span>
        </div>

        {isModel ? (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-slate-400 shrink-0">Version :</span>
              <span className="text-slate-200 text-right">{version}</span>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <span className="text-slate-400 shrink-0">Dernière mise à jour :</span>
              <span className="text-slate-200 text-right tabular-nums">
                {formattedUpdate}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-slate-400 shrink-0">Station :</span>
              <span className="text-slate-200 text-right truncate">
                {station || (stationCode ? `Code ${stationCode}` : '03174000')}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <span className="text-slate-400 shrink-0">Mesure :</span>
              <span className="text-slate-200 text-right tabular-nums">
                {formattedMeasure}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Explanatory footer context */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
        <Info className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
        <span>
          {notes ||
            (isModel
              ? 'Donnée issue de la réanalyse/prévision hydrologique continue LISFLOOD (grille ~5 km). Couvre l’ensemble du réseau hydrographique.'
              : 'Donnée mesurée in situ par une station hydrométrique officielle de terrain. Vérité terrain ponctuelle certifiée.')}
        </span>
      </div>
    </div>
  );
};
