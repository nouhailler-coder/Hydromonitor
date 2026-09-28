# Documentation de l'API REST HydroMonitor

## Endpoints Publics (Consultation & Cartographie)

- `GET /health` : État du service et de PostGIS.
- `GET /api/rivers?country=France&limit=20&offset=0` : Liste paginée des cours d'eau.
- `GET /api/rivers/search?q=Seine` : Recherche plein-texte et spatiale (`id`, `name`, `country`, `approx_position`, `type`, `basin`).
- `GET /api/rivers/nearby?lat=48.85&lon=2.35&radius_km=10` : Recherche par proximité géographique (`ST_DWithin`).
- `GET /api/rivers/{river_id}` : Fiche synthétique complète d'un cours d'eau.
- `GET /api/rivers/{river_id}/segments` : Tronçons HydroRIVERS et correspondances GloFAS.
- `GET /api/rivers/{river_id}/basin` : Polygone HydroBASINS et caractéristiques du bassin versant.
- `GET /api/rivers/{river_id}/discharge` : Dernier débit modélisé GloFAS (`MODELE`).
- `GET /api/rivers/{river_id}/discharge/history?date_from=...&date_to=...` : Chronique historique de débit GloFAS.
- `GET /api/rivers/{river_id}/forecast` : Prévisions d'ensemble GloFAS (`PREVISION` : contrôle, médiane, P10-P90, P25-P75).
- `GET /api/rivers/{river_id}/temperature` : Synthèse thermique actuelle (`OBSERVATION`).
- `GET /api/rivers/{river_id}/temperature/history?station_id=...` : Historique de température de l'eau Hub'Eau.
- `GET /api/rivers/{river_id}/stations` : Stations Hub'Eau rattachées avec distance et méthode de mapping.
- `GET /api/rivers/{river_id}/measurements?variable=discharge` : Mesures hydrologiques consolidées.
- `GET /api/map/rivers?zoom=6&bbox=-5,41,10,51` : GeoJSON simplifié selon le niveau de zoom.
- `GET /api/map/stations?bbox=-5,41,10,51` : GeoJSON des stations de mesure et points GloFAS.
- `GET /api/data-sources` : Catalogue des sources, licences et fraîcheur.
- `GET /api/ingestion/status` : État des derniers runs d'ingestion et compteurs globaux.

## Endpoints Authentifiés & Administrateur (Firebase ID Token `Bearer`)

- `GET /api/me` : Retourne le profil vérifié par Firebase Admin SDK (`uid`, `email`, `role`).
- `POST /api/admin/ingestion/trigger` : Déclenche un job d'ingestion idempotent (ex. synchronisation temps réel Hub'Eau ou recalcul du mapping spatial). Réservé aux administrateurs authentifiés.
