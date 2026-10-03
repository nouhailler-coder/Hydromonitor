import React, { useState } from 'react';
import {
  Gauge,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import {
  HydrologicalAnomalyReport,
  MonthlyClimatologyBenchmark,
} from '../types/hydrology';
import {
  formatNumberFr,
  formatPercentileFr,
  formatSignedPercentFr,
} from '../utils/formatters';
import { DataProvenanceBox } from './DataProvenanceBox';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from 'recharts';

interface HydrologicalAnomalySectionProps {
  report: HydrologicalAnomalyReport;
  riverName: string;
}

export const HydrologicalAnomalySection: React.FC<HydrologicalAnomalySectionProps> = ({
  report,
}) => {
  const [customFlow, setCustomFlow] = useState<number>(report.comparative_simulation.test_flow_m3s);
  const [activeSimulationMonth, setActiveSimulationMonth] = useState<'jan' | 'aug' | 'current'>('current');

  // Compute stats on the fly for customFlow
  const monthlyBenchmarks = report.monthly_benchmarks;
  const bJan = monthlyBenchmarks[0];
  const bAug = monthlyBenchmarks[7];
  const bCurrent = monthlyBenchmarks[9]; // October

  const getMonthStats = (flow: number, b: MonthlyClimatologyBenchmark) => {
    const devM3s = Number((flow - b.mean_m3s).toFixed(1));
    const devPct = Number((((flow - b.mean_m3s) / b.mean_m3s) * 100).toFixed(1));
    const z = Number(((flow - b.mean_m3s) / b.std_m3s).toFixed(2));
    let p = 50;
    if (flow <= b.q10_m3s) p = Math.max(1, Math.round((flow / Math.max(1, b.q10_m3s)) * 10));
    else if (flow <= b.q25_m3s) p = Math.round(10 + ((flow - b.q10_m3s) / (b.q25_m3s - b.q10_m3s)) * 15);
    else if (flow <= b.median_m3s) p = Math.round(25 + ((flow - b.q25_m3s) / (b.median_m3s - b.q25_m3s)) * 25);
    else if (flow <= b.q75_m3s) p = Math.round(50 + ((flow - b.median_m3s) / (b.q75_m3s - b.median_m3s)) * 25);
    else if (flow <= b.q90_m3s) p = Math.round(75 + ((flow - b.q75_m3s) / (b.q90_m3s - b.q75_m3s)) * 15);
    else if (flow <= b.q98_m3s) p = Math.round(90 + ((flow - b.q90_m3s) / (b.q98_m3s - b.q90_m3s)) * 8);
    else p = 99;

    let tag = 'Normal';
    let tagColor = 'text-slate-200';
    if (p < 10) {
      tag = 'Très faible (étiage sévère)';
      tagColor = 'text-amber-400';
    } else if (p < 25) {
      tag = 'Modérément faible';
      tagColor = 'text-amber-300';
    } else if (p <= 75) {
      tag = 'Normal de saison';
      tagColor = 'text-emerald-400';
    } else if (p <= 90) {
      tag = 'Élevé';
      tagColor = 'text-[#38BDF8]';
    } else {
      tag = 'Exceptionnel (crue rare)';
      tagColor = 'text-purple-400';
    }
    return { devM3s, devPct, z, p, tag, tagColor };
  };

  const janSim = getMonthStats(customFlow, bJan);
  const augSim = getMonthStats(customFlow, bAug);
  const curSim = getMonthStats(customFlow, bCurrent);

  // Position on the vertical ladder (0% bottom to 100% top)
  const ladderPos = Math.min(94, Math.max(6, report.percentile));

  return (
    <section className="bg-[#0D1626] border border-slate-800 rounded-xl p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-semibold text-slate-100">
            Analyse des Anomalies Hydrologiques
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{report.period_of_year_label}</span>
          <span aria-hidden="true">·</span>
          <span>Climatologie 1991–2020</span>
        </div>
      </div>

      {/* 1. VISUAL LADDER (DÉBIT : TRÈS FAIBLE -> NORMAL -> ACTUEL -> ÉLEVÉ -> EXCEPTIONNEL) */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-3.5">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Échelle d&apos;anomalie hydrologique</span>
          <span className="text-[#38BDF8] font-semibold">{report.level_summary}</span>
        </div>

        {/* ASCII / Graphical Hydrological Ladder */}
        <div className="relative py-2 px-3 font-mono text-xs text-slate-300 select-none">
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Left Diagram Column */}
            <div className="col-span-12 sm:col-span-7 space-y-1">
              {/* Level: Exceptionnel */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-28 text-right text-[11px]">exceptionnel</span>
                <span className="text-purple-400 font-bold">└──</span>
                <span className="text-[11px] text-slate-400">&gt; P90 (&gt; {formatNumberFr(report.quantiles_for_date.q90, 0)} m³/s)</span>
              </div>

              {/* Level: Élevé */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-28 text-right text-[11px]">élevé</span>
                <span className="text-[#38BDF8] font-bold">├──</span>
                <span className="text-[11px] text-slate-400">P75–P90 ({formatNumberFr(report.quantiles_for_date.q75, 0)}–{formatNumberFr(report.quantiles_for_date.q90, 0)} m³/s)</span>
              </div>

              {/* Level: ACTUEL (Highlighted branch) */}
              <div className="flex items-center gap-2 bg-[#0EA5E9]/15 border border-[#0EA5E9]/40 py-1.5 px-2 rounded-lg my-1">
                <span className="text-[#38BDF8] font-bold w-24 text-right text-xs">actuel</span>
                <span className="text-[#38BDF8] font-bold">├────────●</span>
                <span className="text-slate-50 font-bold text-xs">
                  {formatNumberFr(report.flow_m3s, 1)} m³/s
                </span>
                <span className="text-emerald-300 text-[11px] font-semibold">
                  ({formatPercentileFr(report.percentile)} · z: {report.z_score >= 0 ? '+' : ''}{report.z_score}σ)
                </span>
              </div>

              {/* Level: Normal */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-28 text-right text-[11px]">normal</span>
                <span className="text-emerald-400 font-bold">├──</span>
                <span className="text-[11px] text-slate-400">P25–P75 ({formatNumberFr(report.quantiles_for_date.q25, 0)}–{formatNumberFr(report.quantiles_for_date.q75, 0)} m³/s)</span>
              </div>

              {/* Level: Très faible */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-28 text-right text-[11px]">très faible</span>
                <span className="text-amber-400 font-bold">│</span>
                <span className="text-[11px] text-slate-400">&lt; P10 (&lt; {formatNumberFr(report.quantiles_for_date.q10, 0)} m³/s)</span>
              </div>
            </div>

            {/* Right Gauge Bar Column */}
            <div className="col-span-12 sm:col-span-5 bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-[11px] space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Régime actuel</span>
                <span className="font-semibold text-slate-100">{report.level_label.toUpperCase()}</span>
              </div>

              {/* Continuous percentile bar */}
              <div className="relative h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div className="absolute top-0 bottom-0 left-0 w-[10%] bg-amber-500/30" title="Très faible (< P10)" />
                <div className="absolute top-0 bottom-0 left-[25%] w-[50%] bg-emerald-500/25 border-x border-emerald-500/40" title="Normal (P25-P75)" />
                <div className="absolute top-0 bottom-0 left-[75%] w-[15%] bg-[#38BDF8]/30" title="Élevé (P75-P90)" />
                <div className="absolute top-0 bottom-0 left-[90%] w-[10%] bg-purple-500/30" title="Exceptionnel (> P90)" />

                {/* Marker for current percentile */}
                <div
                  className="absolute top-0 bottom-0 w-2 -ml-1 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"
                  style={{ left: `${ladderPos}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>P10: {formatNumberFr(report.quantiles_for_date.q10, 0)}</span>
                <span>P50: {formatNumberFr(report.quantiles_for_date.q50, 0)}</span>
                <span>P90: {formatNumberFr(report.quantiles_for_date.q90, 0)} m³/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 5 CALCULATED STATISTICAL METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 font-mono tabular-nums text-xs">
        {/* Metric 1: Percentile */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase">Percentile</div>
          <div className="text-base font-bold text-emerald-300 mt-0.5">
            {formatPercentileFr(report.percentile)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Rang distribution 30 ans</div>
        </div>

        {/* Metric 2: z-score */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase">z-score</div>
          <div className="text-base font-bold text-[#38BDF8] mt-0.5">
            {report.z_score >= 0 ? '+' : ''}{report.z_score} σ
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Écarts-types vs normale</div>
        </div>

        {/* Metric 3: Écart à la normale saisonnière */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase truncate">Écart normale saison</div>
          <div
            className={`text-base font-bold mt-0.5 ${
              report.deviation_to_seasonal_mean_pct >= 0 ? 'text-[#38BDF8]' : 'text-amber-400'
            }`}
          >
            {formatSignedPercentFr(report.deviation_to_seasonal_mean_pct, 1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {report.deviation_to_seasonal_mean_m3s >= 0 ? '+' : ''}
            {formatNumberFr(report.deviation_to_seasonal_mean_m3s, 1)} m³/s (moy: {formatNumberFr(report.seasonal_mean_m3s, 0)})
          </div>
        </div>

        {/* Metric 4: Écart à la médiane */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase truncate">Écart à la médiane</div>
          <div
            className={`text-base font-bold mt-0.5 ${
              report.deviation_to_seasonal_median_pct >= 0 ? 'text-[#38BDF8]' : 'text-amber-400'
            }`}
          >
            {formatSignedPercentFr(report.deviation_to_seasonal_median_pct, 1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {report.deviation_to_seasonal_median_m3s >= 0 ? '+' : ''}
            {formatNumberFr(report.deviation_to_seasonal_median_m3s, 1)} m³/s (méd: {formatNumberFr(report.seasonal_median_m3s, 0)})
          </div>
        </div>

        {/* Metric 5: Écart au module annuel (pour comparaison) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 uppercase truncate">Écart module annuel</div>
          <div
            className={`text-base font-bold mt-0.5 ${
              report.deviation_to_annual_mean_pct >= 0 ? 'text-slate-100' : 'text-slate-300'
            }`}
          >
            {formatSignedPercentFr(report.deviation_to_annual_mean_pct, 1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {report.deviation_to_annual_mean_m3s >= 0 ? '+' : ''}
            {formatNumberFr(report.deviation_to_annual_mean_m3s, 1)} m³/s (an: {formatNumberFr(report.annual_mean_m3s, 0)})
          </div>
        </div>
      </div>

      {/* 3. SAISONNALITÉ COMPARÉE : "UN DÉBIT DE 400 M³/S N'A PAS LA MÊME SIGNIFICATION EN JANVIER ET EN AOÛT" */}
      <div className="bg-[#09101D] border border-slate-800 rounded-lg p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-slate-100">
              Sensibilité saisonnière : Pourquoi la période de l&apos;année est capitale
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400 italic">
            &laquo; Un débit de 400 m³/s n&apos;a pas la même signification en janvier et en août &raquo;
          </span>
        </div>

        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300">
          <p className="font-mono text-[11px] text-[#38BDF8]">
            {report.comparative_simulation.takeaway}
          </p>
        </div>

        {/* Interactive Comparison Switcher */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>Tester un débit sur le cycle annuel :</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={Math.round(report.annual_mean_m3s * 0.2)}
                max={Math.round(report.annual_mean_m3s * 2.2)}
                step={10}
                value={customFlow}
                onChange={(e) => setCustomFlow(Number(e.target.value))}
                className="w-32 accent-[#38BDF8] cursor-pointer"
              />
              <span className="font-bold text-slate-100 tabular-nums w-20 text-right">
                {customFlow} m³/s
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-xs">
            {/* January Column */}
            <div
              onClick={() => setActiveSimulationMonth('jan')}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                activeSimulationMonth === 'jan'
                  ? 'bg-blue-950/40 border-[#38BDF8]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-slate-200">JANVIER (Hiver)</span>
                <span>Moy: {bJan.mean_m3s} m³/s</span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-50">{customFlow} m³/s</span>
                <span className={`text-xs font-semibold ${janSim.tagColor}`}>
                  {janSim.tag}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{formatPercentileFr(janSim.p)}</span>
                <span className={janSim.devPct >= 0 ? 'text-[#38BDF8]' : 'text-amber-400'}>
                  {formatSignedPercentFr(janSim.devPct, 1)}
                </span>
                <span>z: {janSim.z >= 0 ? '+' : ''}{janSim.z}σ</span>
              </div>
            </div>

            {/* August Column */}
            <div
              onClick={() => setActiveSimulationMonth('aug')}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                activeSimulationMonth === 'aug'
                  ? 'bg-amber-950/40 border-amber-400'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-slate-200">AOÛT (Étiage estival)</span>
                <span>Moy: {bAug.mean_m3s} m³/s</span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-50">{customFlow} m³/s</span>
                <span className={`text-xs font-semibold ${augSim.tagColor}`}>
                  {augSim.tag}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{formatPercentileFr(augSim.p)}</span>
                <span className={augSim.devPct >= 0 ? 'text-[#38BDF8]' : 'text-amber-400'}>
                  {formatSignedPercentFr(augSim.devPct, 1)}
                </span>
                <span>z: {augSim.z >= 0 ? '+' : ''}{augSim.z}σ</span>
              </div>
            </div>

            {/* Current Month Column */}
            <div
              onClick={() => setActiveSimulationMonth('current')}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                activeSimulationMonth === 'current'
                  ? 'bg-emerald-950/40 border-emerald-400'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-slate-200">OCTOBRE (Actuel)</span>
                <span>Moy: {bCurrent.mean_m3s} m³/s</span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-50">{customFlow} m³/s</span>
                <span className={`text-xs font-semibold ${curSim.tagColor}`}>
                  {curSim.tag}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{formatPercentileFr(curSim.p)}</span>
                <span className={curSim.devPct >= 0 ? 'text-[#38BDF8]' : 'text-amber-400'}>
                  {formatSignedPercentFr(curSim.devPct, 1)}
                </span>
                <span>z: {curSim.z >= 0 ? '+' : ''}{curSim.z}σ</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. CLIMATOLOGY PROFILE OVER 12 MONTHS (RECHARTS) */}
        <div className="pt-2">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Cycle annuel normal de débit (1991–2020) et positionnement actuel</span>
            <span>Moyenne annuelle: {formatNumberFr(report.annual_mean_m3s, 0)} m³/s</span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyBenchmarks} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
                <XAxis
                  dataKey="month_short"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" m³/s"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D17',
                    borderColor: '#38BDF8',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                  formatter={(val: any, name: any) => [
                    `${val} m³/s`,
                    name === 'mean_m3s'
                      ? 'Moyenne normale du mois'
                      : name === 'median_m3s'
                      ? 'Médiane normale'
                      : name === 'q75_m3s'
                      ? 'Quartile P75 (Haut)'
                      : 'Quartile P25 (Bas)',
                  ]}
                />
                {/* Interquartile corridor P25-P75 */}
                <Area
                  type="monotone"
                  dataKey="q75_m3s"
                  stroke="none"
                  fill="#64748B"
                  fillOpacity={0.16}
                  name="q75_m3s"
                />
                <Area
                  type="monotone"
                  dataKey="q25_m3s"
                  stroke="none"
                  fill="#0D1626"
                  fillOpacity={1}
                  name="q25_m3s"
                />
                {/* Monthly Mean line */}
                <Line
                  type="monotone"
                  dataKey="mean_m3s"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#F59E0B' }}
                  name="mean_m3s"
                />
                {/* Reference point for current October flow */}
                <ReferenceDot
                  x="Oct"
                  y={report.flow_m3s}
                  r={5}
                  fill="#38BDF8"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" /> Point actuel en Octobre ({formatNumberFr(report.flow_m3s, 0)} m³/s)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400" /> Moyenne mensuelle normale
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-500/25" /> Corridor P25–P75
            </span>
          </div>
        </div>

        {/* Provenance Traçabilité */}
        <div className="pt-3 border-t border-slate-800/80">
          <DataProvenanceBox
            variant="inline"
            metricName="Débit & Climatologie 30 ans"
            source="Copernicus CEMS GloFAS"
            type="modèle"
            version="5.0 (LISFLOOD/ERA5 1991–2020)"
            lastUpdated="30/09/2026 06:00"
            notes="Climatologie de référence 1991-2020 issue de la réanalyse Copernicus GloFAS v5.0."
          />
        </div>
      </div>
    </section>
  );
};
