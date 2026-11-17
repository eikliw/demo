import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { EnrichedListing, Filters, FloodInfo, Listing } from '../types';
import { sampleListings } from '../data/listings';
import { fetchRentcastListings, RENTCAST_KEY } from '../lib/rentcast';
import { lookupMany } from '../lib/flood';
import { DEFAULT_FILTERS, enrich, passes } from '../lib/enrich';

type Ctx = {
  source: 'sample' | 'rentcast';
  loading: boolean;
  all: EnrichedListing[];
  filtered: EnrichedListing[];
  filters: Filters;
  setFilters: (f: Filters) => void;
  floodProgress: { done: number; total: number };
  selectedId?: string;
  setSelectedId: (id?: string) => void;
  activeFilterCount: number;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Listing[]>([]);
  const [source, setSource] = useState<'sample' | 'rentcast'>('sample');
  const [loading, setLoading] = useState(true);
  const [flood, setFlood] = useState<Record<string, FloodInfo>>({});
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string>();
  const pending = useRef<Record<string, FloodInfo>>({});

  // 1) Load listings (RentCast if a key is configured, else sample data).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let ls: Listing[] = [];
      if (RENTCAST_KEY) {
        try {
          ls = await fetchRentcastListings();
        } catch {}
      }
      if (cancelled) return;
      if (ls.length) {
        setSource('rentcast');
        setRaw(ls);
      } else {
        setSource('sample');
        setRaw(sampleListings());
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Look up FEMA flood zones for every listing; batch state updates.
  useEffect(() => {
    if (!raw.length) return;
    const ac = new AbortController();
    const flush = setInterval(() => {
      if (Object.keys(pending.current).length) {
        const batch = pending.current;
        pending.current = {};
        setFlood((prev) => ({ ...prev, ...batch }));
      }
    }, 600);
    lookupMany(
      raw.map((l) => ({ id: l.id, coord: l.coord })),
      (id, info) => {
        pending.current[id] = info;
      },
      5,
      ac.signal,
    ).finally(() => {
      setTimeout(() => clearInterval(flush), 700);
    });
    return () => {
      ac.abort();
      clearInterval(flush);
    };
  }, [raw]);

  const all = useMemo(() => raw.map((l) => enrich(l, flood[l.id])), [raw, flood]);
  const filtered = useMemo(() => all.filter((l) => passes(l, filters)), [all, filters]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).forEach((k) => {
      if (k === 'maxClubMi' || k === 'clubGender') return;
      if (JSON.stringify(filters[k]) !== JSON.stringify(DEFAULT_FILTERS[k])) n++;
    });
    return n;
  }, [filters]);

  const value: Ctx = {
    source,
    loading,
    all,
    filtered,
    filters,
    setFilters,
    floodProgress: { done: Object.keys(flood).length, total: raw.length },
    selectedId,
    setSelectedId,
    activeFilterCount,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}
