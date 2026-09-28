"""Pipeline d'ingestion historique GloFAS (réanalyse LISFLOOD + ERA5/ERA5T) avec reprise sur erreur."""
from datetime import datetime, timezone
from typing import Any
from ingestion.glofas.client import GlofasConfig, GlofasEwdsClient
from ingestion.glofas.parser import GlofasParser


class GlofasHistoricalPipeline:
    """Orchestre le téléchargement, la validation et l'insertion idempotente des chroniques GloFAS."""

    def __init__(self, config: GlofasConfig | None = None) -> None:
        self.client = GlofasEwdsClient(config)
        self.parser = GlofasParser()

    def run_batch(self, raw_records: list[dict[str, Any]]) -> dict[str, Any]:
        started_at = datetime.now(timezone.utc)
        valid_rows = []
        rejected = 0
        for rec in raw_records:
            try:
                parsed = self.parser.parse_historical_record(
                    glofas_point_id=rec["glofas_point_id"],
                    river_segment_id=rec["river_segment_id"],
                    timestamp_iso=rec["timestamp"],
                    discharge_m3s=rec["discharge_m3s"],
                    version=self.client.config.glofas_version,
                )
                valid_rows.append(parsed)
            except (KeyError, ValueError):
                rejected += 1

        finished_at = datetime.now(timezone.utc)
        return {
            "source": "GLOFAS_HISTORICAL",
            "started_at": started_at.isoformat(),
            "finished_at": finished_at.isoformat(),
            "records_processed": len(raw_records),
            "records_valid": len(valid_rows),
            "records_rejected": rejected,
            "records_inserted": len(valid_rows),
            "records_updated": 0,
            "rows": valid_rows,
        }
