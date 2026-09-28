"""Initial PostgreSQL + PostGIS schema for HydroMonitor.

Revision ID: 0001_initial_postgis
Revises: None
Create Date: 2026-09-28
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import geoalchemy2

revision: str = "0001_initial_postgis"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable PostGIS extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 1. TABLE rivers
    op.create_table(
        "rivers",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("river_code", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("country", sa.String(64), nullable=False, index=True),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(
                geometry_type="MULTILINESTRING", srid=4326, spatial_index=False
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_rivers_geometry_gist", "rivers", ["geometry"], postgresql_using="gist")

    # 2. TABLE river_segments
    op.create_table(
        "river_segments",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("hydro_rivers_id", sa.BigInteger(), nullable=False, unique=True, index=True),
        sa.Column("river_id", sa.String(64), sa.ForeignKey("rivers.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("country", sa.String(64), nullable=False),
        sa.Column("river_order", sa.Integer(), nullable=False, index=True),
        sa.Column("length_km", sa.Float(), nullable=False),
        sa.Column("distance_from_source_km", sa.Float(), nullable=True),
        sa.Column("distance_to_mouth_km", sa.Float(), nullable=True),
        sa.Column("upstream_area_km2", sa.Float(), nullable=False),
        sa.Column("mean_discharge_m3s", sa.Float(), nullable=True),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(
                geometry_type="MULTILINESTRING", srid=4326, spatial_index=False
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_river_segments_geometry_gist", "river_segments", ["geometry"], postgresql_using="gist")

    # 3. TABLE basins
    op.create_table(
        "basins",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("hydrobasins_id", sa.BigInteger(), nullable=False, unique=True, index=True),
        sa.Column("level", sa.Integer(), nullable=False, index=True),
        sa.Column("area_km2", sa.Float(), nullable=False),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(
                geometry_type="MULTIPOLYGON", srid=4326, spatial_index=False
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_basins_geometry_gist", "basins", ["geometry"], postgresql_using="gist")

    # 4. TABLE river_basin (composite PK)
    op.create_table(
        "river_basin",
        sa.Column("river_id", sa.String(64), sa.ForeignKey("rivers.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("basin_id", sa.String(64), sa.ForeignKey("basins.id", ondelete="CASCADE"), primary_key=True),
    )

    # 5. TABLE glofas_points
    op.create_table(
        "glofas_points",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("glofas_id", sa.String(128), nullable=False, unique=True, index=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("upstream_area_km2", sa.Float(), nullable=False),
        sa.Column("elevation_m", sa.Float(), nullable=True),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
        ),
    )
    op.create_index("idx_glofas_points_geometry_gist", "glofas_points", ["geometry"], postgresql_using="gist")

    # 6. TABLE river_glofas_mapping
    op.create_table(
        "river_glofas_mapping",
        sa.Column("river_segment_id", sa.String(64), sa.ForeignKey("river_segments.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("glofas_point_id", sa.String(64), sa.ForeignKey("glofas_points.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("distance_m", sa.Float(), nullable=False),
        sa.Column("mapping_method", sa.String(128), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 7. TABLE water_temperature_stations
    op.create_table(
        "water_temperature_stations",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("station_code", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("river_name", sa.String(255), nullable=False, index=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
        ),
        sa.Column("source", sa.String(64), nullable=False, server_default="HUBEAU"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "idx_water_temp_stations_geometry_gist",
        "water_temperature_stations",
        ["geometry"],
        postgresql_using="gist",
    )

    # 8. TABLE water_temperature_measurements
    op.create_table(
        "water_temperature_measurements",
        sa.Column("station_id", sa.String(64), sa.ForeignKey("water_temperature_stations.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("measured_at", sa.DateTime(timezone=True), primary_key=True),
        sa.Column("temperature_c", sa.Float(), nullable=False),
        sa.Column("quality_code", sa.String(32), nullable=False),
        sa.Column("source", sa.String(64), nullable=False, server_default="HUBEAU"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "idx_water_temp_measurements_station_time",
        "water_temperature_measurements",
        ["station_id", "measured_at"],
    )

    # 9. TABLE river_temperature_station (composite PK)
    op.create_table(
        "river_temperature_station",
        sa.Column("river_segment_id", sa.String(64), sa.ForeignKey("river_segments.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("station_id", sa.String(64), sa.ForeignKey("water_temperature_stations.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("distance_m", sa.Float(), nullable=False),
        sa.Column("mapping_method", sa.String(128), nullable=False),
    )

    # 10. TABLE hydrological_measurements
    op.create_table(
        "hydrological_measurements",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("river_segment_id", sa.String(64), sa.ForeignKey("river_segments.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("variable", sa.String(64), nullable=False, index=True),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(32), nullable=False),
        sa.Column("source", sa.String(64), nullable=False),
        sa.Column("source_id", sa.String(128), nullable=True),
        sa.Column("quality", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "idx_hydro_measurements_seg_var_time",
        "hydrological_measurements",
        ["river_segment_id", "variable", "observed_at"],
    )

    # 11. TABLE glofas_forecasts
    op.create_table(
        "glofas_forecasts",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("glofas_point_id", sa.String(64), sa.ForeignKey("glofas_points.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("forecast_reference_time", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("forecast_time", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("member", sa.String(32), nullable=False),
        sa.Column("variable", sa.String(64), nullable=False, server_default="discharge"),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(32), nullable=False, server_default="m3/s"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "idx_glofas_forecasts_point_ref_time",
        "glofas_forecasts",
        ["glofas_point_id", "forecast_reference_time", "forecast_time"],
    )

    # 12. TABLE data_sources
    op.create_table(
        "data_sources",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("code", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("url", sa.String(512), nullable=False),
        sa.Column("data_type", sa.String(64), nullable=False),
        sa.Column("license", sa.String(255), nullable=False),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 13. TABLE ingestion_runs
    op.create_table(
        "ingestion_runs",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("source", sa.String(64), nullable=False, index=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, index=True),
        sa.Column("records_processed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("records_inserted", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("records_updated", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("records_failed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text(), nullable=True),
    )

    # 14. TABLE alerts
    op.create_table(
        "alerts",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("river_id", sa.String(64), sa.ForeignKey("rivers.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("severity", sa.String(32), nullable=False),
        sa.Column("threshold", sa.Float(), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("ingestion_runs")
    op.drop_table("data_sources")
    op.drop_table("glofas_forecasts")
    op.drop_table("hydrological_measurements")
    op.drop_table("river_temperature_station")
    op.drop_table("water_temperature_measurements")
    op.drop_table("water_temperature_stations")
    op.drop_table("river_glofas_mapping")
    op.drop_table("glofas_points")
    op.drop_table("river_basin")
    op.drop_table("basins")
    op.drop_table("river_segments")
    op.drop_table("rivers")
