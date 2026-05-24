"use client";

import { useEffect, useRef, useState } from "react";
import { useCursorTheme } from "@/components/cursor-provider";
import type { CursorTheme } from "@/lib/cursor-themes";

type Ember = {
  x: number;
  y: number;
  size: number;
  color: string;
  vy: number;
  born: number;
  life: number;
};

const MAX_EMBERS = 40;
const EMBER_LIFE_MIN = 400;
const EMBER_LIFE_MAX = 600;
const MOVE_THRESHOLD = 3;

const CLICKABLE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label[for]";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointerOrMobile() {
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches
  );
}

function pickColor(theme: CursorTheme) {
  return theme.particles[Math.floor(Math.random() * theme.particles.length)];
}

export default function CursorTrail() {
  const { theme } = useCursorTheme();
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>([]);
  const rafRef = useRef<number | null>(null);
  const cursorRef = useRef({ x: -100, y: -100 });
  const lastSpawnRef = useRef({ x: -100, y: -100 });
  const themeRef = useRef(theme);
  const isClickableRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const updateEnabled = () => {
      setEnabled(!isCoarsePointerOrMobile());
    };

    updateEnabled();
    window.addEventListener("resize", updateEnabled);

    return () => window.removeEventListener("resize", updateEnabled);
  }, []);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    reducedMotionRef.current = prefersReducedMotion();

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    if (!reducedMotionRef.current) {
      document.body.classList.add("custom-cursor-active");
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const spawnEmber = (x: number, y: number) => {
      if (reducedMotionRef.current) {
        return;
      }

      const last = lastSpawnRef.current;
      const dx = x - last.x;
      const dy = y - last.y;

      if (Math.hypot(dx, dy) < MOVE_THRESHOLD) {
        return;
      }

      lastSpawnRef.current = { x, y };

      embersRef.current.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        size: 2 + Math.random() * 4,
        color: pickColor(themeRef.current),
        vy: -(0.5 + Math.random()),
        born: performance.now(),
        life:
          EMBER_LIFE_MIN + Math.random() * (EMBER_LIFE_MAX - EMBER_LIFE_MIN),
      });

      if (embersRef.current.length > MAX_EMBERS) {
        embersRef.current.splice(0, embersRef.current.length - MAX_EMBERS);
      }
    };

    const opacityForAge = (t: number) => {
      if (t < 0.4) return 1;
      if (t < 0.65) return 0.6;
      if (t < 0.85) return 0.3;
      return 0;
    };

    const tick = () => {
      const now = performance.now();
      const { x, y } = cursorRef.current;
      const activeTheme = themeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!reducedMotionRef.current) {
        embersRef.current = embersRef.current.filter((ember) => {
          const age = now - ember.born;
          const t = age / ember.life;

          if (t >= 1) {
            return false;
          }

          ember.y += ember.vy;
          const alpha = opacityForAge(t);

          if (alpha <= 0) {
            return false;
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = ember.color;
          ctx.fillRect(
            ember.x - ember.size / 2,
            ember.y - ember.size / 2,
            ember.size,
            ember.size,
          );

          return true;
        });
      }

      ctx.globalAlpha = 1;

      if (x >= 0 && y >= 0) {
        const coreColor = activeTheme.core;
        const hotColor = activeTheme.hot;
        const clickable = isClickableRef.current;
        const coreSize = clickable ? 6 : 3;
        const hotSize = clickable ? 2 : 1;
        const coreOffset = Math.floor(coreSize / 2);

        ctx.globalAlpha = 1;
        ctx.fillStyle = coreColor;
        ctx.fillRect(x - coreOffset, y - coreOffset, coreSize, coreSize);

        ctx.fillStyle = hotColor;
        ctx.fillRect(
          x - Math.floor(hotSize / 2),
          y - Math.floor(hotSize / 2),
          hotSize,
          hotSize,
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      cursorRef.current = { x: event.clientX, y: event.clientY };
      isClickableRef.current = !!(event.target as Element).closest(
        CLICKABLE_SELECTOR,
      );
      spawnEmber(event.clientX, event.clientY);
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      hidden={!enabled}
    />
  );
}
