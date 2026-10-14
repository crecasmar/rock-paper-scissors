import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 250;

/**
 * Returns `value` once it has stopped changing for `delay` ms.
 * Every change restarts the wait, and any pending update is dropped on unmount.
 * @template T
 * @param {T} value
 * @param {number} [delay]
 * @returns {T}
 */
const useDebouncedValue = (value, delay = DEFAULT_DELAY_MS) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebouncedValue;
