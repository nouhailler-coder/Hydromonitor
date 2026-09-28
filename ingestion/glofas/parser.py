"""Parser et validateur pour les séries temporelles et ensembles NetCDF GloFAS (dis24)."""
from datetime import datetime, timezone
from typing import Any


class GlofasParser:
    """Extrait et valide les variables `dis24` (m³/s) issues de GloFAS EWDS."""

    def parse_historical_record(
        self,
        glofas_point_id: str,
        river_segment_id: str,
        timestamp_iso: str,
        discharge_m3s: float,
        dataset: str = "cems-glofas-historical",
        version: str = "5.0",
    ) -> dict[str, Any]:
        if discharge_m3s < 0 or discharge_m3s > 500_000:
            raise ValueError(f"Débit GloFAS hors bornes physiques: {discharge_m3s} m³/s")

        observed_at = datetime.fromisoformat(timestamp_iso.replace("Z", "+00:00"))
        return {
            "id": f"glofas-hist-{river_segment_id}-{int(observed_at.timestamp())}",
            "river_segment_id": river_segment_id,
            "observed_at": observed_at,
            "variable": "discharge",
            "value": round(float(discharge_m3s), 2),
            "unit": "m3/s",
            "source": f"GLOFAS_EWDS_V{version}",
            "source_id": f"{dataset}:{glofas_point_id}",
            "quality": "CONSOLIDATED_ERA5",
        }

    def parse_ensemble_forecast_step(
        self,
        glofas_point_id: str,
        reference_time_iso: str,
        forecast_time_iso: str,
        ensemble_values: list[float],
        control_value: float,
    ) -> list[dict[str, Any]]:
        """Calcule les quantiles (médiane, P10, P25, P75, P90) et le membre de contrôle."""
        if not ensemble_values:
            raise ValueError("L'ensemble de prévision GloFAS ne peut pas être vide.")
        sorted_vals = sorted(float(v) for v in ensemble_values if v >= 0)
        if not sorted_vals:
            raise ValueError("Aucune valeur positive valide dans l'ensemble GloFAS.")

        def percentile(p: float) -> float:
            idx = (len(sorted_vals) - 1) * p
            lower = int(idx)
            upper = min(lower + 1, len(sorted_vals) - 1)
            weight = idx - lower
            return round(sorted_vals[lower] * (1 - weight) + sorted_vals[upper] * weight, 2)

        ref_dt = datetime.fromisoformat(reference_time_iso.replace("Z", "+00:00"))
        fc_dt = datetime.fromisoformat(forecast_time_iso.replace("Z", "+00:00"))

        stats = {
            "control": round(float(control_value), 2),
            "median": percentile(0.50),
            "p10": percentile(0.10),
            "p25": percentile(0.25),
            "p75": percentile(0.75),
            "p90": percentile(0.90),
        }
        rows = []
        for member_name, val in stats.items():
            rows.append(
                {
                    "id": f"fc-{glofas_point_id}-{int(ref_dt.timestamp())}-{int(fc_dt.timestamp())}-{member_name}",
                    "glofas_point_id": glofas_point_id,
                    "forecast_reference_time": ref_dt,
                    "forecast_time": fc_dt,
                    "member": member_name,
                    "variable": "discharge",
                    "value": val,
                    "unit": "m3/s",
                }
            )
        return rows
