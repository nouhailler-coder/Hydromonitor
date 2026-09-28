/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Waves,
  MapPin,
  Database,
  Info,
  ShieldCheck,
  UserCheck,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import { hydroApi } from './api/hydroApi';
import {
  RiverDetail,
  RiverSearchItem,
  RiverSegment,
  BasinInfo,
  TemperatureStation,
  DischargePoint,
  ForecastStep,
  TemperaturePoint,
  DataSourceItem,
  IngestionStatusResponse,
} from './types/hydrology';
import { HydroMapCanvas } from './map/HydroMapCanvas';
import { RiverDossierPanel } from './components/RiverDossierPanel';
import { AdminModal } from './pages/AdminModal';
import { AboutSourcesModal } from './pages/AboutSourcesModal';
import { AuthModal } from './pages/AuthModal';
import { auth, onAuthStateChanged, User } from './auth/firebase';

export default function App() {
  // Primary hydrological state (defaults to La Seine MVP)
  const [riversList, setRiversList] = useState<RiverDetail[]>([]);
  const [selectedRiverId, setSelectedRiverId] = useState<string>('river-seine');
  const [selectedRiver, setSelectedRiver] = useState<RiverDetail | null>(null);
  const [basin, setBasin] = useState<BasinInfo | null>(null);
  const [segments, setSegments] = useState<RiverSegment[]>([]);
  const [stations, setStations] = useState<TemperatureStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Time series state
  const [dischargeDays, setDischargeDays] = useState<number>(30);
  const [dischargeHistory, setDischargeHistory] = useState<DischargePoint[]>([]);
  const [forecastSteps, setForecastSteps] = useState<ForecastStep[]>([]);
  const [temperatureHistory, setTemperatureHistory] = useState<TemperaturePoint[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RiverSearchItem[]>([]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [nearbyBanner, setNearbyBanner] = useState<string | null>(null);

  // Observability & Data Sources state
  const [dataSources, setDataSources] = useState<DataSourceItem[]>([]);
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatusResponse | null>(null);

  // Auth & Modal navigation state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [verifiedProfile, setVerifiedProfile] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'admin' | 'about' | 'auth' | null>(null);

  // Sync URL path for SPA routes (/rivers/:id, /admin, /about, /login)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/rivers/')) {
      const slug = path.replace('/rivers/', '').trim();
      if (slug) setSelectedRiverId(slug);
    } else if (path === '/admin') {
      setActiveModal('admin');
    } else if (path === '/about') {
      setActiveModal('about');
    } else if (path === '/login') {
      setActiveModal('auth');
    }
  }, []);

  // Listen to Firebase Auth state & verify token against FastAPI /api/me
  const verifyBackendToken = useCallback(async (user: User | null) => {
    if (!user) {
      setVerifiedProfile(null);
      return;
    }
    try {
      const profile = await hydroApi.getCurrentUserProfile();
      setVerifiedProfile(profile);
    } catch {
      setVerifiedProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      verifyBackendToken(user);
    });
    return () => unsub();
  }, [verifyBackendToken]);

  // Load global lists (rivers, data sources, ingestion status)
  const loadGlobalMetadata = useCallback(async () => {
    try {
      const [rivers, sources, ingStatus] = await Promise.all([
        hydroApi.listRivers(),
        hydroApi.getDataSources(),
        hydroApi.getIngestionStatus(),
      ]);
      setRiversList(rivers);
      setDataSources(sources);
      setIngestionStatus(ingStatus);
    } catch (err) {
      console.error('Error loading global hydrological metadata:', err);
    }
  }, []);

  useEffect(() => {
    loadGlobalMetadata();
  }, [loadGlobalMetadata]);

  // Load selected river full dossier (detail, basin, segments, stations, discharge, forecast, temperature)
  useEffect(() => {
    let cancelled = false;
    async function loadRiverDossier() {
      try {
        const [detail, basinData, segs, sts, disHist, fcSteps] = await Promise.all([
          hydroApi.getRiverDetail(selectedRiverId),
          hydroApi.getRiverBasin(selectedRiverId),
          hydroApi.getRiverSegments(selectedRiverId),
          hydroApi.getTemperatureStations(selectedRiverId),
          hydroApi.getDischargeHistory(selectedRiverId, dischargeDays),
          hydroApi.getRiverForecast(selectedRiverId, 10),
        ]);
        if (cancelled) return;

        setSelectedRiver(detail);
        setBasin(basinData);
        setSegments(segs);
        setStations(sts);
        setDischargeHistory(disHist);
        setForecastSteps(fcSteps);

        const defaultStationId = sts[0]?.id || null;
        setSelectedStationId(defaultStationId);

        const tempSeries = await hydroApi.getTemperatureHistory(
          selectedRiverId,
          defaultStationId || undefined,
          14
        );
        if (!cancelled) {
          setTemperatureHistory(tempSeries);
        }
      } catch (err) {
        console.error('Error loading river dossier:', err);
      }
    }
    loadRiverDossier();
    return () => {
      cancelled = true;
    };
  }, [selectedRiverId, dischargeDays]);

  // Reload temperature history when user switches station
  const handleSelectStation = async (stationId: string, riverIdFromMap?: string) => {
    if (riverIdFromMap && riverIdFromMap !== selectedRiverId) {
      setSelectedRiverId(riverIdFromMap);
    }
    setSelectedStationId(stationId);
    try {
      const targetRiver = riverIdFromMap || selectedRiverId;
      const tempSeries = await hydroApi.getTemperatureHistory(targetRiver, stationId, 14);
      setTemperatureHistory(tempSeries);
    } catch (err) {
      console.error('Error loading station temperature series:', err);
    }
  };

  // Search rivers via GET /api/rivers/search?q=...
  useEffect(() => {
    let active = true;
    hydroApi
      .searchRivers(searchQuery)
      .then((hits) => {
        if (active) setSearchResults(hits);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const handleSelectRiver = (riverId: string) => {
    setSelectedRiverId(riverId);
    setSearchFocused(false);
    setNearbyBanner(null);
    window.history.replaceState({}, '', `/rivers/${riverId}`);
  };

  // Nearby search (PostGIS ST_DWithin equivalent around Paris 48.8566, 2.3522)
  const handleNearbyParisSearch = async () => {
    try {
      const items = await hydroApi.getNearbyRivers(48.8566, 2.3522, 25);
      if (items.length > 0) {
        const nearest = items[0];
        setSelectedRiverId(nearest.id);
        setNearbyBanner(
          `Proximité PostGIS (48.85°N, 2.35°E, rayon 25 km) → ${nearest.name} détectée à ${nearest.distance_m} m`
        );
      }
    } catch (err) {
      console.error('Nearby search error:', err);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070D17] text-[#F0F6FC] overflow-hidden">
      {/* TOP SCIENTIFIC COMMAND BAR */}
      <header className="h-14 shrink-0 bg-[#0D1626]/95 border-b border-slate-800/90 px-4 flex items-center justify-between gap-4 z-30">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/15 border border-[#0EA5E9]/40 flex items-center justify-center text-[#38BDF8]">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-tight text-slate-50">
                HYDROMONITOR
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-[#38BDF8]">
                PostGIS • GloFAS v5 • Hub&apos;Eau
              </span>
            </div>
            <p className="hidden md:block text-[10px] font-mono text-slate-400">
              Observatoire Géospatial &amp; Hydrologique des Cours d&apos;Eau
            </p>
          </div>
        </div>

        {/* Search Input + Quick River Pills (Seine, Loire, Rhône) */}
        <div className="flex items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Rechercher un cours d’eau (ex: "Seine", "Loire", "Rhône")...'
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] transition"
            />

            {/* Search Dropdown Results */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-10 bg-[#0D1626] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                  <span>Résultats PostgreSQL / PostGIS (`GET /api/rivers/search`)</span>
                  <span>{searchResults.length} cours d&apos;eau</span>
                </div>
                {searchResults.map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    onMouseDown={() => {
                      setSearchQuery(hit.name);
                      handleSelectRiver(hit.id);
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-800/70 border-b border-slate-800/60 last:border-none flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-100">{hit.name}</span>
                        <span className="font-mono text-[10px] text-[#38BDF8]">
                          {hit.river_code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {hit.type} • {hit.basin}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs shrink-0">
                      <div className="text-[#38BDF8] font-semibold">
                        {hit.current_discharge_m3s} m³/s
                      </div>
                      <div className="text-[#10B981] text-[11px]">
                        {hit.current_temperature_c} °C
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick River Switchers */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            {riversList.map((r) => {
              const active = r.id === selectedRiverId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectRiver(r.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                    active
                      ? 'bg-[#0EA5E9] text-slate-950 font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.name.replace('La ', '').replace('Le ', '')}
                </button>
              );
            })}
          </div>

          {/* Proximity Search Button (GET /api/rivers/nearby) */}
          <button
            type="button"
            onClick={handleNearbyParisSearch}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-[#38BDF8]/60 text-xs font-mono text-slate-300 hover:text-[#38BDF8] transition shrink-0"
            title="Tester GET /api/rivers/nearby?lat=48.85&lon=2.35&radius_km=25"
          >
            <Navigation className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Autour de Paris</span>
          </button>
        </div>

        {/* Right Actions: Sources/Architecture, Admin Console, Firebase Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveModal('about')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition"
          >
            <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden md:inline">Sources &amp; Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('admin')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition"
          >
            <Database className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden md:inline">Admin &amp; Imports</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('auth')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              currentUser
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-[#0EA5E9]/15 border-[#0EA5E9]/40 text-[#38BDF8] hover:bg-[#0EA5E9]/25'
            }`}
          >
            {currentUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {currentUser.email || 'Connecté'}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Connexion Firebase</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Optional Nearby Spatial Query Notification Bar */}
      {nearbyBanner && (
        <div className="bg-[#0EA5E9]/15 border-b border-[#0EA5E9]/40 px-4 py-1.5 text-xs font-mono text-[#38BDF8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{nearbyBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setNearbyBanner(null)}
            className="text-[11px] underline hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE: MAPLIBRE GL CANVAS + RIVER DOSSIER INSPECTOR */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <div className="flex-1 h-[45vh] lg:h-full relative">
          <HydroMapCanvas
            selectedRiver={selectedRiver}
            selectedStationId={selectedStationId}
            onSelectRiver={handleSelectRiver}
            onSelectStation={handleSelectStation}
          />
        </div>

        {selectedRiver && (
          <RiverDossierPanel
            river={selectedRiver}
            basin={basin}
            segments={segments}
            stations={stations}
            selectedStationId={selectedStationId}
            onSelectStation={(stId) => handleSelectStation(stId)}
            dischargeHistory={dischargeHistory}
            dischargeDays={dischargeDays}
            onChangeDischargeDays={setDischargeDays}
            forecastSteps={forecastSteps}
            temperatureHistory={temperatureHistory}
            dataSources={dataSources}
          />
        )}
      </main>

      {/* MODALS FOR /admin, /about, /login */}
      <AdminModal
        isOpen={activeModal === 'admin'}
        onClose={() => setActiveModal(null)}
        ingestionStatus={ingestionStatus}
        dataSources={dataSources}
        currentUser={currentUser}
        onOpenAuth={() => setActiveModal('auth')}
        onRefreshData={loadGlobalMetadata}
      />

      <AboutSourcesModal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        dataSources={dataSources}
      />

      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser}
        verifiedProfile={verifiedProfile}
        onAuthChange={() => verifyBackendToken(auth.currentUser)}
      />
    </div>
  );
}
