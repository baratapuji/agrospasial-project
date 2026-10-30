'use client';
import { useCallback, useEffect, useState } from 'react';
import { fetchLayers, type SpatialLayer } from '@/services/spatial';

export type LayerStatus = 'loading' | 'ready' | 'error';

export function useLayers() {
  const [layers, setLayers] = useState<SpatialLayer[]>([]);
  const [status, setStatus] = useState<LayerStatus>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setLayers(await fetchLayers());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { layers, status, reload: load };
}