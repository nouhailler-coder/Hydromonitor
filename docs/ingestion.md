# Pipelines d'Ingestion & Mapping Spatial

## 1. Idempotence & Reprise après Erreur
Tous les jobs d'ingestion (`ingestion/*`) sont conçus pour être relancés sans créer de doublons :
- **HydroRIVERS** : Clé unique `hydro_rivers_id` (`HYRIV_ID`).
- **HydroBASINS** : Clé unique `hydrobasins_id` (`HYBAS_ID`).
- **Hub'Eau Mesures** : Clé primaire composite `(station_id, measured_at)` avec `ON CONFLICT DO NOTHING` pour ne jamais écraser une mesure historique validée.
- **GloFAS Prévisions** : Clé déterministe `(glofas_point_id, forecast_reference_time, forecast_time, member)`.

## 2. Algorithme de Mapping Spatial Multi-Critères
- **`map_river_segment_to_glofas()`** : Combine la distance orthodromique Haversine/`ST_Distance` (50%), le ratio de surface drainée amont `UPLAND_SKM` vs `upstream_area_km2` (40%) et l'ordre de Strahler (10%) pour produire un score de confiance `[0.0 .. 1.0]`.
- **`map_station_to_river_segment()`** : Associe chaque station Hub'Eau au tronçon HydroRIVERS situé dans un rayon de 5 km en pondérant la proximité géométrique (70%) et la concordance toponymique du cours d'eau (30%).
