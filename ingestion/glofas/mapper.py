"""Adaptateur de correspondance entre la grille régulière GloFAS (0.05°) et les tronçons HydroRIVERS."""
from typing import Any
from ingestion.mapping.spatial_mapper import map_river_segment_to_glofas


class GlofasGridMapper:
    """Associe chaque tronçon HydroRIVERS au point de grille GloFAS le plus cohérent hydrologiquement."""

    def map_segments(
        self,
        segments: list[dict[str, Any]],
        glofas_points: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        mappings = []
        for seg in segments:
            result = map_river_segment_to_glofas(seg, glofas_points)
            if result is not None:
                mappings.append(result)
        return mappings
