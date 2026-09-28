"""Pipeline de traitement géospatial des rasters HydroSHEDS stockés sur Cloud Storage."""
from dataclasses import dataclass


@dataclass(frozen=True)
class HydroShedsRasterAsset:
    product: str  # CONDEM, DIR, ACC
    resolution_arcsec: int  # 3, 15, 30
    gcs_uri: str
    official_source_url: str = "https://www.hydrosheds.org/products/hydrosheds"


class HydroShedsBatchProcessor:
    """Traite les rasters HydroSHEDS en mode batch depuis GCS sans stocker les rasters bruts dans PostgreSQL."""

    def __init__(self, project_bucket: str) -> None:
        self.project_bucket = project_bucket

    def build_gcs_raster_uri(self, product: str, tile_code: str = "eu_15s") -> HydroShedsRasterAsset:
        uri = f"gs://{self.project_bucket}/hydrosheds/{product.lower()}/{tile_code}.tif"
        return HydroShedsRasterAsset(
            product=product.upper(),
            resolution_arcsec=15,
            gcs_uri=uri,
        )
