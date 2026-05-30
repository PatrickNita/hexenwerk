"use client";

import { getProductLineBoxFrame } from "@/lib/product-line-box-cycle";
import { preloadImages } from "@/lib/preload-images";
import {
  getSection03FrameSrc,
  getSection03FrameSrcs,
} from "@/lib/section03-assets";
import { useEffect, useRef, useState } from "react";

type ProductLineBoxPlayerProps = {
  lineId: string;
  active: boolean;
};

export default function ProductLineBoxPlayer({
  lineId,
  active,
}: ProductLineBoxPlayerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef(1);
  const cycleStartRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      frameRef.current = 1;
      return;
    }

    let cancelled = false;

    preloadImages(getSection03FrameSrcs(lineId)).then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [active, lineId]);

  useEffect(() => {
    if (!active || !ready) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const img = imgRef.current;

    if (img) {
      frameRef.current = 1;
      img.src = getSection03FrameSrc(lineId, 1);
    }

    if (motionMedia.matches) {
      return;
    }

    cycleStartRef.current = performance.now();

    const applyFrame = async (frame: number) => {
      const element = imgRef.current;
      if (!element || frameRef.current === frame) {
        return;
      }

      frameRef.current = frame;
      element.src = getSection03FrameSrc(lineId, frame);

      try {
        await element.decode();
      } catch {
        // Ignore decode errors for missing or slow frames.
      }
    };

    const tick = (now: number) => {
      const { frame } = getProductLineBoxFrame(now, cycleStartRef.current);
      void applyFrame(frame);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, lineId, ready]);

  return (
    <div className="line-panel-box-player" aria-hidden={!active}>
      <img
        ref={imgRef}
        src={getSection03FrameSrc(lineId, 1)}
        alt=""
        className="line-panel-box-player__frame"
      />
    </div>
  );
}
