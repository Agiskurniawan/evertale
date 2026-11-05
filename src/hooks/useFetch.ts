import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../lib/api";

type State<T> = { data: T | null; error: string | null; status: number | null };

/**
 * Ambil data dari API.
 *   const { data, loading, error, reload } = useFetch(() => api.get(...).then(r => r.data.data), [dep1, dep2]);
 * - enabled=false → tidak mengambil data (mis. menunggu user login)
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[], enabled = true) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, status: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetcher()
      .then((data) => !cancelled && setState({ data, error: null, status: 200 }))
      .catch((e) => {
        if (cancelled) return;
        const status = (e as { response?: { status?: number } })?.response?.status ?? 0;
        setState({ data: null, error: errorMessage(e), status });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return {
    data: state.data,
    error: state.error,
    notFound: state.status === 404,
    loading: enabled && state.data === null && state.error === null,
    reload,
  };
}
