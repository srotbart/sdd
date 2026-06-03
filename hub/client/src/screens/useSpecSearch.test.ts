import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpecSearch } from './useSpecSearch';
import type { SpecItem } from '../types';

const ITEMS: SpecItem[] = [
  {
    id: 'SPEC-scr-001',
    title: 'Hub Dashboard screen',
    status: 'active',
    body: 'Renders a cross-workspace overview.',
    refs: [],
    testStatus: { status: 'not-run' },
  },
  {
    id: 'SPEC-scr-002',
    title: 'Workspace Session screen',
    status: 'active',
    body: 'Mirrors session-start output.',
    refs: [],
    testStatus: { status: 'not-run' },
  },
  {
    id: 'SPEC-scr-036',
    title: 'Specs screen fuzzy search',
    status: 'active',
    body: 'A text input filters items.',
    refs: [],
    testStatus: { status: 'not-run' },
  },
];

describe('useSpecSearch — empty query', () => {
  it('returns all items unchanged when query is empty string', () => {
    const { result } = renderHook(() => useSpecSearch(ITEMS, ''));
    expect(result.current).toEqual(ITEMS);
    expect(result.current).toHaveLength(3);
  });
});

describe('useSpecSearch — non-empty query', () => {
  it('returns a subset when query matches some items', () => {
    const { result } = renderHook(() => useSpecSearch(ITEMS, 'Dashboard'));
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.length).toBeLessThan(ITEMS.length);
    expect(result.current[0].id).toBe('SPEC-scr-001');
  });

  it('returns empty array when query matches nothing', () => {
    const { result } = renderHook(() => useSpecSearch(ITEMS, 'xyzzy_no_match_ever'));
    expect(result.current).toHaveLength(0);
  });

  it('matches on id field', () => {
    const { result } = renderHook(() => useSpecSearch(ITEMS, 'SPEC-scr-036'));
    expect(result.current.some((i) => i.id === 'SPEC-scr-036')).toBe(true);
  });

  it('matches on title field', () => {
    const { result } = renderHook(() => useSpecSearch(ITEMS, 'fuzzy search'));
    expect(result.current.some((i) => i.id === 'SPEC-scr-036')).toBe(true);
  });
});
