import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { DischargePoint, ForecastStep, TemperaturePoint } from '../types/hydrology';
import { CategoryBadge } from '../components/CategoryBadge';

interface DischargeChartProps {
  data: DischargePoint[];
  glofasPointId: string;
  days: number;
  onChangeDays: (days: number) => void;
}

export const DischargeHistoryChart: React.FC<DischargeChartProps> = ({
  data,
  glofasPointId,
  days,
  onChangeDays,
}) => {
  const meanRef = data[0]?.mean_reference ?? 450;

  return (
    <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              DÉBIT HISTORIQUE (RÉANALYSE LISFLOOD)
            </h4>
            <CategoryBadge category="MODELE" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Source: Copernicus EWDS `cems-glofas-historical` • Point: {glofasPointId}
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

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.38} />
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
            <Tooltip
              contentStyle={{
                backgroundColor: '#070D17',
                borderColor: '#0EA5E9',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
              }}
              formatter={(value: any) => [`${value} m³/s`, 'Débit GloFAS (MODÈLE)']}
            />
            <ReferenceLine
              y={meanRef}
              stroke="#64748B"
              strokeDasharray="4 4"
              label={{
                value: `Module moy. (${meanRef} m³/s)`,
                position: 'insideTopRight',
                fill: '#94A3B8',
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#38BDF8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#dischargeGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
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
  return (
    <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              PRÉVISIONS D&apos;ENSEMBLE GLOFAS (J+10 • 51 MEMBRES)
            </h4>
            <CategoryBadge category="PREVISION" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Quantiles P10–P90, P25–P75, Médiane &amp; Contrôle • `cems-glofas-forecast` ({glofasPointId})
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

  return (
    <div className="bg-[#0D1626]/90 border border-slate-800/90 rounded-lg p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              TEMPÉRATURE DE L&apos;EAU IN-SITU (HUB&apos;EAU)
            </h4>
            <CategoryBadge category="OBSERVATION" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-md">
            Station #{stationCode} — {stationName} (Qualification Naïades Code 1)
          </p>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
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
              domain={['auto', 'auto']}
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
              formatter={(value: any) => [`${value} °C`, "Température Hub'Eau (OBSERVATION)"]}
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
            <Area
              type="monotone"
              dataKey="temperature_c"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tempGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
