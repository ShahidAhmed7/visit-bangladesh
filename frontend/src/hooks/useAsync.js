import { useCallback, useState } from "react";

export const useAsync = (asyncFn, deps = [], { initialData = null } = {}) => {
  const [state, setState] = useState({ loading: false, error: null, data: initialData });

  const run = useCallback(
    async (...args) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await asyncFn(...args);
        setState({ loading: false, error: null, data });
        return data;
      } catch (error) {
        setState({ loading: false, error, data: null });
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return { ...state, run };
};

export default useAsync;
