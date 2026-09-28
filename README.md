# HydroMonitor — Observatoire Hydrologique & Géospatial

Plateforme web d'exploration des cours d'eau et de leur état hydrologique combinant :
1. **HydroRIVERS v1.0** (référentiel géométrique des tronçons fluviaux)
2. **HydroBASINS v1.c / HydroSHEDS** (bassins versants Pfafstetter et topographie hydrologique)
3. **Copernicus CEMS GloFAS v5.0 (EWDS)** (débits modélisés historiques LISFLOOD/ERA5 et prévisions d'ensemble)
4. **Hub'Eau — Température des cours d'eau (Eaufrance)** (observations thermiques in-situ des stations françaises)

## Structure du Dépôt

- `frontend/` & `src/` : Application React 19 + TypeScript + Vite + MapLibre GL JS + Recharts + Firebase Auth
- `backend/` : API Python FastAPI + Pydantic v2 + SQLAlchemy 2.0 + GeoAlchemy2 + vérification Firebase ID Token
- `ingestion/` : Pipelines d'import batch (`hydrorivers/`, `hydrobasins/`, `hydrosheds/`, `glofas/`, `hubeau/`, `mapping/`)
- `database/` : Migrations Alembic (`migrations/`) et seeds de développement France (`seeds/` : Seine, Loire, Rhône)
- `infra/` : Dockerfiles stateless, Cloud Run Service & Jobs, Cloud Scheduler, Terraform (Cloud SQL PostGIS, GCS, Secret Manager)
- `tests/` : Suites de tests Pytest (`unit/`, `geo/`, `integration/`, `api/`)
- `docs/` : Documentation technique complète (`architecture.md`, `data-sources.md`, `database.md`, `api.md`, `google-cloud.md`, `deployment.md`, `ingestion.md`)

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
PYTHONPATH="backend:." pytest tests/ -v
npm run lint
npm run build
```
