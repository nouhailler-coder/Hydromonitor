"""Tests unitaires, géospatiaux, d'intégration et d'API avec fixtures Seine, Loire, Rhône."""
import pytest
from ingestion.glofas.parser import GlofasParser
from ingestion.mapping.spatial_mapper import (
    map_river_segment_to_glofas,
    map_station_to_river_segment,
)
from ingestion.hubeau.client import HubEauTemperatureClient
from app.services.river_service import RiverService


@pytest.fixture
def french_rivers_fixture() -> dict:
    return {
        "seine_segment": {
            "id": "seg-seine-paris-204101",
            "hydro_rivers_id": 20410199,
            "name": "La Seine",
            "river_order": 7,
            "upstream_area_km2": 44320.0,
            "basin_id": "basin-seine",
            "coordinates": [[2.42, 48.82], [2.3522, 48.8566], [2.28, 48.84]],
        },
        "loire_segment": {
            "id": "seg-loire-orleans-204205",
            "hydro_rivers_id": 20420512,
            "name": "La Loire",
            "river_order": 8,
            "upstream_area_km2": 36970.0,
            "basin_id": "basin-loire",
            "coordinates": [[1.95, 47.89], [1.904, 47.902], [1.85, 47.88]],
        },
        "rhone_segment": {
            "id": "seg-rhone-lyon-204309",
            "hydro_rivers_id": 20430944,
            "name": "Le Rhône",
            "river_order": 8,
            "upstream_area_km2": 50200.0,
            "basin_id": "basin-rhone",
            "coordinates": [[4.85, 45.78], [4.835, 45.764], [4.82, 45.73]],
        },
    }


def test_glofas_parser_historical_and_ensemble() -> None:
    parser = GlofasParser()
    hist = parser.parse_historical_record(
        glofas_point_id="GLOFAS-EU-SEINE-PARIS-042",
        river_segment_id="seg-seine-paris-204101",
        timestamp_iso="2026-09-27T00:00:00Z",
        discharge_m3s=486.4,
    )
    assert hist["variable"] == "discharge"
    assert hist["value"] == 486.4
    assert hist["unit"] == "m3/s"

    with pytest.raises(ValueError):
        parser.parse_historical_record(
            glofas_point_id="GLOFAS-EU-SEINE-PARIS-042",
            river_segment_id="seg-seine-paris-204101",
            timestamp_iso="2026-09-27T00:00:00Z",
            discharge_m3s=-12.0,
        )

    ensemble_rows = parser.parse_ensemble_forecast_step(
        glofas_point_id="GLOFAS-EU-SEINE-PARIS-042",
        reference_time_iso="2026-09-28T00:00:00Z",
        forecast_time_iso="2026-09-29T00:00:00Z",
        ensemble_values=[450.0, 470.0, 490.0, 510.0, 540.0],
        control_value=488.0,
    )
    assert len(ensemble_rows) == 6
    members = {r["member"]: r["value"] for r in ensemble_rows}
    assert members["control"] == 488.0
    assert members["p10"] <= members["median"] <= members["p90"]


def test_spatial_mapping_glofas_and_hubeau(french_rivers_fixture: dict) -> None:
    seine_seg = french_rivers_fixture["seine_segment"]
    glofas_candidates = [
        {
            "id": "GLOFAS-EU-SEINE-PARIS-042",
            "latitude": 48.855,
            "longitude": 2.350,
            "upstream_area_km2": 43800.0,
            "basin_id": "basin-seine",
        },
        {
            "id": "GLOFAS-EU-FAR-AWAY",
            "latitude": 45.764,
            "longitude": 4.835,
            "upstream_area_km2": 50000.0,
            "basin_id": "basin-rhone",
        },
    ]
    mapping = map_river_segment_to_glofas(seine_seg, glofas_candidates)
    assert mapping is not None
    assert mapping["glofas_point_id"] == "GLOFAS-EU-SEINE-PARIS-042"
    assert mapping["confidence"] > 0.85

    station = {
        "id": "hubeau-st-03000100",
        "name": "La Seine à Paris [Pont d'Austerlitz]",
        "river_name": "La Seine",
        "latitude": 48.845,
        "longitude": 2.366,
    }
    st_mapping = map_station_to_river_segment(
        station,
        [
            french_rivers_fixture["seine_segment"],
            french_rivers_fixture["loire_segment"],
            french_rivers_fixture["rhone_segment"],
        ],
    )
    assert st_mapping is not None
    assert st_mapping["river_segment_id"] == "seg-seine-paris-204101"
    assert st_mapping["mapping_method"] == "POSTGIS_ST_DWITHIN_TOPONYM_MATCH"


def test_hubeau_normalization() -> None:
    st = HubEauTemperatureClient.normalize_station(
        {
            "code_station": "03174000",
            "libelle_station": "LA SEINE A PARIS 12E",
            "libelle_cours_eau": "La Seine",
            "latitude": 48.8442,
            "longitude": 2.3658,
        }
    )
    assert st["station_code"] == "03174000"
    assert st["source"] == "HUBEAU"

    meas = HubEauTemperatureClient.normalize_measurement(
        {
            "date_mesure_temp": "2026-09-28",
            "heure_mesure_temp": "08:00:00",
            "resultat": 16.4,
            "code_qualification": "1",
        },
        station_id=st["id"],
    )
    assert meas["temperature_c"] == 16.4


def test_river_service_search_and_proximity() -> None:
    svc = RiverService()
    seine_hits = svc.search_rivers("Seine")
    assert len(seine_hits) == 1
    assert seine_hits[0]["id"] == "river-seine"

    nearby_paris = svc.find_nearby(lat=48.8566, lon=2.3522, radius_km=15.0)
    assert len(nearby_paris) >= 1
    assert nearby_paris[0]["id"] == "river-seine"
