"""Fonctions géospatiales PostGIS, calcul de distance Haversine et simplification géométrique."""
import math
from typing import Any


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcule la distance orthodromique en mètres entre deux coordonnées WGS84 (SRID 4326)."""
    earth_radius_m = 6_371_000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(earth_radius_m * c, 2)


def simplify_linestring_coords(
    coords: list[list[float]], zoom: float
) -> list[list[float]]:
    """Simplifie une polyligne selon le niveau de zoom de la carte pour éviter de surcharger le navigateur."""
    if zoom >= 8 or len(coords) <= 4:
        return coords
    step = 2 if zoom >= 6 else 3
    simplified = coords[::step]
    if simplified[-1] != coords[-1]:
        simplified.append(coords[-1])
    return simplified


def bbox_intersects(
    coords: list[list[float]], bbox: tuple[float, float, float, float] | None
) -> bool:
    """Vérifie si une polyligne intersecte une bounding box (min_lon, min_lat, max_lon, max_lat)."""
    if bbox is None:
        return True
    min_lon, min_lat, max_lon, max_lat = bbox
    for lon, lat in coords:
        if min_lon <= lon <= max_lon and min_lat <= lat <= max_lat:
            return True
    return False
