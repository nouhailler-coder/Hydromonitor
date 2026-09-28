"""Configuration centrale et intégration Google Cloud Secret Manager."""
import os
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "HydroMonitor API"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    database_url: str = Field(
        default="postgresql+psycopg://hydromonitor:hydromonitor_dev@localhost:5432/hydromonitor",
        alias="DATABASE_URL",
    )
    google_cloud_project: str = Field(
        default="gen-lang-client-0257614236",
        alias="GOOGLE_CLOUD_PROJECT",
    )
    firebase_project_id: str = Field(
        default="gen-lang-client-0257614236",
        alias="FIREBASE_PROJECT_ID",
    )
    gcs_bucket_name: str = Field(
        default="hydromonitor-geodata-bucket",
        alias="GCS_BUCKET_NAME",
    )
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        alias="CORS_ORIGINS",
    )

    # Copernicus EWDS / GloFAS
    glofas_ewds_url: str = Field(
        default="https://ewds.climate.copernicus.eu/api",
        alias="GLOFAS_EWDS_URL",
    )
    glofas_ewds_api_key: str = Field(default="", alias="GLOFAS_EWDS_API_KEY")
    glofas_version: str = Field(default="5.0", alias="GLOFAS_VERSION")
    glofas_historical_dataset: str = Field(
        default="cems-glofas-historical",
        alias="GLOFAS_HISTORICAL_DATASET",
    )
    glofas_forecast_dataset: str = Field(
        default="cems-glofas-forecast",
        alias="GLOFAS_FORECAST_DATASET",
    )

    # Hub'Eau
    hubeau_base_url: str = Field(
        default="https://hubeau.eaufrance.fr/api/v1/temperature",
        alias="HUBEAU_BASE_URL",
    )
    hubeau_timeout_seconds: float = Field(default=15.0, alias="HUBEAU_TIMEOUT_SECONDS")
    hubeau_max_retries: int = Field(default=3, alias="HUBEAU_MAX_RETRIES")

    # Admin RBAC
    admin_emails: list[str] = Field(default_factory=lambda: ["nouhailler@gmail.com"])

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


def resolve_secret_from_gcp(secret_id: str, project_id: str, version: str = "latest") -> str | None:
    """Récupère un secret depuis Google Secret Manager en production Cloud Run."""
    if os.getenv("ENVIRONMENT") != "production":
        return None
    try:
        from google.cloud import secretmanager

        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version}"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception:
        return None


@lru_cache
def get_settings() -> Settings:
    return Settings()
