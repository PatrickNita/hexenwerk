"use client";

import { useSitePreload } from "@/components/site-preloader";
import { getProductLineBoxFrame } from "@/lib/product-line-box-cycle";
import {
  getSection03FrameImage,
  isSection03FramesReady,
} from "@/lib/section03-frame-cache";
import { getSection03FrameSrc } from "@/lib/section03-assets";
import { useEffect, useRef } from "react";

type ProductLineBoxPlayerProps = {
  lineId: string;
  active: boolean;
};

export default function ProductLineBoxPlayer({
  lineId,
  active,
}: ProductLineBoxPlayerProps) {
  const { ready: siteReady } = useSitePreload();
  const frameARef = useRef<HTMLImageElement>(null);
  const frameBRef = useRef<HTMLImageElement>(null);
  const frontIsARef = useRef(true);
  const displayedFrameRef = useRef(0);
  const cycleStartRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const applyInFlightRef = useRef(false);
  const queuedFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !siteReady || !isSection03FramesReady()) {
      displayedFrameRef.current = 0;
      frontIsARef.current = true;
      return;
    }

    const frameA = frameARef.current;
    const frameB = frameBRef.current;
    const firstFrame = getSection03FrameImage(lineId, 1);
    const initialSrc = firstFrame?.src ?? getSection03FrameSrc(lineId, 1);

    if (frameA) {
      frameA.src = initialSrc;
      frameA.className =
        "line-panel-box-player__frame line-panel-box-player__frame--front";
    }

    if (frameB) {
      frameB.src = initialSrc;
      frameB.className =
        "line-panel-box-player__frame line-panel-box-player__frame--back";
    }

    displayedFrameRef.current = 1;
    frontIsARef.current = true;

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionMedia.matches) {
      return;
    }

    cycleStartRef.current = performance.now();

    const swapToFrame = async (frame: number) => {
      const cached = getSection03FrameImage(lineId, frame);
      if (!cached) {
        return;
      }

      const frontEl = frontIsARef.current ? frameARef.current : frameBRef.current;
      const backEl = frontIsARef.current ? frameBRef.current : frameARef.current;

      if (!frontEl || !backEl) {
        return;
      }

      backEl.src = cached.src;

      try {
        await backEl.decode();
      } catch {
        // Ignore decode errors for missing or slow frames.
      }

      frontEl.classList.remove("line-panel-box-player__frame--front");
      frontEl.classList.add("line-panel-box-player__frame--back");
      backEl.classList.remove("line-panel-box-player__frame--back");
      backEl.classList.add("line-panel-box-player__frame--front");

      frontIsARef.current = !frontIsARef.current;
      displayedFrameRef.current = frame;
    };

    const applyFrame = async (frame: number) => {
      if (frame === displayedFrameRef.current) {
        return;
      }

      if (applyInFlightRef.current) {
        queuedFrameRef.current = frame;
        return;
      }

      applyInFlightRef.current = true;

      let target = frame;

      do {
        queuedFrameRef.current = null;
        await swapToFrame(target);
        target = queuedFrameRef.current ?? 0;
      } while (
        target !== 0 &&
        target !== displayedFrameRef.current
      );

      applyInFlightRef.current = false;
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

      applyInFlightRef.current = false;
      queuedFrameRef.current = null;
    };
  }, [active, lineId, siteReady]);

  const initialSrc = getSection03FrameSrc(lineId, 1);

  return (
    <div className="line-panel-box-player" aria-hidden={!active}>
      <img
        ref={frameARef}
        src={initialSrc}
        alt=""
        className="line-panel-box-player__frame line-panel-box-player__frame--front"
      />
      <img
        ref={frameBRef}
        src={initialSrc}
        alt=""
        className="line-panel-box-player__frame line-panel-box-player__frame--back"
        aria-hidden
      />
    </div>
  );
}
