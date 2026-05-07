import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiJson } from '../lib/api';
import type { CurriculumResponse } from '../types/curriculum';

export const useCurriculum = (trackId?: string) => {
  const { user }                                    = useAuth();
  const [curriculum, setCurriculum]                 = useState<CurriculumResponse | null>(null);
  const [isLoading, setLoading]                     = useState(false);
  const [error, setError]                           = useState<string | null>(null);

  const fetch = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<CurriculumResponse>(`/api/tracks/${id}/curriculum`);
      setCurriculum(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trackId) fetch(trackId);
  }, [trackId, fetch]);

  return { curriculum, isLoading, error, refetch: () => trackId && fetch(trackId) };
};
