import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Generic hook for data fetching with loading, error, and refresh states
 * @param fetchFn - Async function that fetches the data
 * @param errorMessage - Error message to display on failure
 * @returns Object containing data, loading state, error state, and refresh function
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  errorMessage: string = 'Failed to load data. Please try again.'
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(
    async (isRefreshing: boolean = false) => {
      try {
        if (isRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const result = await fetchFn();
        setData(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error('Data fetch error:', error);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchFn, errorMessage]
  );

  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
    reload: () => loadData(false),
  };
}
