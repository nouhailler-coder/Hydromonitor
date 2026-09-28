import React from 'react';
import {
  Activity,
  Thermometer,
  Layers,
  Clock,
  MapPin,
  GitMerge,
  ExternalLink,
  CheckCircle2,
  Compass,
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
  formatRelativeFreshness,
} from '../utils/formatters';

interface RiverDossierPanelProps {
  river: RiverDetail;
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
  return (
    <aside className="w-full lg:w-[500px] xl:w-[540px] h-full bg-[#070D17]/95 border-l border-slate-800/90 flex flex-col overflow-y-auto">
      {/* 1. RIVER HEADER */}
      <div className="p-5 border-b border-slate-800/90 bg-gradient-to-b from-[#0D1626] to-[#070D17]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#0EA5E9]/15 border border-[#0EA5E9]/35 font-mono text-[10px] font-semibold text-[#38BDF8] uppercase">
                {river.river_code}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {river.country} • Ordre Strahler {river.strahler_order} • {river.length_km} km
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-50 tracking-tight mt-1 uppercase">
              {river.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{river.basin_name}</p>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {formatRelativeFreshness(river.last_updated_at)}
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              Dernière donnée : {formatExactDateTime(river.last_updated_at)}
            </div>
          </div>
        </div>

        {/* 4 CORE METRIC CARDS */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {/* Débit Actuel */}
          <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
                Débit actuel
              </span>
              <CategoryBadge category="MODELE" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono font-bold text-xl text-slate-50">
                {formatNumberFr(river.current_discharge_m3s, 1)} m³/s
              </span>
              <span
                className={`font-mono text-[11px] ${
                  river.discharge_anomaly_pct >= 0 ? 'text-[#38BDF8]' : 'text-amber-400'
                }`}
              >
                {river.discharge_anomaly_pct >= 0 ? '+' : ''}
                {river.discharge_anomaly_pct}% vs moy.
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
              GloFAS {river.glofas_point_id}
            </div>
          </div>

          {/* Température */}
          <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-[#10B981]" />
                Température
              </span>
              <CategoryBadge category="OBSERVATION" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono font-bold text-xl text-slate-50">
                {formatNumberFr(river.current_temperature_c, 1)} °C
              </span>
              <span className="font-mono text-[11px] text-emerald-400">
                {stations.length} stations
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
              Hub&apos;Eau In-Situ (Naïades Code 1)
            </div>
          </div>

          {/* Bassin Versant */}
          <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                Bassin versant
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Pfafstetter #{basin?.pfafstetter_code || '2324'}
              </span>
            </div>
            <div className="mt-1.5 font-mono font-bold text-lg text-slate-50">
              {river.basin_area_km2.toLocaleString('fr-FR')} km²
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
              HydroBASINS ID #{basin?.hydrobasins_id || 2040023010} (Niv. {basin?.level || 4})
            </div>
          </div>

          {/* Dernière mise à jour */}
          <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Dernière mise à jour
              </span>
              <span className="text-[10px] font-mono text-emerald-400">SYNCHRONISÉ</span>
            </div>
            <div className="mt-1.5 font-mono font-semibold text-xs text-slate-100">
              {formatExactDateTime(river.last_updated_at)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
              {formatRelativeFreshness(river.last_updated_at)} • PostGIS SRID 4326
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE DOSSIER SECTIONS */}
      <div className="p-4 space-y-5">
        {/* SECTION: DÉBIT */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
              DÉBIT — HISTORIQUE MODÉLISÉ GLOFAS
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Module interannuel: {river.mean_annual_discharge_m3s} m³/s
            </span>
          </div>
          <DischargeHistoryChart
            data={dischargeHistory}
            glofasPointId={river.glofas_point_id}
            days={dischargeDays}
            onChangeDays={onChangeDischargeDays}
          />
        </section>

        {/* SECTION: PRÉVISION */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C084FC]">
              PRÉVISION — ENSEMBLE GLOFAS (51 MEMBRES)
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Horizon J+10 • Grille 0.05°
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
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#10B981]">
              TEMPÉRATURE — CHRONIQUE IN-SITU HUB&apos;EAU
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
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
              STATIONS DE MESURE PROCHES ({stations.length})
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
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Commune: {st.commune} ({st.departement})</span>
                      <span>Distance tronçon: {st.distance_m} m</span>
                      <span>Confiance: {Math.round(st.confidence * 100)}%</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Mapping: {st.mapping_method} • {formatRelativeFreshness(st.latest_measured_at)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-base text-[#34D399]">
                      {st.latest_temperature_c.toFixed(1)} °C
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Qualité Code {st.quality_code}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION: BASSIN VERSANT & TRONÇONS HYDRORIVERS */}
        <section>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-[#38BDF8]" />
              BASSIN VERSANT &amp; TRONÇONS HYDRORIVERS
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {segments.length} tronçons indexés GiST
            </span>
          </div>

          {basin && (
            <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3.5 mb-3">
              <div className="text-xs font-semibold text-slate-100">{basin.name}</div>
              <div className="grid grid-cols-3 gap-2 mt-2.5 text-[11px] font-mono">
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">SUPERFICIE</div>
                  <div className="text-slate-100 font-semibold">
                    {basin.area_km2.toLocaleString('fr-FR')} km²
                  </div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">ALTITUDE MOY.</div>
                  <div className="text-slate-100 font-semibold">{basin.mean_elevation_m} m</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">COUVERT FORESTIER</div>
                  <div className="text-slate-100 font-semibold">{basin.forest_cover_pct}%</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {segments.map((seg) => (
              <div
                key={seg.id}
                className="bg-[#0D1626]/70 border border-slate-800/90 rounded-lg p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-100">{seg.segment_label}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[#38BDF8]">
                    HYRIV_ID #{seg.hydro_rivers_id}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] font-mono text-slate-400">
                  <div>Longueur: {seg.length_km} km</div>
                  <div>Amont: {seg.upstream_area_km2.toLocaleString('fr-FR')} km²</div>
                  <div>Débit moy: {seg.mean_discharge_m3s} m³/s</div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>
                    Point GloFAS: <strong className="text-slate-200">{seg.glofas_mapping.glofas_id}</strong> (
                    {seg.glofas_mapping.distance_m} m)
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    Confiance mapping: {Math.round(seg.glofas_mapping.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: SOURCES & PROVENANCE */}
        <section className="pb-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
              SOURCES &amp; PROVENANCE SCIENTIFIQUE
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
                    Version: {src.version} • Licence: {src.license}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Dernière synchronisation : {formatExactDateTime(src.last_sync_at)} (
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
