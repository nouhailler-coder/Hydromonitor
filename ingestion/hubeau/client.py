"""Client Python officiel pour l'API Hub'Eau — Température des cours d'eau (Eaufrance v1).

Documentation officielle : https://hubeau.eaufrance.fr/page/api-temperature-continu
Endpoints utilisés :
- GET https://hubeau.eaufrance.fr/api/v1/temperature/station
- GET https://hubeau.eaufrance.fr/api/v1/temperature/chronique
"""
from datetime import datetime, timezone
from typing import Any
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


class HubEauTemperatureClient:
    """Client résilient avec pagination, retry exponentiel, timeout et préservation de provenance."""

    BASE_URL = "https://hubeau.eaufrance.fr/api/v1/temperature"

    def __init__(self, base_url: str | None = None, timeout_seconds: float = 15.0) -> None:
        self.base_url = (base_url or self.BASE_URL).rstrip("/")
        self.timeout_seconds = timeout_seconds
        self._station_cache: dict[str, list[dict[str, Any]]] = {}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def fetch_stations(
        self,
        libelle_cours_eau: str | None = None,
        code_departement: str | None = None,
        bbox: tuple[float, float, float, float] | None = None,
        size: int = 100,
        page: int = 1,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"size": size, "page": page, "format": "json"}
        if libelle_cours_eau:
            params["libelle_cours_eau"] = libelle_cours_eau
        if code_departement:
            params["code_departement"] = code_departement
        if bbox:
            params["bbox"] = ",".join(str(c) for c in bbox)

        cache_key = str(sorted(params.items()))
        if cache_key in self._station_cache:
            return {"data": self._station_cache[cache_key], "cached": True}

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            resp = await client.get(f"{self.base_url}/station", params=params)
            resp.raise_for_status()
            payload = resp.json()
            data = payload.get("data", [])
            self._station_cache[cache_key] = data
            return payload

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def fetch_chronique(
        self,
        code_station: str,
        date_debut_mesure: str | None = None,
        date_fin_mesure: str | None = None,
        size: int = 200,
        sort: str = "desc",
    ) -> list[dict[str, Any]]:
        params: dict[str, Any] = {
            "code_station": code_station,
            "size": size,
            "sort": sort,
        }
        if date_debut_mesure:
            params["date_debut_mesure"] = date_debut_mesure
        if date_fin_mesure:
            params["date_fin_mesure"] = date_fin_mesure

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            resp = await client.get(f"{self.base_url}/chronique", params=params)
            resp.raise_for_status()
            payload = resp.json()
            return payload.get("data", [])

    @staticmethod
    def normalize_station(raw: dict[str, Any]) -> dict[str, Any]:
        """Transforme une station Hub'Eau officielle vers le schéma `water_temperature_stations`."""
        code = str(raw["code_station"])
        lat = float(raw["latitude"])
        lon = float(raw["longitude"])
        return {
            "id": f"hubeau-st-{code}",
            "station_code": code,
            "name": str(raw.get("libelle_station") or code),
            "river_name": str(raw.get("libelle_cours_eau") or "Cours d'eau inconnu"),
            "latitude": lat,
            "longitude": lon,
            "source": "HUBEAU",
        }

    @staticmethod
    def normalize_measurement(raw: dict[str, Any], station_id: str) -> dict[str, Any]:
        """Transforme une mesure chronique Hub'Eau sans jamais écraser l'historique existant."""
        date_str = str(raw["date_mesure_temp"])
        time_str = str(raw.get("heure_mesure_temp") or "00:00:00")
        measured_at = datetime.fromisoformat(f"{date_str}T{time_str}+00:00")
        temp_c = float(raw["resultat"])
        if temp_c < -5.0 or temp_c > 45.0:
            raise ValueError(f"Température de l'eau hors limites physiques: {temp_c} °C")

        return {
            "station_id": station_id,
            "measured_at": measured_at,
            "temperature_c": round(temp_c, 2),
            "quality_code": str(raw.get("code_qualification") or "1"),
            "source": "HUBEAU",
            "created_at": datetime.now(timezone.utc),
        }
