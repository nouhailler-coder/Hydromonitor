import {
  HistoricalQuantiles,
  HydrologicalStatusCode,
  HydrologicalStatusEvaluation,
  StatusThresholdConfig,
} from '../types/hydrology';

/**
 * Registre des configurations de seuils documentés.
 * Basé sur les textes et guides de référence :
 * - Guide méthodologique d'application des débits d'étiage (MEDDE/OFB)
 * - Schémas Directeurs d'Aménagement et de Gestion des Eaux (SDAGE)
 * - Réseau Vigicrues (DGPR)
 * - Copernicus CEMS GloFAS (Flood Hazard Matrix & Seasonal Anomaly Index)
 */
export const DEFAULT_STATUS_THRESHOLDS: StatusThresholdConfig[] = [
  {
    id: 'default_standard',
    name: 'Référence Standard Européenne (SDAGE / CEMS)',
    source: 'ALL',
    region_id: null,
    region_name: 'Europe / France métropolitaine',
    scientific_reference:
      "SDAGE & Guide méthodologique d'évaluation des débits d'étiage (MEDDE/OFB), CEMS GloFAS v5.0",
    description:
      'Grille quantile standardisée : P10 (crise sécheresse/QMNA5), P25 (étiage/vigilance), P75 (hautes eaux), P90 (crue biennale Q2), P98 (crue majeure Q20+).',
    drought_max_percentile: 10.0,
    low_flow_max_percentile: 25.0,
    high_flow_min_percentile: 75.0,
    flood_min_percentile: 90.0,
    extreme_flood_min_percentile: 98.0,
    is_default: true,
  },
  {
    id: 'glofas_era5',
    name: 'Copernicus CEMS GloFAS (Modèle LISFLOOD / ERA5)',
    source: 'GLOFAS',
    region_id: null,
    region_name: 'Modèle spatialisé CEMS maille 0.05° (~5 km)',
    scientific_reference:
      'Copernicus Emergency Management Service — GloFAS Flood Hazard Matrix & Daily Discharges',
    description:
      'Seuils calibrés pour séries temporelles modélisées LISFLOOD lissées sur maille 0.05° : crue P89 et crue extrême P97.5.',
    drought_max_percentile: 10.0,
    low_flow_max_percentile: 25.0,
    high_flow_min_percentile: 75.0,
    flood_min_percentile: 89.0,
    extreme_flood_min_percentile: 97.5,
  },
  {
    id: 'hubeau_insitu',
    name: "Hub'Eau Stations In Situ (Hydrométrie Réelle)",
    source: 'HUBEAU',
    region_id: null,
    region_name: 'Réseau hydrométrique national français (Banque Hydro)',
    scientific_reference:
      'Direction Générale de la Prévention des Risques (DGPR) — Vigicrues & Banque Hydro QMN',
    description:
      "Observations directes en stations limnimétriques avec seuils d'alerte sécheresse préfectoraux et vigicrues jaune/orange/rouge.",
    drought_max_percentile: 10.0,
    low_flow_max_percentile: 25.0,
    high_flow_min_percentile: 75.0,
    flood_min_percentile: 90.0,
    extreme_flood_min_percentile: 98.0,
  },
  {
    id: 'bassin_seine',
    name: 'Bassin Seine-Normandie (Plaine crayeuse amortie)',
    source: 'ALL',
    region_id: 'bassin-seine',
    region_name: "Bassin de la Seine et cours d'eau côtiers normands",
    scientific_reference:
      "SDAGE Seine-Normandie 2022–2027 & Direction régionale et interdépartementale de l'environnement (DRIEE)",
    description:
      'Amortissement karstique/crayeux remarquable. Étiages progressifs et crues d’hiver lentes de nappe débordante.',
    drought_max_percentile: 10.0,
    low_flow_max_percentile: 25.0,
    high_flow_min_percentile: 75.0,
    flood_min_percentile: 90.0,
    extreme_flood_min_percentile: 98.0,
  },
  {
    id: 'bassin_loire',
    name: 'Bassin Loire-Bretagne (Socle granitique vif)',
    source: 'ALL',
    region_id: 'bassin-loire',
    region_name: 'Bassin Loire-Bretagne',
    scientific_reference:
      'SDAGE Loire-Bretagne & Observatoire National des Étiages (ONDE)',
    description:
      'Régime pluvial vif sur substrat peu perméable. Débits d’étiage très sensibles nécessitant une vigilance dès P28.',
    drought_max_percentile: 12.0,
    low_flow_max_percentile: 28.0,
    high_flow_min_percentile: 78.0,
    flood_min_percentile: 91.0,
    extreme_flood_min_percentile: 97.5,
  },
  {
    id: 'bassin_rhone',
    name: 'Bassin Rhône-Méditerranée (Mixte Nivo-Glaciaire & Cévenol)',
    source: 'ALL',
    region_id: 'bassin-rhone',
    region_name: 'Bassin Rhône-Méditerranée',
    scientific_reference:
      'SDAGE Rhône-Méditerranée & Service de Prévision des Crues Grand Delta',
    description:
      'Forts contrastes saisonniers d’alimentation alpine et épisodes méditerranéens intenses aval.',
    drought_max_percentile: 10.0,
    low_flow_max_percentile: 25.0,
    high_flow_min_percentile: 75.0,
    flood_min_percentile: 90.0,
    extreme_flood_min_percentile: 98.0,
  },
  {
    id: 'region_mediterranee',
    name: 'Régime Cévenol & Méditerranéen (Crues éclair vives)',
    source: 'ALL',
    region_id: 'region-mediterranee',
    region_name: 'Arc Méditerranéen & Cévennes',
    scientific_reference:
      'SPC Méditerranée Est / SPC Grand Delta — Phénomènes pluvio-hydrologiques intenses',
    description:
      'Cinétique d’onde de crue fulgurante. Étiages sévères (< P8) et seuils d’alerte crue abaissés à P88.',
    drought_max_percentile: 8.0,
    low_flow_max_percentile: 22.0,
    high_flow_min_percentile: 72.0,
    flood_min_percentile: 88.0,
    extreme_flood_min_percentile: 96.0,
  },
];

const LOCAL_STORAGE_KEY = 'hydromonitor_status_thresholds_v1';

class HydrologicalStatusEngineService {
  private customConfigs: Map<string, StatusThresholdConfig> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: StatusThresholdConfig) => {
            if (c.id) this.customConfigs.set(c.id, c);
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load custom thresholds from localStorage', e);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const arr = Array.from(this.customConfigs.values());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to save thresholds to localStorage', e);
    }
  }

  public getAllConfigs(): StatusThresholdConfig[] {
    const list: StatusThresholdConfig[] = [];
    const ids = new Set<string>();

    // Add custom overrides
    for (const c of this.customConfigs.values()) {
      list.push(c);
      ids.add(c.id);
    }

    // Add defaults not yet in custom
    for (const d of DEFAULT_STATUS_THRESHOLDS) {
      if (!ids.has(d.id)) {
        list.push(d);
      }
    }

    return list;
  }

  public getConfig(
    source = 'ALL',
    regionId?: string | null,
    configId?: string | null
  ): StatusThresholdConfig {
    const all = this.getAllConfigs();

    if (configId) {
      const byId = all.find((c) => c.id === configId);
      if (byId) return byId;
    }

    // Match region first
    if (regionId) {
      const normRegion = regionId.toLowerCase();
      const byRegion = all.find(
        (c) =>
          c.region_id &&
          (c.region_id.toLowerCase() === normRegion ||
            normRegion.includes(c.region_id.toLowerCase().replace('bassin-', '')) ||
            (c.region_name && c.region_name.toLowerCase().includes(normRegion)))
      );
      if (byRegion) return byRegion;
    }

    // Match source
    if (source && source !== 'ALL') {
      const normSource = source.toUpperCase();
      const bySource = all.find(
        (c) => c.source.toUpperCase() === normSource && !c.region_id
      );
      if (bySource) return bySource;
    }

    // Fallback default
    const def = all.find((c) => c.is_default) || all[0] || DEFAULT_STATUS_THRESHOLDS[0];
    return def;
  }

  public saveConfig(config: StatusThresholdConfig): void {
    this.customConfigs.set(config.id, config);
    this.saveToStorage();
  }

  public resetConfig(configId: string): void {
    this.customConfigs.delete(configId);
    this.saveToStorage();
  }

  public resetAllToDefaults(): void {
    this.customConfigs.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  /**
   * Interpole le percentile journalier à partir des quantiles historiques Q10, Q25, Q50, Q75, Q90, Q98
   */
  public estimatePercentile(
    flow: number,
    quantiles: HistoricalQuantiles & { q98?: number }
  ): number {
    const q10 = Number(quantiles.q10 || 100);
    const q25 = Number(quantiles.q25 || 200);
    const q50 = Number(quantiles.q50 || 300);
    const q75 = Number(quantiles.q75 || 400);
    const q90 = Number(quantiles.q90 || 500);
    const q98 = Number(quantiles.q98 || q90 * 1.35);

    if (flow <= 0) return 1;
    if (flow <= q10) {
      return Math.max(1, Math.round((flow / Math.max(1, q10)) * 10));
    }
    if (flow <= q25) {
      return Math.round(10 + ((flow - q10) / Math.max(1, q25 - q10)) * 15);
    }
    if (flow <= q50) {
      return Math.round(25 + ((flow - q25) / Math.max(1, q50 - q25)) * 25);
    }
    if (flow <= q75) {
      return Math.round(50 + ((flow - q50) / Math.max(1, q75 - q50)) * 25);
    }
    if (flow <= q90) {
      return Math.round(75 + ((flow - q75) / Math.max(1, q90 - q75)) * 15);
    }
    if (flow <= q98) {
      return Math.round(90 + ((flow - q90) / Math.max(1, q98 - q90)) * 8);
    }
    return Math.min(99, Math.round(98 + (flow / Math.max(1, q98))));
  }

  /**
   * Détermine le statut hydrologique selon les seuils documentés configurés
   */
  public classifyPercentile(
    percentile: number,
    config: StatusThresholdConfig
  ): HydrologicalStatusCode {
    if (percentile < config.drought_max_percentile) {
      return 'DROUGHT';
    }
    if (percentile < config.low_flow_max_percentile) {
      return 'LOW_FLOW';
    }
    if (percentile <= config.high_flow_min_percentile) {
      return 'NORMAL';
    }
    if (percentile <= config.flood_min_percentile) {
      return 'HIGH_FLOW';
    }
    if (percentile <= config.extreme_flood_min_percentile) {
      return 'FLOOD';
    }
    return 'EXTREME_FLOOD';
  }

  public getStatusMetadata(status: HydrologicalStatusCode): {
    label_fr: string;
    severity: 'crisis' | 'warning' | 'normal' | 'notice' | 'alert' | 'critical';
    color: string;
    badge_class: string;
    icon_name: string;
    recommendation: string;
  } {
    switch (status) {
      case 'DROUGHT':
        return {
          label_fr: 'Sécheresse',
          severity: 'crisis',
          color: '#EF4444',
          badge_class:
            'bg-rose-500/15 text-rose-400 border border-rose-500/35 shadow-sm shadow-rose-950/20',
          icon_name: 'alert-octagon',
          recommendation:
            'Étiage sévère (< P10 / QMNA5). Application des mesures de crise sécheresse et arrêt des prélèvements non prioritaires (Arrêté cadre préfectoral).',
        };
      case 'LOW_FLOW':
        return {
          label_fr: 'Basses eaux',
          severity: 'warning',
          color: '#F97316',
          badge_class:
            'bg-amber-500/15 text-amber-400 border border-amber-500/35 shadow-sm shadow-amber-950/20',
          icon_name: 'arrow-down-circle',
          recommendation:
            'Étiage notable (P10 à P25). Vigilance sécheresse et surveillance resserrée des débits réservés et de la température.',
        };
      case 'NORMAL':
        return {
          label_fr: 'Normal',
          severity: 'normal',
          color: '#10B981',
          badge_class:
            'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-sm shadow-emerald-950/20',
          icon_name: 'check-circle-2',
          recommendation:
            'Écoulement conforme à la normale saisonnière interannuelle (P25 à P75). Équilibre hydrologique satisfaisant.',
        };
      case 'HIGH_FLOW':
        return {
          label_fr: 'Hautes eaux',
          severity: 'notice',
          color: '#0EA5E9',
          badge_class:
            'bg-sky-500/15 text-sky-400 border border-sky-500/35 shadow-sm shadow-sky-950/20',
          icon_name: 'trending-up',
          recommendation:
            'Écoulement soutenu (P75 à P90). Débit élevé de saison sans débordement dommageable en plaine.',
        };
      case 'FLOOD':
        return {
          label_fr: 'Crue',
          severity: 'alert',
          color: '#EAB308',
          badge_class:
            'bg-yellow-500/15 text-yellow-300 border border-yellow-500/40 shadow-sm shadow-yellow-950/20',
          icon_name: 'alert-triangle',
          recommendation:
            'Crue significative (P90 à P98, période de retour 2 à 10 ans). Premiers débordements en lit moyen et alerte Vigicrues.',
        };
      case 'EXTREME_FLOOD':
        return {
          label_fr: 'Crue extrême',
          severity: 'critical',
          color: '#DC2626',
          badge_class:
            'bg-red-600/25 text-red-300 border border-red-500/50 animate-pulse shadow-md shadow-red-950/40',
          icon_name: 'waves',
          recommendation:
            'Crue majeure historique (> P98, période de retour > 20 ans). Débordements généralisés et risques graves pour les personnes et les biens.',
        };
    }
  }

  /**
   * Exécute l'évaluation intégrale suivant le pipeline explicite :
   * Débit actuel → historique → percentile → seuils → classification
   */
  public evaluate(options: {
    current_discharge_m3s: number;
    historical_quantiles: HistoricalQuantiles;
    given_percentile?: number;
    source?: string;
    region_id?: string | null;
    config_id?: string | null;
    override_thresholds?: StatusThresholdConfig;
    reference_period_label?: string;
  }): HydrologicalStatusEvaluation {
    const {
      current_discharge_m3s,
      historical_quantiles,
      given_percentile,
      source = 'ALL',
      region_id = null,
      config_id = null,
      override_thresholds,
      reference_period_label = 'Climatologie journalière 1991–2020 (30 ans)',
    } = options;

    const config =
      override_thresholds || this.getConfig(source, region_id, config_id);

    // Étape 1 : Débit actuel
    const step1 = {
      step_name: 'Débit actuel' as const,
      discharge_m3s: Number(current_discharge_m3s.toFixed(1)),
      unit: 'm³/s' as const,
    };

    // Étape 2 : Historique
    const seasonalMedian = Number(historical_quantiles.q50 || 355);
    const seasonalStd =
      (Number(historical_quantiles.q75 || 440) - Number(historical_quantiles.q25 || 275)) /
      1.349;
    const step2 = {
      step_name: 'Historique' as const,
      period: reference_period_label,
      seasonal_median_m3s: seasonalMedian,
      quantiles_for_date: historical_quantiles,
    };

    // Étape 3 : Percentile
    const percentile =
      given_percentile !== undefined
        ? given_percentile
        : this.estimatePercentile(current_discharge_m3s, historical_quantiles);

    const zScore = Number(
      ((current_discharge_m3s - seasonalMedian) / Math.max(1, seasonalStd)).toFixed(2)
    );

    const step3 = {
      step_name: 'Percentile' as const,
      percentile,
      z_score: zScore,
      formula: 'F(Q_actuel) interpolé sur quantiles journaliers Q10..Q98',
    };

    // Étape 4 : Seuils documentés
    const statusCode = this.classifyPercentile(percentile, config);

    let rangeDesc = '';
    if (statusCode === 'DROUGHT') {
      rangeDesc = `< P${config.drought_max_percentile} (très faible / sécheresse)`;
    } else if (statusCode === 'LOW_FLOW') {
      rangeDesc = `P${config.drought_max_percentile}–P${config.low_flow_max_percentile} (faible / étiage)`;
    } else if (statusCode === 'NORMAL') {
      rangeDesc = `P${config.low_flow_max_percentile}–P${config.high_flow_min_percentile} (normal)`;
    } else if (statusCode === 'HIGH_FLOW') {
      rangeDesc = `P${config.high_flow_min_percentile}–P${config.flood_min_percentile} (élevé / hautes eaux)`;
    } else if (statusCode === 'FLOOD') {
      rangeDesc = `P${config.flood_min_percentile}–P${config.extreme_flood_min_percentile} (très élevé / crue)`;
    } else {
      rangeDesc = `> P${config.extreme_flood_min_percentile} (exceptionnel / crue extrême)`;
    }

    const step4 = {
      step_name: 'Seuils documentés' as const,
      config_id: config.id,
      config_name: config.name,
      source_target: config.source,
      region_target: config.region_name || 'Toutes régions',
      scientific_reference: config.scientific_reference,
      matched_bracket: rangeDesc,
      thresholds: {
        drought_max: config.drought_max_percentile,
        low_flow_max: config.low_flow_max_percentile,
        high_flow_min: config.high_flow_min_percentile,
        flood_min: config.flood_min_percentile,
        extreme_flood_min: config.extreme_flood_min_percentile,
      },
    };

    // Étape 5 : Classification
    const meta = this.getStatusMetadata(statusCode);
    const step5 = {
      step_name: 'Classification' as const,
      status_code: statusCode,
      label_fr: meta.label_fr,
      severity: meta.severity,
      color: meta.color,
      badge_class: meta.badge_class,
      summary: `${meta.label_fr.toUpperCase()} (P${percentile} — ${rangeDesc})`,
    };

    return {
      status_code: statusCode,
      label_fr: meta.label_fr,
      severity: meta.severity,
      color: meta.color,
      badge_class: meta.badge_class,
      icon_name: meta.icon_name,
      current_discharge_m3s: Number(current_discharge_m3s.toFixed(1)),
      calculated_percentile: percentile,
      z_score: zScore,
      threshold_config: config,
      pipeline: {
        step_1_discharge: step1,
        step_2_history: step2,
        step_3_percentile: step3,
        step_4_thresholds: step4,
        step_5_classification: step5,
      },
      management_recommendation: meta.recommendation,
    };
  }
}

export const hydrologicalStatusEngine = new HydrologicalStatusEngineService();
