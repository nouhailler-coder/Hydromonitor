"""Exécuteur de tests Python autonome (stdlib unittest) vérifiant les modules backend, ingestion et moteur d'analyse."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

from app.services.river_service import RiverService
from ingestion.glofas.parser import GlofasParser
from ingestion.hydrorivers.importer import HydroRiversImporter
from ingestion.hydrobasins.importer import HydroBasinsImporter
from ingestion.mapping.spatial_mapper import (
    map_river_segment_to_glofas,
    map_station_to_river_segment,
)


class HydroMonitorTestSuite(unittest.TestCase):
    def test_glofas_parser_and_ensemble_quantiles(self) -> None:
        parser = GlofasParser()
        hist = parser.parse_historical_record(
            glofas_point_id="GLOFAS-EU-SEINE-PARIS-042",
            river_segment_id="seg-seine-paris-20410199",
            timestamp_iso="2026-09-28T00:00:00Z",
            discharge_m3s=425.0,
        )
        self.assertEqual(hist["value"], 425.0)
        self.assertEqual(hist["variable"], "discharge")

        fc = parser.parse_ensemble_forecast_step(
            glofas_point_id="GLOFAS-EU-SEINE-PARIS-042",
            reference_time_iso="2026-09-28T00:00:00Z",
            forecast_time_iso="2026-09-29T00:00:00Z",
            ensemble_values=[420.0, 460.0, 485.0, 510.0, 550.0],
            control_value=488.0,
        )
        self.assertEqual(len(fc), 6)

    def test_spatial_mapping_reproducibility(self) -> None:
        seine_segment = {
            "id": "seg-seine-paris-20410199",
            "name": "La Seine",
            "river_order": 7,
            "upstream_area_km2": 44320.0,
            "basin_id": "basin-seine",
            "coordinates": [[2.415, 48.818], [2.352, 48.856], [2.220, 48.890]],
        }
        glofas_pts = [
            {
                "id": "gp-seine-paris",
                "latitude": 48.855,
                "longitude": 2.350,
                "upstream_area_km2": 43980.0,
                "basin_id": "basin-seine",
            }
        ]
        m1 = map_river_segment_to_glofas(seine_segment, glofas_pts)
        m2 = map_river_segment_to_glofas(seine_segment, glofas_pts)
        self.assertIsNotNone(m1)
        self.assertEqual(m1["confidence"], m2["confidence"])
        self.assertGreater(m1["confidence"], 0.90)

        station = {
            "id": "hubeau-st-03174000",
            "river_name": "La Seine",
            "latitude": 48.8442,
            "longitude": 2.3658,
        }
        st_map = map_station_to_river_segment(station, [seine_segment])
        self.assertIsNotNone(st_map)
        self.assertEqual(st_map["mapping_method"], "POSTGIS_ST_DWITHIN_TOPONYM_MATCH")

    def test_river_service_and_hydrological_analysis_engine(self) -> None:
        svc = RiverService()
        seine = svc.search_rivers("Seine")
        self.assertEqual(len(seine), 1)
        self.assertEqual(seine[0]["id"], "river-seine")
        self.assertEqual(seine[0]["reference_label"], "SEINE — PARIS")

        analysis = svc.compute_hydrological_analysis("river-seine")
        self.assertEqual(analysis["reference_label"], "SEINE — PARIS")
        self.assertEqual(analysis["current_discharge_m3s"], 425.0)
        self.assertEqual(analysis["seasonal_mean_for_date_m3s"], 365.0)
        self.assertEqual(analysis["deviation_pct"], 16.4)
        self.assertEqual(analysis["historical_percentile"], 72)
        self.assertEqual(analysis["trend_label"], "↗ en hausse depuis 3 jours")

        nearby = svc.find_nearby(lat=48.8566, lon=2.3522, radius_km=20.0)
        self.assertGreaterEqual(len(nearby), 1)
        self.assertEqual(nearby[0]["id"], "river-seine")

    def test_hydrorivers_and_hydrobasins_importers(self) -> None:
        hr = HydroRiversImporter(gcs_bucket="test-bucket")
        seg = hr.transform_feature(
            {
                "HYRIV_ID": 20410199,
                "ORD_STRA": 7,
                "LENGTH_KM": 168.0,
                "DIST_UP_KM": 224.5,
                "DIST_DN_KM": 384.5,
                "UPLAND_SKM": 44320.0,
                "DIS_AV_CMS": 365.0,
            },
            river_id="river-seine",
            name="La Seine",
        )
        self.assertEqual(seg["hydro_rivers_id"], 20410199)

        hb = HydroBasinsImporter(gcs_bucket="test-bucket")
        basin = hb.transform_basin_feature(
            {"HYBAS_ID": 2040023010, "PFAF_ID": 2324, "UP_AREA": 78650.0}
        )
        self.assertEqual(basin["hydrobasins_id"], 2040023010)
        self.assertEqual(basin["level"], 4)


if __name__ == "__main__":
    unittest.main(verbosity=2)
