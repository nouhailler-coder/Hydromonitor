"""Import idempotent du référentiel HydroRIVERS v1.0 depuis Cloud Storage vers PostGIS."""
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


@dataclass
class IngestionMetrics:
    source: str
    started_at: datetime
    finished_at: datetime | None = None
    records_processed: int = 0
    records_valid: int = 0
    records_rejected: int = 0
    records_inserted: int = 0
    records_updated: int = 0
    records_failed: int = 0
    error_message: str | None = None


class HydroRiversImporter:
    """Importe les tronçons HydroRIVERS (WWF HydroSHEDS) dans la table `river_segments`."""

    OFFICIAL_DOWNLOAD_URL = "https://data.hydrosheds.org/file/HydroRIVERS/HydroRIVERS_v10_eu_shp.zip"

    def __init__(self, gcs_bucket: str, region_filter: str = "EU") -> None:
        self.gcs_bucket = gcs_bucket
        self.region_filter = region_filter

    def transform_feature(self, props: dict[str, Any], river_id: str, name: str, country: str = "France") -> dict[str, Any]:
        """Convertit un enregistrement HydroRIVERS officiel en dictionnaire prêt pour PostGIS."""
        hyriv_id = int(props["HYRIV_ID"])
        length_km = float(props.get("LENGTH_KM", 0.0))
        if hyriv_id <= 0 or length_km <= 0:
            raise ValueError(f"Tronçon HydroRIVERS invalide: HYRIV_ID={hyriv_id}")

        return {
            "id": f"seg-{hyriv_id}",
            "hydro_rivers_id": hyriv_id,
            "river_id": river_id,
            "name": name,
            "country": country,
            "river_order": int(props.get("ORD_STRA", 1)),
            "length_km": length_km,
            "distance_from_source_km": float(props.get("DIST_UP_KM", 0.0)),
            "distance_to_mouth_km": float(props.get("DIST_DN_KM", 0.0)),
            "upstream_area_km2": float(props.get("UPLAND_SKM", 0.0)),
            "mean_discharge_m3s": float(props.get("DIS_AV_CMS", 0.0)),
        }
