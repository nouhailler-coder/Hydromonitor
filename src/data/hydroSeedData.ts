import {
  DataCategory,
  HistoricalQuantiles,
  HydrologicalAnalysis,
  HydrologicalRegimeCode,
  SegmentAnalysisProfile,
  TrendDirection,
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
    current_temperature_c: 16.4,
    seasonal_temperature_mean_c: 15.6,
    temperature_anomaly_c: 0.8,
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
      distance_m: 215.0,
      mapping_method: 'HYDRORIVERS_GLOFAS_MULTICRITERIA_V1',
      confidence: 0.97,
      latitude: 48.855,
      longitude: 2.350,
      upstream_area_km2: 43980.0,
      elevation_m: 28.0,
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
    latest_temperature_c: 16.4,
    seasonal_mean_c: 15.6,
    temperature_anomaly_c: 0.8,
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
    const median = d === 0 ? base : Number((base + drift).toFixed(1));
    const control = d === 0 ? base : Number((median + Math.cos(d) * (base * 0.022)).toFixed(1));
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
