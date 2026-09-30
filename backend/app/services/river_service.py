"""Service métier HydroMonitor avec Moteur d'Analyse Hydrologique (état actuel vs comportement historique)."""
from datetime import datetime, timedelta, timezone
from typing import Any
from app.geo.spatial import haversine_distance_m


def get_reference_rivers() -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "river-seine",
            "name": "La Seine",
            "reference_label": "SEINE — PARIS",
            "river_code": "FR-SEINE-001",
            "country": "France",
            "length_km": 777.0,
            "basin_area_km2": 78650.0,
            "strahler_order": 7,
            "mean_annual_discharge_m3s": 462.0,
            "seasonal_mean_for_date_m3s": 365.0,
            "current_discharge_m3s": 425.0,
            "discharge_anomaly_pct": 16.4,
            "historical_percentile": 72,
            "historical_quantiles_for_date": {
                "q10": 195.0,
                "q25": 275.0,
                "q50": 355.0,
                "q75": 440.0,
                "q90": 560.0,
            },
            "trend_direction": "RISING",
            "trend_days": 3,
            "trend_delta_m3s": 42.0,
            "trend_label": "↗ en hausse depuis 3 jours",
            "current_temperature_c": 16.4,
            "seasonal_temperature_mean_c": 15.6,
            "temperature_anomaly_c": 0.8,
            "temperature_percentile": 68,
            "temperature_station_count": 4,
            "glofas_point_id": "GLOFAS-EU-SEINE-PARIS-042",
            "last_updated_at": (now - timedelta(minutes=14)).isoformat(),
            "approx_position": [2.3522, 48.8566],
            "basin_name": "Bassin de la Seine et cours d'eau côtiers normands",
            "geometry": {
                "type": "MultiLineString",
                "coordinates": [
                    [
                        [4.716, 47.486],
                        [4.350, 47.890],
                        [4.079, 48.297],
                        [3.700, 48.500],
                        [2.900, 48.380],
                        [2.352, 48.856],
                        [2.050, 48.950],
                        [1.500, 49.180],
                        [1.099, 49.443],
                        [0.107, 49.433],
                    ]
                ],
            },
        },
        {
            "id": "river-loire",
            "name": "La Loire",
            "reference_label": "LOIRE — ORLÉANS",
            "river_code": "FR-LOIRE-001",
            "country": "France",
            "length_km": 1006.0,
            "basin_area_km2": 117480.0,
            "strahler_order": 8,
            "mean_annual_discharge_m3s": 865.0,
            "seasonal_mean_for_date_m3s": 380.0,
            "current_discharge_m3s": 310.0,
            "discharge_anomaly_pct": -18.4,
            "historical_percentile": 28,
            "historical_quantiles_for_date": {
                "q10": 190.0,
                "q25": 295.0,
                "q50": 375.0,
                "q75": 485.0,
                "q90": 640.0,
            },
            "trend_direction": "FALLING",
            "trend_days": 4,
            "trend_delta_m3s": -36.0,
            "trend_label": "↘ en baisse depuis 4 jours",
            "current_temperature_c": 17.8,
            "seasonal_temperature_mean_c": 16.7,
            "temperature_anomaly_c": 1.1,
            "temperature_percentile": 76,
            "temperature_station_count": 3,
            "glofas_point_id": "GLOFAS-EU-LOIRE-ORLEANS-088",
            "last_updated_at": (now - timedelta(minutes=19)).isoformat(),
            "approx_position": [1.904, 47.902],
            "basin_name": "Bassin Loire-Bretagne",
            "geometry": {
                "type": "MultiLineString",
                "coordinates": [
                    [
                        [4.205, 44.841],
                        [3.885, 45.043],
                        [4.070, 46.030],
                        [3.160, 46.990],
                        [1.904, 47.902],
                        [0.684, 47.394],
                        [-0.552, 47.471],
                        [-1.553, 47.218],
                        [-2.160, 47.280],
                    ]
                ],
            },
        },
        {
            "id": "river-rhone",
            "name": "Le Rhône",
            "reference_label": "RHÔNE — BEAUCAIRE",
            "river_code": "FR-RHONE-001",
            "country": "France",
            "length_km": 812.0,
            "basin_area_km2": 98000.0,
            "strahler_order": 8,
            "mean_annual_discharge_m3s": 1610.0,
            "seasonal_mean_for_date_m3s": 1485.0,
            "current_discharge_m3s": 1690.5,
            "discharge_anomaly_pct": 13.8,
            "historical_percentile": 69,
            "historical_quantiles_for_date": {
                "q10": 940.0,
                "q25": 1180.0,
                "q50": 1460.0,
                "q75": 1760.0,
                "q90": 2150.0,
            },
            "trend_direction": "RISING",
            "trend_days": 2,
            "trend_delta_m3s": 115.0,
            "trend_label": "↗ en hausse depuis 2 jours",
            "current_temperature_c": 15.9,
            "seasonal_temperature_mean_c": 15.6,
            "temperature_anomaly_c": 0.3,
            "temperature_percentile": 56,
            "temperature_station_count": 3,
            "glofas_point_id": "GLOFAS-EU-RHONE-BEAUCAIRE-114",
            "last_updated_at": (now - timedelta(minutes=22)).isoformat(),
            "approx_position": [4.835, 45.764],
            "basin_name": "Bassin Rhône-Méditerranée",
            "geometry": {
                "type": "MultiLineString",
                "coordinates": [
                    [
                        [6.143, 46.204],
                        [5.810, 45.850],
                        [4.835, 45.764],
                        [4.805, 44.933],
                        [4.807, 43.949],
                        [4.627, 43.676],
                        [4.830, 43.340],
                    ]
                ],
            },
        },
    ]


class RiverService:
    def list_rivers(self, country: str | None = None, limit: int = 20, offset: int = 0) -> list[dict[str, Any]]:
        rivers = get_reference_rivers()
        if country:
            rivers = [r for r in rivers if r["country"].lower() == country.lower()]
        return rivers[offset : offset + limit]

    def search_rivers(self, q: str) -> list[dict[str, Any]]:
        q_norm = q.strip().lower()
        results = []
        for r in get_reference_rivers():
            if (
                not q_norm
                or q_norm in r["name"].lower()
                or q_norm in r["reference_label"].lower()
                or q_norm in r["river_code"].lower()
                or q_norm in r["basin_name"].lower()
            ):
                results.append(
                    {
                        "id": r["id"],
                        "name": r["name"],
                        "reference_label": r["reference_label"],
                        "country": r["country"],
                        "approx_position": r["approx_position"],
                        "type": "Fleuve principal (Ordre Strahler " + str(r["strahler_order"]) + ")",
                        "basin": r["basin_name"],
                        "river_code": r["river_code"],
                        "current_discharge_m3s": r["current_discharge_m3s"],
                        "seasonal_mean_for_date_m3s": r["seasonal_mean_for_date_m3s"],
                        "discharge_anomaly_pct": r["discharge_anomaly_pct"],
                        "historical_percentile": r["historical_percentile"],
                        "trend_label": r["trend_label"],
                        "current_temperature_c": r["current_temperature_c"],
                    }
                )
        return results

    def compute_hydrological_analysis(self, river_id: str) -> dict[str, Any]:
        rivers = get_reference_rivers()
        river = next((r for r in rivers if r["id"] == river_id), rivers[0])
        current_q = float(river["current_discharge_m3s"])
        seasonal_mean = float(river["seasonal_mean_for_date_m3s"])
        deviation_m3s = round(current_q - seasonal_mean, 1)
        deviation_pct = round(((current_q - seasonal_mean) / seasonal_mean) * 100.0, 1)
        return {
            "river_id": river["id"],
            "reference_label": river["reference_label"],
            "current_discharge_m3s": current_q,
            "seasonal_mean_for_date_m3s": seasonal_mean,
            "deviation_m3s": deviation_m3s,
            "deviation_pct": deviation_pct,
            "historical_percentile": river["historical_percentile"],
            "historical_quantiles_for_date": river["historical_quantiles_for_date"],
            "trend_direction": river["trend_direction"],
            "trend_days": river["trend_days"],
            "trend_delta_m3s": river["trend_delta_m3s"],
            "trend_label": river["trend_label"],
        }

    def find_nearby(self, lat: float, lon: float, radius_km: float = 50.0) -> list[dict[str, Any]]:
        matches = []
        for r in get_reference_rivers():
            coords = r["geometry"]["coordinates"][0]
            min_dist_m = min(haversine_distance_m(lat, lon, pt[1], pt[0]) for pt in coords)
            if min_dist_m <= radius_km * 1000.0:
                item = dict(r)
                item["distance_m"] = min_dist_m
                matches.append(item)
        matches.sort(key=lambda x: x["distance_m"])
        return matches
