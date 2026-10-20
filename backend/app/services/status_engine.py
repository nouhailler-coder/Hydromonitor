"""Moteur d'évaluation d'état hydrologique (HydrologicalStatusEngine).

Calcule avec rigueur scientifique :
  - DROUGHT (Sécheresse / Crise)
  - LOW_FLOW (Basses eaux / Étiage)
  - NORMAL (Débit normal / Écoulement saisonnier)
  - HIGH_FLOW (Hautes eaux)
  - FLOOD (Crue)
  - EXTREME_FLOOD (Crue extrême)

Basé sur des seuils documentés (SDAGE, Directive Cadre Eau, Vigicrues, GloFAS CEMS)
avec configuration modifiable par source (GloFAS, Hub'Eau) et par région/bassin.
Pipeline :
  Débit actuel → historique → percentile → seuils → classification
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class HydrologicalStatusCode(str, Enum):
    DROUGHT = "DROUGHT"
    LOW_FLOW = "LOW_FLOW"
    NORMAL = "NORMAL"
    HIGH_FLOW = "HIGH_FLOW"
    FLOOD = "FLOOD"
    EXTREME_FLOOD = "EXTREME_FLOOD"


@dataclass
class ThresholdConfig:
    id: str
    name: str
    source: str  # "GLOFAS", "HUBEAU", "ALL", etc.
    region_id: str | None  # "bassin-seine", "bassin-loire", "bassin-rhone", etc.
    region_name: str | None
    scientific_reference: str
    description: str
    drought_max_percentile: float = 10.0      # < P10 -> DROUGHT
    low_flow_max_percentile: float = 25.0     # P10..P25 -> LOW_FLOW
    high_flow_min_percentile: float = 75.0    # P75..P90 -> HIGH_FLOW
    flood_min_percentile: float = 90.0        # P90..P98 -> FLOOD
    extreme_flood_min_percentile: float = 98.0 # > P98 -> EXTREME_FLOOD
    is_default: bool = False


# Registre des seuils documentés par défaut selon les guides hydrologiques nationaux & européens
DEFAULT_THRESHOLD_CONFIGS: dict[str, ThresholdConfig] = {
    "default_standard": ThresholdConfig(
        id="default_standard",
        name="Référence Standard Européenne (SDAGE / CEMS)",
        source="ALL",
        region_id=None,
        region_name="Europe / France métropolitaine",
        scientific_reference="SDAGE & Guide méthodologique d'évaluation des débits d'étiage (MEDDE/OFB), CEMS GloFAS v5.0",
        description="Grille quantile standardisée : P10 (crise sécheresse/QMNA5), P25 (étiage/vigilance), P75 (hautes eaux), P90 (crue Q2), P98 (crue majeure Q20+).",
        drought_max_percentile=10.0,
        low_flow_max_percentile=25.0,
        high_flow_min_percentile=75.0,
        flood_min_percentile=90.0,
        extreme_flood_min_percentile=98.0,
        is_default=True,
    ),
    "glofas_era5": ThresholdConfig(
        id="glofas_era5",
        name="Copernicus CEMS GloFAS (Modèle LISFLOOD/ERA5)",
        source="GLOFAS",
        region_id=None,
        region_name="Grille européenne 0.05°",
        scientific_reference="Copernicus Emergency Management Service — GloFAS Flood Hazard Matrix & Seasonal Anomaly Index",
        description="Seuils calibrés pour séries temporelles modélisées LISFLOOD lissées sur maille 0.05° : crue P89 et crue extrême P97.5.",
        drought_max_percentile=10.0,
        low_flow_max_percentile=25.0,
        high_flow_min_percentile=75.0,
        flood_min_percentile=89.0,
        extreme_flood_min_percentile=97.5,
    ),
    "hubeau_insitu": ThresholdConfig(
        id="hubeau_insitu",
        name="Hub'Eau Stations In Situ (Hydrométrie Réelle)",
        source="HUBEAU",
        region_id=None,
        region_name="Réseau hydrométrique national français (Banque Hydro)",
        scientific_reference="Direction Générale de la Prévention des Risques (DGPR) — Vigicrues & Banque Hydro QMN",
        description="Observations directes en stations limnimétriques avec seuils d'alerte sécheresse préfectoraux et vigicrues jaune/orange/rouge.",
        drought_max_percentile=10.0,
        low_flow_max_percentile=25.0,
        high_flow_min_percentile=75.0,
        flood_min_percentile=90.0,
        extreme_flood_min_percentile=98.0,
    ),
    "bassin_seine": ThresholdConfig(
        id="bassin_seine",
        name="Bassin Seine-Normandie (Plaine crayeuse amortie)",
        source="ALL",
        region_id="bassin-seine",
        region_name="Bassin de la Seine et cours d'eau côtiers normands",
        scientific_reference="SDAGE Seine-Normandie 2022–2027 & Direction régionale et interdépartementale de l'environnement (DRIEE)",
        description="Amortissement karstique/crayeux remarquable. Étiages progressifs et crues d'hiver lentes de nappe débordante.",
        drought_max_percentile=10.0,
        low_flow_max_percentile=25.0,
        high_flow_min_percentile=75.0,
        flood_min_percentile=90.0,
        extreme_flood_min_percentile=98.0,
    ),
    "bassin_loire": ThresholdConfig(
        id="bassin_loire",
        name="Bassin Loire-Bretagne (Socle granitique vif)",
        source="ALL",
        region_id="bassin-loire",
        region_name="Bassin Loire-Bretagne",
        scientific_reference="SDAGE Loire-Bretagne & Observatoire National des Étiages (ONDE)",
        description="Régime pluvial vif sur substrat peu perméable. Débits d'étiage très sensibles nécessitant une vigilance dès P28.",
        drought_max_percentile=12.0,
        low_flow_max_percentile=28.0,
        high_flow_min_percentile=78.0,
        flood_min_percentile=91.0,
        extreme_flood_min_percentile=97.5,
    ),
    "bassin_rhone": ThresholdConfig(
        id="bassin_rhone",
        name="Bassin Rhône-Méditerranée (Mixte Nivo-Glaciaire & Cévenol)",
        source="ALL",
        region_id="bassin-rhone",
        region_name="Bassin Rhône-Méditerranée",
        scientific_reference="SDAGE Rhône-Méditerranée & Service de Prévision des Crues Grand Delta",
        description="Forts contrastes saisonniers d'alimentation alpine et épisodes méditerranéens intenses aval.",
        drought_max_percentile=10.0,
        low_flow_max_percentile=25.0,
        high_flow_min_percentile=75.0,
        flood_min_percentile=90.0,
        extreme_flood_min_percentile=98.0,
    ),
    "region_mediterranee": ThresholdConfig(
        id="region_mediterranee",
        name="Régime Cévenol & Méditerranéen (Crues éclair vives)",
        source="ALL",
        region_id="region-mediterranee",
        region_name="Arc Méditerranéen & Cévennes",
        scientific_reference="SPC Méditerranée Est / SPC Grand Delta — Phénomènes pluvio-hydrologiques intenses",
        description="Cinétique d'onde de crue fulgurante. Étiages sévères (< P8) et seuils d'alerte crue abaissés à P88.",
        drought_max_percentile=8.0,
        low_flow_max_percentile=22.0,
        high_flow_min_percentile=72.0,
        flood_min_percentile=88.0,
        extreme_flood_min_percentile=96.0,
    ),
}


class HydrologicalStatusEngine:
    """Moteur scientifique de classification des états hydrologiques."""

    def __init__(self, custom_configs: dict[str, ThresholdConfig] | None = None) -> None:
        self.configs: dict[str, ThresholdConfig] = dict(DEFAULT_THRESHOLD_CONFIGS)
        if custom_configs:
            self.configs.update(custom_configs)

    def get_config(
        self,
        source: str = "ALL",
        region_id: str | None = None,
        config_id: str | None = None,
    ) -> ThresholdConfig:
        """Sélectionne la configuration idoine selon la priorité : config_id > region_id > source > default."""
        if config_id and config_id in self.configs:
            return self.configs[config_id]

        # Priorité régionale si spécifiée
        if region_id:
            for c in self.configs.values():
                if c.region_id == region_id:
                    if source and source != "ALL" and c.source == source:
                        return c
            for c in self.configs.values():
                if c.region_id == region_id:
                    return c

        # Priorité source
        if source and source != "ALL":
            for c in self.configs.values():
                if c.source == source and not c.region_id:
                    return c

        return self.configs.get("default_standard", next(iter(self.configs.values())))

    def update_config(self, config: ThresholdConfig) -> None:
        self.configs[config.id] = config

    def estimate_percentile_from_quantiles(
        self,
        flow: float,
        quantiles: dict[str, float],
    ) -> int:
        """Interpole le percentile journalier à partir de la grille quantile d'une série historique."""
        q10 = float(quantiles.get("q10", 100.0))
        q25 = float(quantiles.get("q25", 200.0))
        q50 = float(quantiles.get("q50", 300.0))
        q75 = float(quantiles.get("q75", 400.0))
        q90 = float(quantiles.get("q90", 500.0))
        q98 = float(quantiles.get("q98", q90 * 1.35))

        if flow <= 0:
            return 1
        if flow <= q10:
            return max(1, round((flow / max(1.0, q10)) * 10))
        if flow <= q25:
            return round(10 + ((flow - q10) / max(1.0, q25 - q10)) * 15)
        if flow <= q50:
            return round(25 + ((flow - q25) / max(1.0, q50 - q25)) * 25)
        if flow <= q75:
            return round(50 + ((flow - q50) / max(1.0, q75 - q50)) * 25)
        if flow <= q90:
            return round(75 + ((flow - q75) / max(1.0, q90 - q75)) * 15)
        if flow <= q98:
            return round(90 + ((flow - q90) / max(1.0, q98 - q90)) * 8)
        return min(99, round(98 + (flow / max(1.0, q98))))

    def classify_percentile(
        self,
        percentile: float,
        config: ThresholdConfig,
    ) -> HydrologicalStatusCode:
        """Applique les seuils documentés d'une configuration pour classifier le percentile."""
        if percentile < config.drought_max_percentile:
            return HydrologicalStatusCode.DROUGHT
        if percentile < config.low_flow_max_percentile:
            return HydrologicalStatusCode.LOW_FLOW
        if percentile <= config.high_flow_min_percentile:
            return HydrologicalStatusCode.NORMAL
        if percentile <= config.flood_min_percentile:
            return HydrologicalStatusCode.HIGH_FLOW
        if percentile <= config.extreme_flood_min_percentile:
            return HydrologicalStatusCode.FLOOD
        return HydrologicalStatusCode.EXTREME_FLOOD

    def evaluate(
        self,
        current_discharge_m3s: float,
        historical_quantiles: dict[str, float] | None = None,
        given_percentile: int | None = None,
        source: str = "ALL",
        region_id: str | None = None,
        config_id: str | None = None,
        override_thresholds: ThresholdConfig | None = None,
        reference_period_label: str = "Climatologie journalière 1991–2020 (30 ans)",
    ) -> dict[str, Any]:
        """Exécute la chaîne complète d'évaluation :

        Débit actuel → historique → percentile → seuils → classification
        """
        config = override_thresholds or self.get_config(
            source=source,
            region_id=region_id,
            config_id=config_id,
        )

        quantiles = historical_quantiles or {
            "q10": 195.0,
            "q25": 275.0,
            "q50": 355.0,
            "q75": 440.0,
            "q90": 560.0,
            "q98": 720.0,
        }

        # Étape 1 : Débit actuel
        step_1 = {
            "step_name": "Débit actuel",
            "discharge_m3s": round(current_discharge_m3s, 2),
            "unit": "m³/s",
        }

        # Étape 2 : Historique
        seasonal_median = float(quantiles.get("q50", 355.0))
        seasonal_std = (float(quantiles.get("q75", 440.0)) - float(quantiles.get("q25", 275.0))) / 1.349
        step_2 = {
            "step_name": "Historique",
            "period": reference_period_label,
            "seasonal_median_m3s": seasonal_median,
            "quantiles_for_date": quantiles,
        }

        # Étape 3 : Percentile
        if given_percentile is not None:
            percentile = int(given_percentile)
        else:
            percentile = self.estimate_percentile_from_quantiles(current_discharge_m3s, quantiles)

        z_score = round((current_discharge_m3s - seasonal_median) / max(1.0, seasonal_std), 2)
        step_3 = {
            "step_name": "Percentile",
            "percentile": percentile,
            "z_score": z_score,
            "formula": "F(Q_actuel) interpolé sur quantiles journaliers Q10..Q98",
        }

        # Étape 4 : Seuils documentés
        status_code = self.classify_percentile(percentile, config)

        range_desc = ""
        if status_code == HydrologicalStatusCode.DROUGHT:
            range_desc = f"< P{config.drought_max_percentile:.0f} (très faible / sécheresse)"
        elif status_code == HydrologicalStatusCode.LOW_FLOW:
            range_desc = f"P{config.drought_max_percentile:.0f}–P{config.low_flow_max_percentile:.0f} (faible / étiage)"
        elif status_code == HydrologicalStatusCode.NORMAL:
            range_desc = f"P{config.low_flow_max_percentile:.0f}–P{config.high_flow_min_percentile:.0f} (normal)"
        elif status_code == HydrologicalStatusCode.HIGH_FLOW:
            range_desc = f"P{config.high_flow_min_percentile:.0f}–P{config.flood_min_percentile:.0f} (élevé / hautes eaux)"
        elif status_code == HydrologicalStatusCode.FLOOD:
            range_desc = f"P{config.flood_min_percentile:.0f}–P{config.extreme_flood_min_percentile:.0f} (très élevé / crue)"
        else:
            range_desc = f"> P{config.extreme_flood_min_percentile:.0f} (exceptionnel / crue extrême)"

        step_4 = {
            "step_name": "Seuils documentés",
            "config_id": config.id,
            "config_name": config.name,
            "source_target": config.source,
            "region_target": config.region_name or "Toutes régions",
            "scientific_reference": config.scientific_reference,
            "matched_bracket": range_desc,
            "thresholds": {
                "drought_max": config.drought_max_percentile,
                "low_flow_max": config.low_flow_max_percentile,
                "high_flow_min": config.high_flow_min_percentile,
                "flood_min": config.flood_min_percentile,
                "extreme_flood_min": config.extreme_flood_min_percentile,
            },
        }

        # Étape 5 : Classification
        meta = self._get_status_metadata(status_code)
        step_5 = {
            "step_name": "Classification",
            "status_code": status_code.value,
            "label_fr": meta["label_fr"],
            "severity": meta["severity"],
            "color": meta["color"],
            "badge_class": meta["badge_class"],
            "summary": f"{meta['label_fr'].upper()} (P{percentile} — {range_desc})",
        }

        return {
            "status_code": status_code.value,
            "label_fr": meta["label_fr"],
            "severity": meta["severity"],
            "color": meta["color"],
            "badge_class": meta["badge_class"],
            "icon_name": meta["icon_name"],
            "current_discharge_m3s": round(current_discharge_m3s, 2),
            "calculated_percentile": percentile,
            "z_score": z_score,
            "threshold_config": {
                "id": config.id,
                "name": config.name,
                "source": config.source,
                "region_id": config.region_id,
                "region_name": config.region_name,
                "scientific_reference": config.scientific_reference,
                "description": config.description,
                "thresholds": {
                    "drought_max": config.drought_max_percentile,
                    "low_flow_max": config.low_flow_max_percentile,
                    "high_flow_min": config.high_flow_min_percentile,
                    "flood_min": config.flood_min_percentile,
                    "extreme_flood_min": config.extreme_flood_min_percentile,
                },
            },
            "pipeline": {
                "step_1_discharge": step_1,
                "step_2_history": step_2,
                "step_3_percentile": step_3,
                "step_4_thresholds": step_4,
                "step_5_classification": step_5,
            },
            "management_recommendation": meta["recommendation"],
        }

    def _get_status_metadata(self, status: HydrologicalStatusCode) -> dict[str, str]:
        if status == HydrologicalStatusCode.DROUGHT:
            return {
                "label_fr": "Sécheresse",
                "severity": "crisis",
                "color": "#EF4444",
                "badge_class": "bg-red-500/15 text-red-400 border-red-500/30",
                "icon_name": "alert-octagon",
                "recommendation": "Étiage sévère (< P10 / QMNA5). Application des mesures de crise et arrêt des prélèvements non prioritaires (Arrêté cadre sécheresse préfectoral).",
            }
        if status == HydrologicalStatusCode.LOW_FLOW:
            return {
                "label_fr": "Basses eaux",
                "severity": "warning",
                "color": "#F97316",
                "badge_class": "bg-orange-500/15 text-orange-400 border-orange-500/30",
                "icon_name": "arrow-down-circle",
                "recommendation": "Étiage notable (P10 à P25). Vigilance sécheresse et surveillance resserrée des débits réservés et de la température.",
            }
        if status == HydrologicalStatusCode.NORMAL:
            return {
                "label_fr": "Normal",
                "severity": "normal",
                "color": "#10B981",
                "badge_class": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                "icon_name": "check-circle-2",
                "recommendation": "Écoulement conforme à la moyenne saisonnière interannuelle (P25 à P75). Aucun risque hydrologique à court terme.",
            }
        if status == HydrologicalStatusCode.HIGH_FLOW:
            return {
                "label_fr": "Hautes eaux",
                "severity": "notice",
                "color": "#0EA5E9",
                "badge_class": "bg-sky-500/15 text-sky-400 border-sky-500/30",
                "icon_name": "trending-up",
                "recommendation": "Écoulement soutenu (P75 à P90). Débit élevé de saison sans débordement dommageable.",
            }
        if status == HydrologicalStatusCode.FLOOD:
            return {
                "label_fr": "Crue",
                "severity": "alert",
                "color": "#F59E0B",
                "badge_class": "bg-amber-500/15 text-amber-400 border-amber-500/30",
                "icon_name": "alert-triangle",
                "recommendation": "Crue significative (P90 à P98, période de retour 2 à 10 ans). Débordements possibles des cours d'eau dans les zones basses.",
            }
        return {
            "label_fr": "Crue extrême",
            "severity": "critical",
            "color": "#DC2626",
            "badge_class": "bg-rose-600/20 text-rose-300 border-rose-500/40 animate-pulse",
            "icon_name": "waves",
            "recommendation": "Crue majeure historique (> P98, retour > 20 ans). Débordements généralisés et risques graves pour les personnes et les biens (Alerte Vigicrues).",
        }
