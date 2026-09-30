import React from 'react';
import {
  Activity,
  Thermometer,
  Layers,
  MapPin,
  GitMerge,
  ExternalLink,
  CheckCircle2,
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  RiverDetail,
  RiverSegment,
  BasinInfo,
  TemperatureStation,
  DischargePoint,
  ForecastStep,
  TemperaturePoint,
  DataSourceItem,
  HydrologicalAnalysis,
} from '../types/hydrology';
import { CategoryBadge } from './CategoryBadge';
import {
  DischargeHistoryChart,
  EnsembleForecastChart,
  TemperatureHistoryChart,
} from '../charts/HydroCharts';
import {
  formatExactDateTime,
  formatNumberFr,
  formatPercentileFr,
  formatRelativeFreshness,
  formatSignedPercentFr,
} from '../utils/formatters';

interface RiverDossierPanelProps {
  river: RiverDetail;
  analysis: HydrologicalAnalysis | null;
  activeSegmentId: string | undefined;
  onSelectSegmentProfile: (segmentId: string) => void;
  basin: BasinInfo | null;
  segments: RiverSegment[];
  stations: TemperatureStation[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  dischargeHistory: DischargePoint[];
  dischargeDays: number;
  onChangeDischargeDays: (days: number) => void;
  forecastSteps: ForecastStep[];
  temperatureHistory: TemperaturePoint[];
  dataSources: DataSourceItem[];
}

export const RiverDossierPanel: React.FC<RiverDossierPanelProps> = ({
  river,
  analysis,
  activeSegmentId,
  onSelectSegmentProfile,
  basin,
  segments,
  stations,
  selectedStationId,
  onSelectStation,
  dischargeHistory,
  dischargeDays,
  onChangeDischargeDays,
  forecastSteps,
  temperatureHistory,
  dataSources,
}) => {
  const diag = analysis?.discharge ?? {
    current_m3s: river.current_discharge_m3s,
    seasonal_mean_for_date_m3s: river.seasonal_mean_for_date_m3s,
    mean_annual_m3s: river.mean_annual_discharge_m3s,
    deviation_m3s: Number(
      (river.current_discharge_m3s - river.seasonal_mean_for_date_m3s).toFixed(1)
    ),
    deviation_pct: river.discharge_anomaly_pct,
    historical_percentile: river.historical_percentile,
    historical_quantiles_for_date: river.historical_quantiles_for_date,
    trend_direction: river.trend_direction,
    trend_days: river.trend_days,
    trend_delta_m3s: river.trend_delta_m3s,
    trend_label: river.trend_label,
    regime_code: 'ABOVE_NORMAL' as const,
    regime_label: river.regime_label,
    category: 'MODELE' as const,
    source_dataset: 'Copernicus GloFAS v5.0 (LISFLOOD / ERA5)',
  };

  const tempDiag = analysis?.temperature ?? {
    current_c: river.current_temperature_c,
    seasonal_mean_for_date_c: river.seasonal_temperature_mean_c,
    deviation_c: river.temperature_anomaly_c,
    historical_percentile: river.temperature_percentile,
    trend_label: river.temperature_trend_label,
    ecological_threshold_c: 22.0,
    margin_to_threshold_c: Number((22.0 - river.current_temperature_c).toFixed(1)),
    station_name: stations[0]?.name || "Station Hub'Eau",
    station_code: stations[0]?.station_code || '03174000',
    category: 'OBSERVATION' as const,
  };

  const referenceTitle = analysis?.reference_label || river.reference_label || river.name;
  const availableProfiles = analysis?.available_profiles || [];
  const isPositiveAnomaly = diag.deviation_pct >= 0;

  return (
    <aside className="w-full lg:w-[520px] xl:w-[560px] h-full bg-[#070D17]/95 border-l border-slate-800/90 flex flex-col overflow-y-auto">
      {/* 1. RIVER HEADER & DIAGNOSTIC ENGINE (ÉTAT ACTUEL VS COMPORTEMENT HISTORIQUE) */}
      <div className="p-5 border-b border-slate-800/90 bg-gradient-to-b from-[#0D1626] to-[#070D17]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-400">
              <span className="text-[#38BDF8] font-semibold">{river.river_code}</span>
              <span aria-hidden="true">·</span>
              <span>{river.country}</span>
              <span aria-hidden="true">·</span>
              <span>Ordre Strahler {river.strahler_order}</span>
              <span aria-hidden="true">·</span>
              <span>{river.length_km} km</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-50 tracking-tight mt-1">
              {referenceTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {river.basin_name} · {river.basin_area_km2.toLocaleString('fr-FR')} km²
            </p>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400 shrink-0">
            <div className="inline-flex items-center gap-1.5 text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {formatRelativeFreshness(river.last_updated_at)}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">
              {formatExactDateTime(river.last_updated_at)}
            </div>
          </div>
        </div>

        {/* Profile / Station Switcher along the river (e.g., SEINE — PARIS, SEINE — TROYES, SEINE — POSES) */}
        {availableProfiles.length > 1 && (
          <div className="mt-3.5 flex items-center gap-1 p-1 bg-slate-950/90 rounded-lg border border-slate-800/90 overflow-x-auto">
            {availableProfiles.map((prof) => {
              const isSelected =
                prof.segment_id === (activeSegmentId || analysis?.active_segment_id);
              return (
                <button
                  key={prof.segment_id}
                  type="button"
                  onClick={() => onSelectSegmentProfile(prof.segment_id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0EA5E9] text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {prof.reference_label}
                </button>
              );
            })}
          </div>
        )}

        {/* MOTEUR D'ANALYSE : ÉTAT ACTUEL PAR RAPPORT AU COMPORTEMENT HISTORIQUE */}
        <div className="mt-4 bg-[#0D1626] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-semibold text-slate-100">
                Diagnostic hydrologique — {referenceTitle}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Réf. 1991–2020 ({analysis?.reference_date_label || 'ce jour'})
            </span>
          </div>

          {/* 5-METRIC ANALYTICAL READOUT (Débit actuel, Moyenne pour cette date, Écart, Position historique, Tendance) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 py-3.5 border-b border-slate-800/80 font-mono tabular-nums">
            {/* 1. Débit actuel */}
            <div>
              <div className="text-[11px] text-slate-400">Débit actuel</div>
              <div className="text-xl font-bold text-slate-50 mt-0.5">
                {formatNumberFr(diag.current_m3s, diag.current_m3s % 1 === 0 ? 0 : 1)} m³/s
              </div>
            </div>

            {/* 2. Moyenne pour cette date */}
            <div>
              <div className="text-[11px] text-slate-400">Moyenne pour cette date</div>
              <div className="text-xl font-bold text-slate-200 mt-0.5">
                {formatNumberFr(
                  diag.seasonal_mean_for_date_m3s,
                  diag.seasonal_mean_for_date_m3s % 1 === 0 ? 0 : 1
                )}{' '}
                m³/s
              </div>
            </div>

            {/* 3. Écart */}
            <div>
              <div className="text-[11px] text-slate-400">Écart</div>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  isPositiveAnomaly ? 'text-[#38BDF8]' : 'text-amber-400'
                }`}
              >
                {formatSignedPercentFr(diag.deviation_pct, 1)}
              </div>
            </div>

            {/* 4. Position historique */}
            <div>
              <div className="text-[11px] text-slate-400">Position historique</div>
              <div className="text-base font-bold text-emerald-300 mt-0.5">
                {formatPercentileFr(diag.historical_percentile)}
              </div>
            </div>

            {/* 5. Tendance */}
            <div className="col-span-2">
              <div className="text-[11px] text-slate-400">Tendance</div>
              <div className="text-base font-bold text-slate-100 mt-0.5 flex items-center gap-1.5">
                {diag.trend_direction === 'RISING' ? (
                  <TrendingUp className="w-4 h-4 text-[#38BDF8] shrink-0" />
                ) : diag.trend_direction === 'FALLING' ? (
                  <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>{diag.trend_label}</span>
                <span className="text-xs font-normal text-slate-400">
                  ({diag.trend_delta_m3s >= 0 ? '+' : ''}
                  {formatNumberFr(diag.trend_delta_m3s, 0)} m³/s)
                </span>
              </div>
            </div>
          </div>

          {/* HISTORICAL PERCENTILE DISTRIBUTION BAR (P10 - P25 - P50 - P75 - P90) */}
          <div className="pt-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Distribution historique pour cette date (P10–P90)</span>
              <span className="text-slate-200 font-semibold">{diag.regime_label}</span>
            </div>

            <div className="relative h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              {/* P25 to P75 normal corridor highlight */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                style={{ left: '25%', width: '50%' }}
              />
              {/* P50 median tick */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400/70"
                style={{ left: '50%' }}
              />
              {/* Current percentile indicator */}
              <div
                className="absolute top-0 bottom-0 w-2.5 -ml-1 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"
                style={{
                  left: `${Math.min(98, Math.max(2, diag.historical_percentile))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1 tabular-nums">
              <span>P10: {formatNumberFr(diag.historical_quantiles_for_date.q10, 0)}</span>
              <span>P25: {formatNumberFr(diag.historical_quantiles_for_date.q25, 0)}</span>
              <span>Médiane: {formatNumberFr(diag.historical_quantiles_for_date.q50, 0)}</span>
              <span>P75: {formatNumberFr(diag.historical_quantiles_for_date.q75, 0)}</span>
              <span>P90: {formatNumberFr(diag.historical_quantiles_for_date.q90, 0)} m³/s</span>
            </div>
          </div>

          {/* INTERPRETATION SUMMARY & FORECAST OUTLOOK */}
          {analysis && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <p>{analysis.diagnostic_explanation}</p>
              <p className="text-[11px] font-mono text-slate-400">
                <strong className="text-[#C084FC]">Perspective J+5 :</strong>{' '}
                {analysis.forecast_outlook.outlook_summary}
              </p>
            </div>
          )}
        </div>

        {/* THERMAL & CATCHMENT CONTEXT ROW */}
        <div className="grid grid-cols-2 gap-3 mt-3 font-mono tabular-nums">
          <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-[#10B981]" />
                Température actuelle
              </span>
              <CategoryBadge category="OBSERVATION" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-50">
                {formatNumberFr(tempDiag.current_c, 1)} °C
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {tempDiag.deviation_c >= 0 ? '+' : ''}
                {formatNumberFr(tempDiag.deviation_c, 1)} °C vs moy.
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Moy. date: {formatNumberFr(tempDiag.seasonal_mean_for_date_c, 1)} °C</span>
              <span>·</span>
              <span>{formatPercentileFr(tempDiag.historical_percentile)}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500 truncate">
              {tempDiag.trend_label} · Marge seuil 22 °C: +{formatNumberFr(tempDiag.margin_to_threshold_c, 1)} °C
            </div>
          </div>

          <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                Bassin &amp; Module annuel
              </span>
              <span className="text-[10px] text-slate-400">
                Pfafstetter #{basin?.pfafstetter_code || '2324'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-50">
                {river.basin_area_km2.toLocaleString('fr-FR')} km²
              </span>
              <span className="text-xs text-slate-300">
                Module: {formatNumberFr(river.mean_annual_discharge_m3s, 0)} m³/s
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              HydroBASINS #{basin?.hydrobasins_id || 2040023010} · Niv. {basin?.level || 4}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500 truncate">
              Forêt {basin?.forest_cover_pct ?? 26.4}% · Alt. moy. {basin?.mean_elevation_m ?? 154} m
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE DOSSIER SECTIONS */}
      <div className="p-4 space-y-5">
        {/* SECTION: DÉBIT */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="text-xs font-semibold text-[#38BDF8]">
              01. Débit — Comparaison à la normale calendaire
            </span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              Moyenne pour cette date : {formatNumberFr(diag.seasonal_mean_for_date_m3s, 0)} m³/s
            </span>
          </div>
          <DischargeHistoryChart
            data={dischargeHistory}
            glofasPointId={river.glofas_point_id}
            referenceLabel={referenceTitle}
            days={dischargeDays}
            onChangeDays={onChangeDischargeDays}
          />
        </section>

        {/* SECTION: PRÉVISION */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="text-xs font-semibold text-[#C084FC]">
              02. Prévision — Ensemble GloFAS (51 membres · J+10)
            </span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              Prob. &gt; normale à J+5 : {analysis?.forecast_outlook.prob_above_seasonal_mean_pct ?? 84}%
            </span>
          </div>
          <EnsembleForecastChart
            steps={forecastSteps}
            glofasPointId={river.glofas_point_id}
          />
        </section>

        {/* SECTION: TEMPÉRATURE */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="text-xs font-semibold text-[#10B981]">
              03. Température — Chronique in-situ Hub&apos;Eau
            </span>
            <select
              value={selectedStationId || stations[0]?.id || ''}
              onChange={(e) => onSelectStation(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-[#10B981]"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  #{st.station_code} — {st.commune} ({st.latest_temperature_c} °C)
                </option>
              ))}
            </select>
          </div>
          <TemperatureHistoryChart data={temperatureHistory} />
        </section>

        {/* SECTION: STATIONS PROCHES */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
              04. Stations de mesure proches ({stations.length})
            </span>
            <CategoryBadge category="OBSERVATION" />
          </div>

          <div className="space-y-2">
            {stations.map((st) => {
              const isSelected =
                st.id === selectedStationId || (!selectedStationId && st.id === stations[0]?.id);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#10B981]/10 border-[#10B981]/50'
                      : 'bg-[#0D1626]/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#10B981]">
                        #{st.station_code}
                      </span>
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {st.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>
                        {st.commune} ({st.departement})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Distance: {st.distance_m} m</span>
                      <span aria-hidden="true">·</span>
                      <span>Confiance: {Math.round(st.confidence * 100)}%</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {st.mapping_method} · {formatRelativeFreshness(st.latest_measured_at)}
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono tabular-nums">
                    <div className="font-bold text-base text-[#34D399]">
                      {st.latest_temperature_c.toFixed(1)} °C
                    </div>
                    {st.seasonal_mean_c !== undefined && (
                      <div className="text-[10px] text-slate-400">
                        Normale: {st.seasonal_mean_c.toFixed(1)} °C (
                        {(st.temperature_anomaly_c ?? 0) >= 0 ? '+' : ''}
                        {(st.temperature_anomaly_c ?? 0).toFixed(1)} °C)
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION: BASSIN VERSANT & TRONÇONS HYDRORIVERS */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-[#38BDF8]" />
              05. Tronçons HydroRIVERS &amp; Points GloFAS
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {segments.length} tronçons indexés GiST
            </span>
          </div>

          <div className="space-y-2">
            {segments.map((seg) => {
              const isSegActive =
                seg.id === (activeSegmentId || analysis?.active_segment_id);
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => onSelectSegmentProfile(seg.id)}
                  className={`w-full text-left rounded-lg p-3 text-xs border transition ${
                    isSegActive
                      ? 'bg-[#0EA5E9]/10 border-[#0EA5E9]/50'
                      : 'bg-[#0D1626]/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100">{seg.segment_label}</span>
                    <span className="font-mono text-[10px] text-[#38BDF8]">
                      HYRIV_ID #{seg.hydro_rivers_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] font-mono text-slate-400 tabular-nums">
                    <div>Longueur: {seg.length_km} km</div>
                    <div>Amont: {seg.upstream_area_km2.toLocaleString('fr-FR')} km²</div>
                    <div>Moy. date: {seg.mean_discharge_m3s} m³/s</div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>
                      Point GloFAS: <strong className="text-slate-200">{seg.glofas_mapping.glofas_id}</strong> (
                      {seg.glofas_mapping.distance_m} m)
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Confiance: {Math.round(seg.glofas_mapping.confidence * 100)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION: SOURCES & PROVENANCE */}
        <section className="pb-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
              06. Sources &amp; Provenance scientifique
            </span>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Provenance vérifiée
            </span>
          </div>

          <div className="space-y-2">
            {dataSources.map((src) => (
              <div
                key={src.id}
                className="bg-[#0D1626]/70 border border-slate-800/90 rounded-lg p-3 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#38BDF8]">{src.code}</span>
                    <span className="text-xs font-medium text-slate-200">{src.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {src.version} · {src.license}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Synchronisé : {formatExactDateTime(src.last_sync_at)} (
                    {formatRelativeFreshness(src.last_sync_at)})
                  </div>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#38BDF8] hover:border-[#38BDF8] shrink-0"
                  title={`Ouvrir ${src.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};
