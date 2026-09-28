import React from 'react';
import { X, Shield, GitBranch, Database, Globe2, ExternalLink } from 'lucide-react';
import { DataSourceItem } from '../types/hydrology';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatExactDateTime } from '../utils/formatters';

interface AboutSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSources: DataSourceItem[];
}

export const AboutSourcesModal: React.FC<AboutSourcesModalProps> = ({
  isOpen,
  onClose,
  dataSources,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0D1626] border border-slate-800 rounded-xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070D17]/80">
          <div className="flex items-center gap-2.5">
            <Globe2 className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="font-display font-bold text-base text-slate-100">
              Architecture Google Cloud, Mapping Spatial &amp; Provenance des Données
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Pipeline Diagram */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#38BDF8] mb-2 flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5" />
              Principe d&apos;Isolation des Sources Scientifiques
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-200 py-2">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
                SOURCES (GloFAS EWDS / Hub&apos;Eau / HydroSHEDS)
              </span>
              <span className="text-[#38BDF8]">→</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
                INGESTION (Cloud Run Jobs)
              </span>
              <span className="text-[#38BDF8]">→</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
                VALIDATION &amp; MAPPING
              </span>
              <span className="text-[#38BDF8]">→</span>
              <span className="px-2.5 py-1 rounded bg-[#0EA5E9]/20 border border-[#0EA5E9]/50 text-[#38BDF8]">
                CLOUD SQL POSTGIS
              </span>
              <span className="text-[#38BDF8]">→</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
                FASTAPI (Cloud Run)
              </span>
              <span className="text-[#38BDF8]">→</span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                REACT + MAPLIBRE
              </span>
            </div>
            <p className="text-slate-400 mt-2">
              Aucune clé secrète n&apos;est exposée dans le navigateur. Les secrets PostgreSQL et
              Copernicus EWDS sont injectés via <strong>Google Secret Manager</strong>. Les rasters
              HydroSHEDS et archives NetCDF sont stockés dans <strong>Google Cloud Storage</strong>.
            </p>
          </div>

          {/* Spatial Mapping Methodology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
              <h3 className="font-mono font-semibold text-slate-100 mb-1.5 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#38BDF8]" />
                Mapping HydroRIVERS ↔ GloFAS (`map_river_segment_to_glofas`)
              </h3>
              <p className="text-slate-400">
                Associe chaque tronçon vectoriel <code className="text-slate-200">HydroRIVERS</code>{' '}
                au point de grille <code className="text-slate-200">GloFAS 0.05°</code> en combinant :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300 font-mono text-[11px]">
                <li>Proximité orthodromique ST_Distance (50%)</li>
                <li>Ratio de surface amont drainée UPLAND_SKM (40%)</li>
                <li>Cohérence de l&apos;ordre de Strahler &amp; bassin (10%)</li>
              </ul>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
              <h3 className="font-mono font-semibold text-slate-100 mb-1.5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10B981]" />
                Mapping HydroRIVERS ↔ Hub&apos;Eau (`map_station_to_river_segment`)
              </h3>
              <p className="text-slate-400">
                Rattache chaque station thermique française au tronçon HydroRIVERS correspondant sans
                jamais écraser l&apos;historique des mesures :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300 font-mono text-[11px]">
                <li>Index spatial GiST &amp; ST_DWithin (rayon ≤ 5 km)</li>
                <li>Concordance toponymique du cours d&apos;eau</li>
                <li>Conservation de `distance_m` et `mapping_method`</li>
              </ul>
            </div>
          </div>

          {/* Provenance & Licenses */}
          <div>
            <h3 className="font-mono uppercase tracking-wider text-slate-400 mb-3">
              Catalogue Officiel des Sources, Versions &amp; Licences
            </h3>
            <div className="space-y-2.5">
              {dataSources.map((ds) => (
                <div
                  key={ds.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#38BDF8]">{ds.code}</span>
                      <span className="font-semibold text-slate-100">{ds.name}</span>
                      <CategoryBadge category={ds.category} />
                    </div>
                    <p className="text-slate-400 text-[11px]">{ds.description}</p>
                    <div className="text-[11px] font-mono text-slate-500">
                      Version: {ds.version} • Licence: {ds.license} • Dernière sync:{' '}
                      {formatExactDateTime(ds.last_sync_at)}
                    </div>
                  </div>
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-[#38BDF8] hover:border-[#38BDF8] text-xs font-mono flex items-center gap-1.5"
                  >
                    Documentation officielle
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
