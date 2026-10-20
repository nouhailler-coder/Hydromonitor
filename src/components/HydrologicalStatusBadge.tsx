import React from 'react';
import {
  AlertOctagon,
  ArrowDownCircle,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Waves,
  Sliders,
  Info,
} from 'lucide-react';
import { HydrologicalStatusCode, HydrologicalStatusEvaluation } from '../types/hydrology';
import { hydrologicalStatusEngine } from '../services/hydrologicalStatusEngine';

interface HydrologicalStatusBadgeProps {
  status?: HydrologicalStatusCode | string;
  evaluation?: HydrologicalStatusEvaluation | null;
  percentile?: number;
  variant?: 'pill' | 'badge' | 'card' | 'compact';
  onOpenInspector?: () => void;
  className?: string;
  showHelpIcon?: boolean;
}

export const HydrologicalStatusBadge: React.FC<HydrologicalStatusBadgeProps> = ({
  status,
  evaluation,
  percentile,
  variant = 'badge',
  onOpenInspector,
  className = '',
  showHelpIcon = true,
}) => {
  const normStatus: HydrologicalStatusCode = (
    evaluation?.status_code ||
    (status as HydrologicalStatusCode) ||
    'NORMAL'
  ).toUpperCase() as HydrologicalStatusCode;

  const meta = hydrologicalStatusEngine.getStatusMetadata(normStatus);
  const p = evaluation?.calculated_percentile ?? percentile;

  const renderIcon = (sizeClass = 'w-3.5 h-3.5') => {
    switch (normStatus) {
      case 'DROUGHT':
        return <AlertOctagon className={sizeClass} />;
      case 'LOW_FLOW':
        return <ArrowDownCircle className={sizeClass} />;
      case 'NORMAL':
        return <CheckCircle2 className={sizeClass} />;
      case 'HIGH_FLOW':
        return <TrendingUp className={sizeClass} />;
      case 'FLOOD':
        return <AlertTriangle className={sizeClass} />;
      case 'EXTREME_FLOOD':
        return <Waves className={`${sizeClass} animate-pulse`} />;
      default:
        return <CheckCircle2 className={sizeClass} />;
    }
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={onOpenInspector}
        title={`Statut hydrologique : ${meta.label_fr} (${p !== undefined ? `P${p}` : ''}) — Cliquer pour inspecter le moteur`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold transition hover:opacity-85 ${meta.badge_class} ${className}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <span>{meta.label_fr.toUpperCase()}</span>
        {p !== undefined && (
          <span className="opacity-70 font-sans font-normal text-[10px]">
            (P{p})
          </span>
        )}
        {onOpenInspector && showHelpIcon && (
          <Sliders className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold ${meta.badge_class} ${className}`}
      >
        {renderIcon('w-3 h-3')}
        <span>{meta.label_fr.toUpperCase()}</span>
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-xl border p-4 bg-slate-900/60 backdrop-blur-sm transition ${className}`}
        style={{ borderColor: `${meta.color}35` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${meta.color}20`,
                color: meta.color,
              }}
            >
              {renderIcon('w-5 h-5')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                  État Hydrologique Moteur
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${meta.color}20`,
                    color: meta.color,
                  }}
                >
                  {meta.label_fr}
                </span>
              </div>
              <h4 className="font-display font-bold text-slate-100 text-sm mt-0.5 flex items-center gap-2">
                <span>{normStatus}</span>
                {p !== undefined && (
                  <span className="text-xs font-mono font-normal text-slate-400">
                    · {p}e percentile
                  </span>
                )}
              </h4>
            </div>
          </div>

          {onOpenInspector && (
            <button
              type="button"
              onClick={onOpenInspector}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
            >
              <Sliders className="w-3 h-3 text-[#38BDF8]" />
              <span>Seuils &amp; Pipeline</span>
            </button>
          )}
        </div>

        <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
          {meta.recommendation}
        </p>

        {evaluation && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
            <span>
              Grille appliquée :{' '}
              <strong className="text-slate-200">
                {evaluation.threshold_config.name}
              </strong>
            </span>
            <span className="text-[#38BDF8]">
              {evaluation.pipeline.step_4_thresholds.matched_bracket}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default 'badge'
  return (
    <button
      type="button"
      onClick={onOpenInspector}
      title="Cliquer pour voir le calcul détaillé et modifier les seuils documentés"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border font-mono text-xs font-bold transition hover:brightness-110 ${meta.badge_class} ${className}`}
    >
      {renderIcon()}
      <span>{meta.label_fr.toUpperCase()}</span>
      {p !== undefined && (
        <span className="opacity-80 font-normal text-[11px]">· P{p}</span>
      )}
      {onOpenInspector && showHelpIcon && (
        <span className="flex items-center gap-1 pl-1 ml-1 border-l border-current/25 text-[10px] font-sans font-normal opacity-75">
          <Sliders className="w-3 h-3" />
          <span>Seuils</span>
        </span>
      )}
    </button>
  );
};
