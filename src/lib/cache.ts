const cache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached(key: string, value: unknown): void {
  cache.set(key, value);
}
