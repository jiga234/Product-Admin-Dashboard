"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a rapidly changing value.
 * Used for search input to wait until user pauses typing before triggering API calls.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
