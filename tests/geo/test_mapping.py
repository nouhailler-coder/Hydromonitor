"""Tests géospatiaux : distance Haversine, simplification géométrique et mapping."""
from app.geo.spatial import haversine_distance_m, simplify_linestring_coords


def test_haversine_and_simplification() -> None:
    dist_m = haversine_distance_m(48.8566, 2.3522, 48.8442, 2.3658)
    assert 1000 < dist_m < 2500

    coords = [[0.0, 48.0], [0.5, 48.1], [1.0, 48.2], [1.5, 48.3], [2.0, 48.4], [2.5, 48.5]]
    simplified_low_zoom = simplify_linestring_coords(coords, zoom=5.0)
    assert len(simplified_low_zoom) < len(coords)
    assert simplified_low_zoom[-1] == coords[-1]
