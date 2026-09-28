"""Import idempotent des polygones HydroBASINS v1.c (codage Pfafstetter) dans PostGIS."""
from typing import Any


class HydroBasinsImporter:
    """Importe les bassins versants HydroBASINS et associe les cours d'eau via ST_Intersects."""

    OFFICIAL_DOWNLOAD_URL = "https://data.hydrosheds.org/file/hydrobasins/standard/hybas_eu_lev01-12_v1c.zip"

    def __init__(self, gcs_bucket: str, pfafstetter_level: int = 4) -> None:
        self.gcs_bucket = gcs_bucket
        self.pfafstetter_level = pfafstetter_level

    def transform_basin_feature(self, props: dict[str, Any]) -> dict[str, Any]:
        hybas_id = int(props["HYBAS_ID"])
        pfaf_id = int(props.get("PFAF_ID", 0))
        sub_area = float(props.get("SUB_AREA", 0.0))
        up_area = float(props.get("UP_AREA", sub_area))
        if hybas_id <= 0 or up_area <= 0:
            raise ValueError(f"Bassin HydroBASINS invalide: HYBAS_ID={hybas_id}")

        return {
            "id": f"basin-{hybas_id}",
            "hydrobasins_id": hybas_id,
            "level": len(str(pfaf_id)) if pfaf_id > 0 else self.pfafstetter_level,
            "area_km2": up_area,
        }
