import {
  DataCategory,
  HistoricalQuantiles,
  HydrologicalAnalysis,
  HydrologicalAnomalyLevel,
  HydrologicalAnomalyReport,
  HydrologicalRegimeCode,
  MonthlyClimatologyBenchmark,
  SegmentAnalysisProfile,
  TrendDirection,
  RiverDataMappingItem,
  MappingQualityAuditSummary,
} from '../types/hydrology';

export type { DataCategory };

export interface GeoJSONGeometry {
  type: 'MultiLineString' | 'LineString' | 'MultiPolygon' | 'Polygon' | 'Point';
  coordinates: any;
}

export interface RiverSegmentRecord {
  id: string;
  hydro_rivers_id: number;
  river_id: string;
  name: string;
  segment_label: string;
  country: string;
  river_order: number;
  length_km: number;
  distance_from_source_km: number;
  distance_to_mouth_km: number;
  upstream_area_km2: number;
  mean_discharge_m3s: number;
  geometry: GeoJSONGeometry;
  glofas_mapping: {
    glofas_point_id: string;
    glofas_id: string;
    distance_m: number;
    mapping_method: string;
    confidence: number;
    latitude: number;
    longitude: number;
    upstream_area_km2: number;
    elevation_m: number;
    basin_match?: boolean;
    upstream_area_ratio?: number;
    river_order_match?: boolean;
    direction_match?: boolean;
    flow_direction_diff_deg?: number;
  };
}

export interface BasinRecord {
  id: string;
  river_id: string;
  name: string;
  hydrobasins_id: number;
  pfafstetter_code: string;
  level: number;
  area_km2: number;
  mean_elevation_m: number;
  forest_cover_pct: number;
  impervious_pct: number;
  geometry: GeoJSONGeometry;
}

export interface TemperatureStationRecord {
  id: string;
  station_code: string;
  name: string;
  river_id: string;
  river_segment_id: string;
  river_name: string;
  commune: string;
  departement: string;
  latitude: number;
  longitude: number;
  distance_m: number;
  mapping_method: string;
  confidence: number;
  source: 'HUBEAU';
  category: 'OBSERVATION';
  latest_temperature_c: number;
  seasonal_mean_c: number;
  temperature_anomaly_c: number;
  latest_measured_at: string;
  quality_code: string;
  quality_label: string;
}

export interface RiverRecord {
  id: string;
  name: string;
  reference_label: string;
  river_code: string;
  country: string;
  type: string;
  length_km: number;
  basin_id: string;
  basin_name: string;
  basin_area_km2: number;
  strahler_order: number;
  mean_annual_discharge_m3s: number;
  seasonal_mean_for_date_m3s: number;
  current_discharge_m3s: number;
  discharge_anomaly_pct: number;
  historical_percentile: number;
  historical_quantiles_for_date: HistoricalQuantiles;
  trend_direction: TrendDirection;
  trend_days: number;
  trend_delta_m3s: number;
  trend_label: string;
  regime_label: string;
  current_temperature_c: number;
  seasonal_temperature_mean_c: number;
  temperature_anomaly_c: number;
  temperature_percentile: number;
  temperature_trend_label: string;
  glofas_point_id: string;
  glofas_grid_resolution: string;
  last_updated_at: string;
  approx_position: [number, number]; // [lon, lat]
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  geometry: GeoJSONGeometry;
}

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();
const daysAhead = (d: number) => new Date(now + d * 86_400_000).toISOString();

export const RIVERS_DATA: RiverRecord[] = [
  {
    id: 'river-seine',
    name: 'La Seine',
    reference_label: 'SEINE — PARIS',
    river_code: 'FR-SEINE-001',
    country: 'France',
    type: 'Fleuve principal (Strahler Ordre 7)',
    length_km: 777,
    basin_id: 'basin-seine',
    basin_name: 'Bassin de la Seine (HydroBASINS Niv. 4)',
    basin_area_km2: 78650,
    strahler_order: 7,
    mean_annual_discharge_m3s: 462.0,
    seasonal_mean_for_date_m3s: 365.0,
    current_discharge_m3s: 425.0,
    discharge_anomaly_pct: 16.4,
    historical_percentile: 72,
    historical_quantiles_for_date: {
      q10: 195.0,
      q25: 275.0,
      q50: 355.0,
      q75: 440.0,
      q90: 560.0,
    },
    trend_direction: 'RISING',
    trend_days: 3,
    trend_delta_m3s: 42.0,
    trend_label: '↗ en hausse depuis 3 jours',
    regime_label: 'Écoulement soutenu — au-dessus de la normale saisonnière (72e percentile)',
    current_temperature_c: 18.7,
    seasonal_temperature_mean_c: 17.2,
    temperature_anomaly_c: 1.5,
    temperature_percentile: 68,
    temperature_trend_label: '↗ +0,4 °C depuis 48h',
    glofas_point_id: 'GLOFAS-EU-SEINE-PARIS-042',
    glofas_grid_resolution: '0.05° (~5 km) — GloFAS v5.0 LISFLOOD',
    last_updated_at: minsAgo(12),
    approx_position: [2.3522, 48.8566],
    bbox: [0.05, 47.35, 4.85, 49.65],
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [4.716, 47.486], // Source Côte-d'Or (Source-Seine)
          [4.520, 47.780], // Châtillon-sur-Seine
          [4.079, 48.297], // Troyes
          [3.720, 48.510], // Romilly-sur-Seine
          [3.498, 48.387], // Nogent / Montereau (Confluence Yonne)
          [2.960, 48.385], // Melun / Fontainebleau
          [2.655, 48.539], // Corbeil-Essonnes
          [2.415, 48.818], // Charenton (Confluence Marne)
          [2.352, 48.856], // Paris (Austerlitz / Pont de l'Alma)
          [2.220, 48.890], // Suresnes / Boulogne
          [2.073, 48.990], // Conflans-Sainte-Honorine (Confluence Oise)
          [1.710, 48.995], // Mantes-la-Jolie
          [1.380, 49.240], // Les Andelys / Poses
          [1.099, 49.443], // Rouen
          [0.720, 49.480], // Caudebec-en-Caux
          [0.107, 49.433], // Estuaire du Havre / Honfleur
        ],
      ],
    },
  },
  {
    id: 'river-loire',
    name: 'La Loire',
    reference_label: 'LOIRE — ORLÉANS',
    river_code: 'FR-LOIRE-001',
    country: 'France',
    type: 'Fleuve principal (Strahler Ordre 8)',
    length_km: 1006,
    basin_id: 'basin-loire',
    basin_name: 'Bassin Loire-Bretagne (HydroBASINS Niv. 4)',
    basin_area_km2: 117480,
    strahler_order: 8,
    mean_annual_discharge_m3s: 865.0,
    seasonal_mean_for_date_m3s: 380.0,
    current_discharge_m3s: 310.0,
    discharge_anomaly_pct: -18.4,
    historical_percentile: 28,
    historical_quantiles_for_date: {
      q10: 190.0,
      q25: 295.0,
      q50: 375.0,
      q75: 485.0,
      q90: 640.0,
    },
    trend_direction: 'FALLING',
    trend_days: 4,
    trend_delta_m3s: -36.0,
    trend_label: '↘ en baisse depuis 4 jours',
    regime_label: 'Étiage modéré — sous la moyenne saisonnière (28e percentile)',
    current_temperature_c: 17.8,
    seasonal_temperature_mean_c: 16.7,
    temperature_anomaly_c: 1.1,
    temperature_percentile: 76,
    temperature_trend_label: '↗ +0,6 °C depuis 3 jours',
    glofas_point_id: 'GLOFAS-EU-LOIRE-ORLEANS-088',
    glofas_grid_resolution: '0.05° (~5 km) — GloFAS v5.0 LISFLOOD',
    last_updated_at: minsAgo(18),
    approx_position: [1.904, 47.902],
    bbox: [-2.25, 44.75, 4.35, 48.05],
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [4.205, 44.841], // Mont Gerbier-de-Jonc
          [3.885, 45.043], // Le Puy-en-Velay
          [4.070, 46.030], // Roanne
          [3.460, 46.560], // Decize
          [3.160, 46.990], // Nevers (Bec d'Allier)
          [2.618, 47.685], // Gien
          [1.904, 47.902], // Orléans
          [1.335, 47.586], // Blois
          [0.684, 47.394], // Tours
          [-0.077, 47.260], // Saumur
          [-0.552, 47.471], // Angers / Les Ponts-de-Cé
          [-1.553, 47.218], // Nantes
          [-2.160, 47.280], // Saint-Nazaire
        ],
      ],
    },
  },
  {
    id: 'river-rhone',
    name: 'Le Rhône',
    reference_label: 'RHÔNE — BEAUCAIRE',
    river_code: 'FR-RHONE-001',
    country: 'France',
    type: 'Fleuve principal (Strahler Ordre 8)',
    length_km: 812,
    basin_id: 'basin-rhone',
    basin_name: 'Bassin Rhône-Méditerranée (HydroBASINS Niv. 4)',
    basin_area_km2: 98000,
    strahler_order: 8,
    mean_annual_discharge_m3s: 1610.0,
    seasonal_mean_for_date_m3s: 1485.0,
    current_discharge_m3s: 1690.5,
    discharge_anomaly_pct: 13.8,
    historical_percentile: 69,
    historical_quantiles_for_date: {
      q10: 940.0,
      q25: 1180.0,
      q50: 1460.0,
      q75: 1760.0,
      q90: 2150.0,
    },
    trend_direction: 'RISING',
    trend_days: 2,
    trend_delta_m3s: 115.0,
    trend_label: '↗ en hausse depuis 2 jours',
    regime_label: 'Régime nivo-pluvial actif — supérieur à la normale saisonnière (69e percentile)',
    current_temperature_c: 15.9,
    seasonal_temperature_mean_c: 15.6,
    temperature_anomaly_c: 0.3,
    temperature_percentile: 56,
    temperature_trend_label: '→ stable depuis 3 jours',
    glofas_point_id: 'GLOFAS-EU-RHONE-BEAUCAIRE-114',
    glofas_grid_resolution: '0.05° (~5 km) — GloFAS v5.0 LISFLOOD',
    last_updated_at: minsAgo(21),
    approx_position: [4.835, 45.764],
    bbox: [4.25, 43.30, 6.25, 46.30],
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [6.143, 46.204], // Genève / Pougny
          [5.810, 45.850], // Seyssel / Belley
          [5.180, 45.800], // Loyettes (Confluence Ain)
          [4.835, 45.764], // Lyon (Confluence Saône)
          [4.872, 45.525], // Vienne
          [4.890, 44.933], // Valence (Confluence Isère)
          [4.750, 44.558], // Montélimar
          [4.807, 43.949], // Avignon (Confluence Durance)
          [4.655, 43.806], // Beaucaire / Tarascon
          [4.627, 43.676], // Arles
          [4.830, 43.340], // Port-Saint-Louis-du-Rhône (Camargue)
        ],
      ],
    },
  },
];

// Multi-station / multi-segment analytical profiles per river
export const SEGMENT_ANALYSIS_PROFILES: Record<string, SegmentAnalysisProfile[]> = {
  'river-seine': [
    {
      segment_id: 'seg-seine-paris-20410199',
      reference_label: 'SEINE — PARIS',
      station_or_node_name: "Paris (Pont d'Austerlitz / Alma)",
      glofas_point_id: 'GLOFAS-EU-SEINE-PARIS-042',
      current_discharge_m3s: 425.0,
      seasonal_mean_for_date_m3s: 365.0,
      deviation_m3s: 60.0,
      deviation_pct: 16.4,
      historical_percentile: 72,
      historical_quantiles_for_date: {
        q10: 195.0,
        q25: 275.0,
        q50: 355.0,
        q75: 440.0,
        q90: 560.0,
      },
      trend_direction: 'RISING',
      trend_days: 3,
      trend_delta_m3s: 42.0,
      trend_label: '↗ en hausse depuis 3 jours',
      regime_code: 'ABOVE_NORMAL',
      regime_label: 'Écoulement soutenu (haut du corridor normal P25–P75)',
      interpretation_summary:
        "À Paris, le débit de la Seine (425 m³/s) dépasse de +16,4 % la moyenne historique pour cette date (365 m³/s), se situant au 72e percentile de la climatologie 1991–2020 avec une hausse continue depuis 3 jours (+42 m³/s) liée aux apports amont de l'Yonne et de la Marne.",
    },
    {
      segment_id: 'seg-seine-amont-20410101',
      reference_label: 'SEINE — TROYES',
      station_or_node_name: 'Troyes / Montereau (Bassin Amont)',
      glofas_point_id: 'GLOFAS-EU-SEINE-TROYES-019',
      current_discharge_m3s: 92.5,
      seasonal_mean_for_date_m3s: 78.0,
      deviation_m3s: 14.5,
      deviation_pct: 18.6,
      historical_percentile: 75,
      historical_quantiles_for_date: {
        q10: 42.0,
        q25: 58.0,
        q50: 76.0,
        q75: 92.0,
        q90: 118.0,
      },
      trend_direction: 'RISING',
      trend_days: 4,
      trend_delta_m3s: 11.2,
      trend_label: '↗ en hausse depuis 4 jours',
      regime_code: 'HIGH_FLOW',
      regime_label: 'Régime humide — quartile supérieur (75e percentile)',
      interpretation_summary:
        'Sur le tronçon amont à Troyes, le débit atteint 92,5 m³/s contre 78,0 m³/s en moyenne calendaire (+18,6 %, 75e percentile), alimentant l’onde de hausse observée vers l’agglomération parisienne.',
    },
    {
      segment_id: 'seg-seine-aval-20410285',
      reference_label: 'SEINE — POSES / ROUEN',
      station_or_node_name: 'Barrage de Poses / Rouen (Seine Normande)',
      glofas_point_id: 'GLOFAS-EU-SEINE-POSES-058',
      current_discharge_m3s: 548.0,
      seasonal_mean_for_date_m3s: 480.0,
      deviation_m3s: 68.0,
      deviation_pct: 14.2,
      historical_percentile: 68,
      historical_quantiles_for_date: {
        q10: 265.0,
        q25: 360.0,
        q50: 470.0,
        q75: 585.0,
        q90: 740.0,
      },
      trend_direction: 'RISING',
      trend_days: 2,
      trend_delta_m3s: 34.0,
      trend_label: '↗ en hausse depuis 2 jours',
      regime_code: 'NORMAL',
      regime_label: 'Écoulement normal à soutenu (68e percentile)',
      interpretation_summary:
        "En aval de la confluence de l'Oise à Poses, le débit (548 m³/s) est supérieur de +14,2 % à la moyenne pour cette date (480 m³/s), en hausse depuis 2 jours à mesure que l'onde parisienne se propage vers l'estuaire.",
    },
  ],
  'river-loire': [
    {
      segment_id: 'seg-loire-moyenne-20420512',
      reference_label: 'LOIRE — ORLÉANS',
      station_or_node_name: 'Orléans / Sandillon (Loire Moyenne)',
      glofas_point_id: 'GLOFAS-EU-LOIRE-ORLEANS-088',
      current_discharge_m3s: 310.0,
      seasonal_mean_for_date_m3s: 380.0,
      deviation_m3s: -70.0,
      deviation_pct: -18.4,
      historical_percentile: 28,
      historical_quantiles_for_date: {
        q10: 190.0,
        q25: 295.0,
        q50: 375.0,
        q75: 485.0,
        q90: 640.0,
      },
      trend_direction: 'FALLING',
      trend_days: 4,
      trend_delta_m3s: -36.0,
      trend_label: '↘ en baisse depuis 4 jours',
      regime_code: 'BELOW_NORMAL',
      regime_label: 'Sous la normale saisonnière (28e percentile)',
      interpretation_summary:
        "À Orléans, la Loire présente un débit de 310 m³/s, inférieur de -18,4 % à la moyenne historique pour cette date (380 m³/s). Située au 28e percentile, elle poursuit un tarissement régulier depuis 4 jours (-36 m³/s).",
    },
    {
      segment_id: 'seg-loire-aval-20420680',
      reference_label: 'LOIRE — MONTJEAN / NANTES',
      station_or_node_name: 'Montjean-sur-Loire (Basse Loire)',
      glofas_point_id: 'GLOFAS-EU-LOIRE-MONTJEAN-094',
      current_discharge_m3s: 695.0,
      seasonal_mean_for_date_m3s: 810.0,
      deviation_m3s: -115.0,
      deviation_pct: -14.2,
      historical_percentile: 33,
      historical_quantiles_for_date: {
        q10: 420.0,
        q25: 610.0,
        q50: 795.0,
        q75: 980.0,
        q90: 1290.0,
      },
      trend_direction: 'FALLING',
      trend_days: 3,
      trend_delta_m3s: -48.0,
      trend_label: '↘ en baisse depuis 3 jours',
      regime_code: 'NORMAL',
      regime_label: 'Tiers inférieur du corridor normal (33e percentile)',
      interpretation_summary:
        'À Montjean-sur-Loire, les apports de la Vienne et de la Maine atténuent le déficit amont : le débit (695 m³/s) se situe à -14,2 % sous la moyenne de saison (810 m³/s, 33e percentile).',
    },
  ],
  'river-rhone': [
    {
      segment_id: 'seg-rhone-aval-20430944',
      reference_label: 'RHÔNE — BEAUCAIRE',
      station_or_node_name: 'Beaucaire / Vallabrègues (Rhône Aval)',
      glofas_point_id: 'GLOFAS-EU-RHONE-BEAUCAIRE-114',
      current_discharge_m3s: 1690.5,
      seasonal_mean_for_date_m3s: 1485.0,
      deviation_m3s: 205.5,
      deviation_pct: 13.8,
      historical_percentile: 69,
      historical_quantiles_for_date: {
        q10: 940.0,
        q25: 1180.0,
        q50: 1460.0,
        q75: 1760.0,
        q90: 2150.0,
      },
      trend_direction: 'RISING',
      trend_days: 2,
      trend_delta_m3s: 115.0,
      trend_label: '↗ en hausse depuis 2 jours',
      regime_code: 'ABOVE_NORMAL',
      regime_label: 'Écoulement soutenu (69e percentile)',
      interpretation_summary:
        "À Beaucaire, le Rhône affiche un débit de 1 690,5 m³/s contre 1 485 m³/s en moyenne historique pour cette date (+13,8 %, 69e percentile), en hausse depuis 2 jours (+115 m³/s) suite aux apports alpins et de la Saône.",
    },
  ],
};

export const RIVER_SEGMENTS_DATA: RiverSegmentRecord[] = [
  {
    id: 'seg-seine-amont-20410101',
    hydro_rivers_id: 20410101,
    river_id: 'river-seine',
    name: 'La Seine',
    segment_label: 'Seine Amont (Source → Troyes → Montereau)',
    country: 'France',
    river_order: 5,
    length_km: 224.5,
    distance_from_source_km: 0.0,
    distance_to_mouth_km: 552.5,
    upstream_area_km2: 10250.0,
    mean_discharge_m3s: 78.0,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [4.716, 47.486],
          [4.520, 47.780],
          [4.079, 48.297],
          [3.720, 48.510],
          [3.498, 48.387],
        ],
      ],
    },
    glofas_mapping: {
      glofas_point_id: 'gp-seine-troyes',
      glofas_id: 'GLOFAS-EU-SEINE-TROYES-019',
      distance_m: 340.0,
      mapping_method: 'HYDRORIVERS_GLOFAS_MULTICRITERIA_V1',
      confidence: 0.94,
      latitude: 48.297,
      longitude: 4.079,
      upstream_area_km2: 10110.0,
      elevation_m: 108.0,
    },
  },
  {
    id: 'seg-seine-paris-20410199',
    hydro_rivers_id: 20410199,
    river_id: 'river-seine',
    name: 'La Seine',
    segment_label: 'SEINE — PARIS (Montereau → Paris → Conflans)',
    country: 'France',
    river_order: 7,
    length_km: 168.0,
    distance_from_source_km: 224.5,
    distance_to_mouth_km: 384.5,
    upstream_area_km2: 44320.0,
    mean_discharge_m3s: 365.0,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [3.498, 48.387],
          [2.960, 48.385],
          [2.655, 48.539],
          [2.415, 48.818],
          [2.352, 48.856],
          [2.220, 48.890],
          [2.073, 48.990],
        ],
      ],
    },
    glofas_mapping: {
      glofas_point_id: 'gp-seine-paris',
      glofas_id: 'GLOFAS-EU-SEINE-PARIS-042',
      distance_m: 1800.0,
      mapping_method: 'HYDRORIVERS_GLOFAS_SCIENTIFIC_V2',
      confidence: 0.94,
      latitude: 48.855,
      longitude: 2.350,
      upstream_area_km2: 43980.0,
      elevation_m: 28.0,
      basin_match: true,
      upstream_area_ratio: 0.992,
      river_order_match: true,
      direction_match: true,
      flow_direction_diff_deg: 12.4,
    },
  },
  {
    id: 'seg-seine-aval-20410285',
    hydro_rivers_id: 20410285,
    river_id: 'river-seine',
    name: 'La Seine',
    segment_label: 'Seine Normande & Estuaire (Conflans → Poses → Le Havre)',
    country: 'France',
    river_order: 7,
    length_km: 384.5,
    distance_from_source_km: 392.5,
    distance_to_mouth_km: 0.0,
    upstream_area_km2: 78650.0,
    mean_discharge_m3s: 480.0,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [2.073, 48.990],
          [1.710, 48.995],
          [1.380, 49.240],
          [1.099, 49.443],
          [0.720, 49.480],
          [0.107, 49.433],
        ],
      ],
    },
    glofas_mapping: {
      glofas_point_id: 'gp-seine-poses',
      glofas_id: 'GLOFAS-EU-SEINE-POSES-058',
      distance_m: 280.0,
      mapping_method: 'HYDRORIVERS_GLOFAS_MULTICRITERIA_V1',
      confidence: 0.96,
      latitude: 49.305,
      longitude: 1.245,
      upstream_area_km2: 65100.0,
      elevation_m: 9.0,
    },
  },
  {
    id: 'seg-loire-moyenne-20420512',
    hydro_rivers_id: 20420512,
    river_id: 'river-loire',
    name: 'La Loire',
    segment_label: 'LOIRE — ORLÉANS (Nevers → Orléans → Tours)',
    country: 'France',
    river_order: 8,
    length_km: 395.0,
    distance_from_source_km: 345.0,
    distance_to_mouth_km: 266.0,
    upstream_area_km2: 46890.0,
    mean_discharge_m3s: 380.0,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [3.160, 46.990],
          [2.618, 47.685],
          [1.904, 47.902],
          [1.335, 47.586],
          [0.684, 47.394],
        ],
      ],
    },
    glofas_mapping: {
      glofas_point_id: 'gp-loire-orleans',
      glofas_id: 'GLOFAS-EU-LOIRE-ORLEANS-088',
      distance_m: 290.0,
      mapping_method: 'HYDRORIVERS_GLOFAS_MULTICRITERIA_V1',
      confidence: 0.95,
      latitude: 47.900,
      longitude: 1.902,
      upstream_area_km2: 36970.0,
      elevation_m: 92.0,
    },
  },
  {
    id: 'seg-loire-aval-20420680',
    hydro_rivers_id: 20420680,
    river_id: 'river-loire',
    name: 'La Loire',
    segment_label: 'Basse Loire & Estuaire (Tours → Montjean → Saint-Nazaire)',
    country: 'France',
    river_order: 8,
    length_km: 266.0,
    distance_from_source_km: 740.0,
    distance_to_mouth_km: 0.0,
    upstream_area_km2: 117480.0,
    mean_discharge_m3s: 810.0,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [0.684, 47.394],
          [-0.077, 47.260],
          [-0.552, 47.471],
          [-1.553, 47.218],
          [-2.160, 47.280],
        ],
      ],
    },
    glofas_mapping: {
      glofas_point_id: 'gp-loire-montjean',
      glofas_id: 'GLOFAS-EU-LOIRE-MONTJEAN-094',
      distance_m: 310.0,
      mapping_method: 'HYDRORIVERS_GLOFAS_MULTICRITERIA_V1',
      confidence: 0.96,
      latitude: 47.388,
      longitude: -0.861,
      upstream_area_km2: 109930.0,
      elevation_m: 14.0,
    },
  },
  {
    id: 'seg-rhone-aval-20430944',
    hydro_rivers_id: 20430944,
    river_id: 'river-rhone',
    name: 'Le Rhône',
    segment_label: 'RHÔNE — BEAUCAIRE (Lyon → Valence → Beaucaire → Camargue)',
    country: 'France',
    river_order: 8,
    length_km: 330.0,
    distance_from_source_km: 482.0,
    distance_to_mouth_km: 0.0,
    upstream_area_km2: 95590.0,
    mean_discharge_m3s: 1485.0,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [4.835, 45.764],
          [4.872, 45.525],
          [4.890, 44.933],
          [4.750, 44.558],
          [4.807, 43.949],
          [4.655, 43.806],
          [4.627, 43.676],
          [4.830, 43.340],
        ],
      ],
    },
    glofas_mapping: {
      glofas_point_id: 'gp-rhone-beaucaire',
      glofas_id: 'GLOFAS-EU-RHONE-BEAUCAIRE-114',
      distance_m: 195.0,
      mapping_method: 'HYDRORIVERS_GLOFAS_MULTICRITERIA_V1',
      confidence: 0.98,
      latitude: 43.806,
      longitude: 4.655,
      upstream_area_km2: 95500.0,
      elevation_m: 6.0,
    },
  },
];

export const BASINS_DATA: Record<string, BasinRecord> = {
  'river-seine': {
    id: 'basin-seine',
    river_id: 'river-seine',
    name: 'Bassin Hydrographique de la Seine (HydroBASINS #2040023010)',
    hydrobasins_id: 2040023010,
    pfafstetter_code: '2324',
    level: 4,
    area_km2: 78650,
    mean_elevation_m: 154,
    forest_cover_pct: 26.4,
    impervious_pct: 7.8,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0.05, 49.55],
            [1.45, 49.95],
            [3.40, 49.75],
            [4.65, 49.10],
            [5.05, 48.20],
            [4.90, 47.25],
            [3.65, 47.20],
            [2.15, 47.85],
            [1.15, 48.45],
            [0.05, 49.20],
            [0.05, 49.55],
          ],
        ],
      ],
    },
  },
  'river-loire': {
    id: 'basin-loire',
    river_id: 'river-loire',
    name: 'Bassin Hydrographique de la Loire (HydroBASINS #2040021840)',
    hydrobasins_id: 2040021840,
    pfafstetter_code: '2322',
    level: 4,
    area_km2: 117480,
    mean_elevation_m: 342,
    forest_cover_pct: 28.9,
    impervious_pct: 3.4,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-2.25, 47.45],
            [-0.45, 48.05],
            [2.05, 48.15],
            [3.65, 47.65],
            [4.45, 46.15],
            [4.35, 44.65],
            [2.85, 44.80],
            [1.10, 45.75],
            [-0.85, 46.65],
            [-2.25, 47.15],
            [-2.25, 47.45],
          ],
        ],
      ],
    },
  },
  'river-rhone': {
    id: 'basin-rhone',
    river_id: 'river-rhone',
    name: 'Bassin Hydrographique du Rhône (HydroBASINS #2040018920)',
    hydrobasins_id: 2040018920,
    pfafstetter_code: '2341',
    level: 4,
    area_km2: 98000,
    mean_elevation_m: 890,
    forest_cover_pct: 38.2,
    impervious_pct: 4.1,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [4.15, 43.30],
            [4.20, 45.95],
            [5.40, 46.75],
            [6.85, 46.25],
            [6.90, 44.60],
            [5.65, 43.35],
            [4.15, 43.30],
          ],
        ],
      ],
    },
  },
};

export const TEMPERATURE_STATIONS_DATA: TemperatureStationRecord[] = [
  // Seine Stations (Official Hub'Eau format)
  {
    id: 'hubeau-st-03174000',
    station_code: '03174000',
    name: "LA SEINE À PARIS 12E [PONT D'AUSTERLITZ]",
    river_id: 'river-seine',
    river_segment_id: 'seg-seine-paris-20410199',
    river_name: 'La Seine',
    commune: 'Paris',
    departement: '75',
    latitude: 48.8442,
    longitude: 2.3658,
    distance_m: 142.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.98,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 18.7,
    seasonal_mean_c: 17.2,
    temperature_anomaly_c: 1.5,
    latest_measured_at: minsAgo(14),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  {
    id: 'hubeau-st-03171500',
    station_code: '03171500',
    name: 'LA SEINE À CORBEIL-ESSONNES',
    river_id: 'river-seine',
    river_segment_id: 'seg-seine-paris-20410199',
    river_name: 'La Seine',
    commune: 'Corbeil-Essonnes',
    departement: '91',
    latitude: 48.6138,
    longitude: 2.4841,
    distance_m: 195.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.96,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 16.1,
    seasonal_mean_c: 15.4,
    temperature_anomaly_c: 0.7,
    latest_measured_at: minsAgo(26),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  {
    id: 'hubeau-st-03227000',
    station_code: '03227000',
    name: 'LA SEINE À POSES [BARRAGE DE POSES]',
    river_id: 'river-seine',
    river_segment_id: 'seg-seine-aval-20410285',
    river_name: 'La Seine',
    commune: 'Poses',
    departement: '27',
    latitude: 49.3065,
    longitude: 1.2462,
    distance_m: 118.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.99,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 15.8,
    seasonal_mean_c: 15.2,
    temperature_anomaly_c: 0.6,
    latest_measured_at: minsAgo(19),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  {
    id: 'hubeau-st-03016000',
    station_code: '03016000',
    name: 'LA SEINE À TROYES [FOUCHY]',
    river_id: 'river-seine',
    river_segment_id: 'seg-seine-amont-20410101',
    river_name: 'La Seine',
    commune: 'Troyes',
    departement: '10',
    latitude: 48.3052,
    longitude: 4.0845,
    distance_m: 230.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.95,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 15.2,
    seasonal_mean_c: 14.7,
    temperature_anomaly_c: 0.5,
    latest_measured_at: minsAgo(32),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  // Loire Stations
  {
    id: 'hubeau-st-04051125',
    station_code: '04051125',
    name: 'LA LOIRE À SANDILLON [AMONT ORLÉANS]',
    river_id: 'river-loire',
    river_segment_id: 'seg-loire-moyenne-20420512',
    river_name: 'La Loire',
    commune: 'Sandillon',
    departement: '45',
    latitude: 47.8542,
    longitude: 2.0315,
    distance_m: 165.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.97,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 17.8,
    seasonal_mean_c: 16.7,
    temperature_anomaly_c: 1.1,
    latest_measured_at: minsAgo(18),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  {
    id: 'hubeau-st-04084000',
    station_code: '04084000',
    name: 'LA LOIRE À TOURS [PONT MIRABEAU]',
    river_id: 'river-loire',
    river_segment_id: 'seg-loire-moyenne-20420512',
    river_name: 'La Loire',
    commune: 'Tours',
    departement: '37',
    latitude: 47.3982,
    longitude: 0.6945,
    distance_m: 180.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.96,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 18.1,
    seasonal_mean_c: 16.9,
    temperature_anomaly_c: 1.2,
    latest_measured_at: minsAgo(24),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  {
    id: 'hubeau-st-04192000',
    station_code: '04192000',
    name: 'LA LOIRE À MONTJEAN-SUR-LOIRE',
    river_id: 'river-loire',
    river_segment_id: 'seg-loire-aval-20420680',
    river_name: 'La Loire',
    commune: 'Mauges-sur-Loire',
    departement: '49',
    latitude: 47.3895,
    longitude: -0.8602,
    distance_m: 135.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.98,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 17.6,
    seasonal_mean_c: 16.8,
    temperature_anomaly_c: 0.8,
    latest_measured_at: minsAgo(29),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  // Rhône Stations
  {
    id: 'hubeau-st-06055500',
    station_code: '06055500',
    name: 'LE RHÔNE À LYON [PONT MORAND / CONFLUENCE]',
    river_id: 'river-rhone',
    river_segment_id: 'seg-rhone-aval-20430944',
    river_name: 'Le Rhône',
    commune: 'Lyon',
    departement: '69',
    latitude: 45.7589,
    longitude: 4.8362,
    distance_m: 120.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.98,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 15.4,
    seasonal_mean_c: 15.1,
    temperature_anomaly_c: 0.3,
    latest_measured_at: minsAgo(21),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  {
    id: 'hubeau-st-06131000',
    station_code: '06131000',
    name: 'LE RHÔNE À VALENCE',
    river_id: 'river-rhone',
    river_segment_id: 'seg-rhone-aval-20430944',
    river_name: 'Le Rhône',
    commune: 'Valence',
    departement: '26',
    latitude: 44.9331,
    longitude: 4.8824,
    distance_m: 175.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.96,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 15.9,
    seasonal_mean_c: 15.6,
    temperature_anomaly_c: 0.3,
    latest_measured_at: minsAgo(25),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
  {
    id: 'hubeau-st-06300100',
    station_code: '06300100',
    name: 'LE RHÔNE À BEAUCAIRE [VALLABRÈGUES]',
    river_id: 'river-rhone',
    river_segment_id: 'seg-rhone-aval-20430944',
    river_name: 'Le Rhône',
    commune: 'Beaucaire',
    departement: '30',
    latitude: 43.8091,
    longitude: 4.6528,
    distance_m: 110.0,
    mapping_method: 'POSTGIS_ST_DWITHIN_TOPONYM_MATCH',
    confidence: 0.99,
    source: 'HUBEAU',
    category: 'OBSERVATION',
    latest_temperature_c: 16.5,
    seasonal_mean_c: 16.1,
    temperature_anomaly_c: 0.4,
    latest_measured_at: minsAgo(22),
    quality_code: '1',
    quality_label: 'Qualification Correcte (Naïades Code 1)',
  },
];

// Interpolate empirical percentile from historical quantiles
function estimatePercentileFromQuantiles(value: number, q: HistoricalQuantiles): number {
  if (value <= q.q10) return Math.max(2, Math.round((value / Math.max(1, q.q10)) * 10));
  if (value <= q.q25) {
    return Math.round(10 + ((value - q.q10) / Math.max(1, q.q25 - q.q10)) * 15);
  }
  if (value <= q.q50) {
    return Math.round(25 + ((value - q.q25) / Math.max(1, q.q50 - q.q25)) * 25);
  }
  if (value <= q.q75) {
    return Math.round(50 + ((value - q.q50) / Math.max(1, q.q75 - q.q50)) * 25);
  }
  if (value <= q.q90) {
    return Math.round(75 + ((value - q.q75) / Math.max(1, q.q90 - q.q75)) * 15);
  }
  return Math.min(99, Math.round(90 + ((value - q.q90) / Math.max(1, q.q90 * 0.35)) * 9));
}

export function generateDischargeHistory(riverId: string, days = 30, segmentId?: string) {
  const river = RIVERS_DATA.find((r) => r.id === riverId) ?? RIVERS_DATA[0];
  const profiles = SEGMENT_ANALYSIS_PROFILES[river.id] || [];
  const profile =
    (segmentId ? profiles.find((p) => p.segment_id === segmentId) : undefined) || profiles[0];

  const currentVal = profile ? profile.current_discharge_m3s : river.current_discharge_m3s;
  const seasonalBase = profile
    ? profile.seasonal_mean_for_date_m3s
    : river.seasonal_mean_for_date_m3s;
  const qToday = profile
    ? profile.historical_quantiles_for_date
    : river.historical_quantiles_for_date;
  const trendDir = profile ? profile.trend_direction : river.trend_direction;
  const trendDays = profile ? profile.trend_days : river.trend_days;
  const trendDelta = profile ? profile.trend_delta_m3s : river.trend_delta_m3s;

  const series = [];
  for (let i = days; i >= 0; i--) {
    // Seasonal normal curve gently evolving towards today's seasonal normal
    const seasonalDrift = Math.sin((i / 18) * Math.PI) * (seasonalBase * 0.04);
    const seasonalMeanDay = Number((seasonalBase - seasonalDrift).toFixed(1));
    const scaleRatio = seasonalMeanDay / Math.max(1, seasonalBase);

    const q10 = Number((qToday.q10 * scaleRatio).toFixed(1));
    const q25 = Number((qToday.q25 * scaleRatio).toFixed(1));
    const q50 = Number((qToday.q50 * scaleRatio).toFixed(1));
    const q75 = Number((qToday.q75 * scaleRatio).toFixed(1));
    const q90 = Number((qToday.q90 * scaleRatio).toFixed(1));

    let val: number;
    if (i === 0) {
      val = currentVal;
    } else if (i <= trendDays) {
      // Strictly monotonic over the last `trendDays` to match `trend_label` (e.g. ↗ en hausse depuis 3 jours)
      const stepFraction = i / trendDays;
      val = Number((currentVal - trendDelta * stepFraction).toFixed(1));
    } else {
      const startOfTrendVal = currentVal - trendDelta;
      const daysBeforeTrend = i - trendDays;
      const wave1 = Math.sin((daysBeforeTrend / 5.5) * Math.PI) * (seasonalBase * 0.09);
      const wave2 = Math.cos((daysBeforeTrend / 3.2) * Math.PI) * (seasonalBase * 0.035);
      const anchor =
        trendDir === 'RISING'
          ? startOfTrendVal + seasonalBase * 0.02
          : startOfTrendVal - seasonalBase * 0.02;
      val = Math.max(15, Number((anchor + wave1 + wave2).toFixed(1)));
    }

    const deviationPct = Number((((val - seasonalMeanDay) / seasonalMeanDay) * 100).toFixed(1));
    const percentile =
      i === 0 && profile
        ? profile.historical_percentile
        : estimatePercentileFromQuantiles(val, { q10, q25, q50, q75, q90 });

    series.push({
      timestamp: daysAgo(i),
      date_label: new Date(now - i * 86_400_000).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      }),
      value: val,
      seasonal_mean: seasonalMeanDay,
      mean_reference: river.mean_annual_discharge_m3s,
      historical_q10: q10,
      historical_q25: q25,
      historical_q75: q75,
      historical_q90: q90,
      deviation_pct: deviationPct,
      percentile,
      unit: 'm³/s',
      quality: i <= 3 ? 'INTERMEDIATE_ERA5T' : 'CONSOLIDATED_ERA5',
      source: 'GLOFAS_EWDS_V5',
      dataset: 'cems-glofas-historical',
      category: 'MODELE' as DataCategory,
    });
  }
  return series;
}

export function generateEnsembleForecast(riverId: string, horizonDays = 10, segmentId?: string) {
  const river = RIVERS_DATA.find((r) => r.id === riverId) ?? RIVERS_DATA[0];
  const profiles = SEGMENT_ANALYSIS_PROFILES[river.id] || [];
  const profile =
    (segmentId ? profiles.find((p) => p.segment_id === segmentId) : undefined) || profiles[0];

  const base = profile ? profile.current_discharge_m3s : river.current_discharge_m3s;
  const seasonalMean = profile
    ? profile.seasonal_mean_for_date_m3s
    : river.seasonal_mean_for_date_m3s;
  const refTime = hoursAgo(4);
  const steps = [];
  for (let d = 0; d <= horizonDays; d++) {
    const drift = Math.sin((d / 4) * Math.PI) * (base * 0.07) + d * (base * 0.005);
    let median = d === 0 ? base : Number((base + drift).toFixed(1));

    // Calibrate Seine Paris precisely to J+1: 440 m³/s, J+3: 510 m³/s, J+7: 470 m³/s
    if (
      river.id === 'river-seine' &&
      (!segmentId || segmentId === 'seg-seine-paris-20410199')
    ) {
      const seineParisForecast: Record<number, number> = {
        0: 425.0,
        1: 440.0,
        2: 480.0,
        3: 510.0,
        4: 520.0,
        5: 505.0,
        6: 488.0,
        7: 470.0,
        8: 450.0,
        9: 435.0,
        10: 425.0,
      };
      if (seineParisForecast[d] !== undefined) {
        median = seineParisForecast[d];
      }
    }

    const control = d === 0 ? base : Number((median + Math.cos(d) * (base * 0.015)).toFixed(1));
    const spread25 = base * (0.02 + d * 0.012);
    const spread90 = base * (0.045 + d * 0.024);

    steps.push({
      forecast_time: daysAhead(d),
      date_label:
        d === 0
          ? "Aujourd'hui"
          : `J+${d} (${new Date(now + d * 86_400_000).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
            })})`,
      reference_time: refTime,
      control,
      median,
      seasonal_mean: Number((seasonalMean + d * (seasonalMean * 0.002)).toFixed(1)),
      p10: Number(Math.max(10, median - spread90).toFixed(1)),
      p25: Number(Math.max(15, median - spread25).toFixed(1)),
      p75: Number((median + spread25).toFixed(1)),
      p90: Number((median + spread90).toFixed(1)),
      p10_p90_range: [
        Number(Math.max(10, median - spread90).toFixed(1)),
        Number((median + spread90).toFixed(1)),
      ] as [number, number],
      p25_p75_range: [
        Number(Math.max(15, median - spread25).toFixed(1)),
        Number((median + spread25).toFixed(1)),
      ] as [number, number],
      unit: 'm³/s',
      source: 'GLOFAS_EWDS_V5',
      dataset: 'cems-glofas-forecast',
      category: 'PREVISION' as DataCategory,
    });
  }
  return steps;
}

export function generateTemperatureHistory(riverId: string, stationId?: string, days = 14) {
  const stations = TEMPERATURE_STATIONS_DATA.filter((s) => s.river_id === riverId);
  const targetStation =
    stations.find((s) => s.id === stationId || s.station_code === stationId) ??
    stations[0] ??
    TEMPERATURE_STATIONS_DATA[0];

  const baseTemp = targetStation.latest_temperature_c;
  const seasonalTemp = targetStation.seasonal_mean_c;
  const points = [];
  const totalSteps = days * 4; // 1 point every 6h
  for (let s = totalSteps; s >= 0; s--) {
    const ts = new Date(now - s * 6 * 3_600_000);
    const diurnal = Math.sin(((ts.getUTCHours() - 6) / 24) * 2 * Math.PI) * 0.55;
    const synoptic = Math.cos((s / 12) * Math.PI) * 0.75;
    const temp =
      s === 0
        ? baseTemp
        : Number((baseTemp + diurnal + synoptic - (s / totalSteps) * 0.4).toFixed(2));
    points.push({
      timestamp: ts.toISOString(),
      date_label: ts.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperature_c: temp,
      seasonal_mean_c: seasonalTemp,
      ecological_threshold_c: 22.0,
      station_id: targetStation.id,
      station_code: targetStation.station_code,
      station_name: targetStation.name,
      quality_code: '1',
      source: 'HUBEAU',
      category: 'OBSERVATION' as DataCategory,
    });
  }
  return points;
}

// Climatologie mensuelle de référence (1991-2020) pour situer le débit dans son cycle annuel
export const MONTHLY_CLIMATOLOGY: Record<string, MonthlyClimatologyBenchmark[]> = {
  'river-seine': [
    { month_index: 1, month_short: 'Jan', month_name: 'Janvier', mean_m3s: 560, median_m3s: 540, std_m3s: 130, q10_m3s: 340, q25_m3s: 440, q75_m3s: 660, q90_m3s: 820, q98_m3s: 1100 },
    { month_index: 2, month_short: 'Fév', month_name: 'Février', mean_m3s: 585, median_m3s: 560, std_m3s: 135, q10_m3s: 360, q25_m3s: 460, q75_m3s: 690, q90_m3s: 860, q98_m3s: 1180 },
    { month_index: 3, month_short: 'Mar', month_name: 'Mars', mean_m3s: 510, median_m3s: 490, std_m3s: 115, q10_m3s: 320, q25_m3s: 410, q75_m3s: 600, q90_m3s: 730, q98_m3s: 980 },
    { month_index: 4, month_short: 'Avr', month_name: 'Avril', mean_m3s: 420, median_m3s: 400, std_m3s: 95, q10_m3s: 260, q25_m3s: 335, q75_m3s: 490, q90_m3s: 610, q98_m3s: 790 },
    { month_index: 5, month_short: 'Mai', month_name: 'Mai', mean_m3s: 340, median_m3s: 325, std_m3s: 80, q10_m3s: 210, q25_m3s: 270, q75_m3s: 400, q90_m3s: 490, q98_m3s: 640 },
    { month_index: 6, month_short: 'Juin', month_name: 'Juin', mean_m3s: 265, median_m3s: 255, std_m3s: 65, q10_m3s: 160, q25_m3s: 210, q75_m3s: 310, q90_m3s: 380, q98_m3s: 510 },
    { month_index: 7, month_short: 'Juil', month_name: 'Juillet', mean_m3s: 210, median_m3s: 200, std_m3s: 55, q10_m3s: 125, q25_m3s: 165, q75_m3s: 245, q90_m3s: 305, q98_m3s: 410 },
    { month_index: 8, month_short: 'Août', month_name: 'Août', mean_m3s: 190, median_m3s: 180, std_m3s: 50, q10_m3s: 110, q25_m3s: 145, q75_m3s: 225, q90_m3s: 280, q98_m3s: 370 },
    { month_index: 9, month_short: 'Sep', month_name: 'Septembre', mean_m3s: 235, median_m3s: 225, std_m3s: 60, q10_m3s: 140, q25_m3s: 185, q75_m3s: 275, q90_m3s: 345, q98_m3s: 460 },
    { month_index: 10, month_short: 'Oct', month_name: 'Octobre', mean_m3s: 365, median_m3s: 355, std_m3s: 70.5, q10_m3s: 195, q25_m3s: 275, q75_m3s: 440, q90_m3s: 560, q98_m3s: 740 },
    { month_index: 11, month_short: 'Nov', month_name: 'Novembre', mean_m3s: 445, median_m3s: 430, std_m3s: 95, q10_m3s: 270, q25_m3s: 350, q75_m3s: 525, q90_m3s: 655, q98_m3s: 870 },
    { month_index: 12, month_short: 'Déc', month_name: 'Décembre', mean_m3s: 520, median_m3s: 500, std_m3s: 115, q10_m3s: 320, q25_m3s: 410, q75_m3s: 615, q90_m3s: 760, q98_m3s: 1020 },
  ],
  'river-loire': [
    { month_index: 1, month_short: 'Jan', month_name: 'Janvier', mean_m3s: 1120, median_m3s: 1080, std_m3s: 320, q10_m3s: 540, q25_m3s: 780, q75_m3s: 1420, q90_m3s: 1850, q98_m3s: 2500 },
    { month_index: 2, month_short: 'Fév', month_name: 'Février', mean_m3s: 1180, median_m3s: 1140, std_m3s: 340, q10_m3s: 580, q25_m3s: 840, q75_m3s: 1510, q90_m3s: 1960, q98_m3s: 2650 },
    { month_index: 3, month_short: 'Mar', month_name: 'Mars', mean_m3s: 980, median_m3s: 940, std_m3s: 270, q10_m3s: 490, q25_m3s: 710, q75_m3s: 1230, q90_m3s: 1580, q98_m3s: 2150 },
    { month_index: 4, month_short: 'Avr', month_name: 'Avril', mean_m3s: 740, median_m3s: 710, std_m3s: 210, q10_m3s: 360, q25_m3s: 520, q75_m3s: 930, q90_m3s: 1210, q98_m3s: 1680 },
    { month_index: 5, month_short: 'Mai', month_name: 'Mai', mean_m3s: 540, median_m3s: 510, std_m3s: 160, q10_m3s: 260, q25_m3s: 380, q75_m3s: 680, q90_m3s: 890, q98_m3s: 1250 },
    { month_index: 6, month_short: 'Juin', month_name: 'Juin', mean_m3s: 360, median_m3s: 340, std_m3s: 110, q10_m3s: 170, q25_m3s: 250, q75_m3s: 460, q90_m3s: 600, q98_m3s: 850 },
    { month_index: 7, month_short: 'Juil', month_name: 'Juillet', mean_m3s: 260, median_m3s: 245, std_m3s: 85, q10_m3s: 130, q25_m3s: 185, q75_m3s: 330, q90_m3s: 430, q98_m3s: 620 },
    { month_index: 8, month_short: 'Août', month_name: 'Août', mean_m3s: 220, median_m3s: 210, std_m3s: 70, q10_m3s: 115, q25_m3s: 160, q75_m3s: 275, q90_m3s: 360, q98_m3s: 520 },
    { month_index: 9, month_short: 'Sep', month_name: 'Septembre', mean_m3s: 270, median_m3s: 255, std_m3s: 80, q10_m3s: 140, q25_m3s: 195, q75_m3s: 340, q90_m3s: 450, q98_m3s: 650 },
    { month_index: 10, month_short: 'Oct', month_name: 'Octobre', mean_m3s: 380, median_m3s: 375, std_m3s: 75, q10_m3s: 190, q25_m3s: 295, q75_m3s: 485, q90_m3s: 640, q98_m3s: 920 },
    { month_index: 11, month_short: 'Nov', month_name: 'Novembre', mean_m3s: 620, median_m3s: 590, std_m3s: 180, q10_m3s: 310, q25_m3s: 440, q75_m3s: 780, q90_m3s: 1020, q98_m3s: 1450 },
    { month_index: 12, month_short: 'Déc', month_name: 'Décembre', mean_m3s: 940, median_m3s: 900, std_m3s: 260, q10_m3s: 460, q25_m3s: 660, q75_m3s: 1190, q90_m3s: 1540, q98_m3s: 2120 },
  ],
  'river-rhone': [
    { month_index: 1, month_short: 'Jan', month_name: 'Janvier', mean_m3s: 1750, median_m3s: 1710, std_m3s: 340, q10_m3s: 1100, q25_m3s: 1360, q75_m3s: 2100, q90_m3s: 2550, q98_m3s: 3300 },
    { month_index: 2, month_short: 'Fév', month_name: 'Février', mean_m3s: 1820, median_m3s: 1780, std_m3s: 360, q10_m3s: 1150, q25_m3s: 1420, q75_m3s: 2190, q90_m3s: 2660, q98_m3s: 3450 },
    { month_index: 3, month_short: 'Mar', month_name: 'Mars', mean_m3s: 1790, median_m3s: 1750, std_m3s: 350, q10_m3s: 1120, q25_m3s: 1390, q75_m3s: 2150, q90_m3s: 2610, q98_m3s: 3400 },
    { month_index: 4, month_short: 'Avr', month_name: 'Avril', mean_m3s: 1860, median_m3s: 1820, std_m3s: 370, q10_m3s: 1180, q25_m3s: 1460, q75_m3s: 2240, q90_m3s: 2720, q98_m3s: 3550 },
    { month_index: 5, month_short: 'Mai', month_name: 'Mai', mean_m3s: 1980, median_m3s: 1930, std_m3s: 390, q10_m3s: 1260, q25_m3s: 1560, q75_m3s: 2380, q90_m3s: 2890, q98_m3s: 3750 },
    { month_index: 6, month_short: 'Juin', month_name: 'Juin', mean_m3s: 1810, median_m3s: 1760, std_m3s: 350, q10_m3s: 1150, q25_m3s: 1420, q75_m3s: 2170, q90_m3s: 2640, q98_m3s: 3450 },
    { month_index: 7, month_short: 'Juil', month_name: 'Juillet', mean_m3s: 1480, median_m3s: 1440, std_m3s: 290, q10_m3s: 940, q25_m3s: 1160, q75_m3s: 1780, q90_m3s: 2160, q98_m3s: 2820 },
    { month_index: 8, month_short: 'Août', month_name: 'Août', mean_m3s: 1280, median_m3s: 1250, std_m3s: 250, q10_m3s: 810, q25_m3s: 1010, q75_m3s: 1540, q90_m3s: 1870, q98_m3s: 2450 },
    { month_index: 9, month_short: 'Sep', month_name: 'Septembre', mean_m3s: 1320, median_m3s: 1290, std_m3s: 260, q10_m3s: 840, q25_m3s: 1040, q75_m3s: 1580, q90_m3s: 1930, q98_m3s: 2520 },
    { month_index: 10, month_short: 'Oct', month_name: 'Octobre', mean_m3s: 1485, median_m3s: 1460, std_m3s: 150, q10_m3s: 940, q25_m3s: 1180, q75_m3s: 1760, q90_m3s: 2150, q98_m3s: 2820 },
    { month_index: 11, month_short: 'Nov', month_name: 'Novembre', mean_m3s: 1680, median_m3s: 1640, std_m3s: 330, q10_m3s: 1060, q25_m3s: 1310, q75_m3s: 2020, q90_m3s: 2460, q98_m3s: 3200 },
    { month_index: 12, month_short: 'Déc', month_name: 'Décembre', mean_m3s: 1720, median_m3s: 1680, std_m3s: 340, q10_m3s: 1090, q25_m3s: 1350, q75_m3s: 2070, q90_m3s: 2520, q98_m3s: 3280 },
  ],
};

export function evaluateFlowAgainstBenchmark(flow: number, b: MonthlyClimatologyBenchmark): {
  percentile: number;
  z_score: number;
  deviation_m3s: number;
  deviation_pct: number;
  level: HydrologicalAnomalyLevel;
  level_label: string;
} {
  const z = Number(((flow - b.mean_m3s) / Math.max(1, b.std_m3s)).toFixed(2));
  const devM3s = Number((flow - b.mean_m3s).toFixed(1));
  const devPct = Number((((flow - b.mean_m3s) / b.mean_m3s) * 100).toFixed(1));

  let p: number;
  if (flow <= b.q10_m3s) {
    p = Math.max(1, Math.round((flow / Math.max(1, b.q10_m3s)) * 10));
  } else if (flow <= b.q25_m3s) {
    p = Math.round(10 + ((flow - b.q10_m3s) / Math.max(1, b.q25_m3s - b.q10_m3s)) * 15);
  } else if (flow <= b.median_m3s) {
    p = Math.round(25 + ((flow - b.q25_m3s) / Math.max(1, b.median_m3s - b.q25_m3s)) * 25);
  } else if (flow <= b.q75_m3s) {
    p = Math.round(50 + ((flow - b.median_m3s) / Math.max(1, b.q75_m3s - b.median_m3s)) * 25);
  } else if (flow <= b.q90_m3s) {
    p = Math.round(75 + ((flow - b.q75_m3s) / Math.max(1, b.q90_m3s - b.q75_m3s)) * 15);
  } else if (flow <= b.q98_m3s) {
    p = Math.round(90 + ((flow - b.q90_m3s) / Math.max(1, b.q98_m3s - b.q90_m3s)) * 8);
  } else {
    p = 99;
  }

  let level: HydrologicalAnomalyLevel;
  let level_label: string;
  if (p < 10) {
    level = 'VERY_LOW';
    level_label = 'très faible';
  } else if (p < 25) {
    level = 'MODERATE_LOW';
    level_label = 'modérément faible';
  } else if (p <= 75) {
    level = 'NORMAL';
    level_label = 'normal';
  } else if (p <= 90) {
    level = 'HIGH';
    level_label = 'élevé';
  } else {
    level = 'EXCEPTIONAL';
    level_label = 'exceptionnel';
  }

  return { percentile: p, z_score: z, deviation_m3s: devM3s, deviation_pct: devPct, level, level_label };
}

export function computeHydrologicalAnomalyReport(
  riverId: string,
  segmentId?: string,
  overrideFlow?: number
): HydrologicalAnomalyReport {
  const river = RIVERS_DATA.find((r) => r.id === riverId) ?? RIVERS_DATA[0];
  const profiles = SEGMENT_ANALYSIS_PROFILES[river.id] || [];
  const profile =
    (segmentId ? profiles.find((p) => p.segment_id === segmentId) : undefined) || profiles[0];

  const currentFlow = overrideFlow !== undefined ? overrideFlow : profile.current_discharge_m3s;
  const seasonalMean = profile.seasonal_mean_for_date_m3s;
  const seasonalMedian = profile.historical_quantiles_for_date.q50;
  const seasonalStd = (profile.historical_quantiles_for_date.q75 - profile.historical_quantiles_for_date.q25) / 1.349;
  const annualMean = river.mean_annual_discharge_m3s;

  const zScore = Number(((currentFlow - seasonalMean) / Math.max(1, seasonalStd)).toFixed(2));
  const devToMeanM3s = Number((currentFlow - seasonalMean).toFixed(1));
  const devToMeanPct = Number((((currentFlow - seasonalMean) / seasonalMean) * 100).toFixed(1));
  const devToMedM3s = Number((currentFlow - seasonalMedian).toFixed(1));
  const devToMedPct = Number((((currentFlow - seasonalMedian) / seasonalMedian) * 100).toFixed(1));
  const devToAnnM3s = Number((currentFlow - annualMean).toFixed(1));
  const devToAnnPct = Number((((currentFlow - annualMean) / annualMean) * 100).toFixed(1));

  const percentile = overrideFlow !== undefined
    ? estimatePercentileFromQuantiles(currentFlow, profile.historical_quantiles_for_date)
    : profile.historical_percentile;

  let level: HydrologicalAnomalyLevel;
  let level_label: string;
  if (percentile < 10) {
    level = 'VERY_LOW';
    level_label = 'très faible';
  } else if (percentile < 25) {
    level = 'MODERATE_LOW';
    level_label = 'modérément faible';
  } else if (percentile <= 75) {
    level = 'NORMAL';
    level_label = 'normal';
  } else if (percentile <= 90) {
    level = 'HIGH';
    level_label = 'élevé';
  } else {
    level = 'EXCEPTIONAL';
    level_label = 'exceptionnel';
  }

  // Ladder position: from bottom (0% = très faible) to top (100% = exceptionnel)
  const ladderPos = Math.min(98, Math.max(2, percentile));

  const monthlyList = MONTHLY_CLIMATOLOGY[river.id] || MONTHLY_CLIMATOLOGY['river-seine'];
  const bJan = monthlyList[0];
  const bAug = monthlyList[7];
  const bOct = monthlyList[9];

  // Specific simulation for 400 m³/s or currentFlow across seasons
  const testFlowVal = overrideFlow !== undefined ? overrideFlow : (river.id === 'river-seine' ? 400 : Math.round(annualMean * 0.85));
  const janEval = evaluateFlowAgainstBenchmark(testFlowVal, bJan);
  const augEval = evaluateFlowAgainstBenchmark(testFlowVal, bAug);
  const octEval = evaluateFlowAgainstBenchmark(currentFlow, bOct);

  return {
    reference_station_label: profile.reference_label,
    flow_m3s: currentFlow,
    period_of_year_label: 'Début Octobre (Automne hydrologique)',
    day_of_year: 275,
    percentile,
    z_score: zScore,
    deviation_to_seasonal_mean_m3s: devToMeanM3s,
    deviation_to_seasonal_mean_pct: devToMeanPct,
    deviation_to_seasonal_median_m3s: devToMedM3s,
    deviation_to_seasonal_median_pct: devToMedPct,
    deviation_to_annual_mean_m3s: devToAnnM3s,
    deviation_to_annual_mean_pct: devToAnnPct,
    level,
    level_label,
    ladder_position_pct: ladderPos,
    level_summary: `${level_label.toUpperCase()} · ${percentile}e percentile · z: ${zScore >= 0 ? '+' : ''}${zScore}σ par rapport à la climatologie journalière 1991–2020`,
    seasonal_mean_m3s: seasonalMean,
    seasonal_median_m3s: seasonalMedian,
    seasonal_std_m3s: Number(seasonalStd.toFixed(1)),
    annual_mean_m3s: annualMean,
    quantiles_for_date: profile.historical_quantiles_for_date,
    monthly_benchmarks: monthlyList,
    comparative_simulation: {
      test_flow_m3s: testFlowVal,
      january: {
        month_name: 'Janvier (Hautes eaux d\'hiver)',
        mean_m3s: bJan.mean_m3s,
        percentile: janEval.percentile,
        z_score: janEval.z_score,
        level_label: janEval.level_label,
        interpretation: `En janvier, ${testFlowVal} m³/s correspond au ${janEval.percentile}e percentile (${janEval.deviation_pct >= 0 ? '+' : ''}${janEval.deviation_pct} % vs normale hivernale de ${bJan.mean_m3s} m³/s). Ce débit y est inhabituellement faible pour l'hiver.`,
      },
      august: {
        month_name: 'Août (Basses eaux d\'étiage)',
        mean_m3s: bAug.mean_m3s,
        percentile: augEval.percentile,
        z_score: augEval.z_score,
        level_label: augEval.level_label,
        interpretation: `En août, ${testFlowVal} m³/s correspond au ${augEval.percentile}e percentile (${augEval.deviation_pct >= 0 ? '+' : ''}${augEval.deviation_pct} % vs normale estivale de ${bAug.mean_m3s} m³/s). Ce même débit correspond à une crue estivale exceptionnelle !`,
      },
      current_month: {
        month_name: 'Octobre (Période actuelle)',
        mean_m3s: bOct.mean_m3s,
        percentile: octEval.percentile,
        z_score: octEval.z_score,
        level_label: octEval.level_label,
        interpretation: `En octobre, ${currentFlow} m³/s correspond au ${octEval.percentile}e percentile (${octEval.deviation_pct >= 0 ? '+' : ''}${octEval.deviation_pct} % vs normale calendaire de ${bOct.mean_m3s} m³/s). L'écoulement y est soutenu sans être une crue.`,
      },
      takeaway: `Un débit de ${testFlowVal} m³/s n'a pas la même signification en janvier et en août : en janvier il témoigne d'un étiage hivernal anormal (${janEval.percentile}e percentile), alors qu'en août il représente un débit exceptionnel (${augEval.percentile}e percentile) !`,
    },
  };
}

// Core Hydrological Analysis Engine: contextualizes current state vs 30-year historical behavior
export function computeHydrologicalAnalysis(
  riverId: string,
  segmentId?: string
): HydrologicalAnalysis {
  const river = RIVERS_DATA.find((r) => r.id === riverId) ?? RIVERS_DATA[0];
  const profiles = SEGMENT_ANALYSIS_PROFILES[river.id] || [];
  const activeProfile =
    (segmentId ? profiles.find((p) => p.segment_id === segmentId) : undefined) || profiles[0];

  const stations = TEMPERATURE_STATIONS_DATA.filter((s) => s.river_id === river.id);
  const matchingStation =
    stations.find((s) => s.river_segment_id === activeProfile.segment_id) || stations[0];

  const fcSteps = generateEnsembleForecast(river.id, 10, activeProfile.segment_id);
  const j5 = fcSteps[Math.min(5, fcSteps.length - 1)];
  const j10 = fcSteps[fcSteps.length - 1];
  const j5DevPct = Number(
    (
      ((j5.median - activeProfile.current_discharge_m3s) / activeProfile.current_discharge_m3s) *
      100
    ).toFixed(1)
  );

  // Probability of remaining above seasonal normal based on ensemble spread at J+5
  const probAboveMean =
    j5.p25 >= activeProfile.seasonal_mean_for_date_m3s
      ? 84
      : j5.median >= activeProfile.seasonal_mean_for_date_m3s
      ? 64
      : 26;

  const probExceedQ75 =
    j5.median >= activeProfile.historical_quantiles_for_date.q75
      ? 62
      : j5.p75 >= activeProfile.historical_quantiles_for_date.q75
      ? 38
      : 14;

  const todayLabel = new Date(now).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });

  const outlookSummary =
    j5DevPct >= 2
      ? `Poursuite probable de la hausse à J+5 (médiane ${j5.median} m³/s, soit +${j5DevPct} % vs actuel) avec ${probAboveMean} % des membres GloFAS maintenus au-dessus de la normale saisonnière.`
      : j5DevPct <= -2
      ? `Amorçage d'une décrue modérée d'ici J+5 (médiane ${j5.median} m³/s, ${j5DevPct} % vs actuel).`
      : `Stabilisation attendue autour de ${j5.median} m³/s à J+5 (${probAboveMean} % des scénarios au-dessus de la moyenne calendaire).`;

  const anomalyReport = computeHydrologicalAnomalyReport(river.id, activeProfile.segment_id);

  return {
    river_id: river.id,
    river_name: river.name,
    reference_label: activeProfile.reference_label,
    reference_period: 'Climatologie GloFAS ERA5 1991–2020 (30 ans)',
    reference_date_label: todayLabel,
    active_segment_id: activeProfile.segment_id,
    available_profiles: profiles,
    discharge: {
      current_m3s: activeProfile.current_discharge_m3s,
      seasonal_mean_for_date_m3s: activeProfile.seasonal_mean_for_date_m3s,
      mean_annual_m3s: river.mean_annual_discharge_m3s,
      deviation_m3s: activeProfile.deviation_m3s,
      deviation_pct: activeProfile.deviation_pct,
      historical_percentile: activeProfile.historical_percentile,
      historical_quantiles_for_date: activeProfile.historical_quantiles_for_date,
      trend_direction: activeProfile.trend_direction,
      trend_days: activeProfile.trend_days,
      trend_delta_m3s: activeProfile.trend_delta_m3s,
      trend_label: activeProfile.trend_label,
      regime_code: activeProfile.regime_code as HydrologicalRegimeCode,
      regime_label: activeProfile.regime_label,
      category: 'MODELE',
      source_dataset: 'Copernicus GloFAS v5.0 (LISFLOOD / ERA5)',
    },
    temperature: {
      current_c: matchingStation.latest_temperature_c,
      seasonal_mean_for_date_c: matchingStation.seasonal_mean_c,
      deviation_c: matchingStation.temperature_anomaly_c,
      historical_percentile: river.temperature_percentile,
      trend_label: river.temperature_trend_label,
      ecological_threshold_c: 22.0,
      margin_to_threshold_c: Number((22.0 - matchingStation.latest_temperature_c).toFixed(1)),
      station_name: matchingStation.name,
      station_code: matchingStation.station_code,
      category: 'OBSERVATION',
    },
    forecast_outlook: {
      horizon_days: 10,
      j5_median_m3s: j5.median,
      j5_deviation_vs_current_pct: j5DevPct,
      j10_median_m3s: j10.median,
      prob_above_seasonal_mean_pct: probAboveMean,
      prob_exceed_q75_pct: probExceedQ75,
      outlook_summary: outlookSummary,
    },
    anomaly_report: anomalyReport,
    diagnostic_headline: activeProfile.regime_label,
    diagnostic_explanation: activeProfile.interpretation_summary,
  };
}

export const DATA_SOURCES_REGISTRY = [
  {
    id: 'ds-hydrorivers',
    code: 'HYDRORIVERS',
    name: 'HydroRIVERS v1.0 (WWF / HydroSHEDS)',
    description:
      'Référentiel mondial des tronçons de cours d’eau dérivé d’HydroSHEDS (résolution 15 secondes d’arc, attributs Strahler, surface drainée amont et débit moyen).',
    url: 'https://www.hydrosheds.org/products/hydrorivers',
    version: 'v1.0 (EU Shapefile / PostGIS)',
    data_type: 'GEOSPATIAL_VECTOR',
    category: 'MODELE',
    license: 'CC-BY 4.0 (WWF / McGill University)',
    last_sync_at: daysAgo(2),
    records_count: 164820,
    freshness_status: 'FRESH',
  },
  {
    id: 'ds-hydrobasins',
    code: 'HYDROBASINS',
    name: 'HydroBASINS v1.c (Pfafstetter Niv. 1–12)',
    description:
      'Polygones hiérarchiques des bassins et sous-bassins versants codés selon le système topologique Pfafstetter.',
    url: 'https://www.hydrosheds.org/products/hydrobasins',
    version: 'v1.c (Standard EU)',
    data_type: 'GEOSPATIAL_VECTOR',
    category: 'MODELE',
    license: 'CC-BY 4.0 (Lehner & Grill 2013)',
    last_sync_at: daysAgo(2),
    records_count: 14920,
    freshness_status: 'FRESH',
  },
  {
    id: 'ds-hydrosheds',
    code: 'HYDROSHEDS',
    name: 'HydroSHEDS DEM & Flow Accumulation (Cloud Storage)',
    description:
      'Modèles numériques d’élévation conditionnés hydrologiquement stockés sur Google Cloud Storage pour traitements batch.',
    url: 'https://www.hydrosheds.org/',
    version: 'v1.1 (15 arc-sec)',
    data_type: 'GEOSPATIAL_RASTER',
    category: 'MODELE',
    license: 'CC-BY 4.0',
    last_sync_at: daysAgo(5),
    records_count: 48,
    freshness_status: 'FRESH',
  },
  {
    id: 'ds-glofas',
    code: 'GLOFAS',
    name: 'Copernicus CEMS GloFAS v5.0 (Catalogue EWDS)',
    description:
      'Débits fluviaux journaliers modélisés (LISFLOOD + ERA5/ERA5T `cems-glofas-historical`, climatologie 30 ans) et prévisions d’ensemble à 51 membres (`cems-glofas-forecast`) à résolution 0.05°.',
    url: 'https://ewds.climate.copernicus.eu/datasets/cems-glofas-historical',
    version: 'GloFAS v5.0 (EWDS API)',
    data_type: 'MODEL_AND_FORECAST',
    category: 'MODELE & PREVISION',
    license: 'Copernicus Open License (CEMS)',
    last_sync_at: minsAgo(38),
    records_count: 482900,
    freshness_status: 'FRESH',
  },
  {
    id: 'ds-hubeau',
    code: 'HUBEAU',
    name: "Hub'Eau — Température des cours d'eau (Eaufrance)",
    description:
      'Observations thermiques continues in-situ des stations hydrométriques françaises issues du réseau national Naïades / OFB.',
    url: 'https://hubeau.eaufrance.fr/page/api-temperature-continu',
    version: 'API REST v1 (/station & /chronique)',
    data_type: 'OBSERVATION_INSITU',
    category: 'OBSERVATION',
    license: 'Licence Ouverte Etalab 2.0',
    last_sync_at: minsAgo(12),
    records_count: 129450,
    freshness_status: 'FRESH',
  },
];

export const INITIAL_INGESTION_RUNS = [
  {
    id: 'run-hubeau-meas-001',
    source: 'HUBEAU',
    job_name: 'hubeau-measurements-update',
    started_at: minsAgo(14),
    finished_at: minsAgo(12),
    duration_seconds: 18.4,
    status: 'SUCCESS',
    records_processed: 1240,
    records_valid: 1238,
    records_rejected: 2,
    records_inserted: 312,
    records_updated: 0,
    records_failed: 0,
    error_message: null,
  },
  {
    id: 'run-glofas-fc-002',
    source: 'GLOFAS',
    job_name: 'glofas-forecast-update',
    started_at: minsAgo(41),
    finished_at: minsAgo(38),
    duration_seconds: 164.2,
    status: 'SUCCESS',
    records_processed: 15300,
    records_valid: 15300,
    records_rejected: 0,
    records_inserted: 1836,
    records_updated: 0,
    records_failed: 0,
    error_message: null,
  },
  {
    id: 'run-mapping-003',
    source: 'MAPPING',
    job_name: 'mapping-update',
    started_at: hoursAgo(6),
    finished_at: hoursAgo(6),
    duration_seconds: 42.7,
    status: 'SUCCESS',
    records_processed: 616,
    records_valid: 616,
    records_rejected: 0,
    records_inserted: 0,
    records_updated: 16,
    records_failed: 0,
    error_message: null,
  },
  {
    id: 'run-hubeau-st-004',
    source: 'HUBEAU',
    job_name: 'hubeau-stations-update',
    started_at: hoursAgo(9),
    finished_at: hoursAgo(9),
    duration_seconds: 11.2,
    status: 'SUCCESS',
    records_processed: 842,
    records_valid: 842,
    records_rejected: 0,
    records_inserted: 4,
    records_updated: 838,
    records_failed: 0,
    error_message: null,
  },
  {
    id: 'run-glofas-hist-005',
    source: 'GLOFAS',
    job_name: 'glofas-historical-import',
    started_at: daysAgo(1),
    finished_at: daysAgo(1),
    duration_seconds: 215.9,
    status: 'SUCCESS',
    records_processed: 45000,
    records_valid: 44995,
    records_rejected: 5,
    records_inserted: 1420,
    records_updated: 0,
    records_failed: 0,
    error_message: null,
  },
];

// Table de qualité du rapprochement spatial scientifique (river_data_mapping)
export const RIVER_DATA_MAPPING_DATA: RiverDataMappingItem[] = [
  // 1. Seine Paris ↔ GloFAS Paris (1.8 km)
  {
    id: 'rdm-seine-paris-glofas',
    river_segment_id: 'seg-seine-paris-20410199',
    segment_label: 'SEINE — PARIS (Montereau → Paris → Conflans)',
    river_id: 'river-seine',
    river_name: 'La Seine',
    strahler_order: 7,
    source: 'GLOFAS',
    source_id: 'GLOFAS-EU-SEINE-PARIS-042',
    source_label: 'Point GloFAS #042 (48.855°N, 2.350°E)',
    distance_m: 1800.0,
    basin_match: true,
    upstream_area_ratio: 0.992,
    upstream_area_segment_km2: 44320.0,
    upstream_area_source_km2: 43980.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 12.4,
    confidence_score: 0.94,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(41),
    notes: 'Rapprochement optimal : bassin identique, surface drainée concordante à 99,2 %, azimut d’écoulement ouest-nord-ouest (292° vs 304°).',
  },
  // 2. Seine Troyes ↔ GloFAS Troyes (0.34 km)
  {
    id: 'rdm-seine-troyes-glofas',
    river_segment_id: 'seg-seine-amont-20410101',
    segment_label: 'SEINE — TROYES (Source → Troyes → Nogent-sur-Seine)',
    river_id: 'river-seine',
    river_name: 'La Seine',
    strahler_order: 6,
    source: 'GLOFAS',
    source_id: 'GLOFAS-EU-SEINE-TROYES-019',
    source_label: 'Point GloFAS #019 (48.297°N, 4.079°E)',
    distance_m: 340.0,
    basin_match: true,
    upstream_area_ratio: 0.965,
    upstream_area_segment_km2: 10450.0,
    upstream_area_source_km2: 10110.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 8.7,
    confidence_score: 0.94,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(41),
    notes: 'Forte concordance hydrographique sur la haute Seine amont.',
  },
  // 3. Seine Poses / Rouen ↔ GloFAS Poses (0.28 km)
  {
    id: 'rdm-seine-poses-glofas',
    river_segment_id: 'seg-seine-aval-20410285',
    segment_label: 'SEINE — POSES / ROUEN (Conflans → Poses → Le Havre)',
    river_id: 'river-seine',
    river_name: 'La Seine',
    strahler_order: 7,
    source: 'GLOFAS',
    source_id: 'GLOFAS-EU-SEINE-POSES-058',
    source_label: 'Point GloFAS #058 (49.305°N, 1.245°E)',
    distance_m: 280.0,
    basin_match: true,
    upstream_area_ratio: 0.978,
    upstream_area_segment_km2: 66500.0,
    upstream_area_source_km2: 65100.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 9.2,
    confidence_score: 0.96,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(41),
    notes: 'Point de contrôle aval en amont de l’onde de marée fluviale.',
  },
  // 4. Loire Orléans ↔ GloFAS Orléans (1.9 km)
  {
    id: 'rdm-loire-orleans-glofas',
    river_segment_id: 'seg-loire-moyenne-20420512',
    segment_label: 'LOIRE — ORLÉANS (Nevers → Orléans → Tours)',
    river_id: 'river-loire',
    river_name: 'La Loire',
    strahler_order: 8,
    source: 'GLOFAS',
    source_id: 'GLOFAS-EU-LOIRE-ORLEANS-088',
    source_label: 'Point GloFAS #088 (47.900°N, 1.902°E)',
    distance_m: 1900.0,
    basin_match: true,
    upstream_area_ratio: 0.985,
    upstream_area_segment_km2: 37550.0,
    upstream_area_source_km2: 36970.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 14.1,
    confidence_score: 0.95,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(41),
    notes: 'Bassin Loire moyenne, inflexion vers l’ouest respectée par le réseau de drainage GloFAS.',
  },
  // 5. Loire Montjean ↔ GloFAS Montjean (1.2 km)
  {
    id: 'rdm-loire-montjean-glofas',
    river_segment_id: 'seg-loire-aval-20420680',
    segment_label: 'LOIRE — MONTJEAN (Tours → Montjean → Saint-Nazaire)',
    river_id: 'river-loire',
    river_name: 'La Loire',
    strahler_order: 8,
    source: 'GLOFAS',
    source_id: 'GLOFAS-EU-LOIRE-MONTJEAN-094',
    source_label: 'Point GloFAS #094 (47.388°N, -0.861°E)',
    distance_m: 1200.0,
    basin_match: true,
    upstream_area_ratio: 0.972,
    upstream_area_segment_km2: 113100.0,
    upstream_area_source_km2: 109930.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 11.5,
    confidence_score: 0.96,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(41),
    notes: 'Confluence Maine et Vienne intégrée sans perte de cohérence surfacique.',
  },
  // 6. Rhône Beaucaire ↔ GloFAS Beaucaire (1.1 km)
  {
    id: 'rdm-rhone-beaucaire-glofas',
    river_segment_id: 'seg-rhone-aval-20430944',
    segment_label: 'RHÔNE — BEAUCAIRE (Lyon → Valence → Beaucaire → Camargue)',
    river_id: 'river-rhone',
    river_name: 'Le Rhône',
    strahler_order: 8,
    source: 'GLOFAS',
    source_id: 'GLOFAS-EU-RHONE-BEAUCAIRE-114',
    source_label: 'Point GloFAS #114 (43.806°N, 4.655°E)',
    distance_m: 1100.0,
    basin_match: true,
    upstream_area_ratio: 0.998,
    upstream_area_segment_km2: 95590.0,
    upstream_area_source_km2: 95500.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 7.3,
    confidence_score: 0.98,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(41),
    notes: 'Très haute fidélité au niveau de la tête de delta du Rhône à Beaucaire / Vallabrègues.',
  },
  // 7. Seine Paris ↔ Station Hub'Eau Austerlitz (142 m)
  {
    id: 'rdm-seine-paris-hubeau-03174000',
    river_segment_id: 'seg-seine-paris-20410199',
    segment_label: 'SEINE — PARIS (Montereau → Paris → Conflans)',
    river_id: 'river-seine',
    river_name: 'La Seine',
    strahler_order: 7,
    source: 'HUBEAU',
    source_id: '03174000',
    source_label: "Station Hub'Eau #03174000 (Pont d'Austerlitz)",
    distance_m: 142.0,
    basin_match: true,
    upstream_area_ratio: 0.995,
    upstream_area_segment_km2: 44320.0,
    upstream_area_source_km2: 44100.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 4.2,
    confidence_score: 0.98,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(14),
    notes: 'Implantation métrologique officielle de référence pour la région Île-de-France.',
  },
  // 8. Seine Corbeil ↔ Station Hub'Eau Corbeil (195 m)
  {
    id: 'rdm-seine-corbeil-hubeau-03171500',
    river_segment_id: 'seg-seine-paris-20410199',
    segment_label: 'SEINE — PARIS (Montereau → Paris → Conflans)',
    river_id: 'river-seine',
    river_name: 'La Seine',
    strahler_order: 7,
    source: 'HUBEAU',
    source_id: '03171500',
    source_label: "Station Hub'Eau #03171500 (Corbeil-Essonnes)",
    distance_m: 195.0,
    basin_match: true,
    upstream_area_ratio: 0.962,
    upstream_area_segment_km2: 44320.0,
    upstream_area_source_km2: 42600.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 6.8,
    confidence_score: 0.96,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(26),
    notes: 'Station amont d’agglomération parisienne, surveillance thermique Naïades.',
  },
  // 9. Loire Sandillon ↔ Station Hub'Eau Sandillon (165 m)
  {
    id: 'rdm-loire-sandillon-hubeau-04051125',
    river_segment_id: 'seg-loire-moyenne-20420512',
    segment_label: 'LOIRE — ORLÉANS (Nevers → Orléans → Tours)',
    river_id: 'river-loire',
    river_name: 'La Loire',
    strahler_order: 8,
    source: 'HUBEAU',
    source_id: '04051125',
    source_label: "Station Hub'Eau #04051125 (Sandillon / Orléans)",
    distance_m: 165.0,
    basin_match: true,
    upstream_area_ratio: 0.988,
    upstream_area_segment_km2: 37550.0,
    upstream_area_source_km2: 37100.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 5.4,
    confidence_score: 0.97,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(18),
    notes: 'Surveillance Loire moyenne en amont d’Orléans.',
  },
  // 10. Rhône Lyon Morand ↔ Station Hub'Eau (120 m)
  {
    id: 'rdm-rhone-lyon-hubeau-06055500',
    river_segment_id: 'seg-rhone-aval-20430944',
    segment_label: 'RHÔNE — BEAUCAIRE (Lyon → Valence → Beaucaire → Camargue)',
    river_id: 'river-rhone',
    river_name: 'Le Rhône',
    strahler_order: 8,
    source: 'HUBEAU',
    source_id: '06055500',
    source_label: "Station Hub'Eau #06055500 (Lyon Pont Morand)",
    distance_m: 120.0,
    basin_match: true,
    upstream_area_ratio: 0.975,
    upstream_area_segment_km2: 95590.0,
    upstream_area_source_km2: 93200.0,
    river_order_match: true,
    direction_match: true,
    flow_direction_diff_deg: 3.9,
    confidence_score: 0.98,
    confidence_level: 'HIGH',
    mapping_version: 'v2.4-multicriteria-scientific',
    created_at: minsAgo(21),
    notes: 'Station en confluence Saône-Rhône avec qualification Naïades code 1.',
  },
];

export function computeMappingQualityAudit(
  items: RiverDataMappingItem[] = RIVER_DATA_MAPPING_DATA
): MappingQualityAuditSummary {
  const total = items.length;
  if (total === 0) {
    return {
      total_mappings: 0,
      mean_confidence_score: 0,
      glofas_mappings_count: 0,
      hubeau_mappings_count: 0,
      high_confidence_count: 0,
      medium_confidence_count: 0,
      low_confidence_count: 0,
      basin_compatibility_pct: 100,
      upstream_area_compatibility_pct: 100,
      river_order_compatibility_pct: 100,
      direction_compatibility_pct: 100,
      algorithm_version: 'v2.4-multicriteria-scientific',
      last_audit_at: new Date().toISOString(),
    };
  }

  const sumConf = items.reduce((acc, it) => acc + it.confidence_score, 0);
  const glofasCount = items.filter((it) => it.source === 'GLOFAS').length;
  const hubeauCount = items.filter((it) => it.source === 'HUBEAU').length;
  const highCount = items.filter((it) => it.confidence_score >= 0.85).length;
  const medCount = items.filter(
    (it) => it.confidence_score >= 0.7 && it.confidence_score < 0.85
  ).length;
  const lowCount = items.filter((it) => it.confidence_score < 0.7).length;

  const basinMatchCount = items.filter((it) => it.basin_match).length;
  const areaMatchCount = items.filter((it) => it.upstream_area_ratio >= 0.8).length;
  const orderMatchCount = items.filter((it) => it.river_order_match).length;
  const dirMatchCount = items.filter((it) => it.direction_match).length;

  return {
    total_mappings: total,
    mean_confidence_score: Number((sumConf / total).toFixed(4)),
    glofas_mappings_count: glofasCount,
    hubeau_mappings_count: hubeauCount,
    high_confidence_count: highCount,
    medium_confidence_count: medCount,
    low_confidence_count: lowCount,
    basin_compatibility_pct: Number(((basinMatchCount / total) * 100).toFixed(1)),
    upstream_area_compatibility_pct: Number(((areaMatchCount / total) * 100).toFixed(1)),
    river_order_compatibility_pct: Number(((orderMatchCount / total) * 100).toFixed(1)),
    direction_compatibility_pct: Number(((dirMatchCount / total) * 100).toFixed(1)),
    algorithm_version: 'v2.4-multicriteria-scientific',
    last_audit_at: new Date().toISOString(),
  };
}

