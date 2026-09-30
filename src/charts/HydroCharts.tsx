import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { DischargePoint, ForecastStep, TemperaturePoint } from '../types/hydrology';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatNumberFr, formatPercentileFr, formatSignedPercentFr } from '../utils/formatters';

interface DischargeChartProps {
  data: DischargePoint[];
  glofasPointId: string;
  referenceLabel?: string;
  days: number;
  onChangeDays: (days: number) => void;
}

const CustomDischargeTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const pt: DischargePoint | undefined = payload[0]?.payload;
  if (!pt) return null;

  const isPositive = pt.deviation_pct >= 0;

  return (
    <div className="bg-[#070D17]/95 border border-slate-700 rounded-lg p-3 shadow-xl font-mono text-xs space-y-1.5 min-w-[230px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="font-semibold text-slate-100">{label}</span>
        <span className="text-[10px] text-[#38BDF8]">GloFAS ERA5</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Débit du jour</span>
        <span className="font-bold text-slate-50">{formatNumberFr(pt.value, 1)} m³/s</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Moyenne pour cette date</span>
        <span className="text-slate-200">{formatNumberFr(pt.seasonal_mean, 1)} m³/s</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Écart vs normale</span>
        <span className={`font-semibold ${isPositive ? 'text-[#38BDF8]' : 'text-amber-400'}`}>
          {formatSignedPercentFr(pt.deviation_pct, 1)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Position historique</span>
        <span className="text-emerald-300 font-semibold">{formatPercentileFr(pt.percentile)}</span>
      </div>
      <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Corridor normal P25–P75</span>
        <span>
          {formatNumberFr(pt.historical_q25, 0)}–{formatNumberFr(pt.historical_q75, 0)} m³/s
        </span>
      </div>
    </div>
  );
};

export const DischargeHistoryChart: React.FC<DischargeChartProps> = ({
  data,
  glofasPointId,
  referenceLabel,
  days,
  onChangeDays,
}) => {
  const latestPoint = data[data.length - 1];
  const seasonalRef = latestPoint?.seasonal_mean ?? 365;

  return (
    <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-100">
              Trajectoire du débit vs Normale calendaire (1991–2020)
            </h4>
            <CategoryBadge category="MODELE" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {referenceLabel ? `${referenceLabel} · ` : ''}Point {glofasPointId}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-800 text-[11px] font-mono">
          {[14, 30, 60].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChangeDays(d)}
              className={`px-2 py-0.5 rounded transition ${
                days === d
                  ? 'bg-[#0EA5E9] text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}j
            </button>
          ))}
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="date_label"
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
              minTickGap={22}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              unit=" m³/s"
            />
            <Tooltip content={<CustomDischargeTooltip />} />

            {/* Historical P75 upper normal envelope */}
            <Area
              type="monotone"
              dataKey="historical_q75"
              stroke="none"
              fill="#64748B"
              fillOpacity={0.14}
              name="Quartile historique P75"
            />

            {/* Actual / Reanalysis Discharge */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#38BDF8"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#dischargeGrad)"
              name="Débit actuel (m³/s)"
            />

            {/* Historical Seasonal Mean for each date */}
            <Line
              type="monotone"
              dataKey="seasonal_mean"
              stroke="#F59E0B"
              strokeWidth={1.6}
              strokeDasharray="4 4"
              dot={false}
              name="Moyenne pour cette date"
            />

            <ReferenceLine
              y={seasonalRef}
              stroke="#F59E0B"
              strokeOpacity={0.35}
              strokeDasharray="2 2"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#38BDF8]" /> Débit observé/modélisé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-amber-400" /> Moyenne pour cette date ({formatNumberFr(seasonalRef, 0)} m³/s)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-500/25" /> Enveloppe P25–P75
        </span>
      </div>
    </div>
  );
};

interface ForecastChartProps {
  steps: ForecastStep[];
  glofasPointId: string;
}

export const EnsembleForecastChart: React.FC<ForecastChartProps> = ({
  steps,
  glofasPointId,
}) => {
  const seasonalRef = steps[0]?.seasonal_mean;

  return (
    <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-100">
              Prévisions d&apos;ensemble GloFAS (J+10 · 51 membres)
            </h4>
            <CategoryBadge category="PREVISION" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Quantiles P10–P90, P25–P75, Médiane &amp; Normale calendaire · {glofasPointId}
          </p>
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={steps} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="date_label"
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
              minTickGap={18}
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
                borderColor: '#A855F7',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Area
              type="monotone"
              dataKey="p90"
              stroke="none"
              fill="#A855F7"
              fillOpacity={0.14}
              name="Quantile P90 (Haut)"
            />
            <Area
              type="monotone"
              dataKey="p75"
              stroke="none"
              fill="#A855F7"
              fillOpacity={0.22}
              name="Quantile P75"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="#C084FC"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#C084FC' }}
              name="Médiane d'ensemble (P50)"
            />
            <Line
              type="monotone"
              dataKey="control"
              stroke="#38BDF8"
              strokeWidth={1.8}
              strokeDasharray="4 3"
              dot={false}
              name="Membre de contrôle"
            />
            <Line
              type="monotone"
              dataKey="seasonal_mean"
              stroke="#F59E0B"
              strokeWidth={1.4}
              strokeDasharray="3 3"
              dot={false}
              name="Moyenne pour cette date"
            />
            <Line
              type="monotone"
              dataKey="p10"
              stroke="#64748B"
              strokeWidth={1}
              strokeDasharray="2 2"
              dot={false}
              name="Quantile P10 (Bas)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#C084FC]" /> Médiane P50
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-[#38BDF8]" /> Contrôle déterministe
        </span>
        {seasonalRef !== undefined && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-amber-400" /> Normale du jour ({formatNumberFr(seasonalRef, 0)} m³/s)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#A855F7]/25" /> Enveloppe P10–P90
        </span>
      </div>
    </div>
  );
};

interface TemperatureChartProps {
  data: TemperaturePoint[];
}

export const TemperatureHistoryChart: React.FC<TemperatureChartProps> = ({ data }) => {
  const stationName = data[0]?.station_name || "Station Hub'Eau";
  const stationCode = data[0]?.station_code || '—';
  const seasonalMean = data[0]?.seasonal_mean_c ?? 15.6;

  return (
    <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-100">
              Température de l&apos;eau in-situ vs Normale saisonnière
            </h4>
            <CategoryBadge category="OBSERVATION" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Station #{stationCode} — {stationName} · Normale du jour: {formatNumberFr(seasonalMean, 1)} °C
          </p>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="date_label"
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
              minTickGap={26}
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 3']}
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              unit=" °C"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#070D17',
                borderColor: '#10B981',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
              }}
              formatter={(value: any, name: any) => [
                `${value} °C`,
                name === 'seasonal_mean_c' ? 'Normale pour cette date' : "Température de l'eau",
              ]}
            />
            <ReferenceLine
              y={22}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              label={{
                value: 'Seuil vigilance thermique (22 °C)',
                position: 'insideTopRight',
                fill: '#F59E0B',
                fontSize: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="seasonal_mean_c"
              stroke="#94A3B8"
              strokeWidth={1.4}
              strokeDasharray="3 3"
              dot={false}
              name="seasonal_mean_c"
            />
            <Area
              type="monotone"
              dataKey="temperature_c"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tempGrad)"
              name="temperature_c"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
