"""Service métier HydroMonitor avec données de référence Seine, Loire, Rhône."""
from datetime import datetime, timedelta, timezone
from typing import Any
from app.geo.spatial import bbox_intersects, haversine_distance_m, simplify_linestring_coords


def get_reference_rivers() -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "river-seine",
            "name": "La Seine",
            "river_code": "FR-SEINE-001",
            "country": "France",
            "length_km": 777.0,
            "basin_area_km2": 78650.0,
            "strahler_order": 7,
            "current_discharge_m3s": 486.4,
            "discharge_trend_pct": 4.2,
            "current_temperature_c": 16.4,
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
            "river_code": "FR-LOIRE-001",
            "country": "France",
            "length_km": 1006.0,
            "basin_area_km2": 117480.0,
            "strahler_order": 8,
            "current_discharge_m3s": 842.0,
            "discharge_trend_pct": -1.8,
            "current_temperature_c": 17.8,
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
            "river_code": "FR-RHONE-001",
            "country": "France",
            "length_km": 812.0,
            "basin_area_km2": 98000.0,
            "strahler_order": 8,
            "current_discharge_m3s": 1690.5,
            "discharge_trend_pct": 6.7,
            "current_temperature_c": 15.9,
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
            if not q_norm or q_norm in r["name"].lower() or q_norm in r["river_code"].lower() or q_norm in r["basin_name"].lower():
                results.append(
                    {
                        "id": r["id"],
                        "name": r["name"],
                        "country": r["country"],
                        "approx_position": r["approx_position"],
                        "type": "Fleuve principal (Ordre Strahler " + str(r["strahler_order"]) + ")",
                        "basin": r["basin_name"],
                        "river_code": r["river_code"],
                        "current_discharge_m3s": r["current_discharge_m3s"],
                        "current_temperature_c": r["current_temperature_c"],
                    }
                )
        return results

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
