import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { SpecItem } from '../types';

const FUSE_OPTIONS: Fuse.IFuseOptions<SpecItem> = {
  threshold: 0.4,
  keys: ['id', 'title'],
};

export function useSpecSearch(items: SpecItem[], query: string): SpecItem[] {
  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items]);

  return useMemo(() => {
    if (!query) {
      return items;
    }
    return fuse.search(query).map((r) => r.item);
  }, [fuse, items, query]);
}
