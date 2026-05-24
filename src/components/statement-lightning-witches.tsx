"use client";

import { useEffect, useRef } from "react";
import { useCursorTheme } from "@/components/cursor-provider";
import {
  applyFireGlowToElement,
  computeFireGlowCycle,
  defaultLightningBackground,
} from "@/lib/fire-glow";

export default function StatementLightningLayer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const { activeLineId } = useCursorTheme();
  const activeLineIdRef = useRef(activeLineId);

  useEffect(() => {
    activeLineIdRef.current = activeLineId;
  }, [activeLineId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    applyFireGlowToElement(
      root,
      computeFireGlowCycle(performance.now(), activeLineIdRef.current),
    );

    if (motionMedia.matches) {
      return;
    }

    const tick = (now: number) => {
      applyFireGlowToElement(
        root,
        computeFireGlowCycle(now, activeLineIdRef.current),
      );
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [activeLineId]);

  return (
    <div
      ref={rootRef}
      className="statement-lightning"
      style={{ backgroundImage: defaultLightningBackground() }}
      aria-hidden
    />
  );
}
