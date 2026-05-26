"use client";

import type { ReactNode } from "react";
import CursorTrail from "@/components/cursor-trail";
import { CursorProvider } from "@/components/cursor-provider";
import { SitePreloadProvider } from "@/components/site-preloader";

export default function CursorShell({ children }: { children: ReactNode }) {
  return (
    <SitePreloadProvider>
      <CursorProvider>
        <CursorTrail />
        {children}
      </CursorProvider>
    </SitePreloadProvider>
  );
}
