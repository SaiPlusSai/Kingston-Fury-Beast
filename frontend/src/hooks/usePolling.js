import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../services/api';

/**
 * Like useAsyncData but re-fetches every `intervalMs` milliseconds.
 * Automatically pauses when the browser tab is hidden.
 */
export const usePolling = (fetcher, deps = [], intervalMs = 15000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);
  const activeRef = useRef(true);

  const run = useCallback(async () => {
    if (!activeRef.current) return;
    try {
      const result = await fetcher();
      if (activeRef.current) {
        setData(result);
        setLastUpdated(new Date());
        setError('');
      }
    } catch (err) {
      if (activeRef.current) setError(getApiErrorMessage(err));
    } finally {
      if (activeRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    activeRef.current = true;
    setLoading(true);
    run();

    const schedule = () => {
      timerRef.current = setTimeout(async () => {
        if (document.visibilityState !== 'hidden') await run();
        if (activeRef.current) schedule();
      }, intervalMs);
    };
    schedule();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, intervalMs]);

  return { data, loading, error, lastUpdated, refetch: run };
};
