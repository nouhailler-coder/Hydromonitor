"""Tests d'intégration du client Hub'Eau Température."""
import pytest
from ingestion.hubeau.client import HubEauTemperatureClient


def test_hubeau_temperature_bounds_validation() -> None:
    with pytest.raises(ValueError):
        HubEauTemperatureClient.normalize_measurement(
            {
                "date_mesure_temp": "2026-09-28",
                "heure_mesure_temp": "12:00:00",
                "resultat": 85.0,
                "code_qualification": "1",
            },
            station_id="hubeau-st-03174000",
        )
