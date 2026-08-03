"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MusteriHesapResponse } from "@/types/api";

type MusteriContextValue = {
  secilenMusteri: MusteriHesapResponse | null;
  musteriSec: (musteri: MusteriHesapResponse) => void;
  musteriTemizle: () => void;
};

const MusteriContext = createContext<MusteriContextValue | null>(null);

export function MusteriProvider({ children }: { children: ReactNode }) {
  const [secilenMusteri, setSecilenMusteri] =
    useState<MusteriHesapResponse | null>(null);

  const musteriSec = useCallback((musteri: MusteriHesapResponse) => {
    setSecilenMusteri(musteri);
  }, []);

  const musteriTemizle = useCallback(() => {
    setSecilenMusteri(null);
  }, []);

  const value = useMemo(
    () => ({ secilenMusteri, musteriSec, musteriTemizle }),
    [musteriSec, musteriTemizle, secilenMusteri],
  );

  return (
    <MusteriContext.Provider value={value}>
      {children}
    </MusteriContext.Provider>
  );
}

export function useMusteri() {
  const context = useContext(MusteriContext);

  if (!context) {
    throw new Error("useMusteri, MusteriProvider içinde kullanılmalıdır.");
  }

  return context;
}
