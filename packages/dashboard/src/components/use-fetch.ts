import { useCallback, useEffect, useState } from "react";
import { AxiosError, CanceledError } from "axios";
import { useProgress } from "./progress-provider";

export const useFetch = <E extends AxiosError, T>(
  fetchFn: (signal?: AbortSignal) => Promise<T>,
  showProgress?: boolean
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [controller] = useState(new AbortController());
  const [error, setError] = useState<E | null>(null);
  const { setVisible } = useProgress();

  const fetch = useCallback(() => {
    setLoading(true);
    return fetchFn(controller.signal)
      .then((res) => setData(res))
      .catch((e) => {
        if (e instanceof CanceledError) {
          // eslint-disable-next-line string-to-lingui/missing-lingui-transformation
          console.log("Request canceled");
        } else {
          setError(e);
        }
      })
      .finally(() => setLoading(false));
  }, [fetchFn]);

  useEffect(() => {
    void fetch();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (showProgress) setVisible(loading);
  }, [loading, showProgress]);

  return {
    data,
    loading,
    controller,
    error,
    fetch,
  };
};
