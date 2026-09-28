"""Pipeline de correspondance spatiale reproductible :
- HydroRIVERS ↔ GloFAS (`map_river_segment_to_glofas`)
- HydroRIVERS ↔ Stations Hub'Eau (`map_station_to_river_segment`)

Prend en compte :
- distance orthodromique (mètres)
- cohérence de surface drainée amont (`upstream_area_km2` / `UPLAND_SKM`)
- ordre de Strahler (`river_order`)
- appartenance au bassin versant ou concordance toponymique
"""
import math
from datetime import datetime, timezone
from typing import Any


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6_371_000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _min_distance_to_segment_m(lat: float, lon: float, coordinates: list[list[float]]) -> float:
    if not coordinates:
        return float("inf")
    return min(_haversine_m(lat, lon, pt[1], pt[0]) for pt in coordinates)


def map_river_segment_to_glofas(
    river_segment: dict[str, Any],
    glofas_points: list[dict[str, Any]],
    max_search_distance_m: float = 15_000.0,
) -> dict[str, Any] | None:
    """Associe un tronçon HydroRIVERS à un point de grille GloFAS avec score de confiance [0..1].

    Critères pondérés :
    - Proximité géographique (50%)
    - Cohérence de surface amont drainée `upstream_area_km2` (40%)
    - Ordre hydrologique de Strahler >= 4 (10%)
    """
    seg_coords: list[list[float]] = river_segment.get("coordinates", [])
    seg_area = float(river_segment.get("upstream_area_km2") or 1.0)
    seg_order = int(river_segment.get("river_order") or 1)
    seg_basin = river_segment.get("basin_id")

    best_candidate: dict[str, Any] | None = None
    best_confidence = -1.0

    for pt in glofas_points:
        if seg_basin and pt.get("basin_id") and seg_basin != pt.get("basin_id"):
            continue

        dist_m = _min_distance_to_segment_m(float(pt["latitude"]), float(pt["longitude"]), seg_coords)
        if dist_m > max_search_distance_m:
            continue

        pt_area = float(pt.get("upstream_area_km2") or seg_area)
        area_ratio = min(seg_area, pt_area) / max(seg_area, pt_area, 1.0)

        dist_score = max(0.0, 1.0 - (dist_m / max_search_distance_m))
        order_score = 1.0 if seg_order >= 4 else 0.6
        confidence = round(0.50 * dist_score + 0.40 * area_ratio + 0.10 * order_score, 4)

        if confidence > best_confidence:
            best_confidence = confidence
            best_candidate = {
                "river_segment_id": str(river_segment["id"]),
                "glofas_point_id": str(pt["id"]),
                "distance_m": round(dist_m, 2),
                "mapping_method": "HYDRORIVERS_GLOFAS_MULTICRITERIA_V1",
                "confidence": confidence,
                "upstream_area_ratio": round(area_ratio, 4),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

    return best_candidate


def map_station_to_river_segment(
    station: dict[str, Any],
    river_segments: list[dict[str, Any]],
    max_distance_m: float = 5_000.0,
) -> dict[str, Any] | None:
    """Associe une station Hub'Eau au tronçon HydroRIVERS le plus cohérent (distance + cours d'eau)."""
    st_lat = float(station["latitude"])
    st_lon = float(station["longitude"])
    st_river_name = str(station.get("river_name") or "").strip().lower()

    best_match: dict[str, Any] | None = None
    best_score = -1.0

    for seg in river_segments:
        coords: list[list[float]] = seg.get("coordinates", [])
        dist_m = _min_distance_to_segment_m(st_lat, st_lon, coords)
        if dist_m > max_distance_m:
            continue

        seg_name = str(seg.get("name") or "").strip().lower()
        name_match = bool(st_river_name and seg_name and (st_river_name in seg_name or seg_name in st_river_name))
        dist_score = max(0.0, 1.0 - (dist_m / max_distance_m))
        score = 0.70 * dist_score + (0.30 if name_match else 0.0)

        if score > best_score:
            best_score = score
            method = "POSTGIS_ST_DWITHIN_TOPONYM_MATCH" if name_match else "POSTGIS_ST_DWITHIN_NEAREST"
            best_match = {
                "river_segment_id": str(seg["id"]),
                "station_id": str(station["id"]),
                "distance_m": round(dist_m, 2),
                "mapping_method": method,
                "confidence": round(score, 4),
            }

    return best_match
