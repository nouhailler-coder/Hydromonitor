# Schéma de Base de Données PostgreSQL / PostGIS

## Extension Spatiale
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Tables Principales (14 Tables)
1. **`rivers`** : Cours d'eau principaux (`geometry MULTILINESTRING SRID 4326`, index GiST).
2. **`river_segments`** : Tronçons HydroRIVERS (`hydro_rivers_id` unique, `river_order`, `length_km`, `upstream_area_km2`, `mean_discharge_m3s`, `geometry MULTILINESTRING SRID 4326`, index GiST).
3. **`basins`** : Bassins versants HydroBASINS (`hydrobasins_id`, `level`, `area_km2`, `geometry MULTIPOLYGON SRID 4326`, index GiST).
4. **`river_basin`** : Table de jointure `(river_id, basin_id)` avec clé primaire composite.
5. **`glofas_points`** : Points de grille GloFAS (`glofas_id`, `upstream_area_km2`, `geometry POINT SRID 4326`, index GiST).
6. **`river_glofas_mapping`** : Correspondance spatiale `(river_segment_id, glofas_point_id, distance_m, mapping_method, confidence)`.
7. **`water_temperature_stations`** : Stations thermiques Hub'Eau (`station_code`, `geometry POINT SRID 4326`, index GiST).
8. **`water_temperature_measurements`** : Chroniques de température (`PRIMARY KEY (station_id, measured_at)`, index composite `station_id + measured_at`).
9. **`river_temperature_station`** : Correspondance `(river_segment_id, station_id, distance_m, mapping_method)`.
10. **`hydrological_measurements`** : Table générique multi-variables (`discharge`, `water_temperature`, `water_level`, `precipitation`).
11. **`glofas_forecasts`** : Prévisions d'ensemble (`glofas_point_id`, `forecast_reference_time`, `forecast_time`, `member`, `value`).
12. **`data_sources`** : Registre des sources, versions, licences et dates de dernière synchronisation.
13. **`ingestion_runs`** : Journal d'observabilité des jobs d'import (`records_processed`, `records_inserted`, `records_updated`, `records_failed`).
14. **`alerts`** : Seuils et alertes hydrologiques par cours d'eau.
