import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ArtifactKind = 'TGT' | 'SPEC' | 'GAP' | 'WI' | 'ISS' | 'IMP';

export interface PeekerState {
  id: string;
  kind: ArtifactKind;
}

export interface PeekerContextValue {
  peeker: PeekerState | null;
  openPeeker: (id: string, kind: ArtifactKind) => void;
  closePeeker: () => void;
}

export const PeekerContext = createContext<PeekerContextValue>({
  peeker: null,
  openPeeker: () => {},
  closePeeker: () => {},
});

export function usePeeker(): PeekerContextValue {
  return useContext(PeekerContext);
}

interface PeekerProviderProps {
  children: ReactNode;
}

export function PeekerProvider({ children }: PeekerProviderProps) {
  const [peeker, setPeeker] = useState<PeekerState | null>(null);

  const openPeeker = useCallback((id: string, kind: ArtifactKind) => {
    setPeeker({ id, kind });
  }, []);

  const closePeeker = useCallback(() => {
    setPeeker(null);
  }, []);

  return (
    <PeekerContext.Provider value={{ peeker, openPeeker, closePeeker }}>
      {children}
    </PeekerContext.Provider>
  );
}
