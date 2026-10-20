interface CacheLike<Key> {
  keys(): IterableIterator<Key>
  delete(key: Key): unknown
}

export function clearSWRCache<Key>(cache: CacheLike<Key>) {
  for (const key of Array.from(cache.keys())) {
    cache.delete(key)
  }
}
