# HydroMonitor — Moteur d'Analyse Hydrologique & Géospatiale

**HydroMonitor** est un moteur d'analyse hydrologique permettant de **comprendre immédiatement l'état actuel d'une rivière par rapport à son comportement historique** (climatologie multi-décennale 1991–2020), en croisant :

1. **HydroRIVERS v1.0** — Référentiel géométrique des tronçons fluviaux (ordre de Strahler, surface drainée amont)
2. **HydroBASINS v1.c / HydroSHEDS** — Bassins versants topologiques Pfafstetter et topographie hydrologique
3. **Copernicus CEMS GloFAS v5.0 (EWDS)** — Réanalyse historique LISFLOOD/ERA5 (30 ans) et prévisions d'ensemble à 51 membres (horizon J+10)
4. **Hub'Eau — Température des cours d'eau (Eaufrance)** — Chroniques thermiques in-situ des stations hydrométriques françaises

---

## Philosophie : Du « Dashboard de Données » au « Moteur d'Analyse »

Au lieu d'afficher une valeur brute isolée difficile à interpréter (`Débit actuel : 425 m³/s`), **HydroMonitor** contextualise systématiquement chaque mesure par rapport à la distribution statistique historique pour la même date de l'année :

```text
SEINE — PARIS

Débit actuel              425 m³/s
Moyenne pour cette date   365 m³/s
Écart                     +16,4 %
Position historique       72e percentile
Tendance                  ↗ en hausse depuis 3 jours
```

L'utilisateur comprend instantanément :
- **La normalité saisonnière** : comparaison à la moyenne calendaire 1991–2020 pour ce jour précis (et non à la seule moyenne annuelle),
- **La rareté statistique** : positionnement dans les quantiles historiques (`P10`, `P25`, `Médiane P50`, `P75`, `P90`) et calcul du centile exact (`72e percentile`),
- **La dynamique récente** : détection automatique de la tendance multi-jours (`↗ en hausse depuis 3 jours`, `+42 m³/s`),
- **La trajectoire prévisionnelle** : probabilité de maintien au-dessus de la normale saisonnière à J+5 et J+10 selon les 51 membres d'ensemble GloFAS.

---

## Structure du Dépôt

- `frontend/` & `src/` : Application React 19 + TypeScript + Vite + MapLibre GL JS + Recharts + Firebase Auth
- `backend/` : API Python FastAPI + Pydantic v2 + SQLAlchemy 2.0 + GeoAlchemy2 + Moteur d'analyse hydrologique (`/api/rivers/{id}/analysis`)
- `ingestion/` : Pipelines d'import batch (`hydrorivers/`, `hydrobasins/`, `hydrosheds/`, `glofas/`, `hubeau/`, `mapping/`)
- `database/` : Migrations Alembic (`migrations/`) et seeds de développement France (`seeds/` : Seine, Loire, Rhône)
- `infra/` : Dockerfiles stateless, Cloud Run Service & Jobs, Cloud Scheduler, Terraform (Cloud SQL PostGIS, GCS, Secret Manager)
- `tests/` : Suites de tests unitaires, géospatiaux et analytiques (`unit/`, `geo/`, `integration/`, `api/`)
- `docs/` : Documentation technique complète (`architecture.md`, `data-sources.md`, `database.md`, `api.md`, `google-cloud.md`, `deployment.md`, `ingestion.md`)

---

## Démarrage Rapide en Local

### 1. Base de données PostgreSQL / PostGIS & Backend Docker
```bash
docker compose up -d
```

### 2. Migrations Alembic & Seed de Développement (Seine, Loire, Rhône)
```bash
alembic -c database/alembic.ini upgrade head
python database/seeds/seed_runner.py --env=dev
```

### 3. Lancement du Backend FastAPI (hors Docker)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Lancement du Frontend React + Serveur Full-Stack
```bash
npm install
npm run dev
```

### 5. Exécution des Tests
```bash
python3 tests/run_tests_stdlib.py
npm run lint
npm run build
```
