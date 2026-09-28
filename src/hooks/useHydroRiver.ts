import { useState, useEffect } from 'react';
import { hydroApi } from '../api/hydroApi';
import { RiverDetail } from '../types/hydrology';

export function useHydroRiver(riverId: string) {
  const [river, setRiver] = useState<RiverDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    hydroApi
      .getRiverDetail(riverId)
      .then((data) => {
        if (active) {
          setRiver(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Erreur de chargement');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [riverId]);

  return { river, loading, error };
}
