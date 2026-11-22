import {useCallback, useEffect, useState} from 'react';

export interface LocalStorageResult<T> {
  value: T;
  setValue: (next: T | ((prev: T) => T)) => void;
  resetValue: () => void;
  storageError: string | null;
  clearStorageError: () => void;
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): LocalStorageResult<T> {
  const [storageError, setStorageError] = useState<string | null>(null);

  const [value, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return initialValue;
      }
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setStorageError(
        'Browser storage is unavailable or full. Changes remain active for this session.'
      );
    }
  }, [key, value]);

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    setStoredValue((prev) =>
      typeof next === 'function' ? (next as (p: T) => T)(prev) : next
    );
  }, []);

  const resetValue = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        setStorageError(null);
      } catch {
        setStorageError('Unable to clear browser storage.');
      }
    }
  }, [initialValue, key]);

  const clearStorageError = useCallback(() => {
    setStorageError(null);
  }, []);

  return {
    value,
    setValue,
    resetValue,
    storageError,
    clearStorageError,
  };
}
