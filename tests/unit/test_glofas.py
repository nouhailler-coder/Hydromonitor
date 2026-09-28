"""Tests unitaires du module GloFAS (Copernicus EWDS)."""
from ingestion.glofas.client import GlofasConfig, GlofasEwdsClient


def test_glofas_ewds_request_builder() -> None:
    client = GlofasEwdsClient(GlofasConfig(glofas_version="5.0"))
    req = client.build_historical_request(year="2026", month="09", days=["27", "28"])
    assert req["dataset"] == "cems-glofas-historical"
    assert req["request"]["system_version"] == ["version_5_0"]
    assert req["request"]["hydrological_model"] == ["lisflood"]
