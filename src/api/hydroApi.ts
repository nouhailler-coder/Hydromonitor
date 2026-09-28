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
} from '../types/hydrology';
import { getCurrentFirebaseIdToken } from '../auth/firebase';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getCurrentFirebaseIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || `Erreur API (${response.status})`);
  }
  return response.json();
}

export const hydroApi = {
  async searchRivers(query: string): Promise<RiverSearchItem[]> {
    const res = await fetchJson<{ results: RiverSearchItem[] }>(
      `/api/rivers/search?q=${encodeURIComponent(query)}`
    );
    return res.results;
  },

  async getNearbyRivers(lat: number, lon: number, radiusKm = 50): Promise<any[]> {
    const res = await fetchJson<{ items: any[] }>(
      `/api/rivers/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`
    );
    return res.items;
  },

  async listRivers(): Promise<RiverDetail[]> {
    const res = await fetchJson<{ items: RiverDetail[] }>('/api/rivers?limit=50');
    return res.items;
  },

  async getRiverDetail(riverId: string): Promise<RiverDetail> {
    return fetchJson<RiverDetail>(`/api/rivers/${encodeURIComponent(riverId)}`);
  },

  async getRiverSegments(riverId: string): Promise<RiverSegment[]> {
    const res = await fetchJson<{ items: RiverSegment[] }>(
      `/api/rivers/${encodeURIComponent(riverId)}/segments`
    );
    return res.items;
  },

  async getRiverBasin(riverId: string): Promise<BasinInfo> {
    const res = await fetchJson<{ basin: BasinInfo }>(
      `/api/rivers/${encodeURIComponent(riverId)}/basin`
    );
    return res.basin;
  },

  async getDischargeHistory(
    riverId: string,
    days = 30,
    dateFrom?: string,
    dateTo?: string
  ): Promise<DischargePoint[]> {
    const params = new URLSearchParams({ days: String(days) });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    const res = await fetchJson<{ series: DischargePoint[] }>(
      `/api/rivers/${encodeURIComponent(riverId)}/discharge/history?${params.toString()}`
    );
    return res.series;
  },

  async getRiverForecast(riverId: string, days = 10): Promise<ForecastStep[]> {
    const res = await fetchJson<{ steps: ForecastStep[] }>(
      `/api/rivers/${encodeURIComponent(riverId)}/forecast?days=${days}`
    );
    return res.steps;
  },

  async getTemperatureStations(riverId: string): Promise<TemperatureStation[]> {
    const res = await fetchJson<{ items: TemperatureStation[] }>(
      `/api/rivers/${encodeURIComponent(riverId)}/stations`
    );
    return res.items;
  },

  async getTemperatureHistory(
    riverId: string,
    stationId?: string,
    days = 14
  ): Promise<TemperaturePoint[]> {
    const params = new URLSearchParams({ days: String(days) });
    if (stationId) params.set('station_id', stationId);
    const res = await fetchJson<{ series: TemperaturePoint[] }>(
      `/api/rivers/${encodeURIComponent(riverId)}/temperature/history?${params.toString()}`
    );
    return res.series;
  },

  async getMapRivers(zoom: number): Promise<any> {
    return fetchJson<any>(`/api/map/rivers?zoom=${zoom.toFixed(1)}`);
  },

  async getMapStations(riverId?: string): Promise<any> {
    const q = riverId ? `?river_id=${encodeURIComponent(riverId)}` : '';
    return fetchJson<any>(`/api/map/stations${q}`);
  },

  async getDataSources(): Promise<DataSourceItem[]> {
    const res = await fetchJson<{ items: DataSourceItem[] }>('/api/data-sources');
    return res.items;
  },

  async getIngestionStatus(): Promise<IngestionStatusResponse> {
    return fetchJson<IngestionStatusResponse>('/api/ingestion/status');
  },

  async getCurrentUserProfile(): Promise<{
    uid: string;
    email: string | null;
    display_name: string | null;
    role: 'admin' | 'viewer';
    authenticated: boolean;
    project_id: string;
  }> {
    return fetchJson('/api/me');
  },

  async triggerIngestionJob(jobName: string): Promise<any> {
    return fetchJson('/api/admin/ingestion/trigger', {
      method: 'POST',
      body: JSON.stringify({ job_name: jobName }),
    });
  },
};
