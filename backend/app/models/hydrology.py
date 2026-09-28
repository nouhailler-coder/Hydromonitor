"""Modèles SQLAlchemy 2.0 + GeoAlchemy2 PostGIS pour HydroMonitor."""
from datetime import datetime
from typing import Any
from geoalchemy2 import Geometry
from sqlalchemy import (
    BigInteger,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class River(Base):
    __tablename__ = "rivers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    river_code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    country: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    geometry: Mapped[Any] = mapped_column(
        Geometry(geometry_type="MULTILINESTRING", srid=4326, spatial_index=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    segments: Mapped[list["RiverSegment"]] = relationship(back_populates="river", cascade="all, delete-orphan")


class RiverSegment(Base):
    __tablename__ = "river_segments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    hydro_rivers_id: Mapped[int] = mapped_column(BigInteger, nullable=False, unique=True, index=True)
    river_id: Mapped[str] = mapped_column(String(64), ForeignKey("rivers.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(64), nullable=False)
    river_order: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    length_km: Mapped[float] = mapped_column(Float, nullable=False)
    distance_from_source_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    distance_to_mouth_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    upstream_area_km2: Mapped[float] = mapped_column(Float, nullable=False)
    mean_discharge_m3s: Mapped[float | None] = mapped_column(Float, nullable=True)
    geometry: Mapped[Any] = mapped_column(
        Geometry(geometry_type="MULTILINESTRING", srid=4326, spatial_index=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    river: Mapped["River"] = relationship(back_populates="segments")


class Basin(Base):
    __tablename__ = "basins"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    hydrobasins_id: Mapped[int] = mapped_column(BigInteger, nullable=False, unique=True, index=True)
    level: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    area_km2: Mapped[float] = mapped_column(Float, nullable=False)
    geometry: Mapped[Any] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326, spatial_index=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class RiverBasin(Base):
    __tablename__ = "river_basin"

    river_id: Mapped[str] = mapped_column(String(64), ForeignKey("rivers.id", ondelete="CASCADE"), primary_key=True)
    basin_id: Mapped[str] = mapped_column(String(64), ForeignKey("basins.id", ondelete="CASCADE"), primary_key=True)


class GlofasPoint(Base):
    __tablename__ = "glofas_points"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    glofas_id: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    upstream_area_km2: Mapped[float] = mapped_column(Float, nullable=False)
    elevation_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    geometry: Mapped[Any] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False,
    )


class RiverGlofasMapping(Base):
    __tablename__ = "river_glofas_mapping"

    river_segment_id: Mapped[str] = mapped_column(String(64), ForeignKey("river_segments.id", ondelete="CASCADE"), primary_key=True)
    glofas_point_id: Mapped[str] = mapped_column(String(64), ForeignKey("glofas_points.id", ondelete="CASCADE"), primary_key=True)
    distance_m: Mapped[float] = mapped_column(Float, nullable=False)
    mapping_method: Mapped[str] = mapped_column(String(128), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class WaterTemperatureStation(Base):
    __tablename__ = "water_temperature_stations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    station_code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    river_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geometry: Mapped[Any] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False,
    )
    source: Mapped[str] = mapped_column(String(64), nullable=False, default="HUBEAU")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WaterTemperatureMeasurement(Base):
    __tablename__ = "water_temperature_measurements"
    __table_args__ = (
        Index("idx_water_temp_measurements_station_time", "station_id", "measured_at"),
    )

    station_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("water_temperature_stations.id", ondelete="CASCADE"), primary_key=True
    )
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    quality_code: Mapped[str] = mapped_column(String(32), nullable=False)
    source: Mapped[str] = mapped_column(String(64), nullable=False, default="HUBEAU")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RiverTemperatureStation(Base):
    __tablename__ = "river_temperature_station"

    river_segment_id: Mapped[str] = mapped_column(String(64), ForeignKey("river_segments.id", ondelete="CASCADE"), primary_key=True)
    station_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("water_temperature_stations.id", ondelete="CASCADE"), primary_key=True
    )
    distance_m: Mapped[float] = mapped_column(Float, nullable=False)
    mapping_method: Mapped[str] = mapped_column(String(128), nullable=False)


class HydrologicalMeasurement(Base):
    __tablename__ = "hydrological_measurements"
    __table_args__ = (
        Index("idx_hydro_measurements_seg_var_time", "river_segment_id", "variable", "observed_at"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    river_segment_id: Mapped[str] = mapped_column(String(64), ForeignKey("river_segments.id", ondelete="CASCADE"), nullable=False, index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    variable: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # discharge, water_temperature, water_level, precipitation
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    quality: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class GlofasForecast(Base):
    __tablename__ = "glofas_forecasts"
    __table_args__ = (
        Index("idx_glofas_forecasts_point_ref_time", "glofas_point_id", "forecast_reference_time", "forecast_time"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    glofas_point_id: Mapped[str] = mapped_column(String(64), ForeignKey("glofas_points.id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_reference_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    forecast_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    member: Mapped[str] = mapped_column(String(32), nullable=False)  # control, median, p10, p25, p75, p90, ens_01..50
    variable: Mapped[str] = mapped_column(String(64), nullable=False, default="discharge")
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(32), nullable=False, default="m3/s")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DataSource(Base):
    __tablename__ = "data_sources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    data_type: Mapped[str] = mapped_column(String(64), nullable=False)
    license: Mapped[str] = mapped_column(String(255), nullable=False)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    source: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    records_processed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_inserted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_updated: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_failed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    river_id: Mapped[str] = mapped_column(String(64), ForeignKey("rivers.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
