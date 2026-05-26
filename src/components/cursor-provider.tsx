"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCursorTheme, type CursorTheme } from "@/lib/cursor-themes";

type CursorContextValue = {
  theme: CursorTheme;
  activeLineId: string | null;
  pinnedLineId: string | null;
  setActiveLineId: (id: string | null) => void;
  pinLineId: (id: string) => void;
  unpinLineId: () => void;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [pinnedLineId, setPinnedLineId] = useState<string | null>(null);

  const pinLineId = useCallback((id: string) => {
    setPinnedLineId(id);
    setActiveLineId(id);
  }, []);

  const unpinLineId = useCallback(() => {
    setPinnedLineId(null);
    setActiveLineId(null);
  }, []);

  const value = useMemo(
    () => ({
      theme: getCursorTheme(activeLineId ?? "default"),
      activeLineId,
      pinnedLineId,
      setActiveLineId,
      pinLineId,
      unpinLineId,
    }),
    [activeLineId, pinnedLineId, pinLineId, unpinLineId],
  );

  return (
    <CursorContext.Provider value={value}>{children}</CursorContext.Provider>
  );
}

export function useCursorTheme() {
  const context = useContext(CursorContext);

  if (!context) {
    throw new Error("useCursorTheme must be used within CursorProvider");
  }

  return context;
}
