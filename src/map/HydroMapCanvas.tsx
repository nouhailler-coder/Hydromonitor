import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Compass, Maximize2, Eye, EyeOff, MapPin } from 'lucide-react';
import { hydroApi } from '../api/hydroApi';
import { RiverDetail, TemperatureStation } from '../types/hydrology';

interface HydroMapCanvasProps {
  selectedRiver: RiverDetail | null;
  selectedStationId: string | null;
  onSelectRiver: (riverId: string) => void;
  onSelectStation: (stationId: string, riverId?: string) => void;
}

export const HydroMapCanvas: React.FC<HydroMapCanvasProps> = ({
  selectedRiver,
  selectedStationId,
  onSelectRiver,
  onSelectStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [zoomLevel, setZoomLevel] = useState<number>(5.6);
  const [cursorCoords, setCursorCoords] = useState<[number, number]>([2.3522, 48.8566]);
  const [generalizationMode, setGeneralizationMode] = useState<string>('SIMPLIFIED_MAIN_RIVERS');
  const [layersVisible, setLayersVisible] = useState({
    basins: true,
    rivers: true,
    segments: true,
    hubeauStations: true,
    glofasPoints: true,
  });
  const [stationsFeatures, setStationsFeatures] = useState<any[]>([]);

  // Load GeoJSON layers from API
  const refreshMapData = async (map: maplibregl.Map, currentZoom: number) => {
    try {
      const [riversGeo, stationsGeo] = await Promise.all([
        hydroApi.getMapRivers(currentZoom),
        hydroApi.getMapStations(),
      ]);

      setGeneralizationMode(riversGeo.generalization || 'SIMPLIFIED_MAIN_RIVERS');
      setStationsFeatures(stationsGeo.features || []);

      const basinsSource = map.getSource('hydrobasins-source') as maplibregl.GeoJSONSource;
      if (basinsSource && riversGeo.basins) {
        basinsSource.setData(riversGeo.basins);
      }

      const riversSource = map.getSource('hydrorivers-source') as maplibregl.GeoJSONSource;
      if (riversSource) {
        riversSource.setData({
          type: 'FeatureCollection',
          features: riversGeo.features || [],
        });
      }
    } catch (err) {
      console.error('Map data fetch error:', err);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [2.45, 47.15],
      zoom: 5.6,
      minZoom: 4,
      maxZoom: 14,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('mousemove', (e) => {
      setCursorCoords([
        Number(e.lngLat.lng.toFixed(4)),
        Number(e.lngLat.lat.toFixed(4)),
      ]);
    });

    map.on('zoomend', () => {
      const z = Number(map.getZoom().toFixed(2));
      setZoomLevel(z);
      refreshMapData(map, z);
    });

    map.on('load', async () => {
      map.addSource('hydrobasins-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('hydrorivers-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // 1. HydroBASINS Polygon Fill
      map.addLayer({
        id: 'hydrobasins-fill',
        type: 'fill',
        source: 'hydrobasins-source',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'river_id'], selectedRiver?.id || 'river-seine'],
            '#0EA5E9',
            '#1E293B',
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'river_id'], selectedRiver?.id || 'river-seine'],
            0.16,
            0.06,
          ],
        },
      });

      // 2. HydroBASINS Polygon Boundary
      map.addLayer({
        id: 'hydrobasins-outline',
        type: 'line',
        source: 'hydrobasins-source',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'river_id'], selectedRiver?.id || 'river-seine'],
            '#38BDF8',
            '#475569',
          ],
          'line-width': [
            'case',
            ['==', ['get', 'river_id'], selectedRiver?.id || 'river-seine'],
            2,
            1,
          ],
          'line-dasharray': [3, 2],
        },
      });

      // 3. River Glow Halo
      map.addLayer({
        id: 'hydrorivers-glow',
        type: 'line',
        source: 'hydrorivers-source',
        filter: ['==', ['get', 'feature_type'], 'MAIN_RIVER'],
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'id'], selectedRiver?.id || 'river-seine'],
            '#38BDF8',
            '#0284C7',
          ],
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedRiver?.id || 'river-seine'],
            11,
            6,
          ],
          'line-opacity': [
            'case',
            ['==', ['get', 'id'], selectedRiver?.id || 'river-seine'],
            0.32,
            0.12,
          ],
          'line-blur': 4,
        },
      });

      // 4. Main Rivers Line
      map.addLayer({
        id: 'hydrorivers-main',
        type: 'line',
        source: 'hydrorivers-source',
        filter: ['==', ['get', 'feature_type'], 'MAIN_RIVER'],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'id'], selectedRiver?.id || 'river-seine'],
            '#38BDF8',
            '#0EA5E9',
          ],
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedRiver?.id || 'river-seine'],
            4.2,
            2.6,
          ],
        },
      });

      // 5. Detailed HydroRIVERS Segments (visible at high zoom >= 6.5)
      map.addLayer({
        id: 'hydrorivers-segments',
        type: 'line',
        source: 'hydrorivers-source',
        filter: ['==', ['get', 'feature_type'], 'HYDRORIVERS_SEGMENT'],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#7DD3FC',
          'line-width': 2.5,
          'line-dasharray': [1, 1.5],
        },
      });

      // Click handlers on river lines and basins
      map.on('click', 'hydrorivers-main', (e) => {
        const feat = e.features?.[0];
        if (feat?.properties?.id) {
          onSelectRiver(String(feat.properties.id));
        }
      });

      map.on('click', 'hydrobasins-fill', (e) => {
        const feat = e.features?.[0];
        if (feat?.properties?.river_id) {
          onSelectRiver(String(feat.properties.river_id));
        }
      });

      map.on('mouseenter', 'hydrorivers-main', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'hydrorivers-main', () => {
        map.getCanvas().style.cursor = '';
      });

      await refreshMapData(map, map.getZoom());
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update active river styling & flyTo when selectedRiver changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedRiver) return;

    if (map.isStyleLoaded()) {
      if (map.getLayer('hydrobasins-fill')) {
        map.setPaintProperty('hydrobasins-fill', 'fill-color', [
          'case',
          ['==', ['get', 'river_id'], selectedRiver.id],
          '#0EA5E9',
          '#1E293B',
        ]);
        map.setPaintProperty('hydrobasins-fill', 'fill-opacity', [
          'case',
          ['==', ['get', 'river_id'], selectedRiver.id],
          0.16,
          0.05,
        ]);
      }
      if (map.getLayer('hydrobasins-outline')) {
        map.setPaintProperty('hydrobasins-outline', 'line-color', [
          'case',
          ['==', ['get', 'river_id'], selectedRiver.id],
          '#38BDF8',
          '#475569',
        ]);
        map.setPaintProperty('hydrobasins-outline', 'line-width', [
          'case',
          ['==', ['get', 'river_id'], selectedRiver.id],
          2.2,
          1,
        ]);
      }
      if (map.getLayer('hydrorivers-main')) {
        map.setPaintProperty('hydrorivers-main', 'line-color', [
          'case',
          ['==', ['get', 'id'], selectedRiver.id],
          '#38BDF8',
          '#0284C7',
        ]);
        map.setPaintProperty('hydrorivers-main', 'line-width', [
          'case',
          ['==', ['get', 'id'], selectedRiver.id],
          4.5,
          2.4,
        ]);
      }
      if (map.getLayer('hydrorivers-glow')) {
        map.setPaintProperty('hydrorivers-glow', 'line-opacity', [
          'case',
          ['==', ['get', 'id'], selectedRiver.id],
          0.38,
          0.1,
        ]);
      }
    }

    if (selectedRiver.bbox) {
      const [minLon, minLat, maxLon, maxLat] = selectedRiver.bbox;
      map.fitBounds(
        [
          [minLon, minLat],
          [maxLon, maxLat],
        ],
        { padding: { top: 70, bottom: 70, left: 70, right: 70 }, duration: 1100 }
      );
    }
  }, [selectedRiver?.id]);

  // Toggle vector layer visibilities
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const setVis = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVis('hydrobasins-fill', layersVisible.basins);
    setVis('hydrobasins-outline', layersVisible.basins);
    setVis('hydrorivers-main', layersVisible.rivers);
    setVis('hydrorivers-glow', layersVisible.rivers);
    setVis('hydrorivers-segments', layersVisible.segments);
  }, [layersVisible]);

  // Render HTML markers for Hub'Eau stations & GloFAS points
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stationsFeatures.forEach((feat) => {
      const props = feat.properties || {};
      const coords = feat.geometry?.coordinates;
      if (!coords || coords.length < 2) return;

      const isHubEau = props.point_type === 'HUBEAU_STATION';
      if (isHubEau && !layersVisible.hubeauStations) return;
      if (!isHubEau && !layersVisible.glofasPoints) return;

      const isSelectedStation = isHubEau && props.id === selectedStationId;
      const isSelectedRiverFeature = props.river_id === selectedRiver?.id;

      const el = document.createElement('button');
      el.type = 'button';

      if (isHubEau) {
        el.className = `group relative flex items-center justify-center transition-transform ${
          isSelectedStation ? 'scale-125 z-30' : 'hover:scale-110 z-20'
        }`;
        el.innerHTML = `
          <span class="px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border shadow-lg flex items-center gap-1 ${
            isSelectedStation
              ? 'bg-[#10B981] text-[#052E16] border-white'
              : isSelectedRiverFeature
              ? 'bg-[#0D1626]/95 text-[#34D399] border-[#10B981]/70'
              : 'bg-[#0D1626]/80 text-[#94A3B8] border-slate-700'
          }">
            <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            ${Number(props.latest_temperature_c).toFixed(1)}°C
          </span>
        `;
        el.title = `${props.name} (Hub'Eau #${props.station_code}) — ${props.latest_temperature_c} °C`;
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          onSelectStation(String(props.id), String(props.river_id));
        });
      } else {
        // GloFAS Grid Point marker (diamond)
        el.className = 'z-10 hover:scale-125 transition-transform';
        el.innerHTML = `
          <div class="w-3.5 h-3.5 rotate-45 rounded-[2px] border flex items-center justify-center shadow ${
            isSelectedRiverFeature
              ? 'bg-[#0EA5E9]/30 border-[#38BDF8]'
              : 'bg-slate-800/70 border-slate-600'
          }">
            <div class="w-1.5 h-1.5 bg-[#38BDF8] rounded-full"></div>
          </div>
        `;
        el.title = `Point Grille GloFAS ${props.glofas_id} — Débit moy: ${props.mean_discharge_m3s} m³/s (Confiance mapping: ${Math.round(
          Number(props.confidence) * 100
        )}%)`;
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (props.river_id) onSelectRiver(String(props.river_id));
        });
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([coords[0], coords[1]])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [
    stationsFeatures,
    layersVisible.hubeauStations,
    layersVisible.glofasPoints,
    selectedRiver?.id,
    selectedStationId,
  ]);

  const handleResetFranceView = () => {
    mapRef.current?.flyTo({ center: [2.45, 47.15], zoom: 5.6, duration: 900 });
  };

  return (
    <div className="relative w-full h-full bg-[#070D17] overflow-hidden select-none">
      {/* MapLibre GL Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top-Left Layer Switcher & Zoom Generalization Indicator */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-xs">
        <div className="bg-[#0D1626]/90 backdrop-blur-md border border-slate-800/90 rounded-lg p-3 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              Couches PostGIS / MapLibre
            </span>
            <button
              type="button"
              onClick={handleResetFranceView}
              className="text-[11px] font-mono text-[#38BDF8] hover:underline flex items-center gap-1"
              title="Recentrer sur la France"
            >
              <Maximize2 className="w-3 h-3" />
              France
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setLayersVisible((p) => ({ ...p, basins: !p.basins }))}
              className={`flex items-center justify-between px-2 py-1.5 rounded border text-left transition ${
                layersVisible.basins
                  ? 'bg-[#0EA5E9]/15 border-[#0EA5E9]/40 text-slate-100'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="truncate">HydroBASINS</span>
              {layersVisible.basins ? (
                <Eye className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setLayersVisible((p) => ({ ...p, rivers: !p.rivers }))}
              className={`flex items-center justify-between px-2 py-1.5 rounded border text-left transition ${
                layersVisible.rivers
                  ? 'bg-[#0EA5E9]/15 border-[#0EA5E9]/40 text-slate-100'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="truncate">HydroRIVERS</span>
              {layersVisible.rivers ? (
                <Eye className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setLayersVisible((p) => ({ ...p, hubeauStations: !p.hubeauStations }))
              }
              className={`flex items-center justify-between px-2 py-1.5 rounded border text-left transition ${
                layersVisible.hubeauStations
                  ? 'bg-[#10B981]/15 border-[#10B981]/40 text-slate-100'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="truncate">Hub&apos;Eau (°C)</span>
              {layersVisible.hubeauStations ? (
                <Eye className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setLayersVisible((p) => ({ ...p, glofasPoints: !p.glofasPoints }))}
              className={`flex items-center justify-between px-2 py-1.5 rounded border text-left transition ${
                layersVisible.glofasPoints
                  ? 'bg-[#A855F7]/15 border-[#A855F7]/40 text-slate-100'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="truncate">Points GloFAS</span>
              {layersVisible.glofasPoints ? (
                <Eye className="w-3.5 h-3.5 text-[#C084FC] shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Zoom {zoomLevel.toFixed(1)}x</span>
            <span className="text-[#38BDF8]">
              {zoomLevel >= 6.5 ? 'Tronçons détaillés' : 'Cours d’eau généralisés'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-Left Legend & Cursor Coordinates */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-[#0D1626]/90 backdrop-blur-md border border-slate-800/90 rounded-lg px-3 py-2 shadow-xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded bg-[#38BDF8]" />
            <span className="text-slate-300">Cours d&apos;eau (HydroRIVERS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-dashed border-[#38BDF8] bg-[#0EA5E9]/20" />
            <span className="text-slate-300">Bassin (HydroBASINS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-slate-300">Station Hub&apos;Eau</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-[#0EA5E9]/40 border border-[#38BDF8]" />
            <span className="text-slate-300">Grille GloFAS 0.05°</span>
          </div>
        </div>

        <div className="bg-[#0D1626]/90 backdrop-blur-md border border-slate-800/90 rounded-lg px-3 py-2 shadow-xl font-mono text-[11px] text-slate-400 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>WGS84 (SRID 4326):</span>
          <span className="text-slate-200">
            {cursorCoords[1].toFixed(4)}° N, {cursorCoords[0].toFixed(4)}° E
          </span>
        </div>
      </div>
    </div>
  );
};
