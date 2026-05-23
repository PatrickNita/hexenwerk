"use client";

import type { ReactNode } from "react";
import CursorTrail from "@/components/cursor-trail";
import { CursorProvider } from "@/components/cursor-provider";

export default function CursorShell({ children }: { children: ReactNode }) {
  return (
    <CursorProvider>
      <CursorTrail />
      {children}
    </CursorProvider>
  );
}
