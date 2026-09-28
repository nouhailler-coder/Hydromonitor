# HydroMonitor — Architecture Système & Flux de Données

## 1. Principe Fondamental d'Isolation des Sources

Les sources scientifiques externes (Copernicus EWDS GloFAS, Eaufrance Hub'Eau, WWF HydroSHEDS) ne sont **jamais** exposées directement au navigateur client :

```text
SOURCES OFFICIELLES (HydroRIVERS, HydroBASINS, GloFAS EWDS, Hub'Eau)
   ↓
CLOUD RUN JOBS / INGESTION PYTHON (Téléchargement, Extraction, Retry, Cache)
   ↓
VALIDATION & MAPPING SPATIAL (Bornes physiques, Score de confiance, Idempotence)
   ↓
CLOUD SQL POSTGRESQL 16 + POSTGIS 3.4 (Index spatiaux GiST + Index temporels)
   ↓
CLOUD RUN FASTAPI STATELESS (Vérification Firebase ID Token, Simplification GeoJSON)
   ↓
REACT 19 + MAPLIBRE GL JS + RECHARTS (Firebase Hosting SPA)
```

## 2. Catégorisation Explicite des Données

L'application distingue strictement dans le schéma API et dans l'interface utilisateur :
- **`OBSERVATION` (Vert Émeraude `#10B981`)** : Mesures physiques in-situ issues des capteurs thermiques Hub'Eau / Naïades.
- **`MODELE` (Bleu Cyan `#0EA5E9`)** : Réanalyse hydrologique journalière issue du modèle LISFLOOD forcé par ERA5/ERA5T (GloFAS Historical v5.0).
- **`PREVISION` (Violet `#A855F7`)** : Prévisions d'ensemble probabilistes à 10-30 jours (50 membres perturbés + contrôle, quantiles P10/P25/Médiane/P75/P90).

## 3. Résilience & Fraîcheur

- Chaque série et indicateur affiche explicitement son horodatage de dernière synchronisation (`Mis à jour il y a X min` / `Dernière donnée : date/heure UTC`).
- En cas d'indisponibilité temporaire d'une API amont (Hub'Eau ou Copernicus EWDS), l'application continue de servir instantanément les données validées depuis PostGIS sans dégradation de l'expérience utilisateur.
