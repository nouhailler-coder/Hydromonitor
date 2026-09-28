"""Repository PostgreSQL + PostGIS pour l'accès aux rivières, tronçons, bassins et mesures."""
from datetime import datetime
from typing import Any
from sqlalchemy import text
from sqlalchemy.orm import Session


class RiverRepository:
    """Exécute des requêtes SQL paramétrées et spatiales PostGIS."""

    def __init__(self, db: Session | None = None) -> None:
        self.db = db

    def search_rivers_postgis(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        """Recherche indexée avec ST_Centroid et correspondance insensible à la casse."""
        if self.db is None:
            return []
        stmt = text(
            """
            SELECT
                r.id,
                r.name,
                r.country,
                r.river_code,
                ST_X(ST_Centroid(r.geometry)) AS lon,
                ST_Y(ST_Centroid(r.geometry)) AS lat
            FROM rivers r
            WHERE r.name ILIKE :pattern OR r.river_code ILIKE :pattern
            ORDER BY r.name ASC
            LIMIT :limit
            """
        )
        rows = self.db.execute(stmt, {"pattern": f"%{query}%", "limit": limit}).mappings().all()
        return [dict(r) for r in rows]

    def find_nearby_rivers_postgis(
        self, lat: float, lon: float, radius_km: float = 10.0, limit: int = 10
    ) -> list[dict[str, Any]]:
        """Utilise ST_DWithin sur geography(SRID 4326) et l'index GiST."""
        if self.db is None:
            return []
        stmt = text(
            """
            SELECT
                r.id,
                r.name,
                r.country,
                r.river_code,
                ST_Distance(
                    r.geometry::geography,
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
                ) AS distance_m
            FROM rivers r
            WHERE ST_DWithin(
                r.geometry::geography,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                :radius_m
            )
            ORDER BY distance_m ASC
            LIMIT :limit
            """
        )
        rows = (
            self.db.execute(
                stmt,
                {"lat": lat, "lon": lon, "radius_m": radius_km * 1000.0, "limit": limit},
            )
            .mappings()
            .all()
        )
        return [dict(r) for r in rows]
