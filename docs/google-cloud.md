# Architecture Google Cloud Platform (GCP)

## Composants Cloud Utilisés

1. **Cloud Run (Service Stateless)** : Héberge l'API FastAPI (`hydromonitor-api`). Aucune donnée persistante sur le système de fichiers local.
2. **Cloud Run Jobs (7 Jobs Batch Idempotents)** :
   - `hydrorivers-import`
   - `hydrobasins-import`
   - `glofas-historical-import`
   - `glofas-forecast-update`
   - `hubeau-stations-update`
   - `hubeau-measurements-update`
   - `mapping-update`
3. **Cloud SQL for PostgreSQL 16 + PostGIS 3.4** : Base de données relationnelle et spatiale avec index GiST.
4. **Google Cloud Storage (`gs://PROJECT_BUCKET/`)** :
   - `hydrorivers/`
   - `hydrobasins/`
   - `hydrosheds/`
   - `glofas/`
   - `imports/`
   - `exports/`
   Accès public désactivé (`public_access_prevention = enforced`).
5. **Google Secret Manager** : Stockage sécurisé de `DATABASE_URL` et `GLOFAS_EWDS_API_KEY`.
6. **Cloud Scheduler** : Déclenchement périodique des Cloud Run Jobs via OIDC.
7. **Firebase Authentication & Firebase Hosting** : Authentification utilisateur (Google + Email/Password) et distribution CDN du frontend React SPA.
