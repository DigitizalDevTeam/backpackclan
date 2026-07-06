import { loadMockData, saveMockData } from "@/lib/mock/persistence";

export function createPersistedStore<T>(key: string, seed: T) {
  let state: T | null = null;

  function get(): T {
    if (state === null) {
      state = loadMockData(key, structuredClone(seed));
    }
    return state;
  }

  function set(next: T): void {
    state = next;
    saveMockData(key, state);
  }

  function replace(updater: (current: T) => T): T {
    const next = updater(get());
    set(next);
    return next;
  }

  function reset(): void {
    state = structuredClone(seed);
    saveMockData(key, state);
  }

  return { get, set, replace, reset };
}
