"""Schémas Pydantic v2 strictement découplés des modèles SQLAlchemy."""
from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field


DataCategory = Literal["OBSERVATION", "MODELE", "PREVISION"]


class GeoJSONGeometry(BaseModel):
    type: str
    coordinates: list[Any]


class RiverSegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hydro_rivers_id: int
    river_id: str
    name: str
    country: str
    river_order: int
    length_km: float
    distance_from_source_km: float | None = None
    distance_to_mouth_km: float | None = None
    upstream_area_km2: float
    mean_discharge_m3s: float | None = None
    glofas_mapping: dict[str, Any] | None = None
    geometry: GeoJSONGeometry


class BasinOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hydrobasins_id: int
    level: int
    area_km2: float
    pfafstetter_code: str | None = None
    sub_basins_count: int = 1
    geometry: GeoJSONGeometry


class StationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    station_code: str
    name: str
    river_name: str
    latitude: float
    longitude: float
    source: str = "HUBEAU"
    distance_m: float | None = None
    mapping_method: str | None = None
    latest_temperature_c: float | None = None
    latest_measured_at: datetime | None = None
    quality_code: str | None = None
    category: DataCategory = "OBSERVATION"


class TimeSeriesPoint(BaseModel):
    timestamp: datetime
    value: float
    unit: str
    quality: str
    source: str
    category: DataCategory


class ForecastEnsembleStep(BaseModel):
    forecast_time: datetime
    reference_time: datetime
    control: float
    median: float
    p10: float
    p25: float
    p75: float
    p90: float
    unit: str = "m³/s"
    source: str = "GLOFAS_EWDS_V5"
    category: DataCategory = "PREVISION"


class RiverSummaryOut(BaseModel):
    id: str
    name: str
    river_code: str
    country: str
    length_km: float
    basin_area_km2: float
    strahler_order: int
    current_discharge_m3s: float
    discharge_trend_pct: float
    current_temperature_c: float
    temperature_station_count: int
    glofas_point_id: str
    last_updated_at: datetime
    approx_position: tuple[float, float]  # (lon, lat)
    basin_name: str
    geometry: GeoJSONGeometry


class RiverSearchHit(BaseModel):
    id: str
    name: str
    country: str
    approx_position: tuple[float, float]
    type: str = "Cours d'eau principal"
    basin: str
    river_code: str
    current_discharge_m3s: float
    current_temperature_c: float


class DataSourceOut(BaseModel):
    id: str
    code: str
    name: str
    description: str
    url: str
    version: str
    data_type: str
    category: DataCategory | str
    license: str
    last_sync_at: datetime
    records_count: int
    freshness_status: Literal["FRESH", "RECENT", "STALE"]


class IngestionRunOut(BaseModel):
    id: str
    source: str
    job_name: str
    started_at: datetime
    finished_at: datetime | None
    duration_seconds: float | None
    status: Literal["SUCCESS", "RUNNING", "FAILED"]
    records_processed: int
    records_valid: int
    records_rejected: int
    records_inserted: int
    records_updated: int
    records_failed: int
    error_message: str | None = None


class UserProfileOut(BaseModel):
    uid: str
    email: str | None
    display_name: str | None
    role: Literal["admin", "viewer"]
    authenticated: bool
    project_id: str
