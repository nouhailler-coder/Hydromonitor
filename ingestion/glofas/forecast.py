"""Pipeline de mise à jour quotidienne des prévisions d'ensemble GloFAS (50 membres + contrôle)."""
from datetime import datetime, timezone
from typing import Any
from ingestion.glofas.client import GlofasConfig, GlofasEwdsClient
from ingestion.glofas.parser import GlofasParser


class GlofasForecastPipeline:
    """Exécute l'ingestion idempotente des prévisions d'ensemble GloFAS depuis Copernicus EWDS."""

    def __init__(self, config: GlofasConfig | None = None) -> None:
        self.client = GlofasEwdsClient(config)
        self.parser = GlofasParser()

    def process_forecast_steps(self, steps: list[dict[str, Any]]) -> dict[str, Any]:
        started_at = datetime.now(timezone.utc)
        all_rows: list[dict[str, Any]] = []
        rejected = 0
        for step in steps:
            try:
                rows = self.parser.parse_ensemble_forecast_step(
                    glofas_point_id=step["glofas_point_id"],
                    reference_time_iso=step["reference_time"],
                    forecast_time_iso=step["forecast_time"],
                    ensemble_values=step["ensemble_values"],
                    control_value=step["control_value"],
                )
                all_rows.extend(rows)
            except (KeyError, ValueError):
                rejected += 1

        finished_at = datetime.now(timezone.utc)
        return {
            "source": "GLOFAS_FORECAST",
            "started_at": started_at.isoformat(),
            "finished_at": finished_at.isoformat(),
            "records_processed": len(steps),
            "records_valid": len(steps) - rejected,
            "records_rejected": rejected,
            "records_inserted": len(all_rows),
            "rows": all_rows,
        }
