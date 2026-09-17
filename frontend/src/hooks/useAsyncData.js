import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../services/api';

export const useAsyncData = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [...deps, trigger]);

  const refetch = () => setTrigger((prev) => prev + 1);

  return { data, loading, error, setData, refetch };
};
