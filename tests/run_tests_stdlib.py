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
    generate_river_data_mapping_table,
)
from app.services.status_engine import (
    HydrologicalStatusEngine,
    HydrologicalStatusCode,
    ThresholdConfig,
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
        self.assertGreater(m1["confidence_score"], 0.90)
        self.assertTrue(m1["basin_match"])
        self.assertTrue(m1["river_order_match"])
        self.assertTrue(m1["direction_match"])
        self.assertGreater(m1["upstream_area_ratio"], 0.90)
        self.assertEqual(m1["mapping_version"], "v2.4-multicriteria-scientific")

        station = {
            "id": "hubeau-st-03174000",
            "river_name": "La Seine",
            "latitude": 48.8442,
            "longitude": 2.3658,
        }
        st_map = map_station_to_river_segment(station, [seine_segment])
        self.assertIsNotNone(st_map)
        self.assertEqual(st_map["mapping_method"], "POSTGIS_ST_DWITHIN_TOPONYM_MATCH")
        self.assertTrue(st_map["basin_match"])

        table = generate_river_data_mapping_table([seine_segment], glofas_pts, [station])
        self.assertEqual(len(table), 2)
        self.assertTrue(all(row["confidence_score"] > 0.80 for row in table))

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
        self.assertEqual(analysis["percentile"], 72)
        self.assertGreater(analysis["z_score"], 0.45)
        self.assertEqual(analysis["deviation_to_seasonal_mean_pct"], 16.4)
        self.assertEqual(analysis["deviation_to_seasonal_mean_m3s"], 60.0)
        self.assertEqual(analysis["deviation_to_seasonal_median_m3s"], 70.0)
        self.assertEqual(analysis["level_label"], "normal")
        self.assertEqual(analysis["trend_label"], "↗ en hausse depuis 3 jours")
        self.assertIn("january", analysis["seasonal_sensitivity"])
        self.assertIn("august", analysis["seasonal_sensitivity"])
        self.assertEqual(analysis["seasonal_sensitivity"]["august"]["percentile"], 98)
        self.assertEqual(analysis["seasonal_sensitivity"]["january"]["percentile"], 22)

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

    def test_hydrological_status_engine_pipeline_and_threshold_configs(self) -> None:
        engine = HydrologicalStatusEngine()
        quantiles = {
            "q10": 195.0,
            "q25": 275.0,
            "q50": 355.0,
            "q75": 440.0,
            "q90": 560.0,
            "q98": 720.0,
        }

        # 1. Pipeline verification: Débit actuel → historique → percentile → seuils → classification
        eval_res = engine.evaluate(current_discharge_m3s=425.0, historical_quantiles=quantiles)
        pipeline = eval_res["pipeline"]
        self.assertEqual(pipeline["step_1_discharge"]["discharge_m3s"], 425.0)
        self.assertEqual(pipeline["step_2_history"]["seasonal_median_m3s"], 355.0)
        self.assertIn("percentile", pipeline["step_3_percentile"])
        self.assertIn("step_4_thresholds", pipeline)
        self.assertEqual(eval_res["status_code"], HydrologicalStatusCode.NORMAL.value)
        self.assertEqual(eval_res["label_fr"], "Normal")

        # 2. Testing all 6 categories on documented thresholds (<P10, P10-P25, P25-P75, P75-P90, P90-P98, >P98)
        # Drought (< P10)
        drought = engine.evaluate(current_discharge_m3s=150.0, historical_quantiles=quantiles)
        self.assertEqual(drought["status_code"], HydrologicalStatusCode.DROUGHT.value)
        self.assertEqual(drought["label_fr"], "Sécheresse")
        self.assertEqual(drought["severity"], "crisis")

        # Low flow (P10 - P25)
        low_flow = engine.evaluate(current_discharge_m3s=230.0, historical_quantiles=quantiles)
        self.assertEqual(low_flow["status_code"], HydrologicalStatusCode.LOW_FLOW.value)
        self.assertEqual(low_flow["label_fr"], "Basses eaux")

        # Normal (P25 - P75)
        normal = engine.evaluate(current_discharge_m3s=360.0, historical_quantiles=quantiles)
        self.assertEqual(normal["status_code"], HydrologicalStatusCode.NORMAL.value)
        self.assertEqual(normal["label_fr"], "Normal")

        # High flow (P75 - P90)
        high_flow = engine.evaluate(current_discharge_m3s=490.0, historical_quantiles=quantiles)
        self.assertEqual(high_flow["status_code"], HydrologicalStatusCode.HIGH_FLOW.value)
        self.assertEqual(high_flow["label_fr"], "Hautes eaux")

        # Flood (P90 - P98)
        flood = engine.evaluate(current_discharge_m3s=620.0, historical_quantiles=quantiles)
        self.assertEqual(flood["status_code"], HydrologicalStatusCode.FLOOD.value)
        self.assertEqual(flood["label_fr"], "Crue")

        # Extreme Flood (> P98)
        extreme_flood = engine.evaluate(current_discharge_m3s=850.0, historical_quantiles=quantiles)
        self.assertEqual(extreme_flood["status_code"], HydrologicalStatusCode.EXTREME_FLOOD.value)
        self.assertEqual(extreme_flood["label_fr"], "Crue extrême")

        # 3. Modifiable thresholds by source and region
        cfg_glofas = engine.get_config(source="GLOFAS")
        self.assertEqual(cfg_glofas.source, "GLOFAS")
        self.assertEqual(cfg_glofas.flood_min_percentile, 89.0)

        cfg_med = engine.get_config(region_id="region-mediterranee")
        self.assertEqual(cfg_med.flood_min_percentile, 88.0)
        self.assertEqual(cfg_med.drought_max_percentile, 8.0)

        # Custom threshold modification test
        custom_cfg = ThresholdConfig(
            id="custom_test_zone",
            name="Zone Expérimentale",
            source="HUBEAU",
            region_id="zone-speciale",
            region_name="Zone Spéciale",
            scientific_reference="Test Documenté",
            description="Configuration personnalisée",
            drought_max_percentile=15.0,  # < P15 = sécheresse
            low_flow_max_percentile=30.0,
            high_flow_min_percentile=70.0,
            flood_min_percentile=85.0,
            extreme_flood_min_percentile=95.0,
        )
        engine.update_config(custom_cfg)
        cfg_retrieved = engine.get_config(region_id="zone-speciale")
        self.assertEqual(cfg_retrieved.drought_max_percentile, 15.0)

        # Under standard config, percentile 12 is LOW_FLOW. Under custom_cfg, percentile 12 is DROUGHT!
        std_p12 = engine.classify_percentile(12.0, engine.get_config(config_id="default_standard"))
        custom_p12 = engine.classify_percentile(12.0, cfg_retrieved)
        self.assertEqual(std_p12, HydrologicalStatusCode.LOW_FLOW)
        self.assertEqual(custom_p12, HydrologicalStatusCode.DROUGHT)


if __name__ == "__main__":
    unittest.main(verbosity=2)
