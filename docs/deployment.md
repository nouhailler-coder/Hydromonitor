# Guide de Déploiement (Cloud Run & Firebase Hosting)

## 1. Déploiement Infrastructure (Terraform)
```bash
cd infra/terraform
terraform init
terraform plan -var="project_id=gen-lang-client-0257614236"
terraform apply
```

## 2. Migrations Alembic sur Cloud SQL PostGIS
```bash
export DATABASE_URL="postgresql+psycopg://..."
alembic -c database/alembic.ini upgrade head
```

## 3. Déploiement Backend FastAPI sur Cloud Run
```bash
gcloud builds submit --tag europe-west1-docker.pkg.dev/$PROJECT_ID/hydromonitor/backend:latest -f infra/docker/Dockerfile.backend .
gcloud run services replace infra/cloud-run/service.yaml --region=europe-west1
```

## 4. Déploiement Frontend sur Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```
