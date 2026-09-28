# Terraform Infrastructure-as-Code pour HydroMonitor sur Google Cloud Platform
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

variable "project_id" {
  type        = string
  description = "Google Cloud Project ID"
  default     = "gen-lang-client-0257614236"
}

variable "region" {
  type        = string
  default     = "europe-west1"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Google Cloud Storage Bucket privé pour fichiers géospatiaux & NetCDF
resource "google_storage_bucket" "geodata_bucket" {
  name                        = "${var.project_id}-hydromonitor-geodata"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  lifecycle_rule {
    condition {
      age                   = 30
      matches_prefix        = ["imports/", "glofas/tmp/"]
    }
    action {
      type = "Delete"
    }
  }
}

# Préfixes structurels GCS : hydrorivers/, hydrobasins/, hydrosheds/, glofas/, imports/, exports/
resource "google_storage_bucket_object" "folders" {
  for_each = toset(["hydrorivers/", "hydrobasins/", "hydrosheds/", "glofas/", "imports/", "exports/"])
  name     = each.key
  content  = " "
  bucket   = google_storage_bucket.geodata_bucket.name
}

# 2. Cloud SQL for PostgreSQL 16 (avec extension PostGIS activée par migration Alembic)
resource "google_sql_database_instance" "postgis" {
  name             = "hydromonitor-pg"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-custom-2-7680"
    availability_type = "REGIONAL"
    disk_autoresize   = true
    disk_size         = 50
    disk_type         = "PD_SSD"

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
    }
  }
}

resource "google_sql_database" "hydromonitor_db" {
  name     = "hydromonitor"
  instance = google_sql_database_instance.postgis.name
}

# 3. Google Secret Manager (aucun secret dans Git)
resource "google_secret_manager_secret" "database_url" {
  secret_id = "hydromonitor-database-url"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "glofas_ewds_key" {
  secret_id = "hydromonitor-glofas-ewds-key"
  replication {
    auto {}
  }
}
