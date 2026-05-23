"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCursorTheme, type CursorTheme } from "@/lib/cursor-themes";

type CursorContextValue = {
  theme: CursorTheme;
  activeLineId: string | null;
  setActiveLineId: (id: string | null) => void;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      theme: getCursorTheme(activeLineId ?? "default"),
      activeLineId,
      setActiveLineId,
    }),
    [activeLineId],
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
