-- ============================================================================
-- HydroMonitor Development Seed (France: Seine, Loire, Rhône)
-- Strict separation from production data. Loaded automatically in local Docker
-- or via `python database/seeds/seed_runner.py --env=dev`.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- Data Sources Registry
INSERT INTO data_sources (id, code, name, description, url, data_type, license, last_sync_at)
VALUES
  ('ds-hydrorivers', 'HYDRORIVERS', 'HydroRIVERS v1.0 (HydroSHEDS)', 'Référentiel vectoriel mondial des tronçons fluviaux dérivé d''HydroSHEDS à 15 secondes d''arc.', 'https://www.hydrosheds.org/products/hydrorivers', 'GEOSPATIAL_VECTOR', 'CC-BY 4.0 (WWF / McGill University)', NOW() - INTERVAL '2 days'),
  ('ds-hydrobasins', 'HYDROBASINS', 'HydroBASINS v1.c (Pfafstetter Niv. 1-12)', 'Délimitations hiérarchiques des bassins et sous-bassins versants mondiaux selon le codage Pfafstetter.', 'https://www.hydrosheds.org/products/hydrobasins', 'GEOSPATIAL_VECTOR', 'CC-BY 4.0 (WWF / Lehner & Grill 2013)', NOW() - INTERVAL '2 days'),
  ('ds-hydrosheds', 'HYDROSHEDS', 'HydroSHEDS DEM & Flow Accumulation', 'Modèles numériques d''élévation conditionnés hydrologiquement et directions d''écoulement.', 'https://www.hydrosheds.org/', 'GEOSPATIAL_RASTER', 'CC-BY 4.0', NOW() - INTERVAL '5 days'),
  ('ds-glofas', 'GLOFAS', 'Copernicus CEMS GloFAS v5.0 (EWDS)', 'Système mondial de sensibilisation aux inondations (LISFLOOD + ERA5/ECMWF IFS) — Réanalyse historique et prévisions d''ensemble à 0.05°.', 'https://ewds.climate.copernicus.eu/datasets/cems-glofas-historical', 'MODEL_AND_FORECAST', 'Copernicus Open License (CEMS)', NOW() - INTERVAL '42 minutes'),
  ('ds-hubeau', 'HUBEAU', 'Hub''Eau — Température des cours d''eau (Eaufrance)', 'Mesures in-situ continues de la température de l''eau issues du réseau national Naïades / OFB.', 'https://hubeau.eaufrance.fr/page/api-temperature-continu', 'OBSERVATION_INSITU', 'Licence Ouverte Etalab 2.0', NOW() - INTERVAL '14 minutes')
ON CONFLICT (code) DO NOTHING;

-- Rivers (Seine, Loire, Rhône)
INSERT INTO rivers (id, name, river_code, country, geometry)
VALUES
  (
    'river-seine',
    'La Seine',
    'FR-SEINE-001',
    'France',
    ST_GeomFromText('MULTILINESTRING((4.716 47.486, 4.079 48.297, 3.700 48.500, 2.900 48.380, 2.352 48.856, 1.980 48.950, 1.099 49.443, 0.107 49.433))', 4326)
  ),
  (
    'river-loire',
    'La Loire',
    'FR-LOIRE-001',
    'France',
    ST_GeomFromText('MULTILINESTRING((4.205 44.841, 3.885 45.043, 4.070 46.030, 3.160 46.990, 1.904 47.902, 0.684 47.394, -0.552 47.471, -1.553 47.218, -2.160 47.280))', 4326)
  ),
  (
    'river-rhone',
    'Le Rhône',
    'FR-RHONE-001',
    'France',
    ST_GeomFromText('MULTILINESTRING((6.143 46.204, 5.810 45.850, 4.835 45.764, 4.805 44.933, 4.807 43.949, 4.627 43.676, 4.830 43.340))', 4326)
  )
ON CONFLICT (river_code) DO NOTHING;

-- Basins (HydroBASINS Pfafstetter Level 4/5)
INSERT INTO basins (id, hydrobasins_id, level, area_km2, geometry)
VALUES
  (
    'basin-seine',
    2040023010,
    4,
    78650.0,
    ST_GeomFromText('MULTIPOLYGON(((0.05 49.55, 1.50 49.85, 3.95 49.45, 5.05 48.35, 4.95 47.25, 3.20 47.30, 1.45 48.15, 0.05 49.20, 0.05 49.55)))', 4326)
  ),
  (
    'basin-loire',
    2040021840,
    4,
    117480.0,
    ST_GeomFromText('MULTIPOLYGON(((-2.25 47.45, 0.50 48.10, 3.55 47.85, 4.55 45.80, 4.35 44.65, 2.25 45.10, -0.80 46.50, -2.25 47.15, -2.25 47.45)))', 4326)
  ),
  (
    'basin-rhone',
    2040018920,
    4,
    98000.0,
    ST_GeomFromText('MULTIPOLYGON(((4.15 43.30, 4.25 45.95, 5.95 46.55, 6.95 46.10, 6.75 44.40, 5.45 43.30, 4.15 43.30)))', 4326)
  )
ON CONFLICT (hydrobasins_id) DO NOTHING;

INSERT INTO river_basin (river_id, basin_id)
VALUES
  ('river-seine', 'basin-seine'),
  ('river-loire', 'basin-loire'),
  ('river-rhone', 'basin-rhone')
ON CONFLICT DO NOTHING;
