import React, { useState } from 'react';
import {
  X,
  Database,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Clock,
  Lock,
  GitMerge,
  Cpu,
} from 'lucide-react';
import { DataSourceItem, IngestionStatusResponse } from '../types/hydrology';
import { hydroApi } from '../api/hydroApi';
import { formatExactDateTime, formatRelativeFreshness } from '../utils/formatters';
import { User } from '../auth/firebase';
import { ScientificMappingModule } from '../components/ScientificMappingModule';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingestionStatus: IngestionStatusResponse | null;
  dataSources: DataSourceItem[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onRefreshData: () => Promise<void>;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  ingestionStatus,
  dataSources,
  currentUser,
  onOpenAuth,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'mapping' | 'jobs' | 'observability'>('mapping');
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleTriggerJob = async (jobName: string) => {
    if (!currentUser) {
      setFeedback({
        type: 'error',
        message:
          'Authentification Firebase requise. Connectez-vous pour déclencher un Cloud Run Job.',
      });
      return;
    }

    setRunningJob(jobName);
    setFeedback(null);
    try {
      const res = await hydroApi.triggerIngestionJob(jobName);
      await onRefreshData();
      setFeedback({
        type: 'success',
        message: `Job idempotent "${jobName}" exécuté avec succès (${res.run.records_inserted} insérés, ${res.run.records_updated} mis à jour en ${res.run.duration_seconds}s).`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Échec du déclenchement du job.',
      });
    } finally {
      setRunningJob(null);
    }
  };

  const health = ingestionStatus?.database_health;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0D1626] border border-slate-800 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070D17]/80">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <h2 className="font-display font-bold text-base text-slate-100">
                Console d&apos;Administration — HydroMonitor Core
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Module de rapprochement scientifique (`river_data_mapping`), Cloud Run Jobs et observabilité PostGIS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('mapping')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'mapping'
                ? 'border-[#0EA5E9] text-[#38BDF8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Rapprochement Scientifique (`river_data_mapping`)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'border-[#0EA5E9] text-[#38BDF8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Jobs Cloud Run &amp; Imports</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('observability')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'observability'
                ? 'border-[#0EA5E9] text-[#38BDF8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Observabilité PostGIS &amp; Sources</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: SCIENTIFIC MAPPING MODULE (RIVER_DATA_MAPPING) */}
          {activeTab === 'mapping' && (
            <ScientificMappingModule onRefreshGlobalData={onRefreshData} />
          )}

          {/* TAB 2: CLOUD RUN JOBS & IMPORTS */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              {/* Auth Warning Banner if unauthenticated */}
              {!currentUser && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Mode lecture seule : l&apos;exécution manuelle d&apos;un Cloud Run Job nécessite un
                      Firebase ID Token valide (<code className="font-mono">POST /api/admin/ingestion/trigger</code>).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition"
                  >
                    Se connecter via Firebase
                  </button>
                </div>
              )}

              {feedback && (
                <div
                  className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Cloud Run Jobs Triggers */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Jobs Cloud Run Idempotents &amp; Planification Cloud Scheduler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(ingestionStatus?.cloud_run_jobs || []).map((job) => {
                    const isRunning = runningJob === job.name;
                    return (
                      <div
                        key={job.name}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold text-slate-100 truncate">
                            {job.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {job.schedule}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={() => handleTriggerJob(job.name)}
                          className="shrink-0 px-2.5 py-1.5 rounded bg-[#0EA5E9]/15 border border-[#0EA5E9]/40 text-[#38BDF8] hover:bg-[#0EA5E9]/25 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          {isRunning ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          Lancer
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ingestion Runs Observability Table */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                  Journal d&apos;Observabilité des Imports (`TABLE ingestion_runs`)
                </h3>
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px]">
                        <th className="py-2.5 px-3">Job Cloud Run</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Statut</th>
                        <th className="py-2.5 px-3">Début</th>
                        <th className="py-2.5 px-3">Durée</th>
                        <th className="py-2.5 px-3 text-right">Traités</th>
                        <th className="py-2.5 px-3 text-right">Insérés</th>
                        <th className="py-2.5 px-3 text-right">Mis à jour</th>
                        <th className="py-2.5 px-3 text-right">Rejetés</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {(ingestionStatus?.runs || []).map((run) => (
                        <tr key={run.id} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 text-slate-200 font-semibold">{run.job_name}</td>
                          <td className="py-2 px-3 text-[#38BDF8]">{run.source}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                              {run.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-400">
                            {formatRelativeFreshness(run.started_at)}
                          </td>
                          <td className="py-2 px-3 text-slate-300">{run.duration_seconds}s</td>
                          <td className="py-2 px-3 text-right text-slate-300">
                            {run.records_processed.toLocaleString('fr-FR')}
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-400">
                            +{run.records_inserted.toLocaleString('fr-FR')}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300">
                            {run.records_updated.toLocaleString('fr-FR')}
                          </td>
                          <td className="py-2 px-3 text-right text-amber-400">
                            {run.records_rejected}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OBSERVABILITÉ POSTGIS & SOURCES */}
          {activeTab === 'observability' && (
            <div className="space-y-6">
              {/* Database & PostGIS Health Metrics */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
                  État de la Base PostgreSQL 16 / PostGIS 3.4 (Index GiST &amp; Temporels)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Statut PostGIS</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {health?.status || 'HEALTHY'}
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Tables Alembic</div>
                    <div className="text-base font-mono font-bold text-slate-100 mt-1">
                      {health?.tables_count ?? 15}
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Cours d&apos;eau</div>
                    <div className="text-base font-mono font-bold text-[#38BDF8] mt-1">
                      {health?.rivers_count ?? 3}
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Tronçons HydroRIVERS
                    </div>
                    <div className="text-base font-mono font-bold text-slate-100 mt-1">
                      {health?.segments_count ?? 6}
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Stations Hub&apos;Eau
                    </div>
                    <div className="text-base font-mono font-bold text-[#10B981] mt-1">
                      {health?.stations_count ?? 10}
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Mesures Stockées
                    </div>
                    <div className="text-base font-mono font-bold text-slate-100 mt-1">
                      {(health?.measurements_count ?? 612350).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Sources Status */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                  Statut des Sources Scientifiques (`TABLE data_sources`)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataSources.map((ds) => (
                    <div
                      key={ds.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#38BDF8]">{ds.code}</span>
                          <span className="text-[11px] font-mono text-emerald-400">
                            {formatRelativeFreshness(ds.last_sync_at)}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-100 mt-1">{ds.name}</div>
                        <p className="text-[11px] text-slate-400 mt-1">{ds.description}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                        <span>Licence: {ds.license}</span>
                        <span>Sync: {formatExactDateTime(ds.last_sync_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
