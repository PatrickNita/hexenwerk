"use client";

import { useCursorTheme } from "@/components/cursor-provider";
import {
  applyFireGlowVars,
  computeFireGlowCycle,
  getGlowSpriteColor,
} from "@/lib/fire-glow";
import {
  SECTION02_CANDLE_FRAME_NUMBERS,
  SECTION02_CANDLE_FRAME_SRCS,
  SECTION02_LOG_FRAME_MS,
  SECTION02_LOG_FRAME_SRCS,
} from "@/lib/section02-assets";
import { useSitePreload } from "@/components/site-preloader";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const GLOW_UPDATE_MS = 1000 / 15;

type AppliedGlow = {
  fillColor: string;
  brightness: string;
  strength: string;
};

type SpriteElements = {
  logImg: HTMLImageElement | null;
  logGlow: HTMLDivElement | null;
  candleImg: HTMLImageElement | null;
  candleGlow: HTMLDivElement | null;
};

type StatementArtboardRuntimeContextValue = {
  isActive: boolean;
  spritesReady: boolean;
  registerProduct: (el: HTMLImageElement | null) => void;
  registerFireGlow: (el: HTMLDivElement | null) => void;
  registerLogSprite: (
    img: HTMLImageElement | null,
    glow: HTMLDivElement | null,
  ) => void;
  registerCandleSprite: (
    img: HTMLImageElement | null,
    glow: HTMLDivElement | null,
  ) => void;
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

  const productRef = useRef<HTMLImageElement | null>(null);
  const fireGlowRef = useRef<HTMLDivElement | null>(null);
  const spriteRefs = useRef<SpriteElements>({
    logImg: null,
    logGlow: null,
    candleImg: null,
    candleGlow: null,
  });
  const logFrameIndexRef = useRef(0);
  const candleFrameIndexRef = useRef(0);
  const glowIntervalRef = useRef<number | null>(null);
  const spriteIntervalRef = useRef<number | null>(null);
  const glowCacheRef = useRef<Record<string, AppliedGlow>>({});

  const registerProduct = useCallback((el: HTMLImageElement | null) => {
    productRef.current = el;
  }, []);

  const registerFireGlow = useCallback((el: HTMLDivElement | null) => {
    fireGlowRef.current = el;
    if (el && spritesReadyRef.current) {
      el.classList.add("statement-fire-glow--ready");
    }
  }, []);

  const registerLogSprite = useCallback(
    (img: HTMLImageElement | null, glow: HTMLDivElement | null) => {
      spriteRefs.current.logImg = img;
      spriteRefs.current.logGlow = glow;
    },
    [],
  );

  const registerCandleSprite = useCallback(
    (img: HTMLImageElement | null, glow: HTMLDivElement | null) => {
      spriteRefs.current.candleImg = img;
      spriteRefs.current.candleGlow = glow;
    },
    [],
  );

  const applySpriteFrames = useCallback((reset = false) => {
    if (reset) {
      logFrameIndexRef.current = 0;
      candleFrameIndexRef.current = 0;
    }

    const { logImg, logGlow, candleImg, candleGlow } = spriteRefs.current;
    const logIndex = logFrameIndexRef.current;
    const candleIndex = candleFrameIndexRef.current;

    if (logImg) {
      logImg.src = SECTION02_LOG_FRAME_SRCS[logIndex];
    }

    if (logGlow) {
      logGlow.className = `statement-log-glow-frame statement-log-glow-frame--${logIndex + 1} statement-log-glow-frame--active`;
    }

    if (candleImg) {
      candleImg.src = SECTION02_CANDLE_FRAME_SRCS[candleIndex];
    }

    if (candleGlow) {
      const frameNumber = SECTION02_CANDLE_FRAME_NUMBERS[candleIndex];
      candleGlow.className = `statement-candle-glow-frame statement-candle-glow-frame--${frameNumber} statement-candle-glow-frame--active`;
    }
  }, []);

  useEffect(() => {
    activeLineIdRef.current = activeLineId;
    glowCacheRef.current = {};
  }, [activeLineId]);

  useEffect(() => {
    if (!siteReady) {
      return;
    }

    setSpritesReady(true);
    spritesReadyRef.current = true;
    fireGlowRef.current?.classList.add("statement-fire-glow--ready");
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

    const applyAll = (now: number) => {
      const lineId = activeLineIdRef.current;
      const glow = computeFireGlowCycle(now, lineId);
      const fillColor = getGlowSpriteColor(now, lineId);
      const cache = glowCacheRef.current;

      applyGlowIfChanged(
        fireGlowRef.current,
        "fireGlow",
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
    };

    applyAll(performance.now());

    if (glowIntervalRef.current !== null) {
      window.clearInterval(glowIntervalRef.current);
      glowIntervalRef.current = null;
    }

    if (isActive && !motionMedia.matches) {
      glowIntervalRef.current = window.setInterval(() => {
        applyAll(performance.now());
      }, GLOW_UPDATE_MS);
    }

    return () => {
      if (glowIntervalRef.current !== null) {
        window.clearInterval(glowIntervalRef.current);
        glowIntervalRef.current = null;
      }
    };
  }, [isActive]);

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (spriteIntervalRef.current !== null) {
      window.clearInterval(spriteIntervalRef.current);
      spriteIntervalRef.current = null;
    }

    if (!spritesReady) {
      return;
    }

    applySpriteFrames(true);

    if (!isActive || motionMedia.matches) {
      return;
    }

    spriteIntervalRef.current = window.setInterval(() => {
      logFrameIndexRef.current =
        (logFrameIndexRef.current + 1) % SECTION02_LOG_FRAME_SRCS.length;
      candleFrameIndexRef.current =
        (candleFrameIndexRef.current + 1) % SECTION02_CANDLE_FRAME_SRCS.length;
      applySpriteFrames();
    }, SECTION02_LOG_FRAME_MS);

    return () => {
      if (spriteIntervalRef.current !== null) {
        window.clearInterval(spriteIntervalRef.current);
        spriteIntervalRef.current = null;
      }
    };
  }, [applySpriteFrames, isActive, spritesReady]);

  const value: StatementArtboardRuntimeContextValue = {
    isActive,
    spritesReady,
    registerProduct,
    registerFireGlow,
    registerLogSprite,
    registerCandleSprite,
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
