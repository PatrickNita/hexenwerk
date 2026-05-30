"use client";

import { useCursorTheme } from "@/components/cursor-provider";
import { useSitePreload } from "@/components/site-preloader";
import {
  applyFireGlowVars,
  computeFireGlowCycle,
  getGlowDisplayColor,
  getGlowSpriteColor,
} from "@/lib/fire-glow";
import {
  SECTION02_CANDLE_FRAME_SRCS,
  SECTION02_LOG_FRAME_MS,
  SECTION02_LOG_FRAME_SRCS,
} from "@/lib/section02-assets";
import { renderSection02FireFrame } from "@/lib/section02-canvas-compositor";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type AppliedGlow = {
  fillColor: string;
  brightness: string;
  strength: string;
};

type StatementArtboardRuntimeContextValue = {
  isActive: boolean;
  spritesReady: boolean;
  registerProduct: (el: HTMLImageElement | null) => void;
  registerFireGlow: (el: HTMLDivElement | null) => void;
  registerFireCanvas: (
    canvas: HTMLCanvasElement | null,
    container: HTMLDivElement | null,
  ) => void;
  registerLightning: (el: HTMLDivElement | null) => void;
};

const StatementArtboardRuntimeContext =
  createContext<StatementArtboardRuntimeContextValue | null>(null);

function applyGlowIfChanged(
  element: HTMLElement | null,
  key: string,
  glow: ReturnType<typeof computeFireGlowCycle>,
  fillColor: string,
  cache: Record<string, AppliedGlow>,
): boolean {
  if (!element) {
    return false;
  }

  const brightness = glow.brightness.toFixed(3);
  const strength = glow.strength.toFixed(3);
  const prev = cache[key];

  if (
    prev &&
    prev.fillColor === fillColor &&
    prev.brightness === brightness &&
    prev.strength === strength
  ) {
    return false;
  }

  applyFireGlowVars(element, glow, fillColor);
  cache[key] = { fillColor, brightness, strength };
  return true;
}

export function StatementArtboardRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { activeLineId } = useCursorTheme();
  const { ready: siteReady } = useSitePreload();
  const activeLineIdRef = useRef(activeLineId);
  const [isActive, setIsActive] = useState(false);
  const [spritesReady, setSpritesReady] = useState(false);
  const spritesReadyRef = useRef(false);
  const spritesInitializedRef = useRef(false);

  const productRef = useRef<HTMLImageElement | null>(null);
  const fireGlowRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightningRef = useRef<HTMLDivElement | null>(null);
  const logFrameIndexRef = useRef(0);
  const candleFrameIndexRef = useRef(0);
  const spriteIntervalRef = useRef<number | null>(null);
  const glowCacheRef = useRef<Record<string, AppliedGlow>>({});
  const renderFrameRef = useRef<(now: number) => void>(() => undefined);

  const paintFireCanvas = useCallback((now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const lineId = activeLineIdRef.current;
    const glowColor = getGlowDisplayColor(now, lineId);

    renderSection02FireFrame(ctx, {
      logIndex: logFrameIndexRef.current,
      candleIndex: candleFrameIndexRef.current,
      glowColor,
      width: canvas.width,
      height: canvas.height,
    });
  }, []);

  const applyGlowState = useCallback((now: number) => {
    const lineId = activeLineIdRef.current;
    const glow = computeFireGlowCycle(now, lineId);
    const fillColor = getGlowSpriteColor(now, lineId);
    const cache = glowCacheRef.current;

    applyGlowIfChanged(
      lightningRef.current,
      "lightning",
      glow,
      fillColor,
      cache,
    );

    const product = productRef.current;
    if (product) {
      const prev = cache.shadow;
      if (!prev || prev.fillColor !== fillColor) {
        product.style.setProperty("--product-shadow-color", fillColor);
        cache.shadow = {
          fillColor,
          brightness: "",
          strength: "",
        };
      }
    }
  }, []);

  const renderFrame = useCallback(
    (now: number) => {
      paintFireCanvas(now);
      applyGlowState(now);
    },
    [applyGlowState, paintFireCanvas],
  );

  renderFrameRef.current = renderFrame;

  const registerProduct = useCallback((el: HTMLImageElement | null) => {
    productRef.current = el;
  }, []);

  const registerFireGlow = useCallback((el: HTMLDivElement | null) => {
    fireGlowRef.current = el;
    if (el && spritesReadyRef.current) {
      el.classList.add("statement-fire-glow--ready");
    }
  }, []);

  const registerFireCanvas = useCallback(
    (canvas: HTMLCanvasElement | null, _container: HTMLDivElement | null) => {
      canvasRef.current = canvas;

      if (canvas && spritesInitializedRef.current) {
        renderFrameRef.current(performance.now());
      }
    },
    [],
  );

  const registerLightning = useCallback((el: HTMLDivElement | null) => {
    lightningRef.current = el;

    if (el) {
      renderFrameRef.current(performance.now());
    }
  }, []);

  useEffect(() => {
    activeLineIdRef.current = activeLineId;
    glowCacheRef.current = {};
    renderFrameRef.current(performance.now());
  }, [activeLineId]);

  useEffect(() => {
    if (!siteReady || spritesInitializedRef.current) {
      return;
    }

    let cancelled = false;

    const initSprites = () => {
      logFrameIndexRef.current = 0;
      candleFrameIndexRef.current = 0;
      renderFrameRef.current(performance.now());

      if (cancelled) {
        return;
      }

      spritesInitializedRef.current = true;
      spritesReadyRef.current = true;
      setSpritesReady(true);
      fireGlowRef.current?.classList.add("statement-fire-glow--ready");
    };

    initSprites();

    return () => {
      cancelled = true;
    };
  }, [siteReady]);

  useEffect(() => {
    const section = document.getElementById("s2");
    const root = document.querySelector(".snap-root");

    if (!section || !root) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { root, threshold: 0.08 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (spriteIntervalRef.current !== null) {
      window.clearInterval(spriteIntervalRef.current);
      spriteIntervalRef.current = null;
    }

    if (!spritesReady || !isActive || motionMedia.matches) {
      return;
    }

    spriteIntervalRef.current = window.setInterval(() => {
      logFrameIndexRef.current =
        (logFrameIndexRef.current + 1) % SECTION02_LOG_FRAME_SRCS.length;
      candleFrameIndexRef.current =
        (candleFrameIndexRef.current + 1) % SECTION02_CANDLE_FRAME_SRCS.length;
      renderFrameRef.current(performance.now());
    }, SECTION02_LOG_FRAME_MS);

    return () => {
      if (spriteIntervalRef.current !== null) {
        window.clearInterval(spriteIntervalRef.current);
        spriteIntervalRef.current = null;
      }
    };
  }, [isActive, spritesReady]);

  const value: StatementArtboardRuntimeContextValue = {
    isActive,
    spritesReady,
    registerProduct,
    registerFireGlow,
    registerFireCanvas,
    registerLightning,
  };

  return (
    <StatementArtboardRuntimeContext.Provider value={value}>
      {children}
    </StatementArtboardRuntimeContext.Provider>
  );
}

export function useStatementArtboardRuntimeOptional() {
  return useContext(StatementArtboardRuntimeContext);
}

export function useStatementArtboardRuntime() {
  const context = useStatementArtboardRuntimeOptional();

  if (!context) {
    throw new Error(
      "useStatementArtboardRuntime must be used within StatementArtboardRuntimeProvider",
    );
  }

  return context;
}

export function useStatementArtboardActive(): boolean {
  return useStatementArtboardRuntime().isActive;
}
