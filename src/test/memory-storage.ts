import type { StorageLike } from '../lib/local-repository'

export function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

