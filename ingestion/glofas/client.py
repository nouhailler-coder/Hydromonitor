"""Client officiel Copernicus EWDS (Early Warning Data Store) pour GloFAS v5.0.

Important : N'utilise aucun ancien endpoint CDS obsolète. S'appuie exclusivement sur le
catalogue officiel Copernicus EWDS (`https://ewds.climate.copernicus.eu/api`).
"""
from dataclasses import dataclass
from typing import Any
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


@dataclass
class GlofasConfig:
    ewds_api_url: str = "https://ewds.climate.copernicus.eu/api"
    api_key: str = ""
    glofas_version: str = "5.0"
    historical_dataset: str = "cems-glofas-historical"
    forecast_dataset: str = "cems-glofas-forecast"
    bbox_france: tuple[float, float, float, float] = (51.5, -5.5, 41.0, 9.8)  # North, West, South, East


class GlofasEwdsClient:
    """Adaptateur isolé pour les requêtes de téléchargement et métadonnées Copernicus EWDS."""

    def __init__(self, config: GlofasConfig | None = None) -> None:
        self.config = config or GlofasConfig()

    def build_historical_request(
        self,
        year: str,
        month: str,
        days: list[str],
        product_type: str = "intermediate",
    ) -> dict[str, Any]:
        return {
            "dataset": self.config.historical_dataset,
            "request": {
                "system_version": [f"version_{self.config.glofas_version.replace('.', '_')}"],
                "hydrological_model": ["lisflood"],
                "product_type": [product_type],
                "variable": ["river_discharge_in_the_last_24_hours"],
                "hyear": [year],
                "hmonth": [month],
                "hday": days,
                "data_format": "netcdf",
                "download_format": "unarchived",
                "area": list(self.config.bbox_france),
            },
        }

    def build_forecast_request(
        self,
        year: str,
        month: str,
        day: str,
        leadtime_hours: list[str] | None = None,
    ) -> dict[str, Any]:
        if leadtime_hours is None:
            leadtime_hours = [str(h) for h in range(24, 241, 24)]
        return {
            "dataset": self.config.forecast_dataset,
            "request": {
                "system_version": [f"version_{self.config.glofas_version.replace('.', '_')}"],
                "hydrological_model": ["lisflood"],
                "product_type": ["control_forecast", "ensemble_perturbed_forecasts"],
                "variable": "river_discharge_in_the_last_24_hours",
                "year": year,
                "month": month,
                "day": day,
                "leadtime_hour": leadtime_hours,
                "data_format": "netcdf",
                "area": list(self.config.bbox_france),
            },
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def check_catalogue_status(self) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{self.config.ewds_api_url}/catalogue/v1/collections")
            resp.raise_for_status()
            return resp.json()
