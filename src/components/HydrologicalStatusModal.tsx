import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowDownCircle,
  AlertOctagon,
  Waves,
  TrendingUp,
  RotateCcw,
  Save,
  BookOpen,
  ArrowDown,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  HistoricalQuantiles,
  HydrologicalStatusCode,
  HydrologicalStatusEvaluation,
  StatusThresholdConfig,
} from '../types/hydrology';
import {
  hydrologicalStatusEngine,
  DEFAULT_STATUS_THRESHOLDS,
} from '../services/hydrologicalStatusEngine';
import { formatNumberFr } from '../utils/formatters';

interface HydrologicalStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  riverName?: string;
  referenceLabel?: string;
  currentDischargeM3s: number;
  historicalQuantiles: HistoricalQuantiles;
  sourceDataset?: string;
  regionId?: string;
  onThresholdsUpdated?: () => void;
}

export const HydrologicalStatusModal: React.FC<HydrologicalStatusModalProps> = ({
  isOpen,
  onClose,
  riverName = 'La Seine',
  referenceLabel = 'SEINE — PARIS',
  currentDischargeM3s,
  historicalQuantiles,
  sourceDataset = 'Copernicus GloFAS v5.0',
  regionId = 'bassin-seine',
  onThresholdsUpdated,
}) => {
  const [allConfigs, setAllConfigs] = useState<StatusThresholdConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('default_standard');
  const [simulatedFlow, setSimulatedFlow] = useState<number>(currentDischargeM3s);

  // Editable threshold state
  const [editableConfig, setEditableConfig] = useState<StatusThresholdConfig | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Load configs on open
  useEffect(() => {
    if (isOpen) {
      const configs = hydrologicalStatusEngine.getAllConfigs();
      setAllConfigs(configs);

      // Best match config for current region or source
      const initial = hydrologicalStatusEngine.getConfig(
        sourceDataset.toUpperCase().includes('HUBEAU') ? 'HUBEAU' : 'GLOFAS',
        regionId
      );
      setSelectedConfigId(initial.id);
      setEditableConfig({ ...initial });
      setSimulatedFlow(currentDischargeM3s);
      setSaveSuccess(null);
    }
  }, [isOpen, currentDischargeM3s, regionId, sourceDataset]);

  if (!isOpen || !editableConfig) return null;

  // Compute evaluation with current simulated flow & editable config
  const evaluation: HydrologicalStatusEvaluation = hydrologicalStatusEngine.evaluate({
    current_discharge_m3s: simulatedFlow,
    historical_quantiles: historicalQuantiles,
    source: editableConfig.source,
    region_id: editableConfig.region_id,
    override_thresholds: editableConfig,
    reference_period_label: 'Climatologie journalière 1991–2020 (30 ans)',
  });

  const handleSelectPreset = (id: string) => {
    const found = allConfigs.find((c) => c.id === id);
    if (found) {
      setSelectedConfigId(id);
      setEditableConfig({ ...found });
      setSaveSuccess(null);
    }
  };

  const handleThresholdChange = (key: keyof StatusThresholdConfig, value: number) => {
    setEditableConfig((prev) => (prev ? { ...prev, [key]: value } : null));
    setSaveSuccess(null);
  };

  const handleSaveConfig = () => {
    if (!editableConfig) return;
    hydrologicalStatusEngine.saveConfig(editableConfig);
    setAllConfigs(hydrologicalStatusEngine.getAllConfigs());
    setSaveSuccess(`Seuils pour "${editableConfig.name}" enregistrés dans l'application.`);
    if (onThresholdsUpdated) onThresholdsUpdated();
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleResetCurrent = () => {
    if (!editableConfig) return;
    hydrologicalStatusEngine.resetConfig(editableConfig.id);
    const refreshed = hydrologicalStatusEngine.getConfig(
      editableConfig.source,
      editableConfig.region_id,
      editableConfig.id
    );
    setEditableConfig({ ...refreshed });
    setSaveSuccess('Seuils réinitialisés aux valeurs documentées de référence.');
    if (onThresholdsUpdated) onThresholdsUpdated();
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const { pipeline } = evaluation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0D1626] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070D17]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/15 text-[#38BDF8] border border-sky-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-slate-100">
                  Moteur Hydrologique : <span className="text-[#38BDF8]">HydrologicalStatusEngine</span>
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  6 ÉTATS SCIENTIFIQUES
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Classification rigoureuse basée sur des seuils documentés · {referenceLabel} ({riverName})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* THE 5-STEP PIPELINE DIAGRAM AS REQUESTED */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Pipeline Scientifique Explicite
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Débit actuel → Historique → Percentile → Seuils → Classification
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {/* Step 1: Débit actuel */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    1. Débit actuel
                  </span>
                  <div className="text-lg font-extrabold text-slate-100 font-mono mt-1">
                    {formatNumberFr(simulatedFlow)} <span className="text-xs font-normal text-slate-400">m³/s</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                  {sourceDataset}
                </div>
              </div>

              {/* Step 2: Historique */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    2. Historique
                  </span>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    Médiane {historicalQuantiles.q50} m³/s
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Q10:{historicalQuantiles.q10} · Q90:{historicalQuantiles.q90}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                  Climatologie 1991–2020
                </div>
              </div>

              {/* Step 3: Percentile */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    3. Percentile
                  </span>
                  <div className="text-lg font-extrabold text-[#38BDF8] font-mono mt-1">
                    {evaluation.calculated_percentile}e
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    z-score: {evaluation.z_score >= 0 ? '+' : ''}{evaluation.z_score}σ
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                  Interpolation quantile
                </div>
              </div>

              {/* Step 4: Seuils documentés */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    4. Seuils
                  </span>
                  <div className="text-xs font-bold text-slate-200 mt-1 line-clamp-1">
                    {pipeline.step_4_thresholds.matched_bracket}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Grille : {editableConfig.name.split('(')[0].trim()}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                  {editableConfig.source} · {editableConfig.region_id || 'Global'}
                </div>
              </div>

              {/* Step 5: Classification finale */}
              <div
                className="rounded-lg p-3 text-center flex flex-col justify-between border"
                style={{
                  backgroundColor: `${evaluation.color}15`,
                  borderColor: `${evaluation.color}40`,
                }}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
                    5. Classification
                  </span>
                  <div
                    className="text-base font-extrabold font-mono mt-1 uppercase"
                    style={{ color: evaluation.color }}
                  >
                    {evaluation.status_code}
                  </div>
                  <div className="text-xs font-bold text-slate-100">
                    {evaluation.label_fr}
                  </div>
                </div>
                <div
                  className="text-[10px] font-mono font-bold mt-2 pt-2 border-t uppercase"
                  style={{ borderColor: `${evaluation.color}30`, color: evaluation.color }}
                >
                  Niveau {evaluation.severity}
                </div>
              </div>
            </div>

            {/* Practical guidance based on regime */}
            <div className="mt-3 p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">Interprétation opérationnelle : </strong>
                {evaluation.management_recommendation}
              </div>
            </div>
          </div>

          {/* SIMULATEUR INTERACTIF DE DÉBIT */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <label htmlFor="flow-sim-range" className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <span>Simuler une variation de débit :</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[#38BDF8] font-mono font-bold text-sm">
                  {formatNumberFr(simulatedFlow)} m³/s
                </span>
                {simulatedFlow !== currentDischargeM3s && (
                  <button
                    type="button"
                    onClick={() => setSimulatedFlow(currentDischargeM3s)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline"
                  >
                    (rétablir actuel : {currentDischargeM3s} m³/s)
                  </button>
                )}
              </label>

              {/* Quick shortcut buttons to test all categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
                <span className="text-slate-500 mr-1">Tester :</span>
                <button
                  type="button"
                  onClick={() => setSimulatedFlow(Math.round(historicalQuantiles.q10 * 0.75))}
                  className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                >
                  Sécheresse (&lt;P10)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedFlow(Math.round(historicalQuantiles.q10 * 1.15))}
                  className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30"
                >
                  Basses eaux (P10-P25)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedFlow(Math.round(historicalQuantiles.q50))}
                  className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                >
                  Normal (P25-P75)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedFlow(Math.round(historicalQuantiles.q75 * 1.1))}
                  className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-500/30"
                >
                  Hautes eaux (P75-P90)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedFlow(Math.round(historicalQuantiles.q90 * 1.15))}
                  className="px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25 border border-yellow-500/30"
                >
                  Crue (P90-P98)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedFlow(Math.round(historicalQuantiles.q90 * 1.55))}
                  className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/40"
                >
                  Crue extrême (&gt;P98)
                </button>
              </div>
            </div>

            <input
              id="flow-sim-range"
              type="range"
              min={Math.max(10, Math.round(historicalQuantiles.q10 * 0.4))}
              max={Math.round(historicalQuantiles.q90 * 2.0)}
              step={5}
              value={simulatedFlow}
              onChange={(e) => setSimulatedFlow(parseFloat(e.target.value))}
              className="w-full accent-[#0EA5E9] cursor-pointer"
            />
          </div>

          {/* CONFIGURATION DES SEUILS DOCUMENTÉS (MODIFIABLE PAR SOURCE / RÉGION) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Configuration des Seuils Scientifiques Documentés</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    (Modifiable par source &amp; par région)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Réf. : <cite className="text-slate-300 not-italic">{editableConfig.scientific_reference}</cite>
                </p>
              </div>

              {/* Profile Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="select-profile-status" className="text-xs font-mono text-slate-400">Profil :</label>
                <select
                  id="select-profile-status"
                  value={selectedConfigId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#38BDF8]"
                >
                  {allConfigs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} [{c.source}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Threshold Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Drought (< P10) */}
              <div className="p-3 rounded-lg border border-red-500/25 bg-red-950/15">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold font-mono text-red-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Seuil SÉCHERESSE (DROUGHT)
                  </span>
                  <span className="font-mono text-xs font-bold text-red-300">
                    &lt; P{editableConfig.drought_max_percentile}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={20}
                  step={1}
                  value={editableConfig.drought_max_percentile}
                  onChange={(e) =>
                    handleThresholdChange('drought_max_percentile', parseFloat(e.target.value))
                  }
                  className="w-full accent-red-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Guide d’étiage : P10 correspond usuellement au QMNA5 (débit mensuel minimal sec de retour 5 ans).
                </p>
              </div>

              {/* Low Flow (P10 - P25) */}
              <div className="p-3 rounded-lg border border-amber-500/25 bg-amber-950/15">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1.5">
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                    Seuil BASSES EAUX (LOW_FLOW)
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-300">
                    P{editableConfig.drought_max_percentile} à P{editableConfig.low_flow_max_percentile}
                  </span>
                </div>
                <input
                  type="range"
                  min={editableConfig.drought_max_percentile + 2}
                  max={35}
                  step={1}
                  value={editableConfig.low_flow_max_percentile}
                  onChange={(e) =>
                    handleThresholdChange('low_flow_max_percentile', parseFloat(e.target.value))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Seuil de vigilance et 1er quartile interannuel. Étiage significatif sans crise majeure.
                </p>
              </div>

              {/* High Flow (P75 - P90) */}
              <div className="p-3 rounded-lg border border-sky-500/25 bg-sky-950/15">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold font-mono text-sky-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Seuil HAUTES EAUX (HIGH_FLOW)
                  </span>
                  <span className="font-mono text-xs font-bold text-sky-300">
                    P{editableConfig.high_flow_min_percentile} à P{editableConfig.flood_min_percentile}
                  </span>
                </div>
                <input
                  type="range"
                  min={65}
                  max={editableConfig.flood_min_percentile - 2}
                  step={1}
                  value={editableConfig.high_flow_min_percentile}
                  onChange={(e) =>
                    handleThresholdChange('high_flow_min_percentile', parseFloat(e.target.value))
                  }
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  3e quartile interannuel. Remplissage des nappes et débits vifs d’automne/hiver.
                </p>
              </div>

              {/* Flood (P90 - P98) & Extreme (> P98) */}
              <div className="p-3 rounded-lg border border-yellow-500/25 bg-yellow-950/15">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold font-mono text-yellow-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Seuil CRUE (FLOOD) &amp; CRUE EXTRÊME
                  </span>
                  <span className="font-mono text-xs font-bold text-yellow-300">
                    Crue: P{editableConfig.flood_min_percentile} · Extrême: &gt; P{editableConfig.extreme_flood_min_percentile}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Début Crue (P90)</span>
                    <input
                      type="range"
                      min={80}
                      max={95}
                      step={0.5}
                      value={editableConfig.flood_min_percentile}
                      onChange={(e) =>
                        handleThresholdChange('flood_min_percentile', parseFloat(e.target.value))
                      }
                      className="w-full accent-yellow-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Crue Extrême (P98)</span>
                    <input
                      type="range"
                      min={96}
                      max={99.5}
                      step={0.5}
                      value={editableConfig.extreme_flood_min_percentile}
                      onChange={(e) =>
                        handleThresholdChange('extreme_flood_min_percentile', parseFloat(e.target.value))
                      }
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  P90 correspond à la crue biennale Q2 ; P98 correspond aux crues cinquantennales Q20–Q50.
                </p>
              </div>
            </div>

            {/* Target Source & Region Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div>
                <label htmlFor="source-target-input" className="text-slate-400 block mb-1">Source cible :</label>
                <select
                  id="source-target-input"
                  value={editableConfig.source}
                  onChange={(e) => handleThresholdChange('source', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="ALL">ALL (Toutes sources confondues)</option>
                  <option value="GLOFAS">GLOFAS (Modèle Copernicus CEMS)</option>
                  <option value="HUBEAU">HUBEAU (Observations In Situ)</option>
                  <option value="HYDRORIVERS">HYDRORIVERS (Morphologie du tronçon)</option>
                </select>
              </div>
              <div>
                <label htmlFor="region-target-input" className="text-slate-400 block mb-1">Bassin / Région cible :</label>
                <input
                  id="region-target-input"
                  type="text"
                  value={editableConfig.region_name || 'Toutes régions'}
                  onChange={(e) => handleThresholdChange('region_name' as any, e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>

            {/* Actions & Feedback */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-mono font-bold transition shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les seuils de ce profil</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Rétablir valeurs documentées</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveSuccess}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#070D17]/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            HydroMonitor Core Engine · Classification objective et transparente
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition"
          >
            Fermer l&apos;inspecteur
          </button>
        </div>
      </div>
    </div>
  );
};
