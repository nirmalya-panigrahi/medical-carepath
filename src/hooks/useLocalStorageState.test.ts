import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {useLocalStorageState} from './useLocalStorageState';

describe('useLocalStorageState', () => {
  it('Blue Pill: initializes with fallback and persists updates to localStorage', () => {
    const {result} = renderHook(() =>
      useLocalStorageState<string[]>('test_key_blue', ['alpha'])
    );

    expect(result.current.value).toEqual(['alpha']);

    act(() => {
      result.current.setValue((prev) => [...prev, 'beta']);
    });

    expect(result.current.value).toEqual(['alpha', 'beta']);
    expect(JSON.parse(window.localStorage.getItem('test_key_blue') || '[]')).toEqual([
      'alpha',
      'beta',
    ]);
  });

  it('Red Pill: recovers gracefully from corrupted JSON in localStorage', () => {
    window.localStorage.setItem('test_key_corrupt', '{not-valid-json');

    const {result} = renderHook(() =>
      useLocalStorageState<{count: number}>('test_key_corrupt', {count: 1})
    );

    expect(result.current.value).toEqual({count: 1});
    expect(result.current.storageError).toBeNull();
  });
});
