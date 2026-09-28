export type DataCategory = 'OBSERVATION' | 'MODELE' | 'PREVISION';

export interface RiverSearchItem {
  id: string;
  name: string;
  country: string;
  approx_position: [number, number];
  type: string;
  basin: string;
  river_code: string;
  current_discharge_m3s: number;
  current_temperature_c: number;
  last_updated_at?: string;
}

export interface RiverDetail {
  id: string;
  name: string;
  river_code: string;
  country: string;
  type: string;
  length_km: number;
  basin_id: string;
  basin_name: string;
  basin_area_km2: number;
  strahler_order: number;
  mean_annual_discharge_m3s: number;
  current_discharge_m3s: number;
  discharge_anomaly_pct: number;
  current_temperature_c: number;
  temperature_anomaly_c: number;
  glofas_point_id: string;
  glofas_grid_resolution: string;
  last_updated_at: string;
  approx_position: [number, number];
  bbox: [number, number, number, number];
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  segments_count?: number;
  stations_count?: number;
}

export interface RiverSegment {
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

export interface BasinInfo {
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
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface TemperatureStation {
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
  latest_measured_at: string;
  quality_code: string;
  quality_label: string;
}

export interface DischargePoint {
  timestamp: string;
  date_label: string;
  value: number;
  mean_reference: number;
  unit: string;
  quality: string;
  source: string;
  dataset: string;
  category: DataCategory;
}

export interface ForecastStep {
  forecast_time: string;
  date_label: string;
  reference_time: string;
  control: number;
  median: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  p10_p90_range: [number, number];
  p25_p75_range: [number, number];
  unit: string;
  source: string;
  dataset: string;
  category: DataCategory;
}

export interface TemperaturePoint {
  timestamp: string;
  date_label: string;
  temperature_c: number;
  ecological_threshold_c: number;
  station_id: string;
  station_code: string;
  station_name: string;
  quality_code: string;
  source: string;
  category: DataCategory;
}

export interface DataSourceItem {
  id: string;
  code: string;
  name: string;
  description: string;
  url: string;
  version: string;
  data_type: string;
  category: string;
  license: string;
  last_sync_at: string;
  records_count: number;
  freshness_status: 'FRESH' | 'RECENT' | 'STALE';
}

export interface IngestionRunItem {
  id: string;
  source: string;
  job_name: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  records_processed: number;
  records_valid: number;
  records_rejected: number;
  records_inserted: number;
  records_updated: number;
  records_failed: number;
  error_message: string | null;
}

export interface IngestionStatusResponse {
  database_health: {
    engine: string;
    status: string;
    tables_count: number;
    rivers_count: number;
    segments_count: number;
    basins_count: number;
    stations_count: number;
    measurements_count: number;
  };
  cloud_run_jobs: Array<{
    name: string;
    schedule: string;
    idempotent: boolean;
  }>;
  runs: IngestionRunItem[];
}
