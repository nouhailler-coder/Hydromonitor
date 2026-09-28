# Sources de Données Hydrologiques & Licences

| Code | Nom Officiel | Type | URL Officielle | Licence |
|---|---|---|---|---|
| `HYDRORIVERS` | HydroRIVERS v1.0 | Référentiel vectoriel des tronçons (`MULTILINESTRING`) | `https://www.hydrosheds.org/products/hydrorivers` | CC-BY 4.0 (WWF / McGill) |
| `HYDROBASINS` | HydroBASINS v1.c | Polygones de bassins versants Pfafstetter (`MULTIPOLYGON`) | `https://www.hydrosheds.org/products/hydrobasins` | CC-BY 4.0 (Lehner & Grill) |
| `HYDROSHEDS` | HydroSHEDS DEM / ACC | Rasters d'élévation et d'accumulation de flux (stockés sur GCS) | `https://www.hydrosheds.org/` | CC-BY 4.0 |
| `GLOFAS` | Copernicus CEMS GloFAS v5.0 | Modèle hydrologique LISFLOOD (`cems-glofas-historical` & `cems-glofas-forecast`) | `https://ewds.climate.copernicus.eu/api` | Copernicus Open License |
| `HUBEAU` | Hub'Eau Température Continu | API REST officielle Eaufrance (`station` & `chronique`) | `https://hubeau.eaufrance.fr/api/v1/temperature` | Licence Ouverte Etalab 2.0 |

## Notes d'Intégration
- **GloFAS** : Utilise exclusivement le catalogue **Copernicus EWDS** (`ewds.climate.copernicus.eu`) et la résolution `0.05°` (GloFAS v4.0/v5.0). Aucun ancien endpoint CDS obsolète n'est utilisé.
- **Hub'Eau** : Les mesures historiques dans `water_temperature_measurements` utilisent une clé primaire composite `(station_id, measured_at)` et ne sont jamais écrasées.
